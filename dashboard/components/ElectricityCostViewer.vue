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

onMounted(() => {
  createCharts()
})

function createCharts() {
  if (canvasRef.value === null) return
  const canvas = canvasRef.value.getContext('2d')
  if (canvas === null) return
  console.log(canvasRef.value?.getContext('2d'))
  const c = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: 'ダミーデータ',
          data: [12, 19, 3, 5, 2, 3],
        },
      ],
    },
  })
  console.log(c)
}
</script>
