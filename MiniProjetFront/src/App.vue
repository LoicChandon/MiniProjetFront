<script setup>
import { ref } from 'vue'
import ListeMedicaments from './components/ListeMedicaments.vue'

const clics = ref(0)
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
      <p class="easter-egg" @click="clics++" style="cursor: pointer">
        1 clic = {{ clics }} rose{{ clics > 1 ? 's' : '' }} de la St Valentin en 2027
      </p>
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

.easter-egg {
  position: fixed;
  text-align: right;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.35);
  user-select: none;
  transition: color 0.2s;
}
.easter-egg:hover {
  color: rgba(200, 50, 80, 0.7);
}
</style>
