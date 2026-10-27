const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

const runDebug = async () => {
  console.log('--- INICIANDO DEBUG DE IDENTIDADE ---');

  try {
    // 1. Validar Usuário Admin no Banco
    console.log('[1/4] Verificando usuários ADMIN...');
    let admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    
    if (admins.length === 0) {
      console.log('(!) Nenhum admin encontrado. Criando admin padrão...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'admin@loja.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✔ Admin criado:', newAdmin.email);
      admins = [newAdmin];
    } else {
      console.log(`✔ ${admins.length} admin(s) encontrado(s). Primeiro:`, admins[0].email);
    }

    const adminUser = admins[0];

    // 2. Validar Login e JWT
    console.log('[2/4] Validando geração de JWT...');
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('✔ Token gerado.');

    // 3. Inspecionar JWT decodificado
    console.log('[3/4] Inspecionando conteúdo do JWT...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Conteúdo:', decoded);

    const hasCorrectFields = decoded.id && decoded.email && decoded.role;
    if (hasCorrectFields) {
      console.log('✔ JWT contém id, email e role.');
    } else {
      console.error('✖ JWT ESTÁ DEFINIDO INCORRETAMENTE!');
    }

    // 4. Verificação de Middleware (Simulada)
    console.log('[4/4] Validando padronização req.user...');
    const req = { headers: { authorization: `Bearer ${token}` } };
    
    // Simulação do authMiddleware
    const extractedToken = req.headers.authorization.split(' ')[1];
    const userPayload = jwt.verify(extractedToken, JWT_SECRET);
    req.user = {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role
    };

    console.log('Simulação req.user:', req.user);
    if (req.user.role === 'ADMIN') {
      console.log('✔ adminMiddleware passaria com req.user.role === "ADMIN"');
    } else {
      console.error('✖ FALHA: req.user.role não é ADMIN!');
    }

    console.log('\n--- DEBUG CONCLUÍDO ---');

  } catch (error) {
    console.error('--- ERRO NO DEBUG ---:', error);
  } finally {
    await prisma.$disconnect();
  }
};

runDebug();
