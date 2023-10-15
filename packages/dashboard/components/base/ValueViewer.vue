<template>
  <v-card variant="tonal">
    <div class="spacer"></div>
    <v-card-subtitle>{{ title }}</v-card-subtitle>
    <v-card-text>
      <div class="text-h4 text-center">
        <span>{{ value }}</span>
      </div>
      <div class="text-right">{{ unit }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string
  unit: string
}>()
</script>

<style>
.spacer {
  padding: 0.25rem;
}
</style>
