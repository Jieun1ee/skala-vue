<script setup>
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (value) => {
  const koreanOnly = value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, '')

  emit('update-query', koreanOnly)
}
</script>

<template>
  <div class="search-section">
    <label class="search-label" for="city-search">
      <span class="search-label-icon">⌕</span>

      <span>
        도시 검색
        <small>한글 즉시 동기화</small>
      </span>
    </label>

    <!-- // element-plus 추가 -->
    <el-input
      id="city-search"
      :model-value="props.searchQuery"
      type="text"
      autocomplete="off"
      placeholder="검색할 도시 이름을 입력하세요"
      clearable
      size="large"
      @input="handleInput"
      @clear="emit('update-query', '')"
    />

    <p class="search-text">
      검색 중인 도시:

      <strong>
        {{ props.searchQuery || '전체 도시' }}
      </strong>
    </p>
  </div>
</template>
