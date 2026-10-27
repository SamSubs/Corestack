const http = require('http');

const API_URL = 'http://localhost:3000/api';

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const runTest = async () => {
  console.log('🚀 Iniciando Verificação do Sistema...\n');

  try {
    // 1. Registro
    const email = `admin_${Date.now()}@teste.com`;
    console.log(`[1/5] Registrando Administrador (${email})...`);
    const reg = await request('POST', '/register', {
      name: 'Admin Teste',
      email,
      password: 'password123',
      role: 'ADMIN'
    });
    if (reg.status !== 201) throw new Error('Falha no registro');

    // 2. Login
    console.log('[2/5] Realizando Login...');
    const log = await request('POST', '/login', {
      email,
      password: 'password123'
    });
    if (log.status !== 200 || !log.data.token) throw new Error('Falha no login');
    const token = log.data.token;

    // 3. Criar Produto (Admin)
    console.log('[3/5] Criando Produto via Painel Admin...');
    const prod = await request('POST', '/admin/products', {
      name: 'PlayStation 5',
      description: 'Console de nova geração',
      price: 4500,
      stock: 10
    }, token);
    if (prod.status !== 201) {
      console.error(`❌ Erro no passo 3: Status ${prod.status}`, prod.data);
      throw new Error('Falha ao criar produto');
    }
    const productId = prod.data.id;

    // 4. Adicionar ao Carrinho
    console.log('[4/5] Adicionando produto ao carrinho...');
    const cart = await request('POST', '/cart/add', {
      productId,
      quantity: 1
    }, token);
    if (cart.status !== 201) throw new Error('Falha ao adicionar ao carrinho');

    // 5. Checkout
    console.log('[5/5] Finalizando Pedido (Checkout)...');
    const order = await request('POST', '/orders/create', {}, token);
    if (order.status !== 201) throw new Error('Falha no checkout');

    console.log('\n✅ VERIFICAÇÃO COMPLETA: TODOS OS SISTEMAS OPERACIONAIS!');
    console.log(`ID do Pedido: ${order.data.id}`);
    console.log(`Total: R$ ${order.data.total}`);

  } catch (error) {
    console.error(`\n❌ ERRO NA VERIFICAÇÃO: ${error.message}`);
    process.exit(1);
  }
};

runTest();
