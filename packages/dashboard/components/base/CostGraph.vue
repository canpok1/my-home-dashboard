<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle> 更新 {{ $datetime(lastUpdated) }} </v-card-subtitle>
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

const props = defineProps<{
  title?: string
  xLabels: string[]
  lineParams: {
    name: string
    values: number[]
    yTitle: string
  }
  barParams: {
    name: string
    values: number[]
    yTitle: string
  }
  lastUpdated: string
}>()

const canvasRef = ref<HTMLCanvasElement>()
const { xLabels, lineParams, barParams } = toRefs(props)

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

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(canvas!, {
    data: {
      labels: xLabels.value,
      datasets: [
        {
          type: 'line',
          label: lineParams.value.name,
          data: lineParams.value.values,
          yAxisID: 'left',
        },
        {
          type: 'bar',
          label: barParams.value.name,
          data: barParams.value.values,
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
            text: lineParams.value.yTitle,
          },
        },
        right: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: barParams.value.yTitle,
          },
        },
      },
    },
  })
}

defineExpose({ setupChart })

onMounted(setupChart)
</script>
