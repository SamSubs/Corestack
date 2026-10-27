const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

async function loginAdmin() {
  try {
    const res = await axios.post(`${API_URL}/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    authToken = res.data.token;
    console.log('Login efetuado com sucesso para o teste.');
  } catch (error) {
    console.error('Falha no login:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testConcurrency() {
  console.log('Iniciando teste de stress de concorrência...');
  
  // Vamos tentar criar 20 pedidos simultaneamente para um mesmo usuário
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(axios.post(`${API_URL}/orders/create`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    }).catch(e => e.response));
  }

  const results = await Promise.all(promises);
  let successCount = 0;
  let rateLimitCount = 0;
  let errorCount = 0;

  results.forEach(res => {
    if (res.status === 201) successCount++;
    else if (res.status === 429) rateLimitCount++;
    else errorCount++;
  });

  console.log('Resultados da Criação de Pedidos Simultâneos:');
  console.log(`- Sucessos: ${successCount}`);
  console.log(`- Bloqueados pelo Rate Limit: ${rateLimitCount}`);
  console.log(`- Outros Erros: ${errorCount}`);
  
  if (rateLimitCount > 0) {
    console.log('✔ Rate Limiter transacional funcionou corretamente impedindo flood.');
  }

  console.log('Teste concluído.');
}

async function main() {
  await loginAdmin();
  await testConcurrency();
}

main();
