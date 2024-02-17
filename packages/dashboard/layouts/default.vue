<template>
  <v-app>
    <v-app-bar color="green">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>MyHomeDashboard</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer"> </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(false)
</script>
