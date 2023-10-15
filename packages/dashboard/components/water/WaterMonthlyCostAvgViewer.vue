<template>
  <value-viewer
    v-if="displayMode === 'amount'"
    :title="title"
    :value="amountAvg"
    unit="m^3/月"
  ></value-viewer>
  <value-viewer
    v-else
    :title="title"
    :value="yenAvg"
    unit="円/月"
  ></value-viewer>
</template>

<script setup lang="ts">
const props = defineProps<{
  displayMode: 'amount' | 'yen'
}>()

const { displayMode } = toRefs(props)

const { data, error } = await useFetch('/api/water/table', {
  params: { limit: 12 },
})
if (error.value) {
  console.log(error.value)
}
const title = computed(() => {
  const term = data.value?.monthlyUsages.length || 0
  return `水道平均（${term}ヵ月間）`
})
const amountAvg = computed(() => {
  const usages = data.value?.monthlyUsages
  if (!usages) {
    return '0'
  }
  const sum = usages.map((v) => v.amount).reduce((a, b) => a + b)
  return formatNumber(sum / (usages.length * 2), 2)
})
const yenAvg = computed(() => {
  const usages = data.value?.monthlyUsages
  if (!usages) {
    return '0'
  }
  const sum = usages.map((v) => v.yen).reduce((a, b) => a + b)
  return formatNumber(sum / (usages.length * 2), 2)
})
</script>

<style>
span {
  display: inline-block;
}
</style>
