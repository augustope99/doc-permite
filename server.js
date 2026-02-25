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

function formatarCNPJ(cnpj) {
  // Formats a raw 14-digit CNPJ string into XX.XXX.XXX/XXXX-XX
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

app.get('/api/validacao/:cnpj', async (req, res) => {
  const cleanedCnpj = req.params.cnpj.replace(/\D/g, '');
  
  if (cleanedCnpj.length !== 14) {
    return res.status(400).json({ status: "error", message: "CNPJ inválido." });
  }

  if (!process.env.QITECH_CLIENT_ID || !process.env.QITECH_CLIENT_SECRET) {
    console.error("ERRO: QITECH_CLIENT_ID ou QITECH_CLIENT_SECRET não configurados no .env");
    return res.status(500).json({ status: "error", message: "Credenciais do servidor não configuradas." });
  }
  
  // The QI Tech API expects the CNPJ to be formatted in the query parameter.
  const formattedCnpj = formatarCNPJ(cleanedCnpj);
  
  const url = `${process.env.QITECH_BASE_URL}/onboarding/legal_persons?document_number=${formattedCnpj}`;
  console.log("URL:", url); // Debug log as requested

  try{
    console.log("Consultando status da análise:", formattedCnpj);

    // Create the Basic Auth token from client_id and client_secret, as required by the query endpoint.
    const auth = Buffer.from(
        `${process.env.QITECH_CLIENT_ID}:${process.env.QITECH_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        // Per your example, we are including Content-Type. The primary fix is the Authorization method.
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    // Use optional chaining and provide a default 'not_found' status if the CNPJ doesn't exist in QI Tech.
    const status = response.data.data[0]?.analysis_status || "not_found";

    console.log(`Status para ${formattedCnpj}: ${status}`);

    // Return the raw status to the frontend.
    res.json({
      status: status
    });

  }
  catch(e){
    console.log("Erro ao consultar análise", formattedCnpj, ":",
      e.response?.data || e.message
    );

    res.status(500).json({
      status: "error",
      erro: "Erro ao consultar QI Tech"
    });
  }
});

app.listen(PORT,'0.0.0.0',()=>{
  console.log("Servidor rodando:",PORT);
});