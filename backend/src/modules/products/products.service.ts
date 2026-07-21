import { Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { notFound } from '../../utils/httpError.js';

export function getStockStatus(currentStock: number, minStockAlert: number) {
  const pct = currentStock / minStockAlert;
  if (pct <= 1) return 'critical';
  if (pct <= 2) return 'low';
  return 'ok';
}

function withStockStatus<T extends { currentStock: number; minStockAlert: number }>(product: T) {
  return { ...product, stockStatus: getStockStatus(product.currentStock, product.minStockAlert) };
}

export async function listProducts(query: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}) {
  const where: Prisma.ProductWhereInput = {
    category: query.category,
    OR: query.search
      ? [
          { name: { contains: query.search, mode: 'insensitive' } },
          { sku: { contains: query.search, mode: 'insensitive' } },
          { category: { contains: query.search, mode: 'insensitive' } }
        ]
      : undefined
  };

  const products = await prisma.product.findMany({ where, orderBy: { updatedAt: 'desc' } });
  const filtered = query.lowStock
    ? products.filter((product) => product.currentStock <= product.minStockAlert)
    : products;
  const start = (query.page - 1) * query.limit;
  return {
    rows: filtered.slice(start, start + query.limit).map(withStockStatus),
    meta: { page: query.page, limit: query.limit, total: filtered.length }
  };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, role: true } } }
      }
    }
  });
  if (!product) throw notFound('Product');
  return withStockStatus(product);
}

export async function createProduct(data: Prisma.ProductCreateInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data });
    if (product.currentStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          type: 'IN',
          reason: 'Opening stock',
          userId
        }
      });
    }
    return product;
  });
}

export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  await getProduct(id);
  return prisma.product.update({ where: { id }, data });
}
