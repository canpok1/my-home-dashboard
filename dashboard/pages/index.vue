<template>
    <v-navigation-drawer v-model="drawer">
        <!--  -->
    </v-navigation-drawer>

    <v-app-bar>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>MyHomeDashboard</v-toolbar-title>
    </v-app-bar>

    <v-main>
        <ElectricityCostViewer></ElectricityCostViewer>
    </v-main>
</template>

<script setup lang="ts">
const drawer = ref(true)
</script>
