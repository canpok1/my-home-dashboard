<template>
  <v-navigation-drawer v-model="drawer">
    <!--  -->
  </v-navigation-drawer>

  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>MyHomeDashboard</v-toolbar-title>
  </v-app-bar>

  <v-main>
    <v-container>
      <v-row>
        <v-col cols="6">
          <ElectricityCostViewer></ElectricityCostViewer>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const drawer = ref(true)
</script>
