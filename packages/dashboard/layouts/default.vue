<template>
  <v-app>
    <v-app-bar color="green">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>MyHomeDashboard</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list v-model:opened="open" density="compact">
        <v-list-item title="ホーム" href="/" prepend-icon="mdi-home">
        </v-list-item>

        <v-list-group value="electricity">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-lightning-bolt"
              title="電気"
            ></v-list-item>
          </template>

          <v-list-item title="使用量（日次）" href="/electricity/daily">
          </v-list-item>
          <v-list-item title="使用量（月次）" href="/electricity/monthly">
          </v-list-item>
        </v-list-group>

        <v-list-group value="gas">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-fire"
              title="ガス"
            ></v-list-item>
          </template>

          <v-list-item title="使用量（月次）" href="/gas/monthly">
          </v-list-item>
        </v-list-group>

        <v-list-group value="water">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-water"
              title="水道"
            ></v-list-item>
          </template>

          <v-list-item title="使用量（月次）" href="/water/monthly">
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(false)
const open = ref(['electricity', 'gas', 'water'])
</script>
