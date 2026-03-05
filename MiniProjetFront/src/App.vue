<script setup>
import ListeMedicaments from './components/ListeMedicaments.vue'
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" elevation="2">
      <v-app-bar-title>
        <v-icon class="mr-1">mdi-hospital-box</v-icon>
        PharmaSavoie (73 représente)
      </v-app-bar-title>
    </v-app-bar>
>
    <v-main class="bg-grey-lighten-4">
      <ListeMedicaments />
    </v-main>
  </v-app>
</template>

<style>
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}
</style>
