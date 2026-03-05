<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = 'https://miniprojetbackisis.onrender.com/api'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['fermer', 'ajoute', 'erreur'])

// categories
const categories = ref([])
const chargementCategories = ref(false)
const enregistrement = ref(false)

// champs du formulaire
const formulaire = ref({
  nom: '',
  quantiteParUnite: '',
  prixUnitaire: null,
  unitesEnStock: 0,
  niveauDeReappro: 10,
  imageURL: '',
  categorieCode: null
})


async function chargerCategories() {
  chargementCategories.value = true
  try {
    const response = await axios.get(`${API_BASE}/categories?size=50`)
    categories.value = response.data._embedded.categories.map((cat) => {
      const href = cat._links.self.href
      const code = href.substring(href.lastIndexOf('/') + 1)
      return { code, libelle: cat.libelle }
    })
  } catch (err) {
    console.error('Erreur chargement catégories', err)
  } finally {
    chargementCategories.value = false
  }
}

function reinitialiser() {
  formulaire.value = {
    nom: '',
    quantiteParUnite: '',
    prixUnitaire: null,
    unitesEnStock: 0,
    niveauDeReappro: 10,
    imageURL: '',
    categorieCode: null
  }
}

function fermer() {
  reinitialiser()
  emit('fermer')
}

async function soumettre() {
  enregistrement.value = true
  try {
    // creation du medicament
    const response = await axios.post(
      `${API_BASE}/medicaments`,
      {
        nom: formulaire.value.nom,
        quantiteParUnite: formulaire.value.quantiteParUnite,
        prixUnitaire: formulaire.value.prixUnitaire,
        unitesEnStock: formulaire.value.unitesEnStock,
        unitesCommandees: 0,
        niveauDeReappro: formulaire.value.niveauDeReappro,
        indisponible: false,
        imageURL: formulaire.value.imageURL,
        categorie: `${API_BASE}/categories/${formulaire.value.categorieCode}`
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    emit('ajoute', response.data)
    fermer()
  } catch (err) {
    console.error('Erreur lors de l\'ajout', err)
    emit('erreur', 'Erreur lors de l\'ajout du médicament')
  } finally {
    enregistrement.value = false
  }
}

// champs obligatoires
const formulaireValide = () => {
  const f = formulaire.value
  return f.nom && f.quantiteParUnite && f.prixUnitaire > 0 && f.categorieCode
}

//au lancement on charge les catégories
onMounted(chargerCategories)
</script>

<template>
  <v-dialog :model-value="visible" max-width="550" persistent @update:model-value="fermer">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4">
        <v-icon class="mr-2" color="success">mdi-plus-circle</v-icon>
        Ajouter un médicament
      </v-card-title>
      <v-divider />

      <!-- Mise en page du formulaire -->
      <v-card-text class="pa-4">
        <v-text-field
          v-model="formulaire.nom"
          label="Nom du médicament"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-select
          v-model="formulaire.categorieCode"
          :items="categories"
          item-title="libelle"
          item-value="code"
          label="Catégorie"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :loading="chargementCategories"
        />

        <v-text-field
          v-model="formulaire.quantiteParUnite"
          label="Quantité par unité (ex: Boîte de 16 comprimés)"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-row class="mb-1">
          <v-col cols="6">
            <v-text-field
              v-model.number="formulaire.prixUnitaire"
              label="Prix unitaire (€)"
              type="number"
              variant="outlined"
              density="comfortable"
              step="0.01"
              min="0"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="formulaire.unitesEnStock"
              label="Stock initial"
              type="number"
              variant="outlined"
              density="comfortable"
              min="0"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model.number="formulaire.niveauDeReappro"
          label="Seuil de réapprovisionnement"
          type="number"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          min="0"
        />

        <v-text-field
          v-model="formulaire.imageURL"
          label="URL de l'image (optionnel)"
          variant="outlined"
          density="comfortable"
        />
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="fermer">Annuler</v-btn>
        <v-btn
          color="success"
          variant="flat"
          :loading="enregistrement"
          :disabled="!formulaireValide()"
          @click="soumettre"
        >
          Ajouter
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
