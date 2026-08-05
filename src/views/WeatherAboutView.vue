<script setup>
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'

const router = useRouter()

const moveToHome = () => {
  router.push({
    name: 'weather-home',
  })
}
</script>

<template>
  <main class="weather-page">
    <section class="weather-container">
      <section class="about-hero">
        <p>ABOUT THIS PROJECT</p>

        <h2>Vue 날씨 대시보드</h2>

        <span> Vue 3의 주요 기능을 하나의 프로젝트에서 학습하기 위한 종합 실습입니다. </span>
      </section>

      <BaseDashboardCard title="프로젝트 구성" description="이번 실습에서 적용한 주요 기술입니다.">
        <div class="feature-grid">
          <article>
            <span>⚡</span>
            <h3>Composition API</h3>
            <p>ref, computed, watch, watchEffect, onMounted를 활용한 반응형 개발</p>
          </article>

          <article>
            <span>🧩</span>
            <h3>Component</h3>
            <p>Props, Emits, Slot을 이용한 재사용 가능한 컴포넌트 설계</p>
          </article>

          <article>
            <span>🧭</span>
            <h3>Vue Router</h3>
            <p>동적 라우팅과 페이지 기반 화면 이동 구현</p>
          </article>

          <article>
            <span>🗂️</span>
            <h3>Pinia</h3>
            <p>전역 상태 관리와 전국 날씨 데이터를 효율적으로 관리</p>
          </article>

          <article>
            <span>🔗</span>
            <h3>Axios</h3>
            <p>OpenWeather API와 통신하여 실시간 날씨 및 예보 조회</p>
          </article>

          <article>
            <span>🗺️</span>
            <h3>Leaflet Map</h3>
            <p>전국 지역을 지도에서 확인하고 날씨 정보를 시각화</p>
          </article>

          <article>
            <span>📈</span>
            <h3>Chart.js</h3>
            <p>판교 5일 예보의 기온 변화를 차트로 시각화</p>
          </article>

          <article>
            <span>🌤️</span>
            <h3>SunCalc</h3>
            <p>태양 위치를 계산하여 판교역 예상 그늘을 시뮬레이션</p>
          </article>

          <article>
            <span>🎨</span>
            <h3>Element Plus</h3>
            <p>Button, Alert, Skeleton 등 UI 컴포넌트를 활용</p>
          </article>
        </div>
        <el-button type="primary" size="large" class="about-home-button" @click="moveToHome">
          날씨 대시보드로 이동
        </el-button>
      </BaseDashboardCard>
    </section>
  </main>
</template>
