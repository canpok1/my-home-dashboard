<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">
      <v-list-item title="ホーム" href="/"></v-list-item>
      <v-list-item
        title="電気使用量（日次）"
        href="/electricity/daily"
      ></v-list-item>
      <v-list-item
        title="電気使用量（月次）"
        href="/electricity/monthly"
      ></v-list-item>
      <v-list-item title="ガス使用量（月次）" href="/gas/monthly"></v-list-item>
    </v-navigation-drawer>

    <v-app-bar color="green">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>MyHomeDashboard</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(false)
</script>
