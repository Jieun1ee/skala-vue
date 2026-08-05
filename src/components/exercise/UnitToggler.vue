<script setup>
import { storeToRefs } from 'pinia'

import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const { unitName, unitSymbol } = storeToRefs(configStore)

const handleToggleUnit = () => {
  configStore.toggleUnit()
}
</script>

<template>
  <div class="unit-toggler">
    <div class="unit-information">
      <span class="unit-label">날씨 단위</span>

      <strong> {{ unitName }} {{ unitSymbol }} </strong>
    </div>

    <el-button type="primary" class="unit-button" @click="handleToggleUnit">
      <span>↻</span>
      단위 변경
    </el-button>
  </div>
</template>
