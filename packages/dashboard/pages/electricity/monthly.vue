<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h5">電気使用量詳細（月次）</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <ElectricityMonthlyCostGraph></ElectricityMonthlyCostGraph>
        </v-col>
        <v-col cols="12" md="6">
          <ElectricityMonthlyCostTable></ElectricityMonthlyCostTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts"></script>
