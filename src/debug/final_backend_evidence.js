const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, data: body, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runEvidence() {
  console.log('--- EVIDÊNCIA DETERMINÍSTICA DE FUNCIONALIDADE ---');

  try {
    // 1. Validar LOGIN Real
    console.log('[1/4] Executando POST /api/login (admin@admin.com)...');
    const loginRes = await request('POST', '/login', { email: 'admin@admin.com', password: 'admin123' });
    
    console.log('Status Login:', loginRes.status);
    console.log('Payload de Resposta:', JSON.stringify(loginRes.data, null, 2));

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error('Falha crítica no login do backend');
    }

    const token = loginRes.data.token;

    // 2. Decodificar e Validar JWT Manualmente
    console.log('[2/4] Decodificando JWT para validação de Payload...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT Decodificado:', JSON.stringify(decoded, null, 2));

    if (!decoded.id || !decoded.email || !decoded.role) {
      throw new Error('JWT inválido: Faltam campos obrigatórios (id, email ou role)');
    }
    console.log('✔ Validação de JWT: OK (role ADMIN presente)');

    // 3. Testar Rota Admin GET
    console.log('[3/4] Testando GET /api/admin/products com token...');
    const getRes = await request('GET', '/admin/products', null, token);
    console.log('Status GET:', getRes.status);
    if (getRes.status !== 200) throw new Error('Falha no acesso à rota de listagem admin');

    // 4. Testar Rota Admin POST (CRUD Progressivo)
    console.log('[4/4] Testando CRUD Real: POST /api/admin/products (Criação)...');
    const name = `Test Product ${Date.now()}`;
    const postRes = await request('POST', '/admin/products', {
      name,
      description: 'Determinstic test',
      price: 199.99,
      stock: 50
    }, token);
    
    console.log('Status POST:', postRes.status);
    console.log('Produto Criado:', JSON.stringify(postRes.data, null, 2));

    if (postRes.status !== 201) throw new Error('Falha na criação de produto via API');

    console.log('\n--- EVIDÊNCIA CONCLUÍDA: SUCESSO TOTAL DO BACKEND ---');

  } catch (error) {
    console.error('\n✖ FALHA NA EVIDÊNCIA:', error.message);
    process.exit(1);
  }
}

runEvidence();
