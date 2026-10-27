const http = require('http');

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
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function test() {
  console.log('--- TESTE FINAL DO BACKEND ---');
  try {
    // 1. Login Admin
    console.log('[1/2] Testando LOGIN admin@admin.com...');
    const login = await request('POST', '/login', { email: 'admin@admin.com', password: 'admin123' });
    if (login.status !== 200) {
      console.error(`✖ Erro no login: Status ${login.status}`, login.data);
      return;
    }
    const token = login.data.token;
    console.log('✔ Login OK. Token recebido.');

    // 2. Acessar Rota Admin
    console.log('[2/2] Testando ACESSO ADMIN /api/admin/products...');
    const adminAccess = await request('GET', '/admin/products', null, token);
    
    if (adminAccess.status === 200) {
      console.log('✔ ACESSO CONCEDIDO! 200 OK');
      console.log('--- SISTEMA VALIDADO ---');
    } else {
      console.error(`✖ FALHA NO ACESSO: Status ${adminAccess.status}`, adminAccess.data);
    }
  } catch (err) {
    console.error('✖ ERRO NO TESTE:', err.message);
  }
}

test();
