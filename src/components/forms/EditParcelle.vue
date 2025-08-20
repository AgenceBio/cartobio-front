<template>
  <div>
    <div class="fr-px-6v fr-py-6v">
      <div class="fr-grid-row">
        <button
          class="end-right fr-btn fr-btn--tertiary-no-outline fr-icon-close-line fr-btn--icon-right"
          @click="handleClose"
        >
          Fermer
        </button>
      </div>
      <div class="fr-mb-4v">
        <div class="fr-grid-row">
          <ConversionLevel :feature="feature" with-date />
        </div>
        <div class="flex-space-between">
          <p class="fr-mt-1w">{{ feature.properties.NOM }}</p>
          <button
            @click="modalName = true"
            class="fr-icon--sm fr-btn--sm fr-btn fr-btn--tertiary-no-outline fr-icon-edit-line"
          ></button>
        </div>
        <p class="fr-h4 fr-mb-2v">{{ featureName(feature, { explicitName: false }) }}</p>
        <div class="fr-grid-row">
          <span class="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v" aria-hidden="true"></span>
          <p class="fr-mb-0">{{ feature.properties.COMMUNE }} {{ feature.properties.COMMUNE_LABEL }}</p>
        </div>
        <div class="fr-grid-row">
          <span class="ri-custom-size fr-mr-1v" aria-hidden="true"></span>
          <p class="fr-mb-0">
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
        <figure class="fr-quote fr-py-1w fr-px-2w fr-my-2w" v-if="feature.properties.commentaires && permissions.isOc">
          <blockquote>
            <p>{{ feature.properties.commentaires }}</p>
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
            <textarea class="fr-input" id="feature-commentaires" name="commentaires" v-model="patch.commentaires" />
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
                    >Date de début de conversion <span v-if="!isEngagementDateRequired">(facultatif)</span></label
                  >
                  <input
                    type="date"
                    class="fr-input"
                    v-model="patch.engagement_date"
                    name="engagement_date"
                    id="engagement_date"
                    :required="isEngagementDateRequired"
                    :disabled="!isAB || readonly || !permissions.canChangeConversionLevel"
                    min="1985-01-01"
                    :max="maxDate"
                  />
                </div>
              </div>
            </AccordionSection>
          </AccordionGroup>
        </template>
        <template v-else>
          <AccordionGroup>
            <AccordionSection title="Culture" isEdit :optionsCulture="optionsCulture(feature)">
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

              <div>
                <label class="fr-label" for="engagement_date"
                  >Date de début de conversion <span v-if="!isEngagementDateRequired">(facultatif)</span></label
                >
                <p>{{ jjmmyyyy(patch.engagement_date) }}</p>
              </div>

              <AnnotationsSelector
                v-if="permissions.canAddAnnotations"
                v-model="patch.annotations"
                :feature-id="feature.properties.id"
                :readonly="readonly || !permissions.canEditParcellaire"
              />

              <div class="fr-input-group" v-if="permissions.isOc">
                <label class="fr-label" for="auditeur_notes">Vos notes de certification (facultatif)</label>
                <textarea
                  :disabled="readonly || !permissions.canEditParcellaire"
                  class="fr-input"
                  id="auditeur_notes"
                  name="auditeur_notes"
                  v-model="patch.auditeur_notes"
                />
              </div>
            </AccordionSection>
          </AccordionGroup>
        </template>

        <AnnotationsSelector
          v-if="permissions.canAddAnnotations"
          v-model="patch.annotations"
          :feature-id="feature.properties.id"
          :readonly="readonly || !permissions.canEditParcellaire"
        />

        <div class="fr-input-group fr-mt-2w" v-if="permissions.canAddAnnotations">
          <label class="fr-label" for="auditeur_notes">Vos notes de certification </label>
          <textarea
            :disabled="readonly || !permissions.canEditParcellaire"
            class="fr-input"
            id="auditeur_notes"
            name="auditeur_notes"
            v-model="patch.auditeur_notes"
          />
        </div>

        <p class="fr-text--bold" v-if="feature.properties.historique">Historique</p>

        <TimelineHistorique :historique="feature.properties.historique" />

        <div class="fr-input-group">
          <button class="fr-btn" type="submit" form="single-feature-edit-form" aria-label="Enregister le parcellaire">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
    <div class="footer-controle fr-px-2w">
      <div class="fr-toggle fr-toggle--label-left fr-my-2w">
        <input
          type="checkbox"
          class="fr-toggle__input"
          id="toggle"
          aria-describedby="toggle-messages"
          v-model="estControlee"
          @change="tagParcelle(featureId)"
        />
        <label class="fr-toggle__label" for="toggle">Marquée comme contrôlée</label>
        <div class="fr-messages-group" id="toggle-messages" aria-live="polite"></div>
      </div>
    </div>
    <Modal v-if="modalName" @close="modalName = false">
      <template #title>Modification du nom de la parcelles</template>
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
        />
      </div>
      <template #footer>
        <div class="fr-input-group">
          <button
            class="fr-btn"
            @click="
              () => {
                validate();
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
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useFocus } from "@vueuse/core";

import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";
import { LEVEL_C1, LEVEL_C2, LEVEL_C3, isABLevel, getConversionLevel } from "@/referentiels/ab.js";
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
const estControlee = ref(props.feature.properties.controlee);
const isAB = computed(() => isABLevel(patch.value.conversion_niveau));
const maxDate = computed(() => toDateInputString(new Date()));
const modalName = ref(false);

useFocus(autofocusedElement, { initialValue: true });
function requiresAction(properties) {
  return properties.some((property) => featuresSet.byFeatureProperty(props.feature.id, property, true).size > 0);
}
const patch = ref({
  NOM: props.feature.properties.NOM || "",
  cultures: props.feature.properties.cultures,
  commentaires: props.feature.properties.commentaires || "",
  conversion_niveau: props.feature.properties.conversion_niveau || "",
  engagement_date: props.feature.properties.engagement_date,
});

const featureId = computed(() => props.feature.id);
watch(featureId, () => {
  estControlee.value = props.feature.properties.validee;
  patch.value = {
    NOM: props.feature.properties.NOM || "",
    cultures: props.feature.properties.cultures,
    commentaires: props.feature.properties.commentaires || "",
    ...(!permissions.canChangeCulture
      ? {
          conversion_niveau: props.feature.properties.conversion_niveau || "",
          engagement_date: props.feature.properties.engagement_date,
        }
      : {}),
  };
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
};

function handleClose() {
  if (featuresSet.isDirty) {
    showCancelModal.value = true;
  } else {
    emit("close");
  }
}

function tagParcelle(id) {
  if (estControlee.value) {
    tagParcelleControlee(props.record.record_id, id).then(() => {
      estControlee.value = true;
      emit("controlee", id);
    });

    return;
  }
  tagParcelleNonControlee(props.record.record_id, id).then(() => {
    estControlee.value = false;
    emit("non-controlee", id);
  });
}

function optionsCulture(feature) {
  if (feature.properties.cultures.length > 1)
    return { name: "Multiculture", icon: getCultureIcon(feature.properties.cultures[0].CPF) };
  if (feature.properties.cultures[0].CPF)
    return {
      name: fromCodeCpf(feature.properties.cultures[0].CPF).libelle_code_cpf,
      icon: getCultureIcon(feature.properties.cultures[0].CPF),
    };
  else return null;
}

onBeforeUnmount(() => featuresSet.setCandidate([]));

watch(
  patch,
  (properties) => {
    featuresSet.setCandidate([
      {
        id: props.feature.id,
        properties: {
          ...props.feature.properties,
          ...properties,
        },
      },
    ]);
  },
  { deep: true },
);
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
}

.flex-space-between > p {
  display: flex;
  align-items: center;
}

.footer-controle {
  display: flex;
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: 1px solid var(--grey-900-175);
  background-color: #f5f5fe;
  z-index: 1;
}
</style>
