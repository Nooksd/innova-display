const express = require('express');
const https = require('https');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware para permitir solicitações de qualquer origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(cors({
  origin: '*',
  methods: 'GET',
  allowedHeaders: ['Content-Type', 'Authorization', 'user', 'password']
}));

const basicAuth = (req, res, next) => {
  const user = req.headers.user;
  const password = req.headers.password;
  if (user === 'suportetecnico@innova-energy.com.br' && password === 'senha123') {
    next();
  } else {
    res.status(401);
    res.send('Access forbidden');
  }
}

const solarzApi = axios.create({
  baseURL: 'https://app.solarz.com.br/openApi',
  headers: {
    'Content-Type': 'aplication/json',
    'Access-Control-Allow-Origin': 'http://*, https://*'
  },
  auth: {
    username: 'suportetecnico@innova-energy.com.br',
    password: 'senha123'
  }
});


app.get('/:id', basicAuth, async (req, res) => {
  try {

    // Faz a solicitação para a API
    const response = await solarzApi.get(`/seller/plant/power?id=${req.params.id}`);

    // Retorna a resposta da API para o cliente
    res.send(response.data);
  } catch (error) {

    // Se houver um erro, envia uma resposta de erro para o cliente
    res.status(500).send('Erro ao acessar a API');
  }
});

app.get('/range/:id', basicAuth, async (req, res) => {
  const currentDate = new Date();

  const sixteenDaysAgo = new Date(currentDate.getTime() - (16 * 24 * 60 * 60 * 1000));
  const oneDayAgo = new Date(currentDate.getTime() - (1 * 24 * 60 * 60 * 1000));

  const yearP = sixteenDaysAgo.getFullYear();
  const monthP = (sixteenDaysAgo.getMonth() < 9 ? '0' : '') + (sixteenDaysAgo.getMonth() + 1);
  const dayP = (sixteenDaysAgo.getDate() < 10 ? '0' : '') + sixteenDaysAgo.getDate();

  const year = oneDayAgo.getFullYear();
  const month = (oneDayAgo.getMonth() < 9 ? '0' : '') + (oneDayAgo.getMonth() + 1);
  const day = (oneDayAgo.getDate() < 10 ? '0' : '') + oneDayAgo.getDate();

  const dataPassada = yearP + "-" + monthP + "-" + dayP;
  const dataAtual = year + "-" + month + "-" + day;

  const rangeData = {
    "fromLocalDate": dataPassada,
    "plantId": req.params.id,
    "toLocalDate": dataAtual
  }

  try {

    // Faz a solicitação para a API
    const response = await solarzApi.post('/seller/plant/energy/dayRange', rangeData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    )

    // Retorna a resposta da API para o cliente
    res.send(response.data);
  } catch (error) {

    // Se houver um erro, envia uma resposta de erro para o cliente
    res.status(500).send(error)
  }
});

app.get('/powerCurve/:id', basicAuth, async (req, res) => {

  const currentDate = new Date();
  
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() < 9 ? '0' : '') + (currentDate.getMonth() + 1);
  const day = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate();

  const date = year + "-" + month + "-" + day;


  try {

    // Faz a solicitação para a API
    const response = await solarzApi.get(`/seller/plantRealTimeData/powerCurve/day/${date}/unitePortals/true/plantId/${req.params.id}`)

    // Retorna a resposta da API para o cliente
    res.send(response.data);

  } catch (error) {

    // Se houver um erro, envia uma resposta de erro para o cliente
    res.status(500).send(error)
  }
});


app.get('/comparison/:id1/:id2/:id3', basicAuth, async (req, res) => {
  try {

    // Cria variáveis para função
    const allTotals = [];
    const ids = [req.params.id1, req.params.id2, req.params.id3];

    // pega todos os dados na api com os 3 ids
    for (const id of ids) {
      const response = await solarzApi.get(`/seller/plant/power?id=${id}`);
      allTotals.push(response.data.totalGenerated);
    }

    // Retorna a resposta da API para o cliente
    res.send(allTotals);
  } catch (error) {

    // Se houver um erro, envia uma resposta de erro para o cliente
    res.status(500).send('Erro ao acessar a API');
  }
});

// Configuração do servidor HTTPS
const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

// Inicia o servidor HTTPS
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});
