<template>
  <v-card variant="tonal">
    <v-card-title>電気料金</v-card-title>
    <canvas ref="canvasRef"></canvas>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'

const canvasRef = ref<HTMLCanvasElement>()
const { data, error } = await useFetch('/api/electricity')
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
  const yens = data.value.yens
  const kwhs = data.value.kwhs

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(canvas!, {
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: '料金',
          data: yens,
          yAxisID: 'left',
        },
        {
          type: 'bar',
          label: '使用量',
          data: kwhs,
          yAxisID: 'right',
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
            text: '料金(円)',
          },
        },
        right: {
          type: 'linear',
          display: true,
          position: 'right',
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
