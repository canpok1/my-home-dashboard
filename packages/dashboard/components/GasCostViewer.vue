<template>
  <v-card variant="tonal">
    <v-card-title>ガス料金</v-card-title>
    <canvas ref="canvasRef"></canvas>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'

const canvasRef = ref<HTMLCanvasElement>()
const { data, error } = await useFetch('/api/gas')
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
  const amounts = data.value.amounts

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
          data: amounts,
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
            text: '使用量(m^3)',
          },
        },
      },
    },
  })
}

onMounted(setupChart)
</script>
