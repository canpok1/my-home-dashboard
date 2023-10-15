<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h5">ガス使用量詳細（月次）</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="3">
          <v-row>
            <v-col cols="12">
              <GasMonthlyCostAvgViewer display-mode="amount">
              </GasMonthlyCostAvgViewer>
            </v-col>
            <v-col cols="12">
              <GasMonthlyCostAvgViewer display-mode="yen">
              </GasMonthlyCostAvgViewer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="8" md="9">
          <GasMonthlyCostGraph ref="graph"></GasMonthlyCostGraph>
        </v-col>
        <v-col cols="12">
          <GasMonthlyCostTable></GasMonthlyCostTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import GasMonthlyCostGraph from '@/components/gas/GasMonthlyCostGraph.vue'
const graph = ref<InstanceType<typeof GasMonthlyCostGraph>>()

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
