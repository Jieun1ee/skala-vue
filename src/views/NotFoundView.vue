<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const moveToHome = () => {
  router.push({
    name: 'weather-home',
  })
}
</script>

<template>
  <main class="not-found-page">
    <section class="not-found-card">
      <div class="not-found-code">4<span>☀️</span>4</div>

      <h1>페이지를 찾을 수 없습니다.</h1>

      <p>요청하신 주소가 존재하지 않거나 이동되었을 수 있습니다.</p>

      <el-button type="primary" size="large" round class="not-found-button" @click="moveToHome">
        날씨 대시보드로 이동
      </el-button>
    </section>
  </main>
</template>
