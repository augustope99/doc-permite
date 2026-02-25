require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req,res)=>{
  res.send('API QI TECH ONLINE');
});

app.get('/api/validacao/:cnpj', async (req, res) => {
  // Este endpoint agora espera um 'analysis_id' no lugar do CNPJ.
  const { cnpj: analysis_id } = req.params;
  
  if (!analysis_id) {
    return res.status(400).json({ status: "error", message: "analysis_id é obrigatório." });
  }

  if (!process.env.QITECH_API_KEY) {
    console.error("ERRO: QITECH_API_KEY não configurada no .env");
    return res.status(500).json({ status: "error", message: "API KEY não configurada no servidor." });
  }

  // Usando 'Bearer' conforme solicitado para este endpoint.
  const axiosConfig = {
    headers:{
      'Authorization': `Bearer ${process.env.QITECH_API_KEY}`,
      "Content-Type":"application/json"
    },
    timeout: 10000
  };

  const url = `${process.env.QITECH_BASE_URL}/onboarding/analyses/${analysis_id}`;
  console.log(`Consultando status da análise: ${analysis_id}`);

  try{
    const response = await axios.get(url, axiosConfig);
    
    // Extraindo e retornando os campos solicitados.
    const { id, status, created_at, updated_at } = response.data;
    
    res.json({
      analysis_id: id,
      status,
      created_at,
      updated_at
    });

  }
  catch(e){
    const errorMessage = e.response?.data || e.message;
    const errorStatus = e.response?.status || 500;
    console.error(`Erro ao consultar análise ${analysis_id}:`, errorMessage);
    res.status(errorStatus).json({ 
      status: "error", 
      message: "Falha ao consultar a análise.", 
      details: errorMessage 
    });
  }
});

app.listen(PORT,'0.0.0.0',()=>{
  console.log("Servidor rodando:",PORT);
});