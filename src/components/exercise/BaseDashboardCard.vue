<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },

  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="dashboard-card">
    <div v-if="title || description" class="dashboard-card-header">
      <div>
        <h2 v-if="title" class="dashboard-card-title">
          {{ title }}
        </h2>

        <p v-if="description" class="dashboard-card-description">
          {{ description }}
        </p>
      </div>

      <slot name="header-action" />
    </div>

    <div class="dashboard-card-content">
      <slot />
    </div>
  </section>
</template>
