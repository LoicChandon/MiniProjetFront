<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  medicament: { type: Object, default: () => ({}) },
  enregistrement: { type: Boolean, default: false }
})

const emit = defineEmits(['annuler', 'enregistrer'])

// copie locale du medicament pour pouvoir modifier les champs sans toucher au parent
const formulaire = ref({ ...props.medicament })

// quand le parent change le medicament (ouverture du dialog), on met a jour la copie
watch(
  () => props.medicament,
  (nouveau) => {
    formulaire.value = { ...nouveau }
  }
)

function soumettre() {
  emit('enregistrer', { ...formulaire.value })
}
</script>

<template>
  <v-dialog :model-value="visible" max-width="500" persistent @update:model-value="emit('annuler')">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4">
        <v-icon class="mr-2" color="primary">mdi-pencil</v-icon>
        Modifier le médicament
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-text-field
          v-model="formulaire.nom"
          label="Nom"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />
        <v-text-field
          v-model.number="formulaire.prixUnitaire"
          label="Prix unitaire (€)"
          type="number"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          step="0.01"
        />
        <v-text-field
          v-model.number="formulaire.unitesEnStock"
          label="Unités en stock"
          type="number"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />
        <v-text-field
          v-model="formulaire.quantiteParUnite"
          label="Quantité par unité"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />
        <v-text-field
          v-model="formulaire.imageURL"
          label="URL de l'image"
          variant="outlined"
          density="comfortable"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="emit('annuler')">Annuler</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="enregistrement"
          @click="soumettre"
        >
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
