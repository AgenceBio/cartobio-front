<template>
  <div class="global">
    <div ref="global" class="fr-px-6v fr-py-6v content">
      <div class="fr-grid-row">
        <p class="fr-h6 fr-mb-2v fr-my-auto">{{ featureName(feature, { explicitName: false }) }}</p>
        <button
          class="end-right fr-btn fr-btn--tertiary-no-outline fr-icon-close-line fr-btn--icon-right"
          @click="handleClose"
          aria-label="Fermer la fiche de la parcelle"
        ></button>
      </div>
      <div class="fr-mt-4v fr-pb-0">
        <div class="flex">
          <span class="fr-mt-1w fr-mb-0 fr-text--sm" v-if="feature.properties.NOM">{{ feature.properties.NOM }}</span>
          <em class="fr-mt-1w fr-mb-0 fr-hint-text" v-else>Nom de la parcelle</em>
          <button
            @click="modalName = true"
            class="fr-icon--sm fr-btn--sm fr-btn fr-btn--tertiary-no-outline fr-icon-edit-line"
            aria-label="Modifier le nom de la parcelle {{ feature.properties.NOM || '' }}"
          ></button>
        </div>
        <div class="fr-grid-row">
          <ConversionLevel
            v-if="feature.properties.conversion_niveau && feature.properties.conversion_niveau != ''"
            :feature="feature"
            with-date
            noIcon
            labelSelector
          />
          <span v-else-if="permissions.isOc" class="fr-badge fr-badge--warning fr-badge--sm">
            Saisir la certification
          </span>
          <ConversionLevel v-else-if="!permissions.isOc" unknown noIcon />
        </div>
        <div class="fr-grid-row">
          <span class="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
          <p class="fr-mb-0 fr-text--sm">{{ feature.properties.COMMUNE }} {{ feature.properties.COMMUNE_LABEL }}</p>
        </div>
        <div class="fr-grid-row fr-text--sm">
          <span class="ri-custom-size fr-mr-1v" aria-hidden="true"></span>
          <p class="fr-mb-0 fr-text--sm">
            {{
              !isNaN(parseFloat(inHa(legalProjectionSurface(feature))))
                ? inHa(legalProjectionSurface(feature)) + " ha"
                : ""
            }}
          </p>
        </div>
      </div>
      <form @submit.prevent="validate" id="single-feature-edit-form">
        <div class="fr-mb-3w">
          <div v-for="[id, result] in nameErrors" :key="id" class="fr-hint-text fr-error-text">
            {{ result.errorMessage }}.
          </div>
          <ul v-if="details.length">
            <li v-for="(detail, index) in details" :key="index">
              {{ detail }}
            </li>
          </ul>
        </div>

        <figure
          class="fr-quote fr-py-1w fr-px-2w fr-my-2w fr-mx-1w"
          aria-label="Notes de l'exploitant ou de l'exploitante"
          v-if="feature.properties.commentaires && permissions.isOc"
        >
          <blockquote>
            <p class="fr-text--md no-gras">{{ feature.properties.commentaires }}</p>
          </blockquote>
          <figcaption>
            <p class="fr-quote__author">Notes de l'exploitant‧e</p>
          </figcaption>
        </figure>
        <template v-if="permissions.canEditParcellaire">
          <AccordionGroup v-if="permissions.isOc">
            <AccordionSection
              title="Culture"
              isEdit
              :optionsCulture="optionsCulture(feature)"
              :requires-action="requiresAction(['cultures'])"
            >
              <div class="fr-card">
                <div class="fr-p-2w">
                  <div class="fr-p-2w fr-mb-1w" v-if="feature.properties.CODE_CULTURE">
                    <span class="fr-h5">Culture de la parcelle</span>
                    <div class="import-pac fr-mt-3w">
                      <span class="fr-label"
                        >Culture de l'import PAC du {{ jjmmyyyy(feature.properties.createdAt) }}</span
                      >
                    </div>
                    <div class="fr-hint-text">
                      Code culture
                      <template v-if="feature.properties.CODE_PRECISION"> - code précision</template>
                      <template
                        v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')"
                      >
                        : culture</template
                      >
                    </div>
                    <div class="code-culture">
                      {{ feature.properties.CODE_CULTURE }}
                      <template v-if="feature.properties.CODE_PRECISION">
                        - {{ feature.properties.CODE_PRECISION }}</template
                      >
                      <template
                        v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')"
                      >
                        :
                        {{
                          getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? "")
                            .libelle
                        }}</template
                      >
                    </div>
                  </div>
                  <CultureSelector
                    :feature-id="feature.properties.id"
                    :cultures="patch.cultures"
                    @change="($cultures) => (patch.cultures = $cultures)"
                  />
                </div>
              </div>
            </AccordionSection>
          </AccordionGroup>
          <div v-else>
            <div class="fr-card">
              <div class="fr-p-2w">
                <div class="fr-p-2w fr-mb-1w" v-if="feature.properties.CODE_CULTURE">
                  <span class="fr-h5">Culture de la parcelle</span>
                  <div class="import-pac fr-mt-3w">
                    <span class="fr-label"
                      >Culture de l'import PAC du {{ jjmmyyyy(feature.properties.createdAt) }}</span
                    >
                  </div>
                  <div class="fr-hint-text">
                    Code culture
                    <template v-if="feature.properties.CODE_PRECISION"> - code précision</template>
                    <template
                      v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')"
                    >
                      : culture</template
                    >
                  </div>
                  <div class="code-culture">
                    {{ feature.properties.CODE_CULTURE }}
                    <template v-if="feature.properties.CODE_PRECISION">
                      - {{ feature.properties.CODE_PRECISION }}</template
                    >
                    <template
                      v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')"
                    >
                      :
                      {{
                        getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? "").libelle
                      }}</template
                    >
                  </div>
                </div>
                <CultureSelector
                  :feature-id="feature.properties.id"
                  :cultures="patch.cultures"
                  @change="($cultures) => (patch.cultures = $cultures)"
                />
              </div>
            </div>
          </div>
          <div v-if="!permissions.isOc" class="fr-input-group fr-px-6v fr-mt-6v">
            <label class="fr-label" for="feature-commentaires">
              Vos notes
              <span class="fr-hint-text">Elles seront visibles par votre organisme de certification.</span>
            </label>
            <textarea
              class="fr-input"
              aria-describedby="feature-commentaires-hint"
              id="feature-commentaires"
              name="commentaires"
              v-model="patch.commentaires"
            />
            <span id="feature-commentaires-hint" class="fr-sr-only">
              Ces notes sont visibles par votre organisme de certification.
            </span>
          </div>
          <AccordionGroup v-if="permissions.isOc && permissions.canEditParcellaire" :constraint-toggle="!open">
            <AccordionSection
              title="Certification"
              :optionsCulture="{ name: getConversionLevel(patch.conversion_niveau).labelSelector }"
              isEdit
              :open="open"
              :requires-action="requiresAction(['conversion_niveau', 'engagement_date', 'annotations'])"
            >
              <div class="fr-card fr-p-2w">
                <ConversionLevelSelector
                  :feature-id="feature.properties.id || feature.id"
                  :readonly="!permissions.canChangeConversionLevel || readonly"
                  v-model="patch.conversion_niveau"
                />

                <div class="fr-input-group" v-if="isAB && !readonly">
                  <label class="fr-label" for="engagement_date"
                    >Date de début de conversion <span v-if="!isEngagementDateRequired"></span
                  ></label>
                  <p class="fr-hint-text" v-if="patch.conversion_niveau === LEVEL_AB">
                    Une date est requise pour l'attestation de production, si vous ne la connaissez pas ou ne souhaitez
                    pas la mettre, celle-ci sera automatiquement remplie par 01/01/1900.
                  </p>
                  <input
                    type="date"
                    class="fr-input"
                    v-model="patch.engagement_date"
                    name="engagement_date"
                    id="engagement_date"
                    :required="isEngagementDateRequired"
                    :disabled="!isAB || readonly || !permissions.canChangeConversionLevel"
                    min="1900-01-01"
                    :max="maxDate"
                  />
                </div>
              </div>
            </AccordionSection>
          </AccordionGroup>
          <div class="fr-input-group fr-mt-4w" v-if="permissions.canAddAnnotations">
            <label class="fr-label" for="auditeur_notes">Vos notes de certification </label>
            <textarea
              :disabled="readonly || !permissions.canEditParcellaire"
              class="fr-input"
              id="auditeur_notes"
              name="auditeur_notes"
              v-model="patch.auditeur_notes"
            />
          </div>
        </template>
        <template v-else>
          <AccordionGroup>
            <AccordionSection title="Culture" isEdit :optionsCulture="optionsCulture(feature)">
              <div class="culture-group" v-if="feature.properties.CODE_CULTURE">
                <div>
                  <div class="fr-p-2w" v-if="feature.properties.CODE_CULTURE">
                    <div class="import-pac fr-mt-3w">
                      <span class="fr-label"
                        >Culture de l'import PAC du {{ jjmmyyyy(feature.properties.createdAt) }}</span
                      >
                    </div>
                    <div class="fr-hint-text">
                      Code culture
                      <template v-if="feature.properties.CODE_PRECISION"> - code précision</template>
                      <template
                        v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')"
                      >
                        : culture</template
                      >
                    </div>
                    <div class="code-culture">
                      {{ feature.properties.CODE_CULTURE }}
                      <template v-if="feature.properties.CODE_PRECISION">
                        - {{ feature.properties.CODE_PRECISION }}</template
                      >
                      <template
                        v-if="getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? '')"
                      >
                        :
                        {{
                          getCulturePAC(feature.properties.CODE_CULTURE, feature.properties.CODE_PRECISION ?? "")
                            .libelle
                        }}</template
                      >
                    </div>
                  </div>
                </div>
              </div>
              <CultureSelector
                :disabled-input="true"
                :feature-id="feature.properties.id"
                :cultures="patch.cultures"
                @change="($cultures) => (patch.cultures = $cultures)"
              />
            </AccordionSection>
          </AccordionGroup>

          <AccordionGroup :constraint-toggle="!open">
            <AccordionSection
              title="Certification"
              :open="open"
              isEdit
              :optionsCulture="{ name: getConversionLevel(patch.conversion_niveau).labelSelector }"
              :requires-action="requiresAction(['conversion_niveau', 'engagement_date', 'annotations'])"
            >
              <ConversionLevelSelector
                :feature-id="feature.properties.id || feature.id"
                :readonly="!permissions.canChangeConversionLevel || readonly"
                v-model="patch.conversion_niveau"
              />

              <div v-if="patch.engagement_date">
                <label class="fr-label" for="engagement_date"
                  >Date de début de conversion <span v-if="!isEngagementDateRequired">(facultatif)</span></label
                >
                <p>{{ jjmmyyyy(patch.engagement_date) }}</p>
              </div>
              <div class="fr-input-group" v-if="permissions.canChangeConversionLevel">
                <label class="fr-label" for="auditeur_notes">Vos notes de certification (facultatif)</label>
                <textarea
                  :disabled="readonly || !permissions.canEditParcellaire"
                  class="fr-input"
                  id="auditeur_notes"
                  name="auditeur_notes"
                  v-model="patch.auditeur_notes"
                />
              </div>
              <figure class="fr-quote fr-py-1w fr-px-2w fr-my-2w" v-else-if="patch.auditeur_notes">
                <blockquote>
                  <p>{{ patch.auditeur_notes }}</p>
                </blockquote>
                <figcaption>
                  <p class="fr-quote__author">Notes de l'OC</p>
                </figcaption>
              </figure>
            </AccordionSection>
          </AccordionGroup>
        </template>

        <p class="fr-text--bold fr-mt-2w" v-if="feature.properties.historique">Historique</p>
        <TimelineHistorique class="fr-mt-1w" :historique="feature.properties.historique" />
      </form>
    </div>
    <div class="footer-controle fr-px-2w">
      <div
        class="fr-checkbox-group fr-checkbox-group--sm fr-my-2w"
        v-tooltip="{ text: 'Permet d\'annoter la parcelle comme vue', position: 'top' }"
      >
        <input
          name="checkbox-0"
          id="checkbox-0"
          type="checkbox"
          aria-describedby="checkbox-0-messages"
          :aria-checked="estControlee"
          v-model="estControlee"
          @change="tagParcelle(featureId)"
        />
        <label class="fr-label" for="checkbox-0">Vu</label>
        <div class="fr-messages-group" id="checkbox-0-messages" aria-live="polite"></div>
      </div>

      <div class="fr-input-group fr-mt-1w">
        <button
          class="fr-btn"
          type="submit"
          form="single-feature-edit-form"
          aria-label="Enregister le parcellaire"
          :disabled="!hasRealChanges"
        >
          Enregistrer
        </button>
      </div>
    </div>
    <Teleport to="body">
      <Modal v-if="modalName" @close="modalName = false">
        <template #title>Modification du nom de la parcelle</template>
        <div class="fr-input-group" :class="{ 'fr-input-group--error': nameErrors.size }">
          <label class="fr-label" for="feature-nom">Nom de la parcelle</label>
          <span class="fr-hint-text fr-mb-1v">Exemple&nbsp;: Les charrons 2</span>
          <input
            class="fr-input"
            id="feature-nom"
            v-model="patch.NOM"
            :required="requiredName"
            :class="{ 'fr-input--error': nameErrors.size }"
            ref="autofocusedElement"
            aria-invalid="nameErrors.size > 0"
            aria-describedby="feature-nom-hint"
          />
        </div>
        <template #footer>
          <div class="fr-input-group">
            <button
              class="fr-btn"
              @click="
                () => {
                  validateName();
                  modalName = false;
                }
              "
              form="single-feature-edit-form"
              aria-label="Enregister le parcellaire"
            >
              Enregistrer
            </button>
          </div>
        </template>
      </Modal>
      <CancelModal v-if="showCancelModal" @cancel="showCancelModal = false" @close="$emit('close')" />
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { useFocus } from "@vueuse/core";

import AccordionGroup from "@/components/widgets/AccordionGroup.vue";

import AccordionSection from "@/components/widgets/Accordion.vue";
import {
  LEVEL_C1,
  LEVEL_C2,
  LEVEL_C3,
  LEVEL_AB,
  LEVEL_CONVENTIONAL,
  LEVEL_MAYBE_AB,
  isABLevel,
  getConversionLevel,
} from "@/referentiels/ab.js";
import CultureSelector from "@/components/forms/fields/CultureSelector.vue";
import ConversionLevelSelector from "@/components/forms/fields/ConversionLevelSelector.vue";
import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";

import { usePermissions } from "@/stores/permissions.js";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import CancelModal from "@/components/forms/CancelModal.vue";
import { featureDetails, featureName, inHa, legalProjectionSurface, getCultureIcon } from "@/utils/features.js";
import { getCulturePAC } from "@agencebio/rosetta-cultures";
import { jjmmyyyy } from "@/utils/dates";
import { tagParcelleControlee, tagParcelleNonControlee } from "@/cartobio-api";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";
import { toDateInputString } from "@/utils/dates.js";

import TimelineHistorique from "@/components/forms/TimelineHistorique.vue";
import Modal from "@/components/widgets/Modal.vue";

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
  record: {
    type: Object,
    required: true,
  },
  requiredName: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  isTab: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "close", "controlee", "non-controlee"]);
const permissions = usePermissions();
const featuresSet = useFeaturesSetsStore();
const showCancelModal = ref(false);
const autofocusedElement = ref();

const global = ref(null);

const estControlee = ref(props.feature.properties.controlee);

const isAB = computed(() => isABLevel(patch.value.conversion_niveau));
const maxDate = computed(() => toDateInputString(new Date()));
const modalName = ref(false);

const isInitializing = ref(true);

useFocus(autofocusedElement, { initialValue: true });

function requiresAction(properties) {
  return properties.some((property) => featuresSet.byFeatureProperty(props.feature.id, property, true).size > 0);
}

function createInitialPatch() {
  return {
    NOM: props.feature.properties.NOM || "",
    cultures: props.feature.properties.cultures.map((c) => ({ ...c, CPF: c.CPF || "" })),
    commentaires: props.feature.properties.commentaires || "",
    conversion_niveau: props.feature.properties.conversion_niveau || "",
    engagement_date: props.feature.properties.engagement_date || "",
    auditeur_notes: props.feature.properties.auditeur_notes || "",
  };
}

const patch = ref(createInitialPatch());

const initialPatchState = ref(JSON.stringify(createInitialPatch()));

const hasRealChanges = computed(() => {
  const currentState = JSON.stringify(patch.value);
  return currentState !== initialPatchState.value;
});

const featureId = computed(() => props.feature.id);

watch(featureId, (newId, oldId) => {
  if (newId !== oldId) {
    isInitializing.value = true;
    estControlee.value = props.feature.properties.controlee;

    const newPatch = createInitialPatch();
    patch.value = newPatch;
    initialPatchState.value = JSON.stringify(newPatch);

    featuresSet.setCandidate([]);

    nextTick(() => {
      isInitializing.value = false;
      if (global.value) {
        global.value.scrollTop = 0;
      }
    });
  }
});

const details = featureDetails(props.feature);
const nameErrors = computed(() => featuresSet.byFeatureProperty(props.feature.id, "name"));
const isEngagementDateRequired = computed(() => [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(patch.value.conversion_niveau));

const validate = () => {
  const set = featuresSet.byFeature(props.feature.id, true);

  if (set.size) {
    return false;
  }

  emit("submit", { id: props.feature.id, properties: patch });
  initialPatchState.value = JSON.stringify(patch.value);
};

const validateName = () => {
  emit("submit", { id: props.feature.id, properties: { NOM: patch.value.NOM } });
  const temp = createInitialPatch();
  temp.NOM = patch.value.NOM;
  initialPatchState.value = JSON.stringify(temp);
};

function handleClose() {
  if (hasRealChanges.value) {
    showCancelModal.value = true;
  } else {
    emit("close");
  }
}

function tagParcelle(id) {
  if (estControlee.value) {
    tagParcelleControlee(props.record.record_id, id)
      .then(() => {
        estControlee.value = true;
        emit("controlee", id);
      })
      .catch(() => {
        estControlee.value = false;
      });
  } else {
    tagParcelleNonControlee(props.record.record_id, id)
      .then(() => {
        estControlee.value = false;
        emit("non-controlee", id);
      })
      .catch(() => {
        estControlee.value = true;
      });
  }
}

function optionsCulture(feature) {
  if (feature.properties.cultures.length > 1)
    return { name: "Multiculture", icon: getCultureIcon(feature.properties.cultures[0].CPF) };
  if (feature.properties.cultures.length === 1 && feature.properties.cultures[0].CPF)
    return {
      name: fromCodeCpf(feature.properties.cultures[0].CPF)?.libelle_code_cpf ?? "",
      icon: getCultureIcon(feature.properties.cultures[0].CPF),
    };
  else return null;
}

onBeforeUnmount(() => featuresSet.setCandidate([]));

watch(
  patch,
  (properties) => {
    if (!isInitializing.value) {
      featuresSet.setCandidate([
        {
          id: props.feature.id,
          properties: {
            ...props.feature.properties,
            ...properties,
          },
        },
      ]);
    }
  },
  { deep: true },
);

watch(
  () => patch.value.conversion_niveau,
  (newValue) => {
    if (newValue === LEVEL_AB && !patch.value.engagement_date) {
      patch.value.engagement_date = "1900-01-01";
    }
    if (newValue != LEVEL_AB && patch.value.engagement_date === "1900-01-01") {
      patch.value.engagement_date = "";
    }
    if (newValue === LEVEL_CONVENTIONAL) {
      patch.value.engagement_date = "";
    }
  },
);

nextTick(() => {
  isInitializing.value = false;
});
</script>

<style scoped>
.import-pac {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.code-culture {
  line-height: 1.2rem;
}

.end-right {
  margin-left: auto;
}

.flex-space-between {
  display: flex;
  justify-content: space-between;
  height: 35px;
}

.flex-space-between > p {
  display: flex;
  align-items: center;
  height: fit-content;
}

.global {
  display: flex;
  flex-direction: column;
  height: min(80vh, 1000px);
  overflow: auto;
}

.content {
  flex: 1;
  overflow: auto;
}

.footer-controle {
  position: sticky;
  display: flex;
  justify-content: space-between;
  bottom: 0;
  margin-top: auto;
  border-top: 1px solid var(--grey-900-175);
  background-color: #f5f5fe;
  z-index: 10;
}

.no-gras {
  font-weight: 400;
}

.flex {
  display: flex;
}

.culture-group {
  margin-left: 0;
  margin-right: 0;
  border: 0;

  background-color: white;
}
</style>
