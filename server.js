require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de CORS para permitir requisições do seu frontend
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'https://augustope99.github.io']
}));

app.get('/api/complice/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  const cleanedCnpj = cnpj.replace(/\D/g, '');

  if (cleanedCnpj.length !== 14) {
    return res.status(400).json({ status: 'error', message: 'CNPJ inválido.' });
  }
  
  const { QITECH_API_KEY, QITECH_BASE_URL } = process.env;

  if (!QITECH_API_KEY || !QITECH_BASE_URL) {
    console.error('ERRO: Credenciais da QI Tech (QITECH_API_KEY, QITECH_BASE_URL) não encontradas no .env');
    return res.status(500).json({ status: 'error', message: 'Erro de configuração no servidor.' });
  }

  const axiosConfig = {
    headers: {
      'api-key': QITECH_API_KEY,
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 segundos de timeout
  };

  try {
    // PASSO 1: Criar o cadastro da Pessoa Jurídica via POST
    console.log(`[QI Tech] Passo 1: Criando registro para o CNPJ ${cleanedCnpj}...`);
    const createUrl = `${QITECH_BASE_URL}/onboarding/legal_person`;
    const createBody = { cnpj: cleanedCnpj };
    
    const createResponse = await axios.post(createUrl, createBody, axiosConfig);

    const legalPersonId = createResponse.data?.legal_person_id;
    if (!legalPersonId) {
      console.error(`[QI Tech] Erro: 'legal_person_id' não foi retornado na criação para o CNPJ ${cleanedCnpj}. Resposta:`, createResponse.data);
      // Lança um erro para ser pego pelo bloco catch
      throw new Error("Falha ao obter ID da pessoa jurídica da QI Tech.");
    }
    console.log(`[QI Tech] Sucesso! legal_person_id: ${legalPersonId} obtido para o CNPJ ${cleanedCnpj}.`);

    // PASSO 2: Consultar o status da análise via GET usando o ID obtido
    console.log(`[QI Tech] Passo 2: Consultando status para o legal_person_id ${legalPersonId}...`);
    const statusUrl = `${QITECH_BASE_URL}/onboarding/legal_person/${legalPersonId}`;
    
    const statusResponse = await axios.get(statusUrl, axiosConfig);

    const analysisStatus = statusResponse.data?.analysis_status;
    if (!analysisStatus) {
        console.error(`[QI Tech] Erro: 'analysis_status' não foi retornado na consulta para o legal_person_id ${legalPersonId}. Resposta:`, statusResponse.data);
        throw new Error("Falha ao obter status da análise da QI Tech.");
    }
    console.log(`[QI Tech] Status da análise para ${legalPersonId}: ${analysisStatus}`);

    // PASSO 3: Interpretar o resultado e retornar para o frontend
    if (analysisStatus === 'approved') {
      res.json({ status: 'approved' });
    } else {
      // Status 'pending', 'rejected', 'blocked', etc., são tratados como 'rejected' para o frontend.
      res.json({ status: 'rejected' });
    }

  } catch (error) {
    // Tratamento de erro robusto para não quebrar o servidor
    if (error.response) {
      // A API da QI Tech respondeu com um status de erro (4xx, 5xx)
      console.error(`[QI Tech] Erro da API para o CNPJ ${cleanedCnpj}. Status: ${error.response.status}. Data:`, JSON.stringify(error.response.data, null, 2));
      
      // Retorna um erro genérico para o frontend, mas com o status code correto
      res.status(error.response.status).json({ status: 'error' });

    } else if (error.request) {
      // A requisição foi feita, mas não houve resposta (ex: timeout)
      console.error(`[QI Tech] Sem resposta da API para o CNPJ ${cleanedCnpj} (timeout ou sem conexão). Erro:`, error.message);
      res.status(504).json({ status: 'error' }); // 504 Gateway Timeout é apropriado

    } else {
      // Um erro ocorreu ao configurar a requisição
      console.error(`[QI Tech] Erro ao configurar a requisição para o CNPJ ${cleanedCnpj}. Erro:`, error.message);
      res.status(500).json({ status: 'error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
