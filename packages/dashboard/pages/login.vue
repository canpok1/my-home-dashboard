<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const { signIn } = useAuth()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const snackbarShow = ref(false)
const snackbarTimeout = ref(2000)

const submit = async (username: string, password: string) => {
  try {
    await signIn({ username, password }, { callbackUrl: '/' })
  } catch (err) {
    console.info(err)
    errorMessage.value = 'ログイン失敗'
    snackbarShow.value = true
  }
}
</script>

<template>
  <v-card class="mx-auto">
    <v-card-title class="justify-center">
      <v-icon icon="mdi-login"></v-icon>
      ログイン</v-card-title
    >

    <v-card-text>
      <v-text-field
        v-model="username"
        prepend-icon="mdi-account-circle"
        label="Username"
      ></v-text-field>
      <v-text-field
        v-model="password"
        prepend-icon="mdi-lock"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        label="password"
        :type="showPassword ? 'text' : 'password'"
        @click:append="showPassword = !showPassword"
      ></v-text-field>

      <v-btn
        color="info"
        text="ログイン"
        block
        @click="() => submit(username, password)"
      ></v-btn>
    </v-card-text>
    <v-snackbar v-model="snackbarShow" :timeout="snackbarTimeout" color="red">
      {{ errorMessage }}
    </v-snackbar>
  </v-card>
</template>

<style>
.v-card {
  width: 400px;
  margin-top: 30px;
}
</style>
