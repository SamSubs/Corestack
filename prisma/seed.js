const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed...');

    // 1. Limpar dados antigos (opcional, para evitar duplicatas ao testar)
    await prisma.service.deleteMany();
    await prisma.project.deleteMany();

    // 2. Criar Serviços reais para o Core Stack
    await prisma.service.createMany({
        data: [
            {
                name: 'Automação de Processos',
                description: 'Desenvolvimento de fluxos inteligentes com n8n e Node.js para otimização de tempo e redução de erros.',
                active: true
            },
            {
                name: 'Desenvolvimento Android Nativo',
                description: 'Criação de aplicativos robustos em Java/Kotlin, focados em performance e integração de sistemas.',
                active: true
            },
            {
                name: 'Sistemas de Análise Financeira',
                description: 'Dashboards e automações para monitoramento de ativos na B3 e mercado de Criptomoedas.',
                active: true
            }
        ]
    });

    // 3. Criar Projetos reais
    await prisma.project.createMany({
        data: [
            {
                title: 'TradingView Auto-Analyzer',
                description: 'Agente que captura gráficos do TradingView e processa indicadores técnicos via n8n.',
                techStack: ['n8n', 'Node.js', 'TradingView API'],
            },
            {
                title: 'Android System Sync',
                description: 'Sistema de sincronização de arquivos e notificações entre Android e ambiente Mac/Windows.',
                techStack: ['Java', 'Android SDK', 'Firebase'],
            }
        ]
    });

    console.log('Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error('Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });