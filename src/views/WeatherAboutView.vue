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
            <p>ref, computed, watch, onMounted를 활용한 반응형 상태 관리</p>
          </article>

          <article>
            <span>🧩</span>
            <h3>Component</h3>
            <p>props, emits, slot을 이용한 재사용 가능한 컴포넌트 구성</p>
          </article>

          <article>
            <span>🧭</span>
            <h3>Vue Router</h3>
            <p>동적 경로와 지연 로딩을 활용한 페이지 이동</p>
          </article>

          <article>
            <span>🗂️</span>
            <h3>Pinia Store</h3>
            <p>온도 단위와 날씨 데이터를 전역 상태로 관리</p>
          </article>

          <article>
            <span>🔗</span>
            <h3>Axios</h3>
            <p>OpenWeather API와 연동하여 실시간 데이터 조회</p>
          </article>

          <article>
            <span>🎨</span>
            <h3>Blue Point UI</h3>
            <p>파란색 포인트를 활용한 대시보드 디자인</p>
          </article>
        </div>

        <el-button type="primary" size="large" class="about-home-button" @click="moveToHome">
          날씨 대시보드로 이동
        </el-button>
      </BaseDashboardCard>
    </section>
  </main>
</template>
