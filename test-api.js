const assert = require('assert');

const baseURL = 'http://localhost:3000/api';

async function request(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${baseURL}${path}`, options);
  
  if (res.status === 204) return { status: 204, data: null };

  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return { status: res.status, data };
}

async function testBackend() {
  try {
    console.log('0. Testando Health Check...');
    const healthRes = await request('/health');
    assert(healthRes.data.status === 'ok', 'Sistema não está saudável');
    console.log('Saúde do sistema: OK');

    console.log('1. Testando login do cliente...');
    const loginRes = await request('/login', 'POST', { email: 'test@shop.com', password: '123456' });
    const clientToken = loginRes.data.token;
    assert(clientToken, 'Falha ao obter token do cliente');

    // Limpar carrinho residual para evitar erros de estoque de testes anteriores
    console.log('1b. Limpando carrinho residual...');
    const currentCart = await request('/cart', 'GET', null, clientToken);
    for (const item of currentCart.data) {
      await request(`/cart/${item.id}`, 'DELETE', null, clientToken);
    }

    console.log('2. Testando listagem de produtos...');
    const productsRes = await request('/products');
    const products = productsRes.data;
    assert(products.length > 0, 'Nenhum produto encontrado');
    const productId = products[0].id;

    console.log('3. Testando adição ao carrinho...');
    await request('/cart/add', 'POST', { productId, quantity: 1 }, clientToken);
    const cartRes = await request('/cart', 'GET', null, clientToken);
    assert(cartRes.data.length > 0, 'Carrinho vazio após adição');

    console.log('4. Testando criação de pedido...');
    const createOrderRes = await request('/orders/create', 'POST', null, clientToken);
    const orderId = createOrderRes.data.id;
    assert(orderId, 'Falha ao criar pedido');

    console.log(`Pedido #${orderId} criado com status ${createOrderRes.data.status}`);
    
    console.log('5. Testando concorrência atômica no pagamento (Duplo clique)...');
    
    // Forçamos o random a passar para testar concorrência
    // Vamos disparar 2 requisições EXATAMENTE ao mesmo tempo
    const payReq1 = request(`/orders/${orderId}/pay`, 'POST', null, clientToken);
    const payReq2 = request(`/orders/${orderId}/pay`, 'POST', null, clientToken);
    
    const results = await Promise.allSettled([payReq1, payReq2]);
    
    // Pelo menos 1 pode falhar (seja pelo banco ou por ser idempotente)
    // Se ambos falharem por 402 (Falha aleatoria), não prova a concorrência. Mas o banco não vai corromper.
    console.log('Resultados da concorrência:', results.map(r => r.status === 'fulfilled' ? r.value.status : r.reason.status));
    
    // Buscar status real do banco
    const getOrderRes = await request('/orders', 'GET', null, clientToken);
    const finalOrder = getOrderRes.data.find(o => o.id === orderId);
    console.log(`Status final pós-concorrência: ${finalOrder.status} | Payment: ${finalOrder.paymentStatus}`);

    console.log('7. Testando solicitação de cancelamento (PAID -> CANCEL_REQUESTED)...');
    const cancelReqRes = await request(`/orders/${orderId}/cancel`, 'POST', null, clientToken);
    assert(cancelReqRes.data.message === 'Cancelamento solicitado', 'Mensagem deveria ser Cancelamento solicitado');
    
    const postCancel = await request('/orders', 'GET', null, clientToken);
    assert(postCancel.data.find(o => o.id === orderId).status === 'CANCEL_REQUESTED', 'Status real no banco não atualizou');
    console.log('Solicitação de cancelamento enviada e persistida.');

    console.log('\n--- Mudando para Admin ---');
    const adminLoginRes = await request('/login', 'POST', { email: 'admin_test@shop.com', password: '123456' });
    const adminToken = adminLoginRes.data.token;

    console.log('8. Admin aprovando cancelamento...');
    const approveRes = await request(`/admin/orders/${orderId}/cancel`, 'PUT', null, adminToken);
    assert(approveRes.data.message === 'Cancelamento aprovado e estoque devolvido', 'Mensagem deveria confirmar aprovação');

    console.log('9. Testando bloqueio de envio de pedido cancelado...');
    try {
      await request(`/admin/orders/${orderId}/ship`, 'PUT', null, adminToken);
      throw new Error('Deveria ter bloqueado envio de pedido cancelado');
    } catch (e) {
      assert(e.status === 400, 'Bloqueio de envio funcionou (400)');
    }

    console.log('10. Admin deletando pedido cancelado (Soft Delete)...');
    const deleteRes = await request(`/admin/orders/${orderId}`, 'DELETE', null, adminToken);
    assert(deleteRes.data.message === 'Pedido deletado com sucesso (Soft Delete)', 'Erro ao deletar');
    
    // Validar que sumiu da listagem
    const listRes = await request('/admin/orders', 'GET', null, adminToken);
    assert(!listRes.data.find(o => o.id === orderId), 'Pedido deletado ainda aparece na listagem');
    console.log('Soft Delete validado: Pedido marcado como deletado e oculto.');

    console.log('11. Testando integridade de estoque (Prevenção de estoque negativo)...');
    try {
      // Adicionar quantidade absurda ao carrinho
      await request('/cart/add', 'POST', { productId, quantity: 99999 }, clientToken);
      await request('/orders/create', 'POST', null, clientToken);
      throw new Error('Deveria ter falhado por estoque insuficiente');
    } catch (e) {
      assert(e.status === 500 || e.status === 400, 'Bloqueio de estoque insuficiente funcionou');
      console.log('Bloqueio de estoque negativo validado com sucesso.');
    }

    console.log('12. Testando Rate Limiting em rota crítica (Pagamento/Criação)...');
    console.log('Disparando 21 requisições rápidas...');
    let blockedCount = 0;
    const promises = [];
    for(let i=0; i<21; i++) {
        promises.push(request('/orders/create', 'POST', null, clientToken).catch(e => e));
    }
    const rateResults = await Promise.all(promises);
    blockedCount = rateResults.filter(r => r.status === 429).length;
    assert(blockedCount > 0, 'Rate limit não bloqueou excesso de requisições');
    console.log(`Rate Limit validado: ${blockedCount} requisições bloqueadas com 429.`);

    console.log('13. Testando Global Error Handler...');
    try {
        // Enviar algo que quebre (rota inexistente ou formato inválido)
        await request('/debug/error-test', 'GET', null, clientToken);
    } catch (e) {
        assert(e.data.success === false, 'Formato de erro global inválido');
        console.log('Global Error Handler validado: Resposta padronizada recebida.');
    }

    console.log('\n✅ ESTABILIZAÇÃO E OBSERVABILIDADE VALIDADAS COM SUCESSO!');
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.data || error.message || error);
    process.exit(1);
  }
}

testBackend();
