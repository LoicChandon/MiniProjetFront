<script setup>
// dialog de confirmation de suppression
const props = defineProps({
  visible: { type: Boolean, default: false },
  medicament: { type: Object, default: null }
})

const emit = defineEmits(['annuler', 'confirmer'])
</script>

<template>
  <v-dialog :model-value="visible" max-width="400" @update:model-value="emit('annuler')">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4">
        <v-icon class="mr-2" color="error">mdi-alert</v-icon>
        Confirmer la suppression
      </v-card-title>
      <v-card-text>
        Êtes-vous sûr de vouloir supprimer
        <strong>{{ medicament?.nom }}</strong> ?
        Cette action est irréversible.
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="emit('annuler')">Annuler</v-btn>
        <v-btn color="error" variant="flat" @click="emit('confirmer')">
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
