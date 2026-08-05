import { computed, unref } from 'vue'

import { useConfigStore } from '@/stores/configStore'

export const useTemperature = (temperature) => {
  const configStore = useConfigStore()

  const displayTemp = computed(() => {
    const rawTemp = Number(unref(temperature))

    if (Number.isNaN(rawTemp)) {
      return '-'
    }

    if (configStore.unit === 'fahrenheit') {
      return Math.round((rawTemp * 9) / 5 + 32)
    }

    return Math.round(rawTemp)
  })

  const displayTemperature = computed(() => {
    return `${displayTemp.value}${configStore.unitSymbol}`
  })

  return {
    displayTemp,
    displayTemperature,
  }
}
