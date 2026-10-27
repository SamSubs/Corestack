const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function check() {
  console.log('--- INICIANDO CAPTURA DE GHOST (MONITORAMENTO DETERMINÍSTICO) ---');
  try {
    const originalHash = await bcrypt.hash('p@ssword123', 10);
    
    // Atualizar para valor conhecido
    console.log('[1/3] Resetando admin@admin.com para p@ssword123...');
    await prisma.user.update({
      where: { email: 'admin@admin.com' },
      data: { password: originalHash }
    });
    
    let current = await prisma.user.findUnique({ where: { email: 'admin@admin.com' } });
    console.log('Hash inicial salvo:', current.password);
    console.log('UpdatedAt inicial:', current.updatedAt);

    console.log('\n[2/3] Observando alterações no banco por 60 segundos...');
    console.log('(Pressione Ctrl+C para interromper se capturar antes)');

    const interval = setInterval(async () => {
      current = await prisma.user.findUnique({ where: { email: 'admin@admin.com' } });
      
      if (current.password === '123456') {
        console.log('\n🚨🚨 GHOST CAPTURADO! 🚨🚨');
        console.log('A senha foi sobrescrita para 123456!');
        console.log('Horário da detecção:', new Date().toISOString());
        console.log('UpdatedAt no banco:', current.updatedAt);
        console.log('\n[!] Se o console do servidor (Prisma Trace) estiver vazio, a alteração veio de FORA do Node.js.');
        clearInterval(interval);
        process.exit(0);
      } else {
        process.stdout.write('.'); // Batimento cardíaco
      }
    }, 2000);

    // Timeout de segurança após 1 minuto
    setTimeout(() => {
      console.log('\n\n[3/3] Tempo de observação esgotado. Nenhuma alteração ativa detectada.');
      clearInterval(interval);
      process.exit(0);
    }, 60000);

  } catch (error) {
    console.error('Erro na captura:', error.message);
    process.exit(1);
  }
}

check();
