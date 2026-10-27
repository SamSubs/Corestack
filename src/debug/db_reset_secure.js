const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function deepReset() {
  console.log('--- INICIANDO LIMPEZA DEFINITIVA DO BANCO ---');
  try {
    // 1. Limpeza em cascata (FKeys)
    console.log('[1/3] Removendo itens de pedidos...');
    await prisma.orderItem.deleteMany({});
    
    console.log('[1/3] Removendo pedidos...');
    await prisma.order.deleteMany({});
    
    console.log('[1/3] Removendo itens do carrinho...');
    await prisma.cartItem.deleteMany({});
    
    console.log('[1/3] Removendo TODOS os usuários...');
    await prisma.user.deleteMany({});
    
    console.log('✔ Banco de dados limpo com sucesso.');

    // 2. Recriação Segura do Admin
    console.log('[2/3] Criando admin oficial (admin@admin.com)...');
    const hash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin Oficial',
        email: 'admin@admin.com',
        password: hash,
        role: 'ADMIN'
      }
    });
    console.log('✔ Admin criado com hash bcrypt:', admin.email);

    // 3. Verificação de Integridade
    console.log('[3/3] Verificando integridade da senha...');
    const verify = await prisma.user.findUnique({ where: { email: 'admin@admin.com' } });
    if (verify.password.startsWith('$2b$')) {
      console.log('✔ Integridade confirmada: Senha é um hash bcrypt válido.');
    } else {
      throw new Error('FALHA DE SEGURANÇA: Senha não foi criptografada!');
    }

    console.log('\n--- LIMPEZA E RECRIAÇÃO CONCLUÍDAS COM SUCESSO ---');

  } catch (error) {
    console.error('\n✖ ERRO CRÍTICO NO RESET:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deepReset();
