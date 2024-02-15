<script setup>


// <--// IMPORTS DO SCRIPT //-->

import { onMounted, reactive, ref, watch } from 'vue';
import { whetherApi, solarzProxyApi } from '@/services/Http.js';
import comparisonGraph from '../src/components/comparison-grafic.vue';
import generationGraph from '../src/components/generation-grafic.vue';
import generationGraphDay from '../src/components/generation-day-grafic.vue';


// <--// EXECUTA FUNÇÂO ANTES DE CARREGAR PÀGINA //-->

onMounted(() => {
  getWhetherData();
  getOpenApiData(idUsina.value);
});


// <--// DECLARAÇÂO DE VARIÁVEIS //-->

const loaded = ref(false);
const canSwitch = ref(true);
const idUsina = ref(0);
let dataInterval;
const usinas = ['157061', '186333', '799318'];
const timeNow = ref('');
const whetherUberaba = reactive({
  icon: '',
  title: '',
  temp: '',
  humidity: '',
  time: ''
})
const usinaInfo = reactive({
  installedPower: ['carregando...', 'carregando...', 'carregando...'],
  instantPower: ['carregando...', 'carregando...', 'carregando...'],
  plantName: ['carregando...', 'carregando...', 'carregando...'],
  status: ['carregando...', 'carregando...', 'carregando...'],
  totalGenerated: ['carregando...', 'carregando...', 'carregando...']
})


// <--// FUNÇÔES //-->

// função do vue para começar intervals depois que página carregou
watch(
  () => loaded.value, () => {
    if (loaded.value === true) {
      startInterval();
    }
  }
);

// função pega informações sobre o tempo uberaba
async function getWhetherData() {
  let whether = await whetherApi.get(`current.json?key=33d417b2a82440a7b29140126240702&q=uberaba&lang=pt`);
  whether = whether.data.current;

  // atribui dados da api
  whetherUberaba.icon = whether.condition.icon;
  whetherUberaba.title = whether.condition.text;
  whetherUberaba.temp = whether.temp_c;
  whetherUberaba.humidity = whether.humidity;
}

// função pega informações da OpenApi 
async function getOpenApiData(id) {
  try {
    const { data } = await solarzProxyApi.get(`${usinas[id]}`);

    // atribui dados da api
    usinaInfo.installedPower[id] = data.installedPower;
    usinaInfo.instantPower[id] = Number(data.instantPower).toFixed(2);
    usinaInfo.plantName[id] = data.plantName;
    usinaInfo.status[id] = data.status;
    usinaInfo.totalGenerated[id] = Number(data.totalGenerated / 1000).toFixed(2);

    loaded.value = true;
    graphswitch();
  } catch (e) {
    console.log(e)
  }
}

// função que muda a página foco pela classe e faz a animação
function pageSwitch() {
  canSwitch.value = false;

  const page1 = document.querySelector('#main-1');
  const page2 = document.querySelector('#main-2');

  if (page1.classList.contains('in-view')) {

    pauseInterval();

    page1.classList.remove("in-view");
    page1.classList.add("go-up");
    page2.classList.add("in-view");
  } else {

    setTimeout(() => {
      startInterval();
      graphswitch();
    }, 2000);

    page2.classList.remove("in-view");
    page2.classList.add("go-up");
    page1.classList.add("in-view");
  }

  setTimeout(() => {
    page1.classList.remove("go-up");
    page2.classList.remove("go-up");
    canSwitch.value = true;
  }, 2000)
}

// função pega horário atual
function time() {
  timeNow.value = new Date().toLocaleTimeString()
}

function graphswitch() {
  const grafic16Days = document.querySelector('#grafic-16-days');
  const graficDay = document.querySelector('#grafic-day');

  if (graficDay.classList.contains('grafic-in-view')) {
    graficDay.classList.add('grafic-out-of-view');
  }

  grafic16Days.classList.add('grafic-in-view');
  graficDay.classList.remove('grafic-in-view');

  setTimeout(() => {
    grafic16Days.classList.remove('grafic-in-view');
    grafic16Days.classList.add('grafic-out-of-view');
    graficDay.classList.add('grafic-in-view');

    setTimeout(() => {
      grafic16Days.classList.remove("grafic-out-of-view");
    }, 1000)
  }, 20000)

  setTimeout(() => {
    graficDay.classList.remove("grafic-out-of-view");
  }, 1000)

}

// função que setta intervalo de tempo que muda os dados do display
function startInterval() {
  dataInterval = setInterval(() => {

    getWhetherData();

    // troca o id da usina pesquisada
    if (idUsina.value < usinas.length - 1) {
      idUsina.value++;
      getOpenApiData(idUsina.value);
    } else {
      pageSwitch();
      setTimeout(() => {
        pageSwitch();
      }, 300000)
      idUsina.value = 0;
    }
  }, 40000)
}

// função que pausa os interals
function pauseInterval() {
  clearInterval(dataInterval);
}

// <--// SETINTERVALS //-->

// intervalo de tempo que atualiza o relógio
setInterval(() => {
  time()
}, '1000')

</script>

<template>
  <main class="in-view page" id="main-1">
    <!-- Lado esquerdo -->
    <section class="left espaco">
      <div class="fundo">
        <div class="logo">
          <img src="../src/assets/img/logo.png" alt="logo">
        </div>
        <div class="nome-usina">
          <h1 v-if="loaded">{{ usinaInfo.plantName[idUsina] }}</h1>
          <!-- ANIMAÇÂO DE LOADING -->

          <h1 v-if="!loaded" class="loading" style="margin: 0;">
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
        </div>
        <div class="blocos">

          <div class="status fundo-bloco">

            <div class="titulo-bloco">
              <h2 class="titulo">Status</h2>
            </div>
            <div class="info-img">
              <h1 class="info" v-if="loaded">{{ usinaInfo.status[idUsina] === "DESCONHECIDO" ? "-" :
                usinaInfo.status[idUsina] }}</h1>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="-0.5 0 25 25" fill="none"
                v-if="usinaInfo.status[idUsina] === 'ALERTA' && loaded" class="alert">
                <path d="M18.2202 21.25H5.78015C5.14217 21.2775 4.50834 21.1347 3.94373 20.8364C3.37911 20.5381 2.90402 
                  20.095 2.56714 19.5526C2.23026 19.0101 2.04372 18.3877 2.02667 17.7494C2.00963 17.111 2.1627 16.4797 
                  2.47015 15.92L8.69013 5.10999C9.03495 4.54078 9.52077 4.07013 10.1006 3.74347C10.6804 3.41681 11.3346 
                  3.24518 12.0001 3.24518C12.6656 3.24518 13.3199 3.41681 13.8997 3.74347C14.4795 4.07013 14.9654 4.54078 
                  15.3102 5.10999L21.5302 15.92C21.8376 16.4797 21.9907 17.111 21.9736 17.7494C21.9566 18.3877 21.7701 
                  19.0101 21.4332 19.5526C21.0963 20.095 20.6211 20.5381 20.0565 20.8364C19.4919 21.1347 18.8581 21.2775 
                  18.2202 21.25V21.25Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10.8809 17.15C10.8809 17.0021 10.9102 16.8556 10.9671 16.7191C11.024 16.5825 11.1074 16.4586 11.2125 
                  16.3545C11.3175 16.2504 11.4422 16.1681 11.5792 16.1124C11.7163 16.0567 11.8629 16.0287 12.0109 16.03C12.2291 
                  16.034 12.4413 16.1021 12.621 16.226C12.8006 16.3499 12.9398 16.5241 13.0211 16.7266C13.1023 16.9292 13.122 
                  17.1512 13.0778 17.3649C13.0335 17.5786 12.9272 17.7745 12.7722 17.9282C12.6172 18.0818 12.4203 18.1863 
                  12.2062 18.2287C11.9921 18.2711 11.7703 18.2494 11.5685 18.1663C11.3666 18.0833 11.1938 17.9426 11.0715 
                  17.7618C10.9492 17.5811 10.8829 17.3683 10.8809 17.15ZM11.2409 14.42L11.1009 9.20001C11.0876 9.07453 
                  11.1008 8.94766 11.1398 8.82764C11.1787 8.70761 11.2424 8.5971 11.3268 8.5033C11.4112 8.40949 11.5144 
                  8.33449 11.6296 8.28314C11.7449 8.2318 11.8697 8.20526 11.9959 8.20526C12.1221 8.20526 12.2469 8.2318 
                  12.3621 8.28314C12.4774 8.33449 12.5805 8.40949 12.6649 8.5033C12.7493 8.5971 12.8131 8.70761 12.852 
                  8.82764C12.8909 8.94766 12.9042 9.07453 12.8909 9.20001L12.7609 14.42C12.7609 14.6215 12.6808 14.8149 
                  12.5383 14.9574C12.3957 15.0999 12.2024 15.18 12.0009 15.18C11.7993 15.18 11.606 15.0999 11.4635 14.9574C11.321 
                  14.8149 11.2409 14.6215 11.2409 14.42Z" />
              </svg>



              <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="-0.5 0 25 25" fill="none"
                v-if="usinaInfo.status[idUsina] === 'CRITICO' && loaded" class="critic">
                <path d="M18.2202 21.25H5.78015C5.14217 21.2775 4.50834 21.1347 3.94373 20.8364C3.37911 20.5381 2.90402 
                  20.095 2.56714 19.5526C2.23026 19.0101 2.04372 18.3877 2.02667 17.7494C2.00963 17.111 2.1627 16.4797 
                  2.47015 15.92L8.69013 5.10999C9.03495 4.54078 9.52077 4.07013 10.1006 3.74347C10.6804 3.41681 11.3346 
                  3.24518 12.0001 3.24518C12.6656 3.24518 13.3199 3.41681 13.8997 3.74347C14.4795 4.07013 14.9654 4.54078 
                  15.3102 5.10999L21.5302 15.92C21.8376 16.4797 21.9907 17.111 21.9736 17.7494C21.9566 18.3877 21.7701 
                  19.0101 21.4332 19.5526C21.0963 20.095 20.6211 20.5381 20.0565 20.8364C19.4919 21.1347 18.8581 21.2775 
                  18.2202 21.25V21.25Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10.8809 17.15C10.8809 17.0021 10.9102 16.8556 10.9671 16.7191C11.024 16.5825 11.1074 16.4586 11.2125 
                  16.3545C11.3175 16.2504 11.4422 16.1681 11.5792 16.1124C11.7163 16.0567 11.8629 16.0287 12.0109 16.03C12.2291 
                  16.034 12.4413 16.1021 12.621 16.226C12.8006 16.3499 12.9398 16.5241 13.0211 16.7266C13.1023 16.9292 13.122 
                  17.1512 13.0778 17.3649C13.0335 17.5786 12.9272 17.7745 12.7722 17.9282C12.6172 18.0818 12.4203 18.1863 
                  12.2062 18.2287C11.9921 18.2711 11.7703 18.2494 11.5685 18.1663C11.3666 18.0833 11.1938 17.9426 11.0715 
                  17.7618C10.9492 17.5811 10.8829 17.3683 10.8809 17.15ZM11.2409 14.42L11.1009 9.20001C11.0876 9.07453 
                  11.1008 8.94766 11.1398 8.82764C11.1787 8.70761 11.2424 8.5971 11.3268 8.5033C11.4112 8.40949 11.5144 
                  8.33449 11.6296 8.28314C11.7449 8.2318 11.8697 8.20526 11.9959 8.20526C12.1221 8.20526 12.2469 8.2318 
                  12.3621 8.28314C12.4774 8.33449 12.5805 8.40949 12.6649 8.5033C12.7493 8.5971 12.8131 8.70761 12.852 
                  8.82764C12.8909 8.94766 12.9042 9.07453 12.8909 9.20001L12.7609 14.42C12.7609 14.6215 12.6808 14.8149 
                  12.5383 14.9574C12.3957 15.0999 12.2024 15.18 12.0009 15.18C11.7993 15.18 11.606 15.0999 11.4635 14.9574C11.321 
                  14.8149 11.2409 14.6215 11.2409 14.42Z" />
              </svg>

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 0 25 25" stroke-width="2" stroke-linecap="round"
                fill="none" v-if="usinaInfo.status[idUsina] === 'OK' && loaded" class="ok">
                <polyline points="7 13 10 16 17 9" />
                <circle cx="12" cy="12" r="10" />
              </svg>

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                v-if="usinaInfo.status[idUsina] === 'DESCONHECIDO' && loaded" class="desconhecido">
                <path
                  d="M12 17V16.9929M9.13733 9C9.51961 7.84083 10.6567 7 12 7C12.3507 7 12.6873 7.05731 13.0001 7.16262M11.9999 14.8571C11.9999 11.6429 14.9999 12.3571 14.9999 9.85714C14.9999 9.55851 14.9518 9.27058 14.8625 9"
                  stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>


            </div>

          </div>
          <div class="potencia-instantanea fundo-bloco">

            <div class="titulo-bloco">
              <h2 class="titulo">Potência Instantênea</h2>
            </div>
            <div class="info-img">
              <h1 class="info" v-if="loaded">{{ usinaInfo.instantPower[idUsina] }}<span>kW</span></h1>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" v-if="loaded">
                <path
                  d="M17 9V12C17 14.7614 14.7614 17 12 17M7 9V12C7 14.7614 9.23858 17 12 17M12 17V21M8 3V6M16 3V6M5 9H19"
                  stroke="#FFCC00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

          </div>
          <div class="potencia-instalada fundo-bloco">

            <div class="titulo-bloco">
              <h2 class="titulo">Potência Instalada</h2>
            </div>
            <div class="info-img">
              <h1 class="info" v-if="loaded">{{ usinaInfo.installedPower[idUsina] }}<span>kWp</span></h1>
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
              <svg class="instalada-icon" xmlns="http://www.w3.org/2000/svg" fill="#1083BD" viewBox="0 -64 640 640"
                v-if="loaded" stroke="#1083BD">
                <path d="M431.98 448.01l-47.97.05V416h-128v32.21l-47.98.05c-8.82.01-15.97 7.16-15.98 15.99l-.05 31.73c-.01 8.85 
                  7.17 16.03 16.02 16.02l223.96-.26c8.82-.01 15.97-7.16 15.98-15.98l.04-31.73c.01-8.85-7.17-16.03-16.02-16.02zM585.2 
                  26.74C582.58 11.31 568.99 0 553.06 0H86.93C71 0 57.41 11.31 54.79 26.74-3.32 369.16.04 348.08.03 352c-.03 17.32 14.29 
                  32 32.6 32h574.74c18.23 0 32.51-14.56 32.59-31.79.02-4.08 3.35 16.95-54.76-325.47zM259.83 64h120.33l9.77 
                  96H250.06l9.77-96zm-75.17 256H71.09L90.1 208h105.97l-11.41 112zm16.29-160H98.24l16.29-96h96.19l-9.77 
                  96zm32.82 160l11.4-112h149.65l11.4 112H233.77zm195.5-256h96.19l16.29 96H439.04l-9.77-96zm26.06 256l-11.4-112H549.9l19.01 
                  112H455.33z"/>
              </svg>
            </div>

          </div>
          <div class="total-gerado fundo-bloco">

            <div class="titulo-bloco">
              <h2 class="titulo">Total Gerado</h2>
            </div>
            <div class="info-img">
              <h1 class="info" v-if="loaded">{{ usinaInfo.totalGenerated[idUsina] }}<span>MWh</span></h1>
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
              <svg v-if="loaded" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"
                  stroke-width="1.392"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12Z"
                    fill="#fbff00"></path>
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12ZM18.1476 18.1476C18.4405 17.8547 18.9154 17.8547 19.2083 18.1476L19.6011 18.5405C19.894 18.8334 19.894 19.3082 19.6011 19.6011C19.3082 19.894 18.8334 19.894 18.5405 19.6011L18.1476 19.2083C17.8547 18.9154 17.8547 18.4405 18.1476 18.1476ZM5.85211 18.1479C6.145 18.4408 6.145 18.9157 5.85211 19.2086L5.45927 19.6014C5.16638 19.8943 4.6915 19.8943 4.39861 19.6014C4.10572 19.3085 4.10572 18.8336 4.39861 18.5407L4.79145 18.1479C5.08434 17.855 5.55921 17.855 5.85211 18.1479ZM12 20.25C12.4142 20.25 12.75 20.5858 12.75 21V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V21C11.25 20.5858 11.5858 20.25 12 20.25Z"
                    fill="#fbff00"></path>
                </g>
              </svg>
            </div>

          </div>
        </div>
      </div>
    </section>
    <!-- Fim do lado esquerdo -->

    <!-- Inicio do lado direito -->
    <section class="right">
      <div class="geracao-grafico">
        <div class="geracao-semana alinhar-text" id="grafic-16-days">
          <h1>Geração Mensal - {{ usinaInfo.plantName[idUsina] }}</h1>
          <generationGraph :usinaId="usinas[idUsina]" />
        </div>
        <div class="geracao-semana alinhar-text" id="grafic-day">
          <h1>Geração Diária - {{ usinaInfo.plantName[idUsina] }}</h1>
          <generationGraphDay :usinaId="usinas[idUsina]" />
        </div>
        <!-- ANIMAÇÂO DE LOADING -->

        <h1 v-if="!loaded" class="loading" style="margin: 0;">
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
      </div>

      <div class="divisao-blocos">

        <!-- Bloco hora e clima -->
        <div class="clima-hora">
          <div class="titulo">
            <h1>Hora e Clima</h1>
          </div>
          <div class="logo-clima">
            <img :src="`${whetherUberaba.icon}`" alt="logo-clima" style="width: 100px;">
          </div>

          <div class="divisor">

            <div class="horas-clima">
              <h1>{{ timeNow }}</h1>
              <h1>{{ whetherUberaba.temp }}°C</h1>
            </div>

            <div class="tempo">
              <h1>{{ whetherUberaba.title }}</h1>
            </div>
          </div>

        </div>

        <!-- Bloco Comparador -->
        <div class="comparador">
          <h1>Comparador de Geração</h1>
          <div class="graph">
            <comparisonGraph />
          </div>
          <div class="legenda-comparador">
            <label for="ceres"><span class="color-1"></span>Ceres investimentos</label>
            <label for="ceres"><span class="color-2"></span>Agromais</label>
            <label for="ceres"><span class="color-3"></span>Pirajuba</label>
          </div>
        </div>
      </div>
    </section>
    <!-- Fim do lado direito -->
  </main>

  <!-- Troca de pagina/Main 2 -->
  <main id="main-2" class="page">
    <div class="escopo2">
      <div class="titulo">
        <h1>Relatório Geral</h1>
      </div>
      <div class="blocos2">
        <div class="separador2">
          <!-- abre -->
          <div class="primeiro fundobloco2">

            <div class='titulo-bloco'>
              <h1>Ceres investimentos</h1>
            </div>

            <div class="info2">

              <div class="separador-info">

                <h3>Status</h3>
                <h1 :class="usinaInfo.status[0] === 'OK' ? 'ok' :
                  usinaInfo.status[0] === 'ALERTA' ? 'alerta' :
                    usinaInfo.status[0] === 'ALERTA' ? 'alerta' : 'desconhecido'">
                  {{ usinaInfo.status[0] === "DESCONHECIDO" ? "-" :
                    usinaInfo.status[0] }}
                </h1>
                <h3>Potência Instalada</h3>
                <h1>{{ usinaInfo.installedPower[0] }}</h1>
              </div>
              <div class="separador-info">
                <h3>Potência Instantênea</h3>
                <h1>{{ usinaInfo.instantPower[0] }}</h1>
                <h3>Total Gerado</h3>
                <h1>{{ usinaInfo.totalGenerated[0] }}</h1>
              </div>
            </div>

          </div>

          <!-- Fecha -->

          <!-- Abre -->
          <div class="segundo fundobloco2">

            <div class='titulo-bloco'>
              <h1>Pirajuba</h1>
            </div>

            <div class="info2">

              <div class="separador-info">

                <h3>Status</h3>
                <h1 :class="usinaInfo.status[2] === 'OK' ? 'ok' :
                  usinaInfo.status[2] === 'ALERTA' ? 'alerta' :
                    usinaInfo.status[2] === 'ALERTA' ? 'alerta' : 'desconhecido'">
                  {{ usinaInfo.status[2] === "DESCONHECIDO" ? "-" :
                    usinaInfo.status[2] }}
                </h1>
                <h3>Potência Instalada</h3>
                <h1>{{ usinaInfo.installedPower[2] }}</h1>
              </div>
              <div class="separador-info">
                <h3>Potência Instantênea</h3>
                <h1>{{ usinaInfo.instantPower[2] }}</h1>
                <h3>Total Gerado</h3>
                <h1>{{ usinaInfo.totalGenerated[2] }}</h1>
              </div>
            </div>

          </div>
        </div>

        <!-- fecha -->
        <div class="separador2">
          <!-- abre -->
          <div class="terceiro fundobloco2">

            <div class='titulo-bloco'>
              <h1>Agromais</h1>
            </div>

            <div class="info2">

              <div class="separador-info">

                <h3>Status</h3>
                <h1 :class="usinaInfo.status[1] === 'OK' ? 'ok' :
                  usinaInfo.status[1] === 'ALERTA' ? 'alerta' :
                    usinaInfo.status[1] === 'ALERTA' ? 'alerta' : 'desconhecido'">
                  {{ usinaInfo.status[1] === "DESCONHECIDO" ? "-" :
                    usinaInfo.status[1] }}
                </h1>
                <h3>Potência Instalada</h3>
                <h1>{{ usinaInfo.installedPower[1] }}</h1>
              </div>
              <div class="separador-info">
                <h3>Potência Instantênea</h3>
                <h1>{{ usinaInfo.instantPower[1] }}</h1>
                <h3>Total Gerado</h3>
                <h1>{{ usinaInfo.totalGenerated[1] }}</h1>
              </div>
            </div>

          </div>

          <!-- Fecha -->
          <div class="quarto fundobloco2">

            <div class='remove-border titulo-bloco '>
              <h1>Hora e Clima</h1>
            </div>
            <!-- Corpo hora e clima -->
            <div class="corpo-clima">
              <img :src="`${whetherUberaba.icon}`" alt="logo-clima" style="width: 100px;">
              <div class="separa-hora">
                <h1>{{ timeNow }}</h1>
                <h1>{{ whetherUberaba.temp }}°C</h1>
              </div>
              <h1>{{ whetherUberaba.title }}</h1>
            </div>



            <!-- Fim do corpo hora e clima -->
          </div>


        </div>

      </div>
    </div>
  </main>
</template>

<style>
/* Variaveis */
:root {
  --primary: #2e2e2e;
  --secondary: #646464;
  --white-50: #ffffff81;
  --white: #edf5e1;
  --green-1: #83FF64;
  --green-2: #98FB7F;
  --green-3: #00bf63;
  --blue-1: #1083BD;
  --blue-2: #004aad;
  --orange-1: #FAC83D;
  --red-1: #cc3300;
}


/* Formatação da página */
* {
  border: 0;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  outline: none;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  color: var(--white);
  text-decoration: none;
}

body::-webkit-scrollbar {
  display: none;
}

body {
  background-color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100vw;
  height: 100vh;

  .page {
    position: absolute;
    top: 150%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  #main-1 {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .in-view {
    transition: top ease-out 2s;
    top: 50%;
    animation: none;
  }

  .go-up {
    top: -50%;
    transition: top ease-out 2s;
  }

  .left {
    .fundo {
      width: 501px;
      height: 850px;
      background: linear-gradient(To bottom, #2e2e2e, #2e2e2ec7);
      border-radius: 10px;
      display: flex;
      align-items: center;
      /* justify-content: space-evenly; */
      flex-direction: column;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.507);

      .logo {
        img {
          margin: 25px 0px;
          width: 170px;
          height: auto;
          padding: 0px 0px;
        }
      }
    }

    .nome-usina {
      h1 {
        font-size: 20px;
      }
    }

    .blocos {
      .fundo-bloco {
        width: 350px;
        height: 150px;
        background: linear-gradient(To bottom, #2e2e2e, #696969c7);
        border-radius: 15px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.189);
        margin: 25px 0px;


      }

      .titulo-bloco {
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #ffffff98;
        width: 100%;
        height: 25px;
        color: var(--white-50);
      }

      .info-img {
        display: flex;
        align-items: center;
        position: relative;
        justify-content: space-between;
        height: 80%;
        width: 100%;

        svg {
          width: 100px;
          position: absolute;
          opacity: .5;
          right: 0;
        }

        .ok {
          stroke: var(--green-1);
        }

        .alert {
          fill: none;
          stroke: var(--orange-1);
        }

        .critic {
          stroke: var(--red-1);
        }

        .desconhecido {
          width: 150px;
          right: -25px;
        }

        .desconhecido path {
          stroke: var(--white-50);
        }

        h1 {
          position: relative;
          width: 100%;
          text-align: center;
          font-size: 30px;
        }
      }
    }
  }

  .espaco {
    padding: 30px 50px;
  }

  .right {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    max-height: 850px;
    min-height: 850px;
    padding-right: 50px;


    .geracao-grafico {
      width: 1207px;
      height: 475px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(To bottom, #2e2e2e, #2e2e2ec7);
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.507);

      .alinhar-text{
        width: 100%;
        text-align: center;
        h1 {
          font-size: 15px;
          padding: 10px 0px;
        }
      }

      .geracao-semana {
        position: absolute;
        width: 97%;
        height: 97%;
        top: 50%;
        left: -50%;
        transform: translate(-50%, -50%);
      }

      .grafic-in-view {
        left: 50%;
        transition: ease-out 1s;
      }

      .grafic-out-of-view {
        left: 150%;
        transition: ease-out 1s;
      }
    }


    .divisao-blocos {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;
      width: 1207px;
      height: 347px;

      .clima-hora,
      .comparador {
        height: 100%;
        width: 47%;
        background: linear-gradient(To bottom, #2e2e2e, #2e2e2ec7);
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.507);
      }
    }

    .clima-hora {
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .titulo {
      h1 {
        font-size: 25px;
        padding: 25px 0px;
      }
    }

    .divisor {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      width: 100%;

      .horas-clima {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        padding-bottom: 15px;
      }

      .tempo {
        display: flex;
        align-items: top;
        justify-content: center;
        height: 100%;
      }

      h1 {
        font-size: 40px;
        padding: 7px 0px;
      }
    }

    .comparador {
      position: relative;

      .graph {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80%;
      }

      h1 {
        padding-top: 10px;
        padding-bottom: 5px;
        width: 100%;
        height: 20px;
        text-align: center;
        font-size: 17px;
      }

      .legenda-comparador {
        width: 500px;
        height: 50px;
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translate(-50%, 0);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .legenda-comparador label {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .legenda-comparador span {
        width: 50px;
        height: 25px;
        display: block;

      }

      .color-1 {
        background-color: var(--green-3);
        border-radius: 20px;
        max-width: 40px;
        max-height: 20px;
      }

      .color-2 {
        background-color: var(--blue-2);
        border-radius: 20px;
        max-width: 40px;
        max-height: 20px;
      }

      .color-3 {
        background-color: var(--orange-1);
        border-radius: 20px;
        max-width: 40px;
        max-height: 20px;
      }
    }

  }

  #main-2 {
    width: 100%;
    height: 100%;

    .escopo2 {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      height: 100%;

      .separador2 {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;
      }

      .titulo {
        h1 {
          font-size: 40px;
          text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.541);
        }
      }

      .blocos2 {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
      }

      .fundobloco2 {
        background: var(--primary);
        width: 900px;
        height: 350px;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.432);
        margin: 20px 0px;
        display: flex;
        align-items: center;
        /* justify-content: center; */
        flex-direction: column;

        .corpo-clima {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          .separa-hora {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: row;
            width: 300px;
          }

          h1 {
            font-size: 40px;
            padding: 10px 0px;
          }
        }

        .info2 {
          display: flex;
          width: 60%;
          align-items: center;
          justify-content: space-between;

          h3 {
            padding-top: 30px;
            text-align: center;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.749);
          }

          h1 {
            text-align: center;
            font-size: 50px;
          }
        }

        .titulo-bloco {
          width: 80%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 20px 0px;
          border-bottom: 1px solid #FFFFFF;



          h1 {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.749);
          }
        }

        .remove-border {
          border-bottom: none;
        }

        .ok {
          color: var(--green-2);
        }

        .alerta {
          color: var(--orange-1);
        }

        .critico {
          color: var(--red-1);
        }
      }
    }
  }
}
</style>
