const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Corrigindo Imagens ---');
  const products = await prisma.product.findMany();
  let updatedCount = 0;
  
  for (const p of products) {
    if (p.image) {
      let newImage = p.image;
      
      // Remove host se existir
      if (newImage.startsWith('http://localhost:3000')) {
        newImage = newImage.replace('http://localhost:3000', '');
      }
      
      // Garante que começa com /uploads/
      if (newImage.startsWith('uploads/')) {
        newImage = '/' + newImage;
      }
      
      if (newImage !== p.image) {
        await prisma.product.update({
          where: { id: p.id },
          data: { image: newImage }
        });
        updatedCount++;
        console.log(`Produto ${p.id} corrigido: ${p.image} -> ${newImage}`);
      }
    }
  }
  console.log(`${updatedCount} imagens corrigidas.\n`);

  console.log('--- Corrigindo Admin ---');
  const hash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      password: hash,
      role: 'ADMIN'
    },
    create: {
      name: 'Admin Global',
      email: 'admin@admin.com',
      password: hash,
      role: 'ADMIN'
    }
  });
  
  console.log(`Admin configurado com sucesso: ${admin.email}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
