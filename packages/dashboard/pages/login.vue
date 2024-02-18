<script setup>
import { ref } from 'vue'

const { signIn } = useAuth()

const username = ref('')
const password = ref('')
</script>

<template>
  <v-container>
    <h1>Login Page</h1>

    <v-form
      @submit.prevent="signIn({ username, password }, { callbackUrl: '/' })"
    >
      <v-text-field v-model="username" label="Username"></v-text-field>
      <v-text-field
        v-model="password"
        label="password"
        :type="'password'"
      ></v-text-field>
      <v-btn type="submit">sign in</v-btn>
    </v-form>
  </v-container>
</template>
