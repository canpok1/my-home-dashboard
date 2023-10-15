<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h5">水道使用量詳細（月次）</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="3">
          <v-row>
            <v-col cols="12">
              <WaterMonthlyCostAvgViewer display-mode="amount">
              </WaterMonthlyCostAvgViewer>
            </v-col>
            <v-col cols="12">
              <WaterMonthlyCostAvgViewer display-mode="yen">
              </WaterMonthlyCostAvgViewer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="8" md="9">
          <WaterMonthlyCostGraph ref="graph"></WaterMonthlyCostGraph>
        </v-col>
        <v-col cols="12">
          <WaterMonthlyCostTable></WaterMonthlyCostTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import WaterMonthlyCostGraph from '@/components/water/WaterMonthlyCostGraph.vue'
const graph = ref<InstanceType<typeof WaterMonthlyCostGraph>>()

const windowWidth = ref(0)
watch(windowWidth, () => {
  graph.value?.resize()
})
onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})
</script>
