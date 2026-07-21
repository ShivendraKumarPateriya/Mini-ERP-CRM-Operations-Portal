import { prisma } from '../../utils/prisma.js';
import { HttpError, notFound } from '../../utils/httpError.js';

export async function createStockMovement(data: {
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) throw notFound('Product');

    if (data.type === 'OUT' && product.currentStock < data.quantity) {
      throw new HttpError(
        422,
        'INSUFFICIENT_STOCK',
        `${product.name} has only ${product.currentStock} units. Requested: ${data.quantity}.`,
        'quantity'
      );
    }

    await tx.product.update({
      where: { id: product.id },
      data: { currentStock: data.type === 'IN' ? { increment: data.quantity } : { decrement: data.quantity } }
    });

    return tx.stockMovement.create({
      data: {
        productId: product.id,
        quantity: data.quantity,
        type: data.type,
        reason: data.reason,
        userId: data.userId
      }
    });
  });
}
