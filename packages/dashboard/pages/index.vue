<template>
  <div>
    <v-app-bar color="green">
      <v-toolbar-title>MyHomeDashboard</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <ElectricityDailyCostViewer></ElectricityDailyCostViewer>
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
    </v-main>
  </div>
</template>

<script setup lang="ts"></script>
