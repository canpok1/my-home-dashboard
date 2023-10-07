<template>
  <v-card variant="tonal">
    <v-card-title>{{ title }} </v-card-title>
    <v-card-subtitle> 更新 {{ $datetime(data?.lastUpdated) }} </v-card-subtitle>
    <v-data-table :headers="headers" :items="data?.usages"> </v-data-table>
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
if (error.value) {
  console.log(error.value)
}
</script>
