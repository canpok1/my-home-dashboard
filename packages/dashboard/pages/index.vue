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
const { data, error } = await useAsyncData(() => $fetch(url))
if (error) {
  console.log(error)
} else {
  console.log(data)
}

// const labels = data.value?.map((v) => `${v.usage_year}/${v.usage_month}`)
// const usages = data.value?.map((v) => Number(`${v.usage_yen}`))
// const kwhs = data.value?.map((v) => Number(`${v.usage_kwh}`))

const labels: string[] = []
const usages: number[] = []
const kwhs: number[] = []
</script>
