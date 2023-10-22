<template>
  <v-card variant="tonal">
    <v-card-title>{{ title }} </v-card-title>
    <v-card-subtitle> 更新 {{ $datetime(data?.lastUpdated) }} </v-card-subtitle>
    <v-card-text>
      <v-data-table :headers="headers" :items="usages"> </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()

const headers = [
  { title: '年月日', align: 'end', key: 'date' },
  { title: '使用量（kWh）', align: 'end', key: 'amount' },
] as const

const { data, error } = await useFetch('/api/electricity/table', {
  params: { limit: 31, term: 'daily' },
})
const usages = computed(() => {
  if (!data.value?.dailyUsages) {
    return []
  }
  return data.value?.dailyUsages.map((v) => {
    return {
      date: v.date,
      amount: formatNumber(v.amount, 2),
    }
  })
})
if (error.value) {
  console.log(error.value)
}
</script>
