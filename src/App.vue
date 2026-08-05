<script setup>
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="app-header-inner">
        <div class="brand-row">
          <div>
            <p class="brand-eyebrow">WEATHER DASHBOARD</p>

            <h1 class="brand-title">
              <span class="brand-icon"> 🌤️ </span>

              Vue 날씨 대시보드 - P299 이지은
            </h1>
          </div>

          <UnitToggler />
        </div>

        <nav class="navigation">
          <RouterLink to="/">
            <span>🌦️</span>
            전국 날씨
          </RouterLink>

          <RouterLink to="/forecast">
            <span>📈</span>
            판교 5일 예보
          </RouterLink>

          <RouterLink to="/about">
            <span>ℹ️</span>
            서비스 소개
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
