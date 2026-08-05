<script setup>
import { computed, onMounted, ref } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useTemperature } from '@/composables/useTemperature'
import { useWeatherStore } from '@/stores/weatherStore'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()

const selectedWeather = ref(null)
const detailError = ref('')

const selectedTemp = computed(() => selectedWeather.value?.temp ?? 0)
const feelsLikeTemp = computed(() => selectedWeather.value?.feelsLike ?? 0)
const minimumTemp = computed(() => selectedWeather.value?.tempMin ?? 0)
const maximumTemp = computed(() => selectedWeather.value?.tempMax ?? 0)

const { displayTemperature } = useTemperature(selectedTemp)
const { displayTemperature: displayFeelsLike } = useTemperature(feelsLikeTemp)
const { displayTemperature: displayMinimumTemp } = useTemperature(minimumTemp)
const { displayTemperature: displayMaximumTemp } = useTemperature(maximumTemp)

const weatherEmoji = computed(() => {
  const status = selectedWeather.value?.status || ''

  if (status.includes('맑음') || status.includes('맑은')) return '☀️'
  if (status.includes('구름') || status.includes('흐림')) return '☁️'
  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('눈')) return '❄️'
  if (status.includes('천둥') || status.includes('번개')) return '⛈️'
  if (status.includes('안개') || status.includes('박무')) return '🌫️'

  return '🌤️'
})

const moveToHome = () => {
  router.push({
    name: 'weather-home',
  })
}

onMounted(async () => {
  try {
    selectedWeather.value = await weatherStore.fetchWeatherById(route.params.cityId)
  } catch {
    detailError.value = '상세 날씨 정보를 가져오지 못했습니다.'
  }
})
</script>

<template>
  <main class="weather-page">
    <section class="weather-container">
      <!-- Loading -->
      <el-card v-if="weatherStore.isLoading" class="detail-loading-card" shadow="never">
        <el-skeleton :rows="6" animated />
      </el-card>

      <!-- Detail -->
      <template v-else-if="selectedWeather">
        <section class="detail-hero">
          <el-button text class="text-back-button" @click="moveToHome">
            ← 대시보드로 돌아가기
          </el-button>

          <div class="detail-hero-content">
            <div>
              <p class="detail-location">
                {{ selectedWeather.fullName }}
              </p>

              <h2>
                {{ selectedWeather.name }}
              </h2>

              <p class="detail-status">
                {{ selectedWeather.status }}
              </p>
            </div>

            <div class="detail-current-weather">
              <!-- 기존 아이콘 -->
              <!--
              <img
                v-if="selectedWeather.icon"
                :src="`https://openweathermap.org/img/wn/${selectedWeather.icon}@2x.png`"
                :alt="selectedWeather.status"
              />
              -->

              <span class="detail-weather-emoji" role="img">
                {{ weatherEmoji }}
              </span>

              <strong>
                {{ displayTemperature }}
              </strong>
            </div>
          </div>
        </section>

        <BaseDashboardCard
          title="상세 기상 관측 정보"
          description="현재 기상 상태와 부가 정보를 확인할 수 있습니다."
        >
          <div class="detail-stat-grid">
            <article class="detail-stat-card">
              <span>🌡️</span>
              <p>체감 온도</p>
              <strong>{{ displayFeelsLike }}</strong>
            </article>

            <article class="detail-stat-card">
              <span>💧</span>
              <p>습도</p>
              <strong>{{ selectedWeather.humidity }}%</strong>
            </article>

            <article class="detail-stat-card">
              <span>💨</span>
              <p>풍속</p>
              <strong>{{ selectedWeather.wind }}m/s</strong>
            </article>

            <article class="detail-stat-card">
              <span>◉</span>
              <p>기압</p>
              <strong>{{ selectedWeather.pressure }}hPa</strong>
            </article>

            <article class="detail-stat-card">
              <span>↓</span>
              <p>최저 온도</p>
              <strong>{{ displayMinimumTemp }}</strong>
            </article>

            <article class="detail-stat-card">
              <span>↑</span>
              <p>최고 온도</p>
              <strong>{{ displayMaximumTemp }}</strong>
            </article>
          </div>

          <el-button class="detail-home-button" type="primary" size="large" @click="moveToHome">
            날씨 대시보드로 이동
          </el-button>
        </BaseDashboardCard>
      </template>

      <!-- Error -->

      <BaseDashboardCard v-else title="도시 정보를 찾을 수 없습니다.">
        <el-alert
          title="상세 정보를 표시할 수 없습니다."
          :description="detailError || weatherStore.errorMessage"
          type="error"
          show-icon
          :closable="false"
        />

        <el-button class="detail-home-button" type="primary" size="large" @click="moveToHome">
          날씨 대시보드로 이동
        </el-button>
      </BaseDashboardCard>
    </section>
  </main>
</template>
