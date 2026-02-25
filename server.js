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
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

app.get('/api/validacao/:cnpj', async (req, res) => {

  const cleanedCnpj =
    req.params.cnpj.replace(/\D/g,'');

  if(cleanedCnpj.length !== 14){
    return res.json({status:"error"});
  }

  const axiosConfig = {
    headers:{
      Authorization:process.env.QITECH_API_KEY,
      "Content-Type":"application/json"
    }
  };

  try{

    const id =
      cleanedCnpj+"_"+Date.now();

    const response =
    await axios.post(

      process.env.QITECH_BASE_URL+
      "/onboarding/legal_person?analyze=true",

      {
        id:id,
        registration_date:new Date().toISOString(),
        legal_name:"Empresa Teste LTDA",
        trading_name:"Empresa Teste",
        document_number:formatarCNPJ(cleanedCnpj),
        foundation_date:"2020-01-01"
      },

      axiosConfig
    );

    const s=response.data.analysis_status;

    if(s=="automatically_approved"||s=="manually_approved")
      return res.json({status:"approved"});

    if(s=="in_queue"||s=="pending")
      return res.json({status:"pending"});

    return res.json({status:"rejected"});

  }
  catch(e){

    console.log(e.response?.data||e.message);

    res.json({status:"error"});

  }

});

app.listen(PORT,'0.0.0.0',()=>{
  console.log("Servidor rodando:",PORT);
});