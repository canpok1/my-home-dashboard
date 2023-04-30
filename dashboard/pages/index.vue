<template>
    <div>
        <h1>Welcome page</h1>
        count: {{ count }}
        <span @click="addCount">[+]</span>
    </div>
</template>

<script setup lang="ts">
const count = ref(0);
function addCount() {
    count.value++;
}
</script>
