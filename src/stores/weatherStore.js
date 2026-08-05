import { defineStore } from 'pinia'

import { getCurrentWeatherByCoordinates } from '@/api/weatherApi'

import { KOREA_REGIONS } from '@/constants/koreaRegions'

const convertWeatherData = (apiData, region) => {
  const weatherInformation = apiData.weather?.[0]

  return {
    id: region.id,
    name: region.name,

    fullName:
      apiData.name && apiData.sys?.country
        ? `${apiData.name}, ${apiData.sys.country}`
        : region.name,

    latitude: region.latitude,
    longitude: region.longitude,

    temp: Math.round(apiData.main.temp),
    feelsLike: Math.round(apiData.main.feels_like),
    tempMin: Math.round(apiData.main.temp_min),
    tempMax: Math.round(apiData.main.temp_max),

    status: weatherInformation?.description || '정보 없음',

    humidity: apiData.main.humidity,
    pressure: apiData.main.pressure,

    wind: apiData.wind?.speed ?? 0,
    windDirection: apiData.wind?.deg ?? 0,

    cloudiness: apiData.clouds?.all ?? 0,
    visibility: apiData.visibility ?? 0,

    icon: weatherInformation?.icon || '',
  }
}

const createErrorMessage = (error) => {
  if (error.response?.status === 401) {
    return 'OpenWeather API Key가 올바르지 않거나 아직 활성화되지 않았습니다.'
  }

  if (error.response?.status === 404) {
    return '요청한 지역의 날씨 정보를 찾을 수 없습니다.'
  }

  if (error.code === 'ECONNABORTED') {
    return '날씨 서버의 응답 시간이 초과되었습니다.'
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return '인터넷 연결 상태를 확인해 주세요.'
  }

  return error.message || '날씨 데이터를 가져오는 중 오류가 발생했습니다.'
}

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    weatherList: [],
    isLoading: false,
    errorMessage: '',
    failedRegions: [],
    lastUpdatedAt: null,
  }),

  getters: {
    getWeatherById: (state) => {
      return (regionId) => {
        return state.weatherList.find((weather) => weather.id === regionId)
      }
    },

    hottestRegion: (state) => {
      if (state.weatherList.length === 0) {
        return null
      }

      return [...state.weatherList].sort((a, b) => b.temp - a.temp)[0]
    },

    coolestRegion: (state) => {
      if (state.weatherList.length === 0) {
        return null
      }

      return [...state.weatherList].sort((a, b) => a.temp - b.temp)[0]
    },

    averageTemperature: (state) => {
      if (state.weatherList.length === 0) {
        return null
      }

      const totalTemperature = state.weatherList.reduce((sum, weather) => {
        return sum + weather.temp
      }, 0)

      const average = totalTemperature / state.weatherList.length

      return Math.round(average * 10) / 10
    },

    loadedRegionCount: (state) => {
      return state.weatherList.length
    },

    totalRegionCount: () => {
      return KOREA_REGIONS.length
    },
  },

  actions: {
    async fetchWeatherList() {
      this.isLoading = true
      this.errorMessage = ''
      this.failedRegions = []

      try {
        const requests = KOREA_REGIONS.map(async (region) => {
          const apiData = await getCurrentWeatherByCoordinates(region.latitude, region.longitude)

          return convertWeatherData(apiData, region)
        })

        const results = await Promise.allSettled(requests)

        this.weatherList = results
          .filter((result) => {
            return result.status === 'fulfilled'
          })
          .map((result) => {
            return result.value
          })

        this.failedRegions = results
          .map((result, index) => {
            return {
              result,
              region: KOREA_REGIONS[index],
            }
          })
          .filter(({ result }) => {
            return result.status === 'rejected'
          })
          .map(({ region }) => {
            return region.name
          })

        if (this.weatherList.length === 0) {
          this.errorMessage = '전국 날씨 데이터를 불러오지 못했습니다.'
        } else if (this.failedRegions.length > 0) {
          this.errorMessage = `${this.failedRegions.join(', ')} 지역 데이터는 불러오지 못했습니다.`
        }

        this.lastUpdatedAt = new Date()
      } catch (error) {
        console.error('전국 날씨 조회 실패:', error)

        this.errorMessage = createErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchWeatherById(regionId) {
      const existingWeather = this.getWeatherById(regionId)

      if (existingWeather) {
        return existingWeather
      }

      const region = KOREA_REGIONS.find((item) => item.id === regionId)

      if (!region) {
        this.errorMessage = '지원하지 않는 지역 코드입니다.'

        throw new Error('지원하지 않는 지역 코드입니다.')
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const apiData = await getCurrentWeatherByCoordinates(region.latitude, region.longitude)

        const weather = convertWeatherData(apiData, region)

        const existingIndex = this.weatherList.findIndex((item) => item.id === regionId)

        if (existingIndex === -1) {
          this.weatherList.push(weather)
        } else {
          this.weatherList[existingIndex] = weather
        }

        return weather
      } catch (error) {
        console.error('지역 상세 날씨 조회 실패:', error)

        this.errorMessage = createErrorMessage(error)

        throw error
      } finally {
        this.isLoading = false
      }
    },

    clearErrorMessage() {
      this.errorMessage = ''
    },

    resetWeatherStore() {
      this.weatherList = []
      this.isLoading = false
      this.errorMessage = ''
      this.failedRegions = []
      this.lastUpdatedAt = null
    },
  },
})
