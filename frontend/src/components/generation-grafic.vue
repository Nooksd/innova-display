<template>
  <!-- GRÁFICO DE GERAÇÂO -->

  <Bar v-if="loaded" :data="chartData" :options="chartOptions" :height="chartHeight" :width="chartWidth" />
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

import { Bar } from 'vue-chartjs';
import { onMounted, ref, defineProps, watch } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { solarzGeneration } from '@/services/Http.js';


// <--// EXECUTA FUNÇÂO ANTES DE CARREGAR PÀGINA //-->

onMounted(() => {
  getData(props.usinaId);
});


// <--// DECLARAÇÂO DE VARIÁVEIS //-->

const props = defineProps(['usinaId']);
const loaded = ref(false);
const dataV = ref([]);
const labelV = ref([]);
const white50 = 'rgba(255, 255, 255, .5)';
const chartHeight = 430;
const chartWidth = 1160;


// <--// REGISTRA O CONTEUDO DO GRÁFICO //-->

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);


// <--// CONFIGURA DADOS DO GRÁFICO //-->

const chartData = ref({
  datasets: [{
    data: [],
    backgroundColor: ['rgba(131, 255, 100, 1)'],
    borderWidth: 0,
    borderColor: "black",
  }]
});
const chartOptions = {
  responsive: false,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        display: true,
        color: white50,
      },
      grid: {
        display: false,
      }
    },
    y: {
      ticks: {
        beginAtZero: true,
        color: white50,
        callback: function (value, index, values) {
          return value + ' kWh';
        }
      },
      grid: {
        color: white50,
      }
    }
  },
  plugins: {
    tooltip: false,
    legend: false,
    datalabels: {
      color: '#fff',
      anchor: 'end',
      align: 'bottom',
      formatter: (value, context) => `${value} kWh`,
      offset: 0
    }
  },
}


// <--// FUNÇÔES //-->

// função do vue para atualizar dados do gráfico
watch(() => props.usinaId, (newValue) => {
  dataV.value = [];
  labelV.value = [];
  getData(newValue);
});

// função pega dados do gráfico na api
async function getData(id) {
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
    "plantId": id,
    "toLocalDate": dataAtual
  }

  try {
    const response = await solarzGeneration.get(`dayRange`, rangeData);

    response.data.forEach((e) => {
      dataV.value.push(Number(e.total).toFixed(0));
      labelV.value.push(e.date.slice(5, e.date.length));
    })

    loaded.value = true;
    chartData.value = {
      labels: labelV.value,
      datasets: [{
        data: dataV.value,
        backgroundColor: ['rgba(131, 255, 100, 0.8)'],
        borderWidth: 0,
        borderColor: "black",
      }]
    };
  } catch (e) {
    console.log(e);
  }
}
</script>
