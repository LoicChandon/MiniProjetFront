<script setup>
import { ref, onMounted } from 'vue'
import Medicament from './Medicament.vue'
import PopupAjout from './PopupAjout.vue'
import PopupModification from './PopupModification.vue'
import PopupSuppression from './PopupSuppression.vue'
import Notification from './Notification.vue'

const API_BASE = 'https://miniprojetbackisis.onrender.com/api'

const medicaments = ref([])
const chargement = ref(true)
const erreur = ref(null)
const recherche = ref('')

// popup ajout
const dialogAjout = ref(false)

// etats pour update et suppression
const dialogModif = ref(false)
const dialogSuppression = ref(false)
const medEnCours = ref({})
const medASupprimer = ref(null)
const enregistrement = ref(false)

// notif
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
    const response = await fetch(`${API_BASE}/medicaments?size=200`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const responseData = await response.json()
    const meds = responseData._embedded.medicaments

    // Récup des categories (asynchrone pour eviter de bloquer l'affichage)
    const medsWithCategories = await Promise.all(
      meds.map(async (med) => {
        try {
          const catResponse = await fetch(med._links.categorie.href)
          if (!catResponse.ok) throw new Error(`HTTP ${catResponse.status}`)
          const catData = await catResponse.json()
          med.categorieLibelle = catData.libelle
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
    const patchRes = await fetch(`${API_BASE}/medicaments/${med.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitesEnStock: newQty })
    })
    if (!patchRes.ok) throw new Error(`HTTP ${patchRes.status}`)
    med.unitesEnStock = newQty
    afficherNotif(`Stock mis à jour : ${med.nom} → ${newQty}`)

    // Si le nouveau stock passe sous le seuil, déclencher le réapprovisionnement
    if (newQty <= med.niveauDeReappro) {
      await declencherReapprovisionnement()
    }
  } catch (err) {
    console.error(err)
    afficherNotif('Erreur lors de la mise à jour du stock', 'error')
  }
}

function ouvrirModif(med) {
  medEnCours.value = { ...med }
  dialogModif.value = true
}

// enregistrement des midifications
async function enregistrerModif(donnees) {
  enregistrement.value = true
  try {
    const modifRes = await fetch(`${API_BASE}/medicaments/${donnees.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: donnees.nom,
        prixUnitaire: donnees.prixUnitaire,
        unitesEnStock: donnees.unitesEnStock,
        quantiteParUnite: donnees.quantiteParUnite,
        imageURL: donnees.imageURL,
      })
    })
    if (!modifRes.ok) throw new Error(`HTTP ${modifRes.status}`)
    // maj des donnees locales
    const idx = medicaments.value.findIndex((m) => m.id === donnees.id)
    if (idx !== -1) {
      Object.assign(medicaments.value[idx], donnees)
    }
    dialogModif.value = false
    afficherNotif(`${donnees.nom} modifié avec succès`)

    // Si le stock modifié est sous le seuil, déclencher le réapprovisionnement
    if (donnees.unitesEnStock <= donnees.niveauDeReappro) {
      await declencherReapprovisionnement()
    }
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
    const delRes = await fetch(`${API_BASE}/medicaments/${medASupprimer.value.id}`, { method: 'DELETE' })
    if (!delRes.ok) throw new Error(`HTTP ${delRes.status}`)
    medicaments.value = medicaments.value.filter((m) => m.id !== medASupprimer.value.id)
    dialogSuppression.value = false
    afficherNotif(`${medASupprimer.value.nom} supprimé`)
  } catch (err) {
    console.error(err)
    afficherNotif('Erreur lors de la suppression', 'error')
  }
}

// Appel réapprovisionnement du back et notifie l'user
async function declencherReapprovisionnement() {
  try {
    const res = await fetch(`${API_BASE}/reapprovisionnement/notifier`, { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const mailsEnvoyes = await res.json()
    if (mailsEnvoyes.length > 0) {
      afficherNotif(
        `${mailsEnvoyes.length} mail(s) de réapprovisionnement envoyé(s) aux fournisseurs`,
        'warning'
      )
    }
  } catch (err) {
    console.error('Erreur réapprovisionnement :', err)
    afficherNotif('Erreur lors du réapprovisionnement automatique', 'error')
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

// quand popupAjout emet 'ajoute', recharge la liste
async function onMedicamentAjoute() {
  await chargerMedicaments()
  afficherNotif('Médicament ajouté avec succès')
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
      <v-col cols="auto" class="d-flex align-center">
        <v-btn color="success" variant="flat" prepend-icon="mdi-plus" rounded @click="dialogAjout = true">
          Ajouter
        </v-btn>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="recherche" prepend-inner-icon="mdi-magnify" label="Rechercher un médicament…"
          variant="outlined" density="comfortable" hide-details clearable rounded />
      </v-col>
    </v-row>

    <!-- chargement -->
    <v-row v-if="chargement" justify="center" class="my-12">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-row>

    <v-alert v-else-if="erreur" type="error" variant="tonal" class="mb-4">
      {{ erreur }}
      <template #append>
        <v-btn variant="text" @click="chargerMedicaments">Réessayer</v-btn>
      </template>
    </v-alert>

    <!-- liste mdicaments -->
    <v-row v-else>
      <v-col v-for="med in medicamentsFiltres()" :key="med.id" cols="12" sm="6" md="4" lg="3">
        <Medicament :med="med" @maj-quantite="majQuantite" @ouvrir-modif="ouvrirModif"
          @confirmer-suppression="confirmerSuppression" />
      </v-col>

      <v-col v-if="medicamentsFiltres().length === 0" cols="12">
        <v-empty-state icon="mdi-pill-off" title="Aucun médicament trouvé"
          text="Essayez de modifier votre recherche." />
      </v-col>
    </v-row>

    <!-- ajout -->
    <PopupAjout :visible="dialogAjout" @fermer="dialogAjout = false" @ajoute="onMedicamentAjoute"
      @erreur="(msg) => afficherNotif(msg, 'error')" />

    <!-- modif -->
    <PopupModification :visible="dialogModif" :medicament="medEnCours" :enregistrement="enregistrement"
      @annuler="dialogModif = false" @enregistrer="enregistrerModif" />

    <!-- suppression -->
    <PopupSuppression :visible="dialogSuppression" :medicament="medASupprimer" @annuler="dialogSuppression = false"
      @confirmer="supprimerMedicament" />

    <Notification :visible="notification" :texte="notifTexte" :couleur="notifCouleur" @fermer="notification = false" />
  </v-container>
</template>
