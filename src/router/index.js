import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'weather-home',
    component: () => import('@/views/WeatherHomeView.vue'),
  },
  {
    path: '/forecast',
    name: 'pangyo-forecast',
    component: () => import('@/views/PangyoForecastView.vue'),
  },
  {
    path: '/about',
    name: 'weather-about',
    component: () => import('@/views/WeatherAboutView.vue'),
  },
  {
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior() {
    return {
      top: 0,
    }
  },
})

export default router
