// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Habilita o CORS para que seu frontend (GitHub Pages) possa acessar este servidor
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const QITECH_API_URL = process.env.QITECH_API_URL || 'https://api.caas.qitech.app/onboarding';
const QITECH_API_KEY = process.env.QITECH_API_KEY;

/**
 * Formata um CNPJ numérico (ex: 11111111000111) para o formato com máscara (ex: 11.111.111/0001-11)
 * que é exigido pela API da QI Tech.
 * @param {string} cnpj - O CNPJ sem formatação.
 * @returns {string} - O CNPJ formatado.
 */
function formatCnpj(cnpj) {
    if (!cnpj || cnpj.length !== 14) return cnpj;
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}


// Endpoint que o frontend vai chamar
// Ex: GET /api/validacao/11111111000111
app.get('/api/validacao/:cnpj', async (req, res) => {
    const { cnpj } = req.params;

    if (!cnpj || cnpj.length !== 14) {
        return res.status(400).json({ message: 'CNPJ inválido. Deve conter 14 dígitos numéricos.' });
    }

    // O ID da análise deve ser único para cada requisição
    const analysisId = `${cnpj}-${Date.now()}`;

    // Corpo da requisição para a API da QI Tech
    // Apenas os campos obrigatórios são enviados para uma análise simples
    const requestBody = {
        id: analysisId,
        registration_date: new Date().toISOString(),
        document_number: formatCnpj(cnpj), // A API espera o CNPJ com máscara
    };

    try {
        console.log(`Iniciando análise para o CNPJ: ${formatCnpj(cnpj)} com ID: ${analysisId}`);

        if (!QITECH_API_KEY) {
            throw new Error('A variável de ambiente QITECH_API_KEY não está definida. Verifique o arquivo .env');
        }

        const url = `${QITECH_API_URL}/legal_person?analyze=true`;
        console.log(`Consultando URL: ${url}`);

        const response = await axios.post(
            url,
            requestBody,
            {
                headers: {
                    'Authorization': `ApiKey ${QITECH_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Resposta da QI Tech:', response.data);

        // Retorna para o frontend apenas o status da análise
        res.json({
            status: response.data.analysis_status,
            raw_response: response.data // opcional: para debug no frontend
        });

    } catch (error) {
        console.error('Erro ao chamar a API da QI Tech:', error.response ? error.response.data : error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.error('❌ ERRO DE DNS: O domínio da API não foi encontrado.');
            console.error('Verifique o arquivo .env. A URL correta deve ser: https://api.caas.qitech.app/onboarding');
        }

        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data : 'Erro interno no servidor.';

        res.status(status).json({ message: 'Falha ao consultar a API da QI Tech.', details: message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    
    // Validação preventiva da URL ao iniciar
    if (!QITECH_API_URL.includes('.caas.') || !QITECH_API_URL.includes('/onboarding')) {
        console.warn('\n⚠️  ALERTA DE CONFIGURAÇÃO:');
        console.warn(`A URL da API parece incorreta: ${QITECH_API_URL}`);
        console.warn('Verifique o arquivo .env. Deveria ser: https://api.caas.qitech.app/onboarding\n');
    }

    console.log(`Pronto para receber consultas de CNPJ.`);
});