require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Connected via Prisma');

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  console.log('OrderStatus enum OK');

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  console.log('PaymentStatus enum OK');

  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT'`);
  console.log('status column OK');

  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING'`);
  console.log('paymentStatus column OK');

  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT`);
  console.log('paymentMethod column OK');

  await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  console.log('updatedAt column OK');

  // Regenerate prisma client
  await prisma.$disconnect();
  console.log('Migration complete!');
}

run().catch(async (e) => {
  console.error('ERROR:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
