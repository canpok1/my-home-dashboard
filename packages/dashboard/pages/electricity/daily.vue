<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h5">電気使用量詳細（日次）</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <ElectricityDailyCostGraph></ElectricityDailyCostGraph>
        </v-col>
        <v-col cols="12" md="6">
          <ElectricityDailyCostTable></ElectricityDailyCostTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts"></script>
