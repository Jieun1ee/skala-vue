<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  weatherList: {
    type: Array,
    required: true,
  },

  selectedWeatherId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select-weather', 'click-detail'])

const configStore = useConfigStore()

const mapContainer = ref(null)

let mapInstance = null
let markerLayer = null

const convertTemperature = (temperature) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temperature * 9) / 5 + 32)
  }

  return Math.round(temperature)
}

const getTemperatureClass = (temperature) => {
  if (temperature >= 30) {
    return 'very-hot'
  }

  if (temperature >= 25) {
    return 'hot'
  }

  if (temperature >= 20) {
    return 'mild'
  }

  return 'cool'
}

const createMarkerIcon = (weather) => {
  const displayTemperature = convertTemperature(weather.temp)
  const temperatureClass = getTemperatureClass(weather.temp)
  const selectedClass = props.selectedWeatherId === weather.id ? 'selected' : ''

  return L.divIcon({
    className: 'weather-map-icon-wrapper',

    html: `
      <div class="weather-map-marker ${temperatureClass} ${selectedClass}">
        <span>${weather.name}</span>
        <strong>${displayTemperature}${configStore.unitSymbol}</strong>
      </div>
    `,

    iconSize: [72, 48],
    iconAnchor: [36, 24],
    popupAnchor: [0, -20],
  })
}

const createPopupContent = (weather) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'weather-popup'

  const title = document.createElement('strong')
  title.className = 'weather-popup-title'
  title.textContent = weather.name

  const status = document.createElement('p')
  status.className = 'weather-popup-status'
  status.textContent = weather.status

  const information = document.createElement('dl')
  information.className = 'weather-popup-information'

  const informationItems = [
    {
      label: '현재 기온',
      value: `${convertTemperature(weather.temp)}${configStore.unitSymbol}`,
    },
    {
      label: '체감 온도',
      value: `${convertTemperature(weather.feelsLike)}${configStore.unitSymbol}`,
    },
    {
      label: '습도',
      value: `${weather.humidity}%`,
    },
    {
      label: '풍속',
      value: `${weather.wind}m/s`,
    },
  ]

  informationItems.forEach((item) => {
    const row = document.createElement('div')
    const term = document.createElement('dt')
    const description = document.createElement('dd')

    term.textContent = item.label
    description.textContent = item.value

    row.append(term, description)
    information.append(row)
  })

  const detailButton = document.createElement('button')
  detailButton.type = 'button'
  detailButton.className = 'weather-popup-detail-button'
  detailButton.textContent = '상세보기 →'

  detailButton.addEventListener('click', () => {
    emit('click-detail', weather)
  })

  wrapper.append(title, status, information, detailButton)

  return wrapper
}

const renderMarkers = () => {
  if (!mapInstance || !markerLayer) {
    return
  }

  markerLayer.clearLayers()

  const validWeatherList = props.weatherList.filter((weather) => {
    return typeof weather.latitude === 'number' && typeof weather.longitude === 'number'
  })

  validWeatherList.forEach((weather) => {
    const marker = L.marker([weather.latitude, weather.longitude], {
      icon: createMarkerIcon(weather),
      keyboard: true,
      title: `${weather.name} ${convertTemperature(weather.temp)}${configStore.unitSymbol}`,
    })

    marker.bindPopup(createPopupContent(weather), {
      minWidth: 210,
      closeButton: true,
    })

    marker.on('click', () => {
      emit('select-weather', weather)
    })

    marker.addTo(markerLayer)
  })
}

const initializeMap = async () => {
  await nextTick()

  if (!mapContainer.value || mapInstance) {
    return
  }

  mapInstance = L.map(mapContainer.value, {
    center: [36.25, 127.85],
    zoom: 7,
    minZoom: 5,
    maxZoom: 12,
    zoomControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  markerLayer = L.layerGroup().addTo(mapInstance)

  renderMarkers()

  window.setTimeout(() => {
    mapInstance?.invalidateSize()
  }, 100)
}

watch(
  () => props.weatherList,
  () => {
    renderMarkers()
  },
  {
    deep: true,
  },
)

watch(
  () => props.selectedWeatherId,
  () => {
    renderMarkers()
  },
)

watch(
  () => configStore.unit,
  () => {
    renderMarkers()
  },
)

onMounted(() => {
  initializeMap()
})

onBeforeUnmount(() => {
  mapInstance?.remove()

  mapInstance = null
  markerLayer = null
})
</script>

<template>
  <section class="weather-map-section">
    <div class="weather-map-legend">
      <span>
        <i class="very-hot"></i>
        30°C 이상
      </span>

      <span>
        <i class="hot"></i>
        25~29°C
      </span>

      <span>
        <i class="mild"></i>
        20~24°C
      </span>

      <span>
        <i class="cool"></i>
        20°C 미만
      </span>
    </div>

    <div
      ref="mapContainer"
      class="weather-map-container"
      aria-label="대한민국 지역별 현재 기온 지도"
    ></div>
  </section>
</template>
