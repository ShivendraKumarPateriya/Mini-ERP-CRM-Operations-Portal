import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const users: Array<{ name: string; email: string; password: string; role: Role }> = [
  { name: 'Anita Rao', email: 'admin@demo.com', password: 'Admin@1234', role: 'ADMIN' },
  { name: 'Rahul Sharma', email: 'sales@demo.com', password: 'Sales@1234', role: 'SALES' },
  { name: 'Amit Kulkarni', email: 'warehouse@demo.com', password: 'Whouse@1234', role: 'WAREHOUSE' },
  { name: 'Priya Nair', email: 'accounts@demo.com', password: 'Accounts@1234', role: 'ACCOUNTS' }
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: {
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }
    });
  }

  const sales = await prisma.user.findUniqueOrThrow({ where: { email: 'sales@demo.com' } });
  const warehouse = await prisma.user.findUniqueOrThrow({ where: { email: 'warehouse@demo.com' } });

  const customers = [
    {
      name: 'Mohan Mehta',
      businessName: 'Mehta Traders',
      mobile: '+919876543210',
      email: 'mohan@mehtatraders.test',
      gstNumber: '27ABCDE1234F1Z5',
      type: 'WHOLESALE' as const,
      address: 'MG Road, Pune',
      status: 'ACTIVE' as const,
      followUpDate: new Date(Date.now() + 86400000 * 3),
      notes: 'Prefers bulk dispatch before weekends.'
    },
    {
      name: 'Farhan Khan',
      businessName: 'Khan Retail Mart',
      mobile: '+919812345678',
      email: 'orders@khanmart.test',
      type: 'RETAIL' as const,
      address: 'Civil Lines, Jaipur',
      status: 'LEAD' as const,
      followUpDate: new Date(Date.now() + 86400000 * 1),
      notes: 'Interested in edible oils and grains.'
    },
    {
      name: 'Neha Desai',
      businessName: 'Desai Distribution',
      mobile: '+919700001234',
      gstNumber: '24BCDEF2345G1Z8',
      type: 'DISTRIBUTOR' as const,
      address: 'Ring Road, Surat',
      status: 'ACTIVE' as const
    }
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: `${customer.businessName.toLowerCase().replace(/\W+/g, '-')}` },
      update: {},
      create: {
        id: `${customer.businessName.toLowerCase().replace(/\W+/g, '-')}`,
        ...customer
      }
    });
  }

  const products = [
    { name: 'Basmati Rice 25kg', sku: 'SKU-RC-5001', category: 'Grains', unitPrice: '1850', currentStock: 176, minStockAlert: 40, warehouseLocation: 'A-12-03' },
    { name: 'Sunflower Oil 1L', sku: 'SKU-OL-2201', category: 'Edible Oils', unitPrice: '142', currentStock: 33, minStockAlert: 60, warehouseLocation: 'B-04-11' },
    { name: 'Basmati Rice 5kg', sku: 'SKU-RC-5041', category: 'Grains', unitPrice: '410', currentStock: 8, minStockAlert: 40, warehouseLocation: 'A-12-07' },
    { name: 'Toor Dal 1kg', sku: 'SKU-DL-1122', category: 'Pulses', unitPrice: '128', currentStock: 6, minStockAlert: 30, warehouseLocation: 'C-02-19' },
    { name: 'Wheat Flour 10kg', sku: 'SKU-FL-0087', category: 'Grains', unitPrice: '520', currentStock: 210, minStockAlert: 60, warehouseLocation: 'A-08-02' }
  ];

  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });

    const existingMovement = await prisma.stockMovement.findFirst({
      where: { productId: saved.id, reason: 'Opening stock' }
    });
    if (!existingMovement) {
      await prisma.stockMovement.create({
        data: {
          productId: saved.id,
          quantity: saved.currentStock,
          type: 'IN',
          reason: 'Opening stock',
          userId: warehouse.id
        }
      });
    }
  }

  const customer = await prisma.customer.findFirstOrThrow({ where: { businessName: 'Mehta Traders' } });
  const rice = await prisma.product.findUniqueOrThrow({ where: { sku: 'SKU-RC-5001' } });
  const oil = await prisma.product.findUniqueOrThrow({ where: { sku: 'SKU-OL-2201' } });

  const existingChallan = await prisma.challan.findUnique({ where: { challanNumber: `CH-${new Date().getFullYear()}-0001` } });
  if (!existingChallan) {
    await prisma.challan.create({
      data: {
        challanNumber: `CH-${new Date().getFullYear()}-0001`,
        customerId: customer.id,
        userId: sales.id,
        status: 'DRAFT',
        totalQuantity: 65,
        items: {
          create: [
            { productId: rice.id, productName: rice.name, productSku: rice.sku, unitPrice: rice.unitPrice, quantity: 40 },
            { productId: oil.id, productName: oil.name, productSku: oil.sku, unitPrice: oil.unitPrice, quantity: 25 }
          ]
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
