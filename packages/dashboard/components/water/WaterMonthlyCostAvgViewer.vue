<template>
  <v-card variant="tonal">
    <v-card-subtitle>水道平均（{{ term * 2 }}ヵ月間）</v-card-subtitle>
    <v-card-text>
      <div class="text-h3 text-center">
        <span>{{ amountAvg }}</span>
      </div>
      <div class="text-right">m^3/月</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const { data, error } = await useFetch('/api/water/table', {
  params: { limit: 12 },
})
if (error.value) {
  console.log(error.value)
}
const term = computed(() => {
  return data.value?.usages.length || 0
})
const amountAvg = computed(() => {
  const usages = data.value?.usages
  if (!usages) {
    return 0
  }
  const sum = usages.map((v) => v.amount).reduce((a, b) => a + b)
  return formatNumber(sum / (usages.length * 2), 2)
})
</script>

<style>
span {
  display: inline-block;
}
</style>
