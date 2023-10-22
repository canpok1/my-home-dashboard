<template>
  <v-card variant="tonal">
    <v-card-title>{{ title }}</v-card-title>
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

const { $logger } = useNuxtApp()

const headers = [
  { title: '年月', align: 'end', key: 'date' },
  { title: '使用日数', align: 'end', key: 'dayCount' },
  { title: '使用量（kWh）', align: 'end', key: 'amount' },
  { title: '料金（円）', align: 'end', key: 'yen' },
] as const

const { data, error } = await useFetch('/api/electricity/table', {
  params: { limit: 31, term: 'monthly' },
})
const usages = computed(() => {
  if (!data.value?.monthlyUsages) {
    return []
  }
  return data.value?.monthlyUsages.map((v) => {
    return {
      date: v.date,
      dayCount: v.dayCount,
      amount: formatNumber(v.amount, 2),
      yen: formatNumber(v.yen, 0),
    }
  })
})
if (error.value) {
  $logger.error(error.value)
}
</script>
