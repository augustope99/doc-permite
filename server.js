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
    console.error('Credenciais da QI Tech não encontradas no .env');
    return res.status(500).json({ status: 'error', message: 'Erro de configuração no servidor.' });
  }

  const url = `${QITECH_BASE_URL}/onboarding/legal_person/${cleanedCnpj}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'api-key': QITECH_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // Timeout de 10 segundos
    });

    const compliceStatus = response.data?.status?.value;

    // Mapeia os status da QI Tech para os status simplificados do frontend
    if (compliceStatus === 'approved') {
      res.json({ status: 'approved' });
    } else {
      // 'rejected', 'pending', 'blocked', etc. são tratados como não aprovados
      res.json({ status: 'rejected' });
    }

  } catch (error) {
    console.error(`Erro ao consultar API da QI Tech para o CNPJ ${cleanedCnpj}:`, error.message);
    
    // Retorna um erro genérico para o frontend
    res.status(500).json({ status: 'error', message: 'Falha ao consultar o serviço de validação.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
