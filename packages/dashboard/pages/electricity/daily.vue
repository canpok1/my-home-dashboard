<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h5">電気使用量詳細（日次）</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="3">
          <ElectricityDailyCostAvgViewer> </ElectricityDailyCostAvgViewer>
        </v-col>
        <v-col cols="12" sm="8" md="9">
          <ElectricityDailyCostGraph></ElectricityDailyCostGraph>
        </v-col>
        <v-col cols="12">
          <ElectricityDailyCostTable></ElectricityDailyCostTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts"></script>
