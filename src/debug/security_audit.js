const http = require('http');

const request = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

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

async function audit() {
  console.log('--- AUDITORIA DE SEGURANÇA: BYPASS DE SENHA ---');
  
  try {
    // Caso 1: Senha TOTALMENTE errada
    console.log('[1/2] Testando login com senha INCORRETA...');
    const resFail = await request('POST', '/login', { 
      email: 'admin@admin.com', 
      password: 'SENHA_ERRADA_123456_BYPASS' 
    });
    
    console.log('Status Retornado:', resFail.status);
    
    if (resFail.status === 200) {
      console.error('✖ CRÍTICO: LOGIN ACEITO COM SENHA ERRADA! BYPASS DETECTADO.');
    } else if (resFail.status === 401) {
      console.log('✔ SUCESSO: Login rejeitado (401 Unauthorized) conforme esperado.');
    } else {
      console.log('(!) Status inesperado:', resFail.status);
    }

    // Caso 2: Senha correta (para referência)
    console.log('\n[2/2] Testando login com senha CORRETA (admin123)...');
    const resSuccess = await request('POST', '/login', { 
      email: 'admin@admin.com', 
      password: 'admin123' 
    });
    console.log('Status Retornado:', resSuccess.status);
    if (resSuccess.status === 200) {
      console.log('✔ SUCESSO: Login aceito com senha correta.');
    }

  } catch (err) {
    console.error('Erro na auditoria:', err.message);
  }
}

audit();
