<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = 'https://miniprojetbackisis.onrender.com/api'

const medicaments = ref([])
const chargement = ref(true)
const erreur = ref(null)
const recherche = ref('')

// etats pour update et suppression
const dialogModif = ref(false)
const dialogSuppression = ref(false)
const medEnCours = ref({})
const medASupprimer = ref(null)
const enregistrement = ref(false)

// affiche les notifs en temps reel
const notification = ref(false)
const notifTexte = ref('')
const notifCouleur = ref('success')

function afficherNotif(texte, couleur = 'success') {
  notifTexte.value = texte
  notifCouleur.value = couleur
  notification.value = true
}

// recup les medicaments
async function chargerMedicaments() {
  chargement.value = true
  erreur.value = null
  try {
    const response = await axios.get(`${API_BASE}/medicaments?size=100`)
    const meds = response.data._embedded.medicaments

    // Récup des categories (asynchrone pour eviter de bloquer l'affichage)
    const medsWithCategories = await Promise.all(
      meds.map(async (med) => {
        try {
          const catResponse = await axios.get(med._links.categorie.href)
          med.categorieLibelle = catResponse.data.libelle
        } catch {
          med.categorieLibelle = '—'
        }
        // on recupere l'id directement dans la requete
        const selfHref = med._links.self.href
        med.id = selfHref.substring(selfHref.lastIndexOf('/') + 1)
        return med
      })
    )
    medicaments.value = medsWithCategories
  } catch (err) {
    erreur.value = 'Impossible de charger les médicaments. Vérifiez votre connexion.'
    console.error(err)
  } finally {
    chargement.value = false
  }
}

//maj du stock en temps reel
async function majQuantite(med, delta) {
  const newQty = med.unitesEnStock + delta
  if (newQty < 0) return

  try {
    await axios.patch(
      `${API_BASE}/medicaments/${med.id}`,
      { unitesEnStock: newQty },
      { headers: { 'Content-Type': 'application/json' } }
    )
    med.unitesEnStock = newQty
    afficherNotif(`Stock mis à jour : ${med.nom} → ${newQty}`)
  } catch (err) {
    console.error(err)
    afficherNotif('Erreur lors de la mise à jour du stock', 'error')
  }
}

// c'etait chiant xd
function ouvrirModif(med) {
  medEnCours.value = { ...med }
  dialogModif.value = true
}

async function enregistrerModif() {
  enregistrement.value = true
  try {
    await axios.patch(
      `${API_BASE}/medicaments/${medEnCours.value.id}`,
      {
        nom: medEnCours.value.nom,
        prixUnitaire: medEnCours.value.prixUnitaire,
        unitesEnStock: medEnCours.value.unitesEnStock,
        quantiteParUnite: medEnCours.value.quantiteParUnite,
        imageURL: medEnCours.value.imageURL,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    // maj des donnees locales
    const idx = medicaments.value.findIndex((m) => m.id === medEnCours.value.id)
    if (idx !== -1) {
      Object.assign(medicaments.value[idx], medEnCours.value)
    }
    dialogModif.value = false
    afficherNotif(`${medEnCours.value.nom} modifié avec succès`)
  } catch (err) {
    console.error(err)
    afficherNotif('Erreur lors de la modification', 'error')
  } finally {
    enregistrement.value = false
  }
}

function confirmerSuppression(med) {
  medASupprimer.value = med
  dialogSuppression.value = true
}

//suppr medicament
async function supprimerMedicament() {
  try {
    await axios.delete(`${API_BASE}/medicaments/${medASupprimer.value.id}`)
    medicaments.value = medicaments.value.filter((m) => m.id !== medASupprimer.value.id)
    dialogSuppression.value = false
    afficherNotif(`${medASupprimer.value.nom} supprimé`)
  } catch (err) {
    console.error(err)
    afficherNotif('Erreur lors de la suppression', 'error')
  }
}

const medicamentsFiltres = () => {
  if (!recherche.value) return medicaments.value
  const s = recherche.value.toLowerCase()
  return medicaments.value.filter(
    (m) =>
      m.nom.toLowerCase().includes(s) ||
      m.categorieLibelle.toLowerCase().includes(s)
  )
}

// au lancement, on recupère tous les medicaments
onMounted(chargerMedicaments)
</script>

<template>
  <v-container fluid class="pa-4 pa-md-8">
    
    <v-row align="center" class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-bold text-primary">
          <v-icon class="mr-2" size="36">mdi-pill</v-icon>
          Gestion des Médicaments
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-1">
          {{ medicaments.length }} médicament(s) en base
        </p>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="recherche"
          prepend-inner-icon="mdi-magnify"
          label="Rechercher un médicament…"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          rounded
        />
      </v-col>
    </v-row>

    
    <v-row v-if="chargement" justify="center" class="my-12">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-row>

    <v-alert v-else-if="erreur" type="error" variant="tonal" class="mb-4">
      {{ erreur }}
      <template #append>
        <v-btn variant="text" @click="chargerMedicaments">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-row v-else>
      <v-col
        v-for="med in medicamentsFiltres()"
        :key="med.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="d-flex flex-column med-card"
          rounded="lg"
          elevation="2"
          hover
        >
          
          <v-img
            :src="med.imageURL"
            height="180"
            cover
            class="align-end"
            gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4)"
          >
            <v-chip
              class="ma-2"
              size="small"
              color="white"
              variant="flat"
            >
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
                  @click="majQuantite(med, -1)"
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
                  @click="majQuantite(med, 1)"
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

    
          <v-card-actions class="pt-0">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-pencil"
              @click="ouvrirModif(med)"
            >
              Modifier
            </v-btn>
            <v-spacer />
            <v-btn
              variant="tonal"
              color="error"
              size="small"
              icon="mdi-delete"
              @click="confirmerSuppression(med)"
            />
          </v-card-actions>
        </v-card>
      </v-col>

     
      <v-col v-if="medicamentsFiltres().length === 0" cols="12">
        <v-empty-state
          icon="mdi-pill-off"
          title="Aucun médicament trouvé"
          text="Essayez de modifier votre recherche."
        />
      </v-col>
    </v-row>

 
    <v-dialog v-model="dialogModif" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4">
          <v-icon class="mr-2" color="primary">mdi-pencil</v-icon>
          Modifier le médicament
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field
            v-model="medEnCours.nom"
            label="Nom"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model.number="medEnCours.prixUnitaire"
            label="Prix unitaire (€)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            step="0.01"
          />
          <v-text-field
            v-model.number="medEnCours.unitesEnStock"
            label="Unités en stock"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model="medEnCours.quantiteParUnite"
            label="Quantité par unité"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model="medEnCours.imageURL"
            label="URL de l'image"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialogModif = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="enregistrement"
            @click="enregistrerModif"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation de suppression -->
    <v-dialog v-model="dialogSuppression" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pa-4">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          Confirmer la suppression
        </v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ medASupprimer?.nom }}</strong> ?
          Cette action est irréversible.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialogSuppression = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="supprimerMedicament">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notification -->
    <v-snackbar v-model="notification" :color="notifCouleur" :timeout="3000" location="bottom right">
      {{ notifTexte }}
      <template #actions>
        <v-btn variant="text" @click="notification = false">OK</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.med-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.med-card:hover {
  transform: translateY(-4px);
}
</style>
