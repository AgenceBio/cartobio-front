<script setup>
import { useCartoBioStorage } from "@/stores/storage.js";
import VersionConflictModal from "@/components/versions/VersionConflictModal.vue";
import { ref } from "vue";

const storage = useCartoBioStorage();
const modalRecordId = ref(null);
</script>

<template>
  <div class="fr-alert fr-alert--error" role="alert">
    <div class="fr-alert__title">Conflit entre versions</div>
    <p v-if="storage.conflicts.size">
      Les exploitations suivantes ont été modifiées pendant que vous étiez hors-ligne. Cliquez sur l'exploitation pour
      résoudre le conflit.
    </p>

    <ul class="fr-text--bold" v-if="storage.conflicts.size">
      <li v-for="conflict in storage.conflicts" :key="conflict">
        <a href="#" @click="modalRecordId = conflict">
          {{ storage.operators[storage.records[conflict].numerobio].operator.nom }} -
          {{ storage.records[conflict].version_name }}
        </a>
      </li>
    </ul>

    <p v-if="storage.dateConflicts.size">
      Les exploitations suivantes ont des dates d'audit en conflit. Vous devez modifier les dates de l'une ou l'autre
      pour résoudre le conflit.
    </p>

    <ul v-if="storage.dateConflicts.size">
      <li v-for="dateConflict in storage.dateConflicts" :key="dateConflict">
        <span class="fr-text--bold">
          {{ storage.operators[storage.records[dateConflict].numerobio].operator.nom }} </span
        ><br />
        La version
        <span class="fr-text--bold">
          <router-link :to="`/exploitations/${storage.records[dateConflict].numerobio}/${dateConflict}`">
            {{ storage.records[dateConflict].version_name }}
          </router-link>
        </span>
        ne peut être synchronisée à la même date d'audit que
        <span class="fr-text--bold">
          <router-link
            :to="`/exploitations/${storage.records[dateConflict].numerobio}/${
              storage.operators[storage.records[dateConflict].numerobio].records.find(
                (otherRecord) =>
                  otherRecord.record_id !== dateConflict &&
                  otherRecord.audit_date === storage.records[dateConflict].audit_date
              )?.record_id
            }`"
          >
            {{
              storage.operators[storage.records[dateConflict].numerobio].records.find(
                (otherRecord) =>
                  otherRecord.record_id !== dateConflict &&
                  otherRecord.audit_date === storage.records[dateConflict].audit_date
              )?.version_name
            }}
          </router-link>
        </span>
      </li>
    </ul>
  </div>

  <Teleport to="body">
    <VersionConflictModal v-if="modalRecordId" :record-id="modalRecordId" @close="modalRecordId = null" />
  </Teleport>
</template>

<style scoped></style>
