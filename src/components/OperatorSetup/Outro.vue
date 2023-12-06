<template>
  <section>
      <p>
        Félicitations, votre parcellaire a été créé sur CartoBio.<br/>
        Votre organisme de certification y aura accès pour votre audit.
      </p>

      <p>
        <button type="button" @click="emit('submit')" class="fr-btn">
          Accéder à mon parcellaire
        </button>
      </p>
    </section>
</template>

<script setup>
const emit = defineEmits(['submit'])
</script>
