import { Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { notFound } from '../../utils/httpError.js';

export async function listCustomers(query: {
  page: number;
  limit: number;
  status?: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  type?: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  search?: string;
}) {
  const where: Prisma.CustomerWhereInput = {
    deletedAt: null,
    status: query.status,
    type: query.type,
    OR: query.search
      ? [
          { name: { contains: query.search, mode: 'insensitive' } },
          { businessName: { contains: query.search, mode: 'insensitive' } },
          { mobile: { contains: query.search, mode: 'insensitive' } }
        ]
      : undefined
  };
  const [total, rows] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    })
  ]);
  return { rows, meta: { page: query.page, limit: query.limit, total } };
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, deletedAt: null },
    include: { followUps: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, role: true } } } } }
  });
  if (!customer) throw notFound('Customer');
  return customer;
}

export async function createCustomer(data: Prisma.CustomerCreateInput) {
  return prisma.customer.create({ data });
}

export async function updateCustomer(id: string, data: Prisma.CustomerUpdateInput) {
  await getCustomer(id);
  return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(id: string) {
  await getCustomer(id);
  return prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function addFollowUp(customerId: string, userId: string, note: string) {
  await getCustomer(customerId);
  return prisma.followUp.create({ data: { customerId, userId, note } });
}
