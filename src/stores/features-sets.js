import { defineStore, storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";

import { useFeaturesStore } from "@/stores/features.js";
import { usePermissions } from "@/stores/permissions.js";
import { AnnotationTags, LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_MAYBE_AB, LEVEL_UNKNOWN } from "@/referentiels/ab.js";

import { featureName } from "@/utils/features.js";

/**
 * @typedef {import('vue').ComputedRef} ComputedRef
 * @typedef {import('vue').Ref} Ref
 * @typedef {import('geojson').Feature} Feature
 */

/** @enum {String} */
export const RuleSet = {
  NAMELESS: "nameless",
  CULTURE_MISSING: "culture-missing",
  CULTURE_UNSURE: "culture-unsure",
  CONVERSION_LEVEL_MISSING: "conversion-level-missing",
  CONVERSION_LEVEL_UNSURE: "conversion-level-unsure",
  GEOMETRY_MISSING: "geometry-missing",
  ENGAGEMENT_DATE_MISSING: "engagement-date-missing",
  ANNOTATED: "annotation",
};

/**
 * Sets are used to "select" features, either by requiring some attention, some action or to refine results.
 * A "Set item" is a name/selection/validation descriptor
 * A "Set" is a set of items and a reduce function
 * A "Set result" lists the state of each item, and which features it applies to
 */

/**
 * @typedef {String} FeatureId
 */

/**
 * @typedef {Object} SetItem
 * @property {String} errorMessage
 * @property {String?} property
 * @property {Boolean} required
 * @property {() => FeatureId[]} select
 */

/**
 * @typedef {SetItem} SetResult
 * @property {Boolean} count
 * @property {FeatureId[]} featureIds
 * @property {<String, {Boolean|<String, Boolean>[]}>[]} details
 */

export const useFeaturesSetsStore = defineStore("features-sets", () => {
  const featuresStore = useFeaturesStore();
  const permissions = usePermissions();
  const { allCandidate, isDirty } = storeToRefs(featuresStore);

  /**
   * @type {Ref<Map<String,Boolean>>}
   */
  const toggles = ref(new Map());

  /**
   *
   * @param {ComputedRef<Feature[]>} features
   * @param {(f: Feature) => Boolean|Array.<string,boolean>} filterFn
   * @returns {FeatureId[]}
   */
  function collectIds(features, filterFn) {
    return features.value
      .filter((f) => {
        const result = filterFn(f);

        if (Array.isArray(result)) {
          return result.some(([, result]) => result === true);
        }

        return result === true;
      })
      .map(({ id }) => id);
  }

  /**
   *
   * @param {ComputedRef<Feature[]>} features
   * @param {Function(Feature): Boolean} filterFn
   * @returns {FeatureId[]}
   */
  function collectDetails(features, filterFn) {
    return features.value
      .flatMap((f) => {
        const result = filterFn(f);

        if (Array.isArray(result)) {
          return result.map((r) => [f.id, r]).filter(([, r]) => r.at(1));
        }

        return [[f.id, result]];
      })
      .filter(([, result]) => (Array.isArray(result) ? result.length : result));
  }

  /** @type {ComputedRef<Map<String,SetItem>>} */
  const definitions = computed(
    () =>
      new Map([
        [
          RuleSet.NAMELESS,
          {
            label: "Sans nom",
            property: "name",
            required: true,
            errorMessage: "Il manque un nom",
            select(f) {
              return featureName(f, { placeholder: "" }) === "";
            },
          },
        ],
        [
          RuleSet.CULTURE_MISSING,
          {
            label: "Sans culture",
            property: "cultures",
            required: true,
            errorMessage: "Il manque un type de culture",
            select(f) {
              if (!Array.isArray(f.properties.cultures) || f.properties.cultures.length === 0) {
                return true;
              }

              return f.properties.cultures.map(({ id, CPF, TYPE, GF }, i) => [id ?? i, !CPF && !TYPE && !GF]);
            },
          },
        ],
        [
          RuleSet.CULTURE_UNSURE,
          {
            label: "Culture à préciser",
            property: "cultures",
            required: true,
            errorMessage: "La culture est à préciser",
            select(f) {
              if (!Array.isArray(f.properties.cultures) || f.properties.cultures.length === 0) {
                return false;
              }

              return f.properties.cultures.map(({ id, CPF, TYPE, GF }, i) => {
                if (!CPF && (TYPE || GF)) {
                  return [id ?? i, true];
                }

                return [id ?? i, CPF && !fromCodeCpf(CPF)?.is_selectable];
              });
            },
          },
        ],
        [
          RuleSet.CONVERSION_LEVEL_MISSING,
          {
            label: "Niveau de conversion manquant",
            property: "conversion_niveau",
            required: permissions.isOc,
            errorMessage: "Il manque un niveau de conversion",
            select(f) {
              return !f.properties.conversion_niveau || f.properties.conversion_niveau === LEVEL_UNKNOWN;
            },
          },
        ],
        [
          RuleSet.CONVERSION_LEVEL_UNSURE,
          {
            label: "Niveau de conversion à préciser",
            property: "conversion_niveau",
            required: permissions.isOc,
            errorMessage: "Le niveau de conversion en agriculture biologique a besoin d'être précisé",
            select(f) {
              return f.properties.conversion_niveau === LEVEL_MAYBE_AB;
            },
          },
        ],
        [
          RuleSet.ENGAGEMENT_DATE_MISSING,
          {
            label: "Date de début de conversion manquante",
            property: "engagement_date",
            required: permissions.isOc,
            errorMessage: "Il manque une date de début de conversion",
            select(f) {
              return (
                !f.properties.engagement_date && [LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(f.properties.conversion_niveau)
              );
            },
          },
        ],
        [
          RuleSet.GEOMETRY_MISSING,
          {
            label: "Dessin géographique manquant",
            property: "_geometry",
            required: permissions.isOc,
            errorMessage: "Il manque des coordonnées géométriques",
            select(f) {
              return !f.geometry || (Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length === 0);
            },
          },
        ],
        [
          RuleSet.ANNOTATED,
          {
            property: "annotations",
            required: false,
            items(features) {
              return Array.from(
                features.value
                  .reduce((map, feature) => {
                    /** @type {UserAnnotation[]} */ (feature.properties.annotations ?? []).forEach((annotation) => {
                      const id = [RuleSet.ANNOTATED, annotation.code].join("_");

                      if (!map.has(id)) {
                        map.set(id, {
                          id,
                          count: 0,
                          featureIds: [],
                          label: AnnotationTags[annotation.code].label,
                        });
                      }

                      const stats = map.get(id);

                      map.set(id, {
                        ...stats,
                        count: stats.count + 1,
                        featureIds: [...stats.featureIds, feature.id],
                      });
                    });

                    return map;
                  }, new Map())
                  .values()
              );
            },
            select(f) {
              return f.properties.annotations && Object.keys(f.properties.annotations).length > 0;
            },
          },
        ],
      ])
  );

  /**
   * @type {ComputedRef<Map<String,SetResult>>}
   */
  const sets = computed(
    () =>
      new Map(
        Array.from(definitions.value.entries())
          .map(([id, { errorMessage, label, property, required, select }]) => {
            const featureIds = collectIds(allCandidate, select);
            return [
              id,
              {
                count: featureIds.length,
                details: collectDetails(allCandidate, select),
                errorMessage,
                featureIds,
                label,
                property,
                required,
              },
            ];
          })
          .filter(([, { count }]) => count)
      )
  );

  /**
   * @type {ComputedRef<Map<String,SetResult>>}
   */
  const required = computed(() => new Map(Array.from(sets.value.entries()).filter(([, { required }]) => required)));

  /**
   * @type {ComputedRef<Map<String,SetResult>>}
   */
  const tags = computed(() =>
    Array.from(sets.value.entries())
      .flatMap(([id, result]) => {
        const definition = definitions.value.get(id);

        return definition.items ? definition.items(allCandidate) : [{ id, ...result }];
      })
      .map(({ id, ...item }) => ({ id, ...item, active: isToggled(id) }))
      .sort(({ count: countA }, { count: countB }) => countB - countA)
  );

  /**
   * @type {ComputedRef<Feature[]>}
   */
  const hits = computed(() => {
    const taggedFeatureIds = Array.from(tags.value.values())
      .filter(({ active }) => active)
      .flatMap(({ featureIds }) => featureIds);

    if (!taggedFeatureIds.length) {
      return featuresStore.all;
    }

    return featuresStore.all.filter(({ id }) => taggedFeatureIds.includes(id));
  });

  function toggle(id) {
    toggles.value.set(id, !isToggled(id));
  }

  function isToggled(id) {
    return toggles.value.get(id) === true;
  }

  /**
   * @type {ComputedRef<Boolean>}
   */
  const hasRequiredSets = computed(() => required.value.size > 0);

  /**
   * @param {String} featureId
   * @returns {Map<String,SetResult>}
   */
  function byFeature(featureId, filterRequired = false) {
    return new Map(
      Array.from(sets.value.entries())
        .filter(([, { featureIds, required }]) => {
          return featureIds.includes(featureId) && (filterRequired ? filterRequired && required : true);
        })
        .map(([key, { details, ...rest }]) => [
          key,
          {
            ...rest,
            count: 1,
            featureIds: [featureId],
            details: details.filter((d) => d.at(0) === featureId),
          },
        ])
    );
  }

  /**
   * @param {String} featureId
   * @param {String} property
   * @returns {Map<String,SetResult>}
   */
  function byFeatureProperty(featureId, property, filterRequired = false) {
    return new Map(
      Array.from(byFeature(featureId, filterRequired).entries()).filter(([, { property: prop }]) => prop === property)
    );
  }

  /**
   * @param {String} featureId
   * @param {String} detailId
   * @returns {Map<String,SetResult>}
   */
  function byFeatureDetail(featureId, detailId, filterRequired = false) {
    return new Map(
      Array.from(byFeature(featureId, filterRequired).entries()).filter(([, { details }]) =>
        details.some(([fid, r]) => fid === featureId && (Array.isArray(r) ? r.at(0) === detailId : false))
      )
    );
  }

  function $reset() {
    toggles.value = new Map();
  }

  /**
   * Check for toggled items with no tag (items with count=0 are out of the sets)
   * We automatically untoggle them to avoid providing no hits and no hidden toggled tag
   *
   * @param {ComputedRef} tags
   * @param {(currentTags: ComputedRef<Map<String,SetResult>>) => undefined}
   */
  watch(tags, (currentTags) => {
    toggles.value.forEach((value, toggledId) => {
      const tag = currentTags.find(({ id }) => id === toggledId);
      if (!tag && value) {
        toggle(toggledId);
      }
    });
  });

  return {
    //proxy
    isDirty,
    setCandidate: featuresStore.setCandidate,
    // where all lives
    sets,
    required, // sets filtered by requirement
    // computed
    hasRequiredSets,
    tags, // sets filtered by toggled elements

    // general methods
    $reset,
    // per feature methods
    byFeature,
    byFeatureDetail,
    byFeatureProperty,
    // features x active tags
    hits,
    isToggled,
    toggle,
  };
});
