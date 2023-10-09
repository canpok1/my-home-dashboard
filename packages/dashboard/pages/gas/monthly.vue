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
          <GasMonthlyCostAvgViewer> </GasMonthlyCostAvgViewer>
        </v-col>
        <v-col cols="12" sm="8" md="9">
          <GasMonthlyCostGraph></GasMonthlyCostGraph>
        </v-col>
        <v-col cols="12">
          <GasMonthlyCostTable></GasMonthlyCostTable>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts"></script>
