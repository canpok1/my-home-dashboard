<script setup lang="ts">
const drawer = ref(false)
const { status, signOut } = useAuth()
const { path } = useRoute()
</script>

<template>
  <v-app>
    <v-app-bar color="green">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>MyHomeDashboard</v-app-bar-title>

      <div v-show="status === 'unauthenticated' && path !== '/login'">
        <v-btn to="/login">ログイン</v-btn>
      </div>
      <div v-show="status !== 'unauthenticated'">
        <v-btn
          prepend-icon="mdi-logout"
          @click="() => signOut({ callbackUrl: '/login' })"
          >ログアウト</v-btn
        >
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer"> </v-navigation-drawer>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>
