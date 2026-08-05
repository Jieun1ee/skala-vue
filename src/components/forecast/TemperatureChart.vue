<script setup>
import { computed } from 'vue'

import { Line } from 'vue-chartjs'

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps({
  labels: {
    type: Array,
    required: true,
  },

  temperatures: {
    type: Array,
    required: true,
  },

  feelsLikeTemperatures: {
    type: Array,
    required: true,
  },

  unitSymbol: {
    type: String,
    default: '°C',
  },
})

const chartData = computed(() => ({
  labels: props.labels,

  datasets: [
    {
      label: '예상 기온',
      data: props.temperatures,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.12)',
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
      borderWidth: 3,
      fill: true,
      tension: 0.35,
    },
    {
      label: '체감 기온',
      data: props.feelsLikeTemperatures,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.05)',
      pointBackgroundColor: '#f97316',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
      borderDash: [6, 5],
      fill: false,
      tension: 0.35,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: 'index',
    intersect: false,
  },

  plugins: {
    legend: {
      position: 'top',

      labels: {
        usePointStyle: true,
        boxWidth: 8,
        padding: 18,
      },
    },

    tooltip: {
      callbacks: {
        label(context) {
          return `${context.dataset.label}: ${Math.round(context.parsed.y)}${props.unitSymbol}`
        },
      },
    },
  },

  scales: {
    x: {
      grid: {
        display: false,
      },

      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
      },
    },

    y: {
      beginAtZero: false,

      grid: {
        color: 'rgba(148, 163, 184, 0.18)',
      },

      ticks: {
        callback(value) {
          return `${value}${props.unitSymbol}`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="temperature-chart">
    <Line
      :data="chartData"
      :options="chartOptions"
      aria-label="판교 5일 동안의 예상 기온과 체감 기온 변화 차트"
    >
      차트를 불러올 수 없습니다.
    </Line>
  </div>
</template>
