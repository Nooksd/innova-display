import axios from "axios";

export const whetherApi = axios.create({
    baseURL: 'https://api.weatherapi.com/v1',
    headers: {
        'Content-Type': 'aplication/json'
    }
});

export const solarzData = axios.create({
    baseURL: 'https://app.solarz.com.br/openApi/seller/plant/',
    headers: {
        'Content-Type': 'aplication/json',
    },
  auth: {
    username: 'suportetecnico@innova-energy.com.br',
    password: 'senha123'
  }
});

export const solarzGeneration = axios.create({
    baseURL: 'https://app.solarz.com.br/openApi/seller/plant/energy/',
    headers: {
        'Content-Type': 'aplication/json',
    },
  auth: {
    username: 'suportetecnico@innova-energy.com.br',
    password: 'senha123'
  }
});

export const solarzGenerationDay = axios.create({
    baseURL: 'https://app.solarz.com.br/openApi/seller/plantRealTimeData/powerCurve/day/',
    headers: {
        'Content-Type': 'aplication/json',
    },
  auth: {
    username: 'suportetecnico@innova-energy.com.br',
    password: 'senha123'
  }
});


export default whetherApi;