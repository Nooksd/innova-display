const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const basicAuth = (req, res, next) => {
  const user = req.headers.user;
  const password = req.headers.password;
  if (user === 'suportetecnico@innova-energy.com.br' && password === 'senha123') {
    next();
  } else {
    res.status(401).send('Access forbidden');
  }
}

const solarzApi = axios.create({
  baseURL: 'https://app.solarz.com.br/openApi',
  headers: {
    'Content-Type': 'application/json'
  },
  auth: {
    username: 'suportetecnico@innova-energy.com.br',
    password: 'senha123'
  }
});

app.get('/:id', basicAuth, async (req, res) => {
  try {
    const response = await solarzApi.get(`/seller/plant/power?id=${req.params.id}`);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Erro ao acessar a API');
  }
});

app.get('/range/:id', basicAuth, async (req, res) => {
  // O mesmo que o seu código atual...
});

app.get('/powerCurve/:id', basicAuth, async (req, res) => {
  // O mesmo que o seu código atual...
});

app.get('/comparison/:id1/:id2/:id3', basicAuth, async (req, res) => {
  // O mesmo que o seu código atual...
});

app.listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});
