import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

const weatherApi = axios.create({
  baseURL: import.meta.env.VITE_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
})

const validateApiKey = () => {
  if (!apiKey) {
    throw new Error('OpenWeather API Key가 없습니다. .env 파일을 확인하세요.')
  }
}

export const getCurrentWeatherByCoordinates = async (latitude, longitude) => {
  validateApiKey()

  const response = await weatherApi.get('/weather', {
    params: {
      lat: latitude,
      lon: longitude,
      appid: apiKey,
      units: 'metric',
      lang: 'kr',
    },
  })

  return response.data
}

export const getFiveDayForecastByCoordinates = async (latitude, longitude) => {
  validateApiKey()

  const response = await weatherApi.get('/forecast', {
    params: {
      lat: latitude,
      lon: longitude,
      appid: apiKey,
      units: 'metric',
      lang: 'kr',
    },
  })

  return response.data
}
