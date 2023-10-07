<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title> {{ title }} </v-card-title>
      <v-card-subtitle>
        更新 {{ $datetime(data?.lastUpdated) }}
      </v-card-subtitle>
      <template #append>
        <slot name="actions"></slot>
      </template>
    </v-card-item>
    <v-card-text>
      <canvas ref="canvasRef"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'

defineProps<{
  title?: string
}>()

const canvasRef = ref<HTMLCanvasElement>()
const { data, error } = await useFetch('/api/electricity/graph', {
  params: { limit: 31, term: 'daily', format: 'graph' },
})
if (error.value) {
  console.log(error.value)
}

let chart: Chart<'line' | 'bar', number[], string> | null = null
const setupChart = () => {
  if (!canvasRef) {
    console.log('skip setup chart, canvasRef is nothing')
    return
  }
  const canvas = canvasRef.value!.getContext('2d')
  if (!canvasRef) {
    console.log('skip setup chart, canvas is nothing')
    return
  }
  if (!data.value) {
    console.log('skip setup chart, data is nothing')
    return
  }

  const labels = data.value.labels
  const kwhs = data.value.kwhs

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(canvas!, {
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: '使用量',
          data: kwhs,
          yAxisID: 'left',
        },
      ],
    },
    options: {
      scales: {
        left: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '使用量(kWh)',
          },
        },
      },
    },
  })
}

onMounted(setupChart)
</script>
