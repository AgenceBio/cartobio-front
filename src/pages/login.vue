<route lang="yaml">
  meta:
    seo:
      title: Connexion sécurisée à votre compte
</route>

<template>
  <div class="fr-container fr-my-5w">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-6 fr-px-md-0 fr-py-10v fr-py-md-14v fr-background-alt--grey">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
          <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">

            <h2>Connexion à CartoBio</h2>
             <Login />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Login from '@/components/Login.vue'
</script>
