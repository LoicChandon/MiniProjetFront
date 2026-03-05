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
    <v-main class="fond-pharmacie">
      <ListeMedicaments />
    </v-main>
  </v-app>
</template>

<style>
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}

/* .fond-pharmacie {
  background: 
    linear-gradient(rgba(245, 245, 245, 0.80), rgba(245, 245, 245, 0.80)),
    url('/Aisle-of-pharmacy-e1569376043853.jpg') center / cover no-repeat fixed;
  min-height: 100vh;
} */
 .fond-pharmacie {
  background: 
    linear-gradient(rgba(245, 245, 245, 0.80), rgba(245, 245, 245, 0.80)),
    url('/alpes-elevation.jpeg') center / cover no-repeat fixed;
  min-height: 100vh;
}
</style>
