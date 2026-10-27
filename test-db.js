const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, image: true } });
  console.log('PRODUCTS:', JSON.stringify(products, null, 2));
  
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, password: true } });
  console.log('USERS:', JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
