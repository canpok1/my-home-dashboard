<template>
  <v-card variant="tonal">
    <v-card-title>電気料金</v-card-title>
    <canvas ref="canvasRef"></canvas>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'
import { ref, onMounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const props = defineProps<{
  labels: string[]
  usages: number[]
  kwhs: number[]
}>()

onMounted(() => {
  createCharts()
})

function createCharts() {
  if (canvasRef.value === null) return
  const canvas = canvasRef.value.getContext('2d')
  if (canvas === null) return

  const c = new Chart(canvas, {
    data: {
      labels: props.labels,
      datasets: [
        {
          type: 'line',
          label: '料金',
          data: props.usages,
          yAxisID: 'left',
        },
        {
          type: 'bar',
          label: '使用量',
          data: props.kwhs,
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
  console.log(c)
}
</script>
