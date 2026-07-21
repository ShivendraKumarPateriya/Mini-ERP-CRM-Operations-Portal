import { prisma } from './prisma.js';

export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastChallan = await prisma.challan.findFirst({
    where: { challanNumber: { startsWith: `CH-${year}-` } },
    orderBy: { createdAt: 'desc' }
  });
  const lastNumber = lastChallan ? Number.parseInt(lastChallan.challanNumber.split('-')[2] ?? '0', 10) : 0;
  return `CH-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
}
