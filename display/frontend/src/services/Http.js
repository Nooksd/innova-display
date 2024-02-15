import axios from "axios";

export const whetherApi = axios.create({
    baseURL: 'https://api.weatherapi.com/v1',
    headers: {
        'Content-Type': 'aplication/json'
    }
});

export const solarzProxyApi = axios.create({
    baseURL: 'https://192.168.1.102:3000/',
    headers: {
        'Content-Type': 'aplication/json',
        'user': 'suportetecnico@innova-energy.com.br',
        'password': 'senha123'
    }
});


export default whetherApi;