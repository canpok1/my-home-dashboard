<script setup lang="ts">
definePageMeta({ auth: true })
const { status } = useAuth()
</script>

<template>
  <v-container>
    <h1>Top Page</h1>
    <p>Status: {{ status }}</p>
  </v-container>
</template>
