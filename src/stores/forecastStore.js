import { defineStore } from 'pinia'

import { getFiveDayForecastByCoordinates } from '@/api/weatherApi'

const PANGYO_LOCATION = {
  id: 'pangyo',
  name: '판교',
  latitude: 37.3948,
  longitude: 127.1112,
}

const createErrorMessage = (error) => {
  if (error.response?.status === 401) {
    return 'OpenWeather API Key가 올바르지 않거나 아직 활성화되지 않았습니다.'
  }

  if (error.response?.status === 404) {
    return '판교 지역의 예보 정보를 찾을 수 없습니다.'
  }

  if (error.response?.status === 429) {
    return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (error.code === 'ECONNABORTED') {
    return '날씨 서버의 응답 시간이 초과되었습니다.'
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return '인터넷 연결 상태를 확인해 주세요.'
  }

  return error.message || '판교 예보 데이터를 불러오는 중 오류가 발생했습니다.'
}

/*
 * API의 dt는 UTC 기준 Unix timestamp다.
 * city.timezone 값을 더해 해당 지역의 현지 시각으로 변환한다.
 */
const createLocalDate = (timestamp, timezoneOffset) => {
  return new Date((timestamp + timezoneOffset) * 1000)
}

const formatLocalDateKey = (timestamp, timezoneOffset) => {
  const date = createLocalDate(timestamp, timezoneOffset)

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDateLabel = (timestamp, timezoneOffset) => {
  const date = createLocalDate(timestamp, timezoneOffset)

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
}

const formatChartLabel = (timestamp, timezoneOffset) => {
  const date = createLocalDate(timestamp, timezoneOffset)

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date)
}

const convertForecastItem = (item, timezoneOffset) => {
  const weatherInformation = item.weather?.[0]

  return {
    timestamp: item.dt,
    dateKey: formatLocalDateKey(item.dt, timezoneOffset),
    dateLabel: formatDateLabel(item.dt, timezoneOffset),
    chartLabel: formatChartLabel(item.dt, timezoneOffset),

    temp: item.main.temp,
    feelsLike: item.main.feels_like,
    tempMin: item.main.temp_min,
    tempMax: item.main.temp_max,
    humidity: item.main.humidity,

    status: weatherInformation?.description || '정보 없음',

    weatherMain: weatherInformation?.main || '',

    icon: weatherInformation?.icon || '',

    wind: item.wind?.speed ?? 0,

    precipitationProbability: Math.round((item.pop ?? 0) * 100),

    rainAmount: item.rain?.['3h'] ?? 0,

    snowAmount: item.snow?.['3h'] ?? 0,
  }
}

const selectRepresentativeItem = (items) => {
  if (items.length === 0) {
    return null
  }

  /*
   * 현지 시각 정오에 가장 가까운 항목을
   * 해당 날짜의 대표 날씨로 사용한다.
   */
  return [...items].sort((a, b) => {
    const getHourDistance = (item) => {
      const label = item.chartLabel
      const match = label.match(/(\d{2})시/)

      if (!match) {
        return 24
      }

      return Math.abs(Number(match[1]) - 12)
    }

    return getHourDistance(a) - getHourDistance(b)
  })[0]
}

const createDailyForecastList = (forecastList) => {
  const groupedForecast = forecastList.reduce((groups, forecast) => {
    if (!groups[forecast.dateKey]) {
      groups[forecast.dateKey] = []
    }

    groups[forecast.dateKey].push(forecast)

    return groups
  }, {})

  return Object.entries(groupedForecast)
    .map(([dateKey, items]) => {
      const representative = selectRepresentativeItem(items)

      const minimumTemperature = Math.min(...items.map((item) => item.temp))

      const maximumTemperature = Math.max(...items.map((item) => item.temp))

      const maximumRainProbability = Math.max(...items.map((item) => item.precipitationProbability))

      const averageHumidity = items.reduce((total, item) => total + item.humidity, 0) / items.length

      return {
        dateKey,
        dateLabel: representative?.dateLabel || dateKey,

        status: representative?.status || '정보 없음',

        weatherMain: representative?.weatherMain || '',

        icon: representative?.icon || '',

        tempMin: Math.round(minimumTemperature),

        tempMax: Math.round(maximumTemperature),

        rainProbability: maximumRainProbability,

        humidity: Math.round(averageHumidity),

        wind: representative?.wind ?? 0,
      }
    })
    .slice(0, 5)
}

export const useForecastStore = defineStore('forecast', {
  state: () => ({
    location: PANGYO_LOCATION,

    forecastList: [],
    dailyForecastList: [],

    cityName: '',
    country: '',
    timezoneOffset: 0,

    isLoading: false,
    errorMessage: '',
    lastUpdatedAt: null,
  }),

  getters: {
    hasForecastData: (state) => {
      return state.forecastList.length > 0
    },

    chartLabels: (state) => {
      return state.forecastList.map((forecast) => forecast.chartLabel)
    },

    chartTemperatures: (state) => {
      return state.forecastList.map((forecast) => forecast.temp)
    },

    chartFeelsLikeTemperatures: (state) => {
      return state.forecastList.map((forecast) => forecast.feelsLike)
    },

    chartHumidity: (state) => {
      return state.forecastList.map((forecast) => forecast.humidity)
    },

    chartRainProbability: (state) => {
      return state.forecastList.map((forecast) => forecast.precipitationProbability)
    },
  },

  actions: {
    async fetchPangyoForecast() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const apiData = await getFiveDayForecastByCoordinates(
          this.location.latitude,
          this.location.longitude,
        )

        this.cityName = apiData.city?.name || '판교'

        this.country = apiData.city?.country || 'KR'

        this.timezoneOffset = apiData.city?.timezone ?? 0

        this.forecastList = (apiData.list || []).map((item) => {
          return convertForecastItem(item, this.timezoneOffset)
        })

        this.dailyForecastList = createDailyForecastList(this.forecastList)

        this.lastUpdatedAt = new Date()
      } catch (error) {
        console.error('판교 5일 예보 조회 실패:', error)

        this.forecastList = []
        this.dailyForecastList = []
        this.errorMessage = createErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },

    clearForecast() {
      this.forecastList = []
      this.dailyForecastList = []
      this.errorMessage = ''
      this.lastUpdatedAt = null
    },
  },
})
