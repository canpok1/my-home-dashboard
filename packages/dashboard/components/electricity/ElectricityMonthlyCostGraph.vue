<template>
  <CostGraph
    ref="graph"
    :title="title"
    :x-labels="xLabels"
    :line-params="lineParams"
    :bar-params="barParams"
    :last-updated="lastUpdated"
  >
    <template #actions>
      <slot name="actions"></slot>
    </template>
  </CostGraph>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()

const graph = ref()
const resize = () => {
  graph.value.setupChart()
}

defineExpose({
  resize,
})

const { data, error } = await useFetch('/api/electricity/graph', {
  params: {
    limit: 12,
    term: 'monthly',
    format: 'graph',
  },
})
if (error.value) {
  console.log(error.value)
}

const xLabels = computed(() => data.value?.labels || [])
const lineParams = computed(() => {
  return {
    name: '料金',
    values: data.value?.yens || [],
    yTitle: '料金(円)',
  }
})
const barParams = computed(() => {
  return {
    name: '使用量',
    values: data.value?.kwhs || [],
    yTitle: '使用量(kWh)',
  }
})
const lastUpdated = computed(() => data.value?.lastUpdated || '')
</script>
