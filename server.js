require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'https://augustope99.github.io']
}));

function formatarCNPJ(cnpj) {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

app.get('/api/validacao/:cnpj', async (req, res) => {

  const { cnpj } = req.params;
  const cleanedCnpj = cnpj.replace(/\D/g, '');

  if (cleanedCnpj.length !== 14) {
    return res.status(400).json({
      status: "error",
      message: "CNPJ inválido"
    });
  }

  const formattedCnpj = formatarCNPJ(cleanedCnpj);

  console.log("Consultando status:", formattedCnpj);

  try {

    const response = await axios.get(
      `${process.env.QITECH_BASE_URL}/onboarding/legal_persons`,
      {
        params: {
          document_number: formattedCnpj
        },
        headers: {
          Authorization: process.env.QITECH_API_KEY
        },
        timeout: 10000
      }
    );

    const data = response.data;

    console.log("Resposta completa QI Tech:");
    console.log(JSON.stringify(data, null, 2));

    let analysisStatus = null;

    // Caso venha array direto
    if (Array.isArray(data) && data.length > 0) {
      analysisStatus = data[0]?.analysis_status;
    }

    // Caso venha objeto com data[]
    else if (data.data && data.data.length > 0) {
      analysisStatus = data.data[0]?.analysis_status;
    }

    // Caso venha objeto simples
    else if (data.analysis_status) {
      analysisStatus = data.analysis_status;
    }

    if (!analysisStatus) {
      return res.json({
        status: "not_found"
      });
    }

    console.log("Status retornado:", analysisStatus);

    let statusFinal = "pending";

    if (
      analysisStatus === "automatically_approved" ||
      analysisStatus === "manually_approved"
    ) {
      statusFinal = "approved";
    }

    if (
      analysisStatus === "rejected" ||
      analysisStatus === "blocked"
    ) {
      statusFinal = "rejected";
    }

    if (
      analysisStatus === "in_queue" ||
      analysisStatus === "pending"
    ) {
      statusFinal = "pending";
    }

    res.json({
      status: statusFinal,
      raw_status: analysisStatus
    });

  } catch (error) {

    if (error.response) {

      console.log("Erro QI Tech:");
      console.log(JSON.stringify(error.response.data, null, 2));

      return res.status(error.response.status).json({
        status: "error",
        message: error.response.data
      });

    }

    console.log("Erro geral:", error.message);

    res.status(500).json({
      status: "error"
    });

  }

});

app.listen(PORT, () => {
  console.log("Servidor rodando porta", PORT);
});