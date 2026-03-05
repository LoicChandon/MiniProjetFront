<script setup>
// props recues depuis le parent (MedicamentsList)
const props = defineProps({
  med: { type: Object, required: true }
})

// evenements envoyes au parent
const emit = defineEmits(['maj-quantite', 'ouvrir-modif', 'confirmer-suppression'])
</script>

<template>
  <v-card class="d-flex flex-column carte-med" rounded="lg" elevation="2" hover>
    <v-img
      :src="med.imageURL"
      height="180"
      cover
      class="align-end"
      gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4)"
    >
      <v-chip class="ma-2" size="small" color="white" variant="flat">
        <v-icon start size="14">mdi-tag-outline</v-icon>
        {{ med.categorieLibelle }}
      </v-chip>
    </v-img>

    <v-card-title class="pb-1 text-body-1 font-weight-bold">
      {{ med.nom }}
    </v-card-title>

    <v-card-subtitle class="pb-2">
      {{ med.quantiteParUnite }} · {{ med.prixUnitaire?.toFixed(2) }} €
    </v-card-subtitle>

    <v-card-text class="pt-0 pb-2">
      <div class="d-flex align-center justify-space-between">
        <span class="text-body-2 text-medium-emphasis">Stock</span>
        <div class="d-flex align-center ga-1">
          <v-btn
            icon
            size="x-small"
            variant="tonal"
            color="error"
            :disabled="med.unitesEnStock <= 0"
            @click="emit('maj-quantite', med, -1)"
          >
            <v-icon size="18">mdi-minus</v-icon>
          </v-btn>

          <v-chip
            :color="med.unitesEnStock <= med.niveauDeReappro ? 'error' : 'success'"
            variant="tonal"
            size="small"
            class="font-weight-bold mx-1"
            style="min-width: 52px; justify-content: center"
          >
            {{ med.unitesEnStock }}
          </v-chip>

          <v-btn
            icon
            size="x-small"
            variant="tonal"
            color="success"
            @click="emit('maj-quantite', med, 1)"
          >
            <v-icon size="18">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>

      <v-alert
        v-if="med.unitesEnStock <= med.niveauDeReappro"
        type="warning"
        variant="tonal"
        density="compact"
        class="mt-2 text-caption"
      >
        Stock bas (seuil : {{ med.niveauDeReappro }})
      </v-alert>
    </v-card-text>

    <v-spacer />

    <!-- modifer et suppr -->
    <v-card-actions class="pt-0">
      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-pencil"
        @click="emit('ouvrir-modif', med)"
      >
        Modifier
      </v-btn>
      <v-spacer />
      <v-btn
        variant="tonal"
        color="error"
        size="small"
        icon="mdi-delete"
        @click="emit('confirmer-suppression', med)"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.carte-med {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.carte-med:hover {
  transform: translateY(-4px);
}
</style>
