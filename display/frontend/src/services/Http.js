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
        'user': import.meta.env.VITE_USER,
        'password': import.meta.env.VITE_PASSWORD
    }
});


export default whetherApi;