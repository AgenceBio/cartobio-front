<template>
  <div class="fr-card">
    <div class="fr-card__body">
      <div class="fr-card__content">
        <h3 class="fr-card__title">
          Import du parcellaire par l'agriculteur
        </h3>
        <div class="fr-card__desc">
          <p>
            Sur CartoBio, l'agriculteur <b>{{ operator.nom }}</b>
            peut y importer ses données
            depuis son logiciel de gestion (Geofolia, MesParcelles…)
            ou à partir de sa déclaration Telepac la plus récente.
          </p>
        </div>
        <div class="fr-card__start">
          <ul class="fr-tags-group">
            <li>
              <p class="fr-badge fr-badge--info fr-badge--no-icon">recommandé</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const operator = inject('operator')
</script>
