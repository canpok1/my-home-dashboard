<template>
  <v-card variant="tonal">
    <v-card-title>電気使用量（日次） </v-card-title>
    <v-card-subtitle> 更新 {{ $datetime(data?.lastUpdated) }} </v-card-subtitle>
    <v-table>
      <thead>
        <tr>
          <th>年月日</th>
          <th>使用量（kWh）</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usage of data?.usages" :key="usage.date">
          <td>{{ usage.date }}</td>
          <td>{{ usage.amount }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
const { data, error } = await useFetch('/api/electricity/table', {
  params: { limit: 31, term: 'daily' },
})
if (error.value) {
  console.log(error.value)
}
</script>
