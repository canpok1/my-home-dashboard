<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const drawer = ref(true)

const url = '/api/electricity'
console.log('GET[%s]', url)
const { data, error } = await useAsyncData(() => $fetch(url))
console.log('data: %s', data.value)
console.log('error: %s', error.value)
</script>
