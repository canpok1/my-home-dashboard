<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <ElectricityDailyCostViewer>
          <template #actions>
            <v-btn href="/electricity/daily">詳細</v-btn>
          </template>
        </ElectricityDailyCostViewer>
      </v-col>
      <v-col cols="12" md="6">
        <ElectricityMonthlyCostViewer>
          <template #actions>
            <v-btn href="/electricity/monthly">詳細</v-btn>
          </template>
        </ElectricityMonthlyCostViewer>
      </v-col>
      <v-col cols="12" md="6">
        <GasCostViewer>
          <template #actions>
            <v-btn href="/gas/monthly">詳細</v-btn>
          </template>
        </GasCostViewer>
      </v-col>
      <v-col cols="12" md="6">
        <WaterCostViewer></WaterCostViewer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
