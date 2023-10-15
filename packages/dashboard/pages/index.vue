<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-radio-group v-model="displayMode" inline hide-details>
          <v-radio label="使用量表示" value="amount"></v-radio>
          <v-radio label="金額表示" value="yen"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4" md="3">
        <ElectricityDailyCostAvgViewer> </ElectricityDailyCostAvgViewer>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <ElectricityMonthlyCostAvgViewer :display-mode="displayMode">
        </ElectricityMonthlyCostAvgViewer>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <GasMonthlyCostAvgViewer :display-mode="displayMode">
        </GasMonthlyCostAvgViewer>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <WaterMonthlyCostAvgViewer :display-mode="displayMode">
        </WaterMonthlyCostAvgViewer>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <ElectricityDailyCostGraph
          ref="electricityDailyCostGraph"
          title="電気使用量（日次）"
        >
          <template #actions>
            <v-btn href="/electricity/daily">詳細</v-btn>
          </template>
        </ElectricityDailyCostGraph>
      </v-col>
      <v-col cols="12" md="6">
        <ElectricityMonthlyCostGraph
          ref="electricityMonthlyCostGraph"
          title="電気使用量（月次）"
        >
          <template #actions>
            <v-btn href="/electricity/monthly">詳細</v-btn>
          </template>
        </ElectricityMonthlyCostGraph>
      </v-col>
      <v-col cols="12" md="6">
        <GasMonthlyCostGraph
          ref="gasMonthlyCostGraph"
          title="ガス使用量（月次）"
        >
          <template #actions>
            <v-btn href="/gas/monthly">詳細</v-btn>
          </template>
        </GasMonthlyCostGraph>
      </v-col>
      <v-col cols="12" md="6">
        <WaterMonthlyCostGraph
          ref="waterMonthlyCostGraph"
          title="水道使用量（月次）"
        >
          <template #actions>
            <v-btn href="/water/monthly">詳細</v-btn>
          </template>
        </WaterMonthlyCostGraph>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import ElectricityDailyCostGraph from '@/components/electricity/ElectricityDailyCostGraph.vue'
import ElectricityMonthlyCostGraph from '@/components/electricity/ElectricityMonthlyCostGraph.vue'
import GasMonthlyCostGraph from '@/components/gas/GasMonthlyCostGraph.vue'
import WaterMonthlyCostGraph from '@/components/water/WaterMonthlyCostGraph.vue'
const displayMode: Ref<'amount' | 'yen'> = ref('amount')

const electricityDailyCostGraph = ref<InstanceType<
  typeof ElectricityDailyCostGraph
> | null>(null)
const electricityMonthlyCostGraph = ref<InstanceType<
  typeof ElectricityMonthlyCostGraph
> | null>(null)
const gasMonthlyCostGraph = ref<InstanceType<
  typeof GasMonthlyCostGraph
> | null>(null)
const waterMonthlyCostGraph = ref<InstanceType<
  typeof WaterMonthlyCostGraph
> | null>(null)

const windowWidth = ref(0)
watch(windowWidth, () => {
  electricityDailyCostGraph.value?.resize()
  electricityMonthlyCostGraph.value?.resize()
  gasMonthlyCostGraph.value?.resize()
  waterMonthlyCostGraph.value?.resize()
})
onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})
</script>
