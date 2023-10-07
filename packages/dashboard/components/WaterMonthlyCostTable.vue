<template>
  <v-card variant="tonal">
    <v-card-title>水道使用量（月次） </v-card-title>
    <v-card-subtitle> 更新 {{ $datetime(data?.lastUpdated) }} </v-card-subtitle>
    <v-data-table :headers="headers" :items="data?.usages"> </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
const headers = [
  { title: '年月', align: 'end', key: 'date' },
  { title: '使用量（m^3）', align: 'end', key: 'amount' },
  { title: '料金（円）', align: 'end', key: 'yen' },
] as const

const { data, error } = await useFetch('/api/water/table', {
  params: { limit: 31, term: 'monthly' },
})
if (error.value) {
  console.log(error.value)
}
</script>
