<template>
  <value-viewer :title="title" :value="amountAvg" unit="kWh/日"></value-viewer>
</template>

<script setup lang="ts">
const { $logger } = useNuxtApp()
const { data, error } = await useFetch('/api/electricity/table', {
  params: { limit: 31, term: 'daily' },
})
if (error.value) {
  $logger.error(error.value)
}
const title = computed(() => {
  const term = data.value?.dailyUsages?.length || 0
  return `電気平均（${term}日間）`
})
const amountAvg = computed(() => {
  const usages = data.value?.dailyUsages
  if (!usages) {
    return '0'
  }
  const sum = usages.map((v) => v.amount).reduce((a, b) => a + b)
  return formatNumber(sum / usages.length, 2)
})
</script>

<style>
span {
  display: inline-block;
}
</style>
