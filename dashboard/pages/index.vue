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
            <ElectricityCostViewer
              :labels="labels"
              :usages="usages"
              :kwhs="kwhs"
            ></ElectricityCostViewer>
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
const { data, err } = await useAsyncData(() => $fetch(url))
if (err) {
  console.log(err)
}

const labels = data.value.map((v) => `${v.usage_year}/${v.usage_month}`)
const usages = data.value.map((v) => `${v.usage_yen}`)
const kwhs = data.value.map((v) => `${v.usage_kwh}`)
</script>
