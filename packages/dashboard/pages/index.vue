<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <ElectricityDailyCostGraph title="電気使用量（日次）">
          <template #actions>
            <v-btn href="/electricity/daily">詳細</v-btn>
          </template>
        </ElectricityDailyCostGraph>
      </v-col>
      <v-col cols="12" md="6">
        <ElectricityMonthlyCostGraph title="電気使用量（月次）">
          <template #actions>
            <v-btn href="/electricity/monthly">詳細</v-btn>
          </template>
        </ElectricityMonthlyCostGraph>
      </v-col>
      <v-col cols="12" md="6">
        <GasMonthlyCostGraph title="ガス使用量（月次）">
          <template #actions>
            <v-btn href="/gas/monthly">詳細</v-btn>
          </template>
        </GasMonthlyCostGraph>
      </v-col>
      <v-col cols="12" md="6">
        <WaterMonthlyCostGraph title="水道使用量（月次）">
          <template #actions>
            <v-btn href="/water/monthly">詳細</v-btn>
          </template>
        </WaterMonthlyCostGraph>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
