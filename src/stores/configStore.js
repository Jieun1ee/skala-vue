import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius',
  }),

  getters: {
    unitSymbol: (state) => {
      return state.unit === 'celsius' ? '°C' : '°F'
    },

    unitName: (state) => {
      return state.unit === 'celsius' ? '섭씨' : '화씨'
    },
  },

  actions: {
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },
  },
})
