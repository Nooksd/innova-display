<template>
  <!-- GRÁFICO DE COMPARAÇÂO -->

  <Doughnut v-if="loaded" :data="chartData" :options="chartOptions" width="250" />
  <!-- ANIMAÇÂO DE LOADING -->

  <h1 v-if="!loaded" class="loading">
    <span class="loader-bars">
      <span></span>
    </span>
    <span class="loader-bars" style="animation: grow 1.5s linear -.5s infinite;">
      <span></span>
    </span>
    <span class="loader-bars" style="animation: grow 1.5s linear infinite;">
      <span></span>
    </span>
    Carregando...
  </h1>

  <!-- ------------------- -->
</template>

<script setup>


// <--// IMPORTS DO SCRIPT //-->

import { Doughnut } from 'vue-chartjs';
import { onMounted, ref } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { solarzData } from '@/services/Http.js';


// <--// EXECUTA FUNÇÂO ANTES DE CARREGAR PÀGINA //-->

onMounted(() => {
  getData();
});

// <--// DECLARAÇÂO DE VARIÁVEIS //-->

const loaded = ref(false);
const dataV = ref([]);


// <--// REGISTRA O CONTEUDO DO GRÁFICO //-->

ChartJS.register(Title, Tooltip, Legend, ArcElement);


// <--// CONFIGURA DADOS DO GRÁFICO //-->

const chartData = {
  labels: '',
  height: '30px',
  datasets: [{
    label: "Total Gerado",
    data: dataV.value,
    backgroundColor: ['#00bf63', '#004aad', '#FAC83D'],
    borderWidth: 0,
    cutout: 80,
  }]
}
const chartOptions = {
  responsive: false,
  plugins: {
    tooltip: false,
    datalabels: {
      color: '#fff',
      formatter: (value, context) => `${value} mWh`,
    }
  }
}


// <--// FUNÇÔES //-->

// função pega dados do gráfico na api
async function getData() {
  try {
    const allTotals = [];
    const ids = ['157061', '186333', '799318'];

    // pega todos os dados na api com os 3 ids
    for (const id of ids) {
      const response = await solarzData.get(`power?id=${id}`);
      allTotals.push(response.data.totalGenerated);
    }


    dataV.value.push(Number(allTotals[0] / 1000).toFixed(0))
    dataV.value.push(Number(allTotals[1] / 1000).toFixed(0))
    dataV.value.push(Number(allTotals[2] / 1000).toFixed(0))
    loaded.value = true;
  } catch (e) {
    console.log(e)
  }
}
</script>

<style>
.loading {
  position: relative;
  font-size: 20px !important;
  display: flex;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
}

.loader-bars span {
  content: '';
  display: block;
  left: -15px;
  top: 0;
  width: 10px;
  height: 30px;
  margin-right: 5px;
  background-color: #fff;

  left: -45px;
  animation: grow 1.5s linear -1s infinite;
}

@keyframes grow {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }

  100% {
    transform: scaleY(0);
    opacity: 0;
  }
}
</style>
