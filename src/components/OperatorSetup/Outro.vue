<template>
  <section>
    <p v-if="permissions.isAgri">
      Félicitations, votre parcellaire a été créé sur CartoBio.<br/>
      Votre organisme de certification y aura accès pour votre audit.
    </p>
    <p v-else>
      Félicitations, le parcellaire a été créé sur CartoBio.<br/>
      Vous pouvez désormais accéder au parcellaire de l'agriculteur.
    </p>

    <p>
      <button type="button" @click="emit('submit')" class="fr-btn">
        Accéder au parcellaire
      </button>
    </p>
  </section>
</template>

<script setup>
import { usePermissions } from "@/stores/permissions.js"

const emit = defineEmits(['submit'])
const permissions = usePermissions()
</script>
