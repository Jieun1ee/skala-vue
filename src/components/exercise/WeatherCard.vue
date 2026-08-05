<script setup>
import { computed, toRef } from 'vue'

import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const temperature = toRef(() => props.weather.temp)

const { displayTemperature } = useTemperature(temperature)

const weatherEmoji = computed(() => {
  const status = props.weather.status || ''

  if (status.includes('맑음') || status.includes('맑은')) {
    return '☀️'
  }

  if (status.includes('구름') || status.includes('흐림')) {
    return '☁️'
  }

  if (status.includes('비') || status.includes('소나기')) {
    return '🌧️'
  }

  if (status.includes('눈')) {
    return '❄️'
  }

  if (status.includes('천둥') || status.includes('번개')) {
    return '⛈️'
  }

  if (status.includes('안개') || status.includes('박무')) {
    return '🌫️'
  }

  return '🌤️'
})

const handleCardClick = () => {
  emit('select-card', props.weather)
}

const handleDetailClick = () => {
  emit('click-detail', props.weather)
}
</script>

<template>
  <article
    class="weather-card"
    :class="{ selected: props.selected }"
    tabindex="0"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
  >
    <div class="weather-card-top">
      <div>
        <p class="weather-city-label">
          {{ props.weather.name }}
        </p>

        <h3>{{ props.weather.status }}</h3>
      </div>

      <el-tag v-if="props.selected" type="success" size="small" effect="light" round>
        선택됨
      </el-tag>
    </div>

    <div class="weather-main-information">
      <!-- <img
        v-if="props.weather.icon"
        class="weather-icon"
        :src="`https://openweathermap.org/img/wn/${props.weather.icon}@2x.png`"
        :alt="`${props.weather.status} 날씨 아이콘`"
      /> -->

      <span class="weather-emoji" role="img" :aria-label="`${props.weather.status} 날씨`">
        {{ weatherEmoji }}
      </span>

      <strong class="weather-temperature">
        {{ displayTemperature }}
      </strong>
    </div>

    <div class="weather-card-bottom">
      <el-tag v-if="props.weather.temp >= 25" type="danger" effect="light" round> 🔥 더움 </el-tag>

      <el-tag v-else type="info" effect="light" round> ❄️ 선선함 </el-tag>

      <el-button type="primary" size="small" round @click.stop="handleDetailClick">
        상세보기
        <span>→</span>
      </el-button>
    </div>
  </article>
</template>
