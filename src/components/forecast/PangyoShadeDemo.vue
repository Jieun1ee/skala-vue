<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import L from 'leaflet'
import * as SunCalc from 'suncalc'

import 'leaflet/dist/leaflet.css'

const PANGYO_STATION = {
  latitude: 37.3948,
  longitude: 127.1112,
}

const DEMO_BUILDINGS = [
  {
    id: 'demo-building-01',
    name: '데모 건물 A',
    height: 35,
    coordinates: [
      [37.39525, 127.10995],
      [37.39525, 127.11035],
      [37.39495, 127.11035],
      [37.39495, 127.10995],
    ],
  },
  {
    id: 'demo-building-02',
    name: '데모 건물 B',
    height: 55,
    coordinates: [
      [37.39555, 127.11115],
      [37.39555, 127.11165],
      [37.39515, 127.11165],
      [37.39515, 127.11115],
    ],
  },
  {
    id: 'demo-building-03',
    name: '데모 건물 C',
    height: 28,
    coordinates: [
      [37.39445, 127.10975],
      [37.39445, 127.11015],
      [37.39415, 127.11015],
      [37.39415, 127.10975],
    ],
  },
  {
    id: 'demo-building-04',
    name: '데모 건물 D',
    height: 70,
    coordinates: [
      [37.39435, 127.11155],
      [37.39435, 127.11205],
      [37.39395, 127.11205],
      [37.39395, 127.11155],
    ],
  },
  {
    id: 'demo-building-05',
    name: '데모 건물 E',
    height: 42,
    coordinates: [
      [37.39365, 127.11025],
      [37.39365, 127.11075],
      [37.3933, 127.11075],
      [37.3933, 127.11025],
    ],
  },
  {
    id: 'demo-building-06',
    name: '데모 건물 F',
    height: 48,
    coordinates: [
      [37.395, 127.11225],
      [37.395, 127.1127],
      [37.39465, 127.1127],
      [37.39465, 127.11225],
    ],
  },
]

const mapContainer = ref(null)

const selectedDate = ref('')
const selectedMinuteOfDay = ref(16 * 60)

let mapInstance = null
let buildingLayer = null
let shadowLayer = null
let sunlightLayer = null

const padNumber = (number) => {
  return String(number).padStart(2, '0')
}

const initializeDate = () => {
  const now = new Date()

  selectedDate.value = [
    now.getFullYear(),
    padNumber(now.getMonth() + 1),
    padNumber(now.getDate()),
  ].join('-')

  selectedMinuteOfDay.value = now.getHours() * 60 + now.getMinutes()
}

const selectedDateTime = computed(() => {
  if (!selectedDate.value) {
    return new Date()
  }

  const hour = Math.floor(selectedMinuteOfDay.value / 60)
  const minute = selectedMinuteOfDay.value % 60

  return new Date(`${selectedDate.value}T${padNumber(hour)}:${padNumber(minute)}:00`)
})

const selectedTimeLabel = computed(() => {
  const hour = Math.floor(selectedMinuteOfDay.value / 60)
  const minute = selectedMinuteOfDay.value % 60

  return `${padNumber(hour)}:${padNumber(minute)}`
})

const sunPosition = computed(() => {
  return SunCalc.getPosition(
    selectedDateTime.value,
    PANGYO_STATION.latitude,
    PANGYO_STATION.longitude,
  )
})

const altitudeDegree = computed(() => {
  return (sunPosition.value.altitude * 180) / Math.PI
})

const sunlightBearing = computed(() => {
  const degree = (sunPosition.value.azimuth * 180) / Math.PI

  return (degree + 180 + 360) % 360
})

const shadowBearing = computed(() => {
  return (sunlightBearing.value + 180) % 360
})

const hasSunlight = computed(() => {
  return altitudeDegree.value > 0
})

const directionLabel = (bearing) => {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']

  const index = Math.round(bearing / 45) % 8

  return directions[index]
}

const sunlightDirectionLabel = computed(() => {
  return directionLabel(sunlightBearing.value)
})

const shadowDirectionLabel = computed(() => {
  return directionLabel(shadowBearing.value)
})

const averageShadowLength = computed(() => {
  if (!hasSunlight.value) {
    return 0
  }

  const averageHeight =
    DEMO_BUILDINGS.reduce((sum, building) => {
      return sum + building.height
    }, 0) / DEMO_BUILDINGS.length

  const length = averageHeight / Math.tan(sunPosition.value.altitude)

  return Math.min(Math.max(length, 0), 250)
})

const formatNumber = (number, fractionDigits = 0) => {
  if (!Number.isFinite(number)) {
    return '-'
  }

  return number.toFixed(fractionDigits)
}

const moveCoordinate = (latitude, longitude, distanceMeter, bearingDegree) => {
  const earthRadius = 6378137
  const bearingRadian = (bearingDegree * Math.PI) / 180

  const latitudeRadian = (latitude * Math.PI) / 180
  const longitudeRadian = (longitude * Math.PI) / 180

  const movedLatitude = Math.asin(
    Math.sin(latitudeRadian) * Math.cos(distanceMeter / earthRadius) +
      Math.cos(latitudeRadian) * Math.sin(distanceMeter / earthRadius) * Math.cos(bearingRadian),
  )

  const movedLongitude =
    longitudeRadian +
    Math.atan2(
      Math.sin(bearingRadian) * Math.sin(distanceMeter / earthRadius) * Math.cos(latitudeRadian),
      Math.cos(distanceMeter / earthRadius) - Math.sin(latitudeRadian) * Math.sin(movedLatitude),
    )

  return [(movedLatitude * 180) / Math.PI, (movedLongitude * 180) / Math.PI]
}

const calculateShadowLength = (buildingHeight) => {
  if (!hasSunlight.value) {
    return 0
  }

  const length = buildingHeight / Math.tan(sunPosition.value.altitude)

  return Math.min(Math.max(length, 0), 250)
}

const createShadowPolygon = (building) => {
  const shadowLength = calculateShadowLength(building.height)

  const shiftedCoordinates = building.coordinates.map(([latitude, longitude]) => {
    return moveCoordinate(latitude, longitude, shadowLength, shadowBearing.value)
  })

  return [...building.coordinates, ...[...shiftedCoordinates].reverse()]
}

const clearLayers = () => {
  buildingLayer?.clearLayers()
  shadowLayer?.clearLayers()
  sunlightLayer?.clearLayers()
}

const renderBuildings = () => {
  if (!mapInstance || !buildingLayer) {
    return
  }

  DEMO_BUILDINGS.forEach((building) => {
    const polygon = L.polygon(building.coordinates, {
      color: '#3f464d',
      weight: 1.5,
      fillColor: '#68717a',
      fillOpacity: 0.85,
    })

    polygon.bindTooltip(
      `
        <strong>${building.name}</strong><br>
        데모 높이: ${building.height}m
      `,
      {
        direction: 'top',
      },
    )

    polygon.addTo(buildingLayer)
  })
}

const renderShadows = () => {
  if (!mapInstance || !shadowLayer || !hasSunlight.value) {
    return
  }

  DEMO_BUILDINGS.forEach((building) => {
    const shadowLength = calculateShadowLength(building.height)
    const shadowCoordinates = createShadowPolygon(building)

    const shadowPolygon = L.polygon(shadowCoordinates, {
      color: '#24292e',
      weight: 1,
      fillColor: '#24292e',
      fillOpacity: 0.42,
      interactive: true,
    })

    shadowPolygon.bindTooltip(
      `
        <strong>${building.name} 예상 그늘</strong><br>
        예상 길이: ${formatNumber(shadowLength)}m<br>
        방향: ${shadowDirectionLabel.value}
      `,
      {
        direction: 'top',
      },
    )

    shadowPolygon.addTo(shadowLayer)
  })
}

const renderSunlightDirection = () => {
  if (!mapInstance || !sunlightLayer || !hasSunlight.value) {
    return
  }

  const center = [PANGYO_STATION.latitude, PANGYO_STATION.longitude]

  const sunlightEnd = moveCoordinate(center[0], center[1], 180, sunlightBearing.value)

  const shadowEnd = moveCoordinate(center[0], center[1], 180, shadowBearing.value)

  L.polyline([center, sunlightEnd], {
    color: '#d49a32',
    weight: 4,
    opacity: 0.9,
    dashArray: '8 7',
  })
    .bindTooltip(`햇빛 방향: ${sunlightDirectionLabel.value}`)
    .addTo(sunlightLayer)

  L.polyline([center, shadowEnd], {
    color: '#30343a',
    weight: 3,
    opacity: 0.85,
    dashArray: '5 6',
  })
    .bindTooltip(`그늘 방향: ${shadowDirectionLabel.value}`)
    .addTo(sunlightLayer)
}

const renderStationMarker = () => {
  if (!mapInstance || !sunlightLayer) {
    return
  }

  const stationIcon = L.divIcon({
    className: 'pangyo-station-marker-wrapper',

    html: `
      <div class="pangyo-station-marker">
        판교역
      </div>
    `,

    iconSize: [58, 30],
    iconAnchor: [29, 15],
  })

  L.marker([PANGYO_STATION.latitude, PANGYO_STATION.longitude], {
    icon: stationIcon,
    title: '판교역 기준 위치',
  }).addTo(sunlightLayer)
}

const renderMapLayers = () => {
  if (!mapInstance) {
    return
  }

  clearLayers()
  renderBuildings()
  renderShadows()
  renderSunlightDirection()
  renderStationMarker()
}

const initializeMap = async () => {
  await nextTick()

  if (!mapContainer.value || mapInstance) {
    return
  }

  mapInstance = L.map(mapContainer.value, {
    center: [PANGYO_STATION.latitude, PANGYO_STATION.longitude],
    zoom: 17,
    minZoom: 15,
    maxZoom: 19,
    zoomControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: true,
    dragging: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  shadowLayer = L.layerGroup().addTo(mapInstance)
  buildingLayer = L.layerGroup().addTo(mapInstance)
  sunlightLayer = L.layerGroup().addTo(mapInstance)

  renderMapLayers()

  window.setTimeout(() => {
    mapInstance?.invalidateSize()
  }, 100)
}

const setCurrentTime = () => {
  const now = new Date()

  selectedDate.value = [
    now.getFullYear(),
    padNumber(now.getMonth() + 1),
    padNumber(now.getDate()),
  ].join('-')

  selectedMinuteOfDay.value = now.getHours() * 60 + now.getMinutes()
}

watch([selectedDate, selectedMinuteOfDay], () => {
  renderMapLayers()
})

onMounted(async () => {
  initializeDate()
  await initializeMap()
})

onBeforeUnmount(() => {
  mapInstance?.remove()

  mapInstance = null
  buildingLayer = null
  shadowLayer = null
  sunlightLayer = null
})
</script>

<template>
  <section class="pangyo-shade-demo">
    <header class="shade-demo-header">
      <div>
        <p class="shade-demo-eyebrow">PANGYO SHADE DEMO</p>

        <h3>판교역 예상 그늘 테스트</h3>

        <p>시간 막대를 움직여 예상 그늘의 방향과 길이 변화를 확인하세요.</p>
      </div>

      <el-tag type="warning" effect="plain"> 데모용 가상 건물 </el-tag>
    </header>

    <div class="shade-control-grid">
      <label class="shade-control-field">
        <span>날짜</span>

        <input v-model="selectedDate" type="date" />
      </label>

      <div class="shade-time-slider-area">
        <div class="shade-time-slider-header">
          <span>시간 이동</span>

          <strong>
            {{ selectedTimeLabel }}
          </strong>
        </div>

        <input
          v-model.number="selectedMinuteOfDay"
          class="shade-time-slider"
          type="range"
          min="0"
          max="1439"
          step="5"
          aria-label="판교역 그늘 예측 시간 선택"
        />

        <div class="shade-time-scale">
          <span>00시</span>
          <span>06시</span>
          <span>12시</span>
          <span>18시</span>
          <span>24시</span>
        </div>
      </div>

      <el-button type="primary" plain class="shade-current-time-button" @click="setCurrentTime">
        현재 시간
      </el-button>
    </div>

    <div class="shade-summary-grid">
      <article>
        <span>선택 시간</span>

        <strong>
          {{ selectedTimeLabel }}
        </strong>
      </article>

      <article>
        <span>태양 고도</span>

        <strong v-if="hasSunlight"> {{ formatNumber(altitudeDegree, 1) }}° </strong>

        <strong v-else> 일몰 이후 </strong>
      </article>

      <article>
        <span>햇빛 방향</span>

        <strong v-if="hasSunlight">
          {{ sunlightDirectionLabel }}
        </strong>

        <strong v-else>-</strong>
      </article>

      <article>
        <span>그늘 방향</span>

        <strong v-if="hasSunlight">
          {{ shadowDirectionLabel }}
        </strong>

        <strong v-else>-</strong>
      </article>

      <article>
        <span>평균 예상 길이</span>

        <strong v-if="hasSunlight"> {{ formatNumber(averageShadowLength) }}m </strong>

        <strong v-else>-</strong>
      </article>
    </div>

    <el-alert
      v-if="!hasSunlight"
      title="선택한 시간에는 태양이 지평선 아래에 있습니다."
      description="건물 그늘을 계산하지 않고 건물 위치만 표시합니다."
      type="info"
      show-icon
      :closable="false"
      class="shade-alert"
    />

    <div class="shade-map-legend">
      <span>
        <i class="building"></i>
        테스트 건물
      </span>

      <span>
        <i class="shadow"></i>
        예상 그늘
      </span>

      <span>
        <i class="sunlight"></i>
        햇빛 방향
      </span>
    </div>

    <div
      ref="mapContainer"
      class="pangyo-shade-map"
      aria-label="판교역 주변 예상 그늘 데모 지도"
    ></div>

    <p class="shade-demo-notice">
      본 기능은 테스트용 가상 건물 좌표와 높이를 사용합니다. 실제 보행 경로의 그늘, 나무, 차양,
      지형, 건물 세부 구조는 반영하지 않습니다.
    </p>
  </section>
</template>
