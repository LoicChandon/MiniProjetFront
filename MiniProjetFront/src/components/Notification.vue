<script setup>
// on recoit l'etat de visibilite, le texte et la couleur depuis le parent
const props = defineProps({
  visible: { type: Boolean, default: false },
  texte: { type: String, default: '' },
  couleur: { type: String, default: 'success' }
})

const emit = defineEmits(['fermer'])
</script>

<template>
  <v-snackbar
    :model-value="visible"
    :color="couleur"
    :timeout="3000"
    location="bottom right"
    @update:model-value="emit('fermer')"
  >
    {{ texte }}
    <template #actions>
      <v-btn variant="text" @click="emit('fermer')">OK</v-btn>
    </template>
  </v-snackbar>
</template>
