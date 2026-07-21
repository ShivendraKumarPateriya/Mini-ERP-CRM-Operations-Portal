import { Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { generateChallanNumber } from '../../utils/challanNumber.js';
import { HttpError, notFound } from '../../utils/httpError.js';

const challanInclude = {
  customer: true,
  user: { select: { id: true, name: true, role: true } },
  items: { include: { product: true } }
} satisfies Prisma.ChallanInclude;

export async function listChallans(query: {
  page: number;
  limit: number;
  status?: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  customerId?: string;
}) {
  const where: Prisma.ChallanWhereInput = {
    status: query.status,
    customerId: query.customerId
  };
  const [total, rows] = await prisma.$transaction([
    prisma.challan.count({ where }),
    prisma.challan.findMany({
      where,
      include: { customer: true, user: { select: { id: true, name: true, role: true } }, items: true },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    })
  ]);
  return { rows, meta: { page: query.page, limit: query.limit, total } };
}

export async function getChallan(id: string) {
  const challan = await prisma.challan.findUnique({ where: { id }, include: challanInclude });
  if (!challan) throw notFound('Challan');
  return challan;
}

export async function createChallan(data: {
  customerId: string;
  userId: string;
  status: 'DRAFT' | 'CONFIRMED';
  items: Array<{ productId: string; quantity: number }>;
}) {
  const customer = await prisma.customer.findFirst({ where: { id: data.customerId, deletedAt: null } });
  if (!customer) throw notFound('Customer');

  const created = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: data.items.map((item) => item.productId) } }
    });
    if (products.length !== data.items.length) throw notFound('Product');

    const productById = new Map(products.map((product) => [product.id, product]));
    const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);

    return tx.challan.create({
      data: {
        challanNumber: await generateChallanNumber(),
        customerId: data.customerId,
        userId: data.userId,
        status: 'DRAFT',
        totalQuantity,
        items: {
          create: data.items.map((item) => {
            const product = productById.get(item.productId)!;
            return {
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              unitPrice: product.unitPrice,
              quantity: item.quantity
            };
          })
        }
      },
      include: challanInclude
    });
  });

  if (data.status === 'CONFIRMED') {
    return confirmChallan(created.id, data.userId);
  }
  return created;
}

export async function updateDraftChallan(
  id: string,
  data: { customerId?: string; items?: Array<{ productId: string; quantity: number }> }
) {
  const existing = await getChallan(id);
  if (existing.status !== 'DRAFT') {
    throw new HttpError(422, 'CHALLAN_LOCKED', 'Only draft challans can be edited');
  }

  return prisma.$transaction(async (tx) => {
    if (data.customerId) {
      const customer = await tx.customer.findFirst({ where: { id: data.customerId, deletedAt: null } });
      if (!customer) throw notFound('Customer');
    }

    let totalQuantity = existing.totalQuantity;
    if (data.items) {
      const products = await tx.product.findMany({ where: { id: { in: data.items.map((item) => item.productId) } } });
      if (products.length !== data.items.length) throw notFound('Product');
      const productById = new Map(products.map((product) => [product.id, product]));
      totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);

      await tx.challanItem.deleteMany({ where: { challanId: id } });
      await tx.challanItem.createMany({
        data: data.items.map((item) => {
          const product = productById.get(item.productId)!;
          return {
            challanId: id,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            unitPrice: product.unitPrice,
            quantity: item.quantity
          };
        })
      });
    }

    return tx.challan.update({
      where: { id },
      data: { customerId: data.customerId, totalQuantity },
      include: challanInclude
    });
  });
}

export async function confirmChallan(challanId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id: challanId },
      include: { items: true }
    });
    if (!challan) throw notFound('Challan');
    if (challan.status !== 'DRAFT') {
      throw new HttpError(422, 'INVALID_CHALLAN_STATUS', 'Only draft challans can be confirmed');
    }

    for (const [index, item] of challan.items.entries()) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw notFound('Product');
      if (product.currentStock < item.quantity) {
        throw new HttpError(
          422,
          'INSUFFICIENT_STOCK',
          `${product.name} has only ${product.currentStock} units. Requested: ${item.quantity}.`,
          `items[${index}].quantity`
        );
      }
    }

    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } }
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: 'OUT',
          reason: `Challan ${challan.challanNumber}`,
          userId
        }
      });
    }

    return tx.challan.update({
      where: { id: challanId },
      data: { status: 'CONFIRMED' },
      include: challanInclude
    });
  });
}

export async function cancelChallan(challanId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id: challanId }, include: { items: true } });
    if (!challan) throw notFound('Challan');
    if (challan.status !== 'CONFIRMED') {
      throw new HttpError(422, 'INVALID_CHALLAN_STATUS', 'Only confirmed challans can be cancelled');
    }

    for (const item of challan.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { increment: item.quantity } }
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: 'IN',
          reason: `Challan ${challan.challanNumber} cancelled`,
          userId
        }
      });
    }

    return tx.challan.update({
      where: { id: challanId },
      data: { status: 'CANCELLED' },
      include: challanInclude
    });
  });
}
