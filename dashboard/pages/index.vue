<template>
    <div>
        <h1>Welcome page</h1>
        count: {{ count }}
        <v-btn color="primary" @click="addCount">+</v-btn>
    </div>
</template>

<script setup lang="ts">
const count = ref(0);
function addCount(): void {
    count.value++;
}
</script>
