<script setup>
import { computed, onMounted } from 'vue'

import { storeToRefs } from 'pinia'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import TemperatureChart from '@/components/forecast/TemperatureChart.vue'

import { useConfigStore } from '@/stores/configStore'
import { useForecastStore } from '@/stores/forecastStore'

const forecastStore = useForecastStore()
const configStore = useConfigStore()

const { dailyForecastList, isLoading, errorMessage, lastUpdatedAt } = storeToRefs(forecastStore)

const convertTemperature = (temperature) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temperature * 9) / 5 + 32)
  }

  return Math.round(temperature)
}

const convertedChartTemperatures = computed(() => {
  return forecastStore.chartTemperatures.map(convertTemperature)
})

const convertedFeelsLikeTemperatures = computed(() => {
  return forecastStore.chartFeelsLikeTemperatures.map(convertTemperature)
})

const formattedUpdatedAt = computed(() => {
  if (!lastUpdatedAt.value) {
    return '갱신 정보 없음'
  }

  return lastUpdatedAt.value.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

const weatherEmoji = (status) => {
  const value = status || ''

  if (value.includes('맑음') || value.includes('맑은')) {
    return '☀️'
  }

  if (value.includes('천둥') || value.includes('번개')) {
    return '⛈️'
  }

  if (value.includes('비') || value.includes('소나기')) {
    return '🌧️'
  }

  if (value.includes('눈')) {
    return '❄️'
  }

  if (value.includes('안개') || value.includes('박무')) {
    return '🌫️'
  }

  if (value.includes('구름') || value.includes('흐림')) {
    return '☁️'
  }

  return '🌤️'
}

const refreshForecast = async () => {
  await forecastStore.fetchPangyoForecast()
}

onMounted(async () => {
  await forecastStore.fetchPangyoForecast()
})
</script>

<template>
  <main class="weather-page">
    <section class="weather-container">
      <section class="forecast-hero">
        <div>
          <p class="forecast-hero-eyebrow">PANGYO FORECAST</p>

          <h2>판교 5일 날씨 예보</h2>

          <p>판교역 인근 대표 좌표를 기준으로 3시간 간격의 기온과 날씨 변화를 제공합니다.</p>
        </div>

        <div class="forecast-hero-icon">📈</div>
      </section>

      <BaseDashboardCard
        title="판교 5일 예보"
        description="날짜별 최저·최고 기온과 강수확률을 확인하세요."
      >
        <template #header-action>
          <div class="forecast-update-area">
            <span>
              최종 업데이트

              <strong>
                {{ formattedUpdatedAt }}
              </strong>
            </span>

            <el-button type="primary" plain :loading="isLoading" @click="refreshForecast">
              새로고침
            </el-button>
          </div>
        </template>

        <el-skeleton v-if="isLoading && dailyForecastList.length === 0" :rows="6" animated />

        <div v-else-if="errorMessage && dailyForecastList.length === 0" class="forecast-error-area">
          <el-alert
            title="판교 예보를 불러오지 못했습니다."
            :description="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />

          <el-button type="danger" plain @click="refreshForecast"> 다시 시도 </el-button>
        </div>

        <div v-else class="daily-forecast-grid">
          <article
            v-for="forecast in dailyForecastList"
            :key="forecast.dateKey"
            class="daily-forecast-card"
          >
            <p class="daily-forecast-date">
              {{ forecast.dateLabel }}
            </p>

            <span class="daily-forecast-emoji" role="img" :aria-label="forecast.status">
              {{ weatherEmoji(forecast.status) }}
            </span>

            <strong class="daily-forecast-status">
              {{ forecast.status }}
            </strong>

            <div class="daily-temperature">
              <span class="maximum">
                ↑
                {{ convertTemperature(forecast.tempMax) }}{{ configStore.unitSymbol }}
              </span>

              <span class="minimum">
                ↓
                {{ convertTemperature(forecast.tempMin) }}{{ configStore.unitSymbol }}
              </span>
            </div>

            <div class="daily-forecast-extra">
              <span> 💧 {{ forecast.humidity }}% </span>

              <span>
                ☔
                {{ forecast.rainProbability }}%
              </span>
            </div>
          </article>
        </div>
      </BaseDashboardCard>

      <BaseDashboardCard
        v-if="forecastStore.hasForecastData"
        title="3시간 단위 기온 변화"
        description="예상 기온과 체감 기온을 비교할 수 있습니다."
      >
        <TemperatureChart
          :labels="forecastStore.chartLabels"
          :temperatures="convertedChartTemperatures"
          :feels-like-temperatures="convertedFeelsLikeTemperatures"
          :unit-symbol="configStore.unitSymbol"
        />
      </BaseDashboardCard>

      <el-alert
        v-if="errorMessage && dailyForecastList.length > 0"
        :title="errorMessage"
        type="warning"
        show-icon
        :closable="false"
      />
    </section>
  </main>
</template>
