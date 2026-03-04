<script setup>
import MedicamentsList from './components/MedicamentsList.vue'
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" elevation="2">
      <v-app-bar-title>
        <v-icon class="mr-1">mdi-hospital-box</v-icon>
        PharmAdmin
      </v-app-bar-title>
    </v-app-bar>
>
    <v-main class="bg-grey-lighten-4">
      <MedicamentsList />
    </v-main>
  </v-app>
</template>

<style>
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}
</style>
