require('dotenv').config();
console.log("API KEY:", process.env.QITECH_API_KEY); // Log de debug inicial
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de CORS para permitir requisições do seu frontend
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'https://augustope99.github.io']
}));

function formatarCNPJ(cnpj) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

app.get('/api/validacao/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  const cleanedCnpj = cnpj.replace(/\D/g, '');

  // Log completo da request
  console.log("Chamando QI Tech...");
  console.log("CNPJ:", cleanedCnpj);
  console.log("API KEY definida:", !!process.env.QITECH_API_KEY);

  if (cleanedCnpj.length !== 14) {
    return res.status(400).json({ status: 'error', message: 'CNPJ inválido.' });
  }
  
  if (!process.env.QITECH_API_KEY) {
    return res.status(500).json({
      status: "error",
      message: "API KEY não configurada"
    });
  }

  const { QITECH_API_KEY, QITECH_BASE_URL } = process.env;

  const axiosConfig = {
    headers: {
      Authorization: QITECH_API_KEY, // Corrigido: Authorization direto (sem Bearer)
      "Content-Type": "application/json"
    },
    timeout: 10000
  };

  try {
    // PASSO 1: Preparar payload para criação e análise (Onboarding + Analyze KYC)
    // Usamos CNPJ_TIMESTAMP como ID para evitar conflito (409) em múltiplas consultas
    const uniqueId = `${cleanedCnpj}_${Date.now()}`;
    const formattedCnpj = formatarCNPJ(cleanedCnpj);
    
    console.log(`[QI Tech] Iniciando análise para ${formattedCnpj} (ID: ${uniqueId})...`);

    const createUrl = `${QITECH_BASE_URL}/onboarding/legal_person?analyze=true`;
    
    const createBody = {
      id: uniqueId,
      registration_date: new Date().toISOString(),
      legal_name: "Empresa Teste LTDA", // Dados fictícios para validação KYC básica
      trading_name: "Empresa Teste",
      document_number: formattedCnpj,
      foundation_date: "2020-01-01"
    };

    const createResponse = await axios.post(createUrl, createBody, axiosConfig);

    // PASSO 2: Ler resposta e traduzir status
    const analysisStatus = createResponse.data?.analysis_status;
    console.log(`[QI Tech] Status retornado para ${uniqueId}: ${analysisStatus}`);

    // Mapeamento de status
    if (analysisStatus === 'automatically_approved' || analysisStatus === 'manually_approved') {
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
