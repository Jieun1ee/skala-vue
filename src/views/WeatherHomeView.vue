<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'

const router = useRouter()
const weatherStore = useWeatherStore()

const { weatherList, isLoading, errorMessage, lastUpdatedAt } = storeToRefs(weatherStore)

const searchQuery = ref('')
const selectedCityInfo = ref(null)

const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return weatherList.value
  }

  return weatherList.value.filter((weather) => {
    return weather.name.includes(keyword)
  })
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

const updateSearchQuery = (newQuery) => {
  searchQuery.value = newQuery
}

const selectCity = (weather) => {
  selectedCityInfo.value = weather
}

const moveToDetail = (weather) => {
  router.push({
    name: 'weather-detail',
    params: {
      cityId: weather.id,
    },
  })
}

const refreshWeather = async () => {
  await weatherStore.fetchWeatherList()
}

watch(selectedCityInfo, (newCityInfo) => {
  if (!newCityInfo) {
    return
  }

  console.log(`[watch] ${newCityInfo.name}이 선택되었습니다.`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: ${searchQuery.value}`)
})

onMounted(async () => {
  await weatherStore.fetchWeatherList()
})
</script>

<template>
  <main class="weather-page">
    <section class="weather-container">
      <section class="dashboard-hero">
        <div>
          <p class="dashboard-hero-eyebrow">KOREA WEATHER</p>

          <h2>전국 날씨를 확인하세요</h2>

          <p>OpenWeather API를 활용해 전국 17개 지역의 현재 날씨 정보를 제공합니다.</p>
        </div>

        <div class="dashboard-hero-decoration">
          <span>☀️</span>
          <span>☁️</span>
        </div>
      </section>

      <BaseDashboardCard>
        <SearchBar :search-query="searchQuery" @update-query="updateSearchQuery" />
      </BaseDashboardCard>

      <section class="national-summary">
        <article class="summary-card">
          <div class="summary-icon temperature">🌡️</div>

          <div class="summary-content">
            <span>전국 평균 기온</span>

            <strong v-if="weatherStore.averageTemperature !== null">
              {{ weatherStore.averageTemperature }}°C
            </strong>

            <strong v-else>-</strong>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon hottest">🔥</div>

          <div class="summary-content">
            <span>가장 더운 지역</span>

            <strong v-if="weatherStore.hottestRegion">
              {{ weatherStore.hottestRegion.name }}
            </strong>

            <small v-if="weatherStore.hottestRegion">
              {{ weatherStore.hottestRegion.temp }}°C
            </small>

            <strong v-else>-</strong>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon coolest">❄️</div>

          <div class="summary-content">
            <span>가장 선선한 지역</span>

            <strong v-if="weatherStore.coolestRegion">
              {{ weatherStore.coolestRegion.name }}
            </strong>

            <small v-if="weatherStore.coolestRegion">
              {{ weatherStore.coolestRegion.temp }}°C
            </small>

            <strong v-else>-</strong>
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-icon region-count">🗺️</div>

          <div class="summary-content">
            <span>조회 지역</span>

            <strong>
              {{ weatherStore.loadedRegionCount }}
              /
              {{ weatherStore.totalRegionCount }}
            </strong>

            <small>광역 지역 기준</small>
          </div>
        </article>
      </section>

      <BaseDashboardCard
        title="지역별 날씨 현황"
        description="지역 카드를 선택하거나 상세 정보를 확인하세요."
      >
        <template #header-action>
          <div class="weather-update-area">
            <span>
              최종 업데이트

              <strong>
                {{ formattedUpdatedAt }}
              </strong>
            </span>

            <el-button type="primary" plain :loading="isLoading" @click="refreshWeather">
              새로고침
            </el-button>
          </div>
        </template>

        <div v-if="isLoading && weatherList.length === 0" class="loading-container">
          <div class="loading-spinner"></div>

          <strong> 전국 날씨를 불러오고 있습니다. </strong>

          <p>잠시만 기다려 주세요.</p>
        </div>

        <div v-else-if="errorMessage && weatherList.length === 0" class="weather-error-area">
          <el-alert
            title="날씨 정보를 불러오지 못했습니다."
            :description="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />

          <el-button type="danger" plain @click="refreshWeather"> 다시 시도 </el-button>
        </div>

        <template v-else>
          <div v-if="errorMessage" class="partial-error-message">
            {{ errorMessage }}
          </div>

          <div v-if="filteredWeatherList.length > 0" class="weather-grid">
            <WeatherCard
              v-for="weather in filteredWeatherList"
              :key="weather.id"
              :weather="weather"
              :selected="selectedCityInfo?.id === weather.id"
              @select-card="selectCity"
              @click-detail="moveToDetail"
            />
          </div>

          <el-empty v-else description="일치하는 지역이 없습니다.">
            <el-button type="primary" plain @click="updateSearchQuery('')">
              전체 지역 보기
            </el-button>
          </el-empty>
        </template>
      </BaseDashboardCard>

      <div class="selected-message" :class="{ active: selectedCityInfo }">
        <span>
          {{ selectedCityInfo ? '✓' : 'i' }}
        </span>

        <p v-if="selectedCityInfo">
          <strong>
            {{ selectedCityInfo.name }}
          </strong>
          지역이 선택되었습니다.
        </p>

        <p v-else>카드를 클릭하거나 지역을 검색해 보세요.</p>
      </div>
    </section>
  </main>
</template>
