<template>
  <!-- GRÁFICO DE GERAÇÃO -->

  <Line v-if="loaded" :data="chartData" :options="chartOptions" :height="chartHeight" :width="chartWidth" />


  <!-- ANIMAÇÃO DE LOADING -->

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
</template>
  
<script setup>


// <--// IMPORTS DO SCRIPT //-->

import { Line } from 'vue-chartjs';
import { onMounted, ref, defineProps, watch } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { solarzGenerationDay } from '@/services/Http.js';


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

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, ChartDataLabels);


// <--// CONFIGURA DADOS DO GRÁFICO //-->

const chartData = ref({
  datasets: [{
    data: [],
    backgroundColor: ['rgba(131, 255, 100, 0)'],
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 1)',
    fill: false,
    pointRadius: 0,
    pointHoverRadius: 0,
    cubicInterpolationMode: 'monotone',
  }]
});
const chartOptions = {
  responsive: false,
  maintainAspectRatio: false,
  Legend: false,
  scales: {
    x: {
      ticks: {
        display: true,
        color: white50,
        maxTicksLimit: 10
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
          return value + ' kW';
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
      color: 'rgba(0, 0, 0, 0)',
    }
  }
}


// <--// FUNÇÔES //-->

// função do vue para atualizar dados do gráfico
watch(() => props.usinaId, (newValue) => {
  console.log('atualizado: ', props.usinaId)
  dataV.value = [];
  labelV.value = [];
  getData(newValue);
});

async function getData(id) {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() < 9 ? '0' : '') + (currentDate.getMonth() + 1);
  const day = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate();

  const date = year + "-" + month + "-" + day;

  try {
    const response = await solarzGenerationDay.get(`${date}/unitePortals/true/plantId/${id}`);

    let solarData;

    if (response.data.length > 1) {
      solarData = response.data[1].points;
    } else {
      solarData = response.data[0].points;
    }

    solarData.forEach((e) => {
      if (e.value > 0) {
        dataV.value.push(e.value);
        labelV.value.push(e.time);
      }
    })

    loaded.value = true;
    chartData.value = {
      labels: labelV.value,
      datasets: [{
        data: dataV.value,
        backgroundColor: ['rgba(131, 255, 100, 0)'],
        borderWidth: 2,
        borderColor: 'rgba(131, 255, 100, 1)',
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        cubicInterpolationMode: 'monotone',
      }]
    };
  } catch (e) {
    console.log(e);
  }
}
</script>
