<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <ElectricityDailyCostViewer>
          <template #actions>
            <v-btn href="./electricity/daily">詳細</v-btn>
          </template>
        </ElectricityDailyCostViewer>
      </v-col>
      <v-col cols="12" md="6">
        <ElectricityMonthlyCostViewer></ElectricityMonthlyCostViewer>
      </v-col>
      <v-col cols="12" md="6">
        <GasCostViewer></GasCostViewer>
      </v-col>
      <v-col cols="12" md="6">
        <WaterCostViewer></WaterCostViewer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
