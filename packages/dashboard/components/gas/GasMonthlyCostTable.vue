<template>
  <v-card variant="tonal">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle> 更新 {{ $datetime(data?.lastUpdated) }} </v-card-subtitle>
    <v-data-table :headers="headers" :items="usages"> </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()

const headers = [
  { title: '年月', align: 'end', key: 'date' },
  { title: '使用量（m^3）', align: 'end', key: 'amount' },
  { title: '料金（円）', align: 'end', key: 'yen' },
] as const

const { data, error } = await useFetch('/api/gas/table', {
  params: { limit: 31, term: 'monthly' },
})
const usages = computed(() => {
  return data.value?.usages.map((v) => {
    return {
      date: v.date,
      amount: formatNumber(v.amount, 0),
      yen: formatNumber(v.yen, 0),
    }
  })
})
if (error.value) {
  console.log(error.value)
}
</script>
