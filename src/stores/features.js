import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useFeaturesSetsStore } from "@/stores/features-sets.js";
import { SyncOperation, useCartoBioStorage } from "@/stores/storage.js";

/**
 * @typedef {import('@/referentiels/ab.js').UserAnnotation} UserAnnotation
 */

/**
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} CartoBioFeatureCollection
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeature} CartoBioFeature
 */

export function collectIds(features) {
  return features.map(({ id }) => String(id)).sort();
}

export const useFeaturesStore = defineStore("features", () => {
  const selectedIds = ref([]);
  const activeId = ref(null);
  const hoveredId = ref(null);
  const recordId = ref(null);

  /**
   * @type {reactive<CartoBioFeatureCollection>}
   */
  const collection = ref({
    type: "FeatureCollection",
    features: [],
  });

  /**
   * @type {reactive<CartoBioFeatureCollection>}
   */
  const candidateCollection = ref({
    type: "FeatureCollection",
    features: [],
  });

  /**
   * @return {CartoBioFeature}
   */
  function getFeatureById(id) {
    return collection.value.features.find((feature) => String(feature.id) === String(id));
  }

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const all = computed(() => collection.value.features);

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const allCandidate = computed(() => mergeFeatures(collection.value.features, candidateCollection.value.features));

  /**
   * @type {ComputedRef<Boolean>}
   */
  const isDirty = computed(() => JSON.stringify(all.value) !== JSON.stringify(allCandidate.value));

  /**
   * @type {ComputedRef<Boolean>}
   */
  const hasFeatures = computed(() => collection.value.features.length > 0);

  /**
   * @type {ComputedRef<Boolean>}
   */
  const hasPac = computed(() =>
    collection.value.features.some(
      (p) => p.properties.attente_pac || (p?.properties.NUMERO_P != null && p?.properties.NUMERO_I != null),
    ),
  );

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const allSelected = computed(() => {
    const sets = useFeaturesSetsStore();
    const collectedIds = collectIds(sets.hits);

    return collectedIds.toString() === selectedIds.value.sort().toString();
  });

  /**
   * @type {ComputedRef<CartoBioFeature>}
   */
  const activeFeature = computed(() => {
    return activeId.value ? getFeatureById(activeId.value) : null;
  });

  /**
   * @type {ComputedRef<CartoBioFeature|null>}
   */
  const hoveredFeature = computed(() => {
    return hoveredId.value ? getFeatureById(hoveredId.value) : null;
  });

  /**
   * @type {ComputedRef<CartoBioFeature[]>}
   */
  const selectedFeatures = computed(() => {
    return selectedIds.value.map(getFeatureById);
  });

  /**
   * @param {CartoBioFeature[]} features
   */
  function setAll(features) {
    collection.value.features = [...features];
  }

  /**
   *
   * @param {CartoBioFeature[]} features
   */
  function setCandidate(features) {
    candidateCollection.value.features = [...features];
  }

  function toggleAllSelected() {
    const sets = useFeaturesSetsStore();
    selectedIds.value = allSelected.value ? [] : collectIds(sets.hits);
  }

  /**
   * @param {String} featureId
   */
  function toggleSingleSelected(featureId) {
    selectedIds.value = selectedIds.value.includes(String(featureId))
      ? // we remove it if it was available
        selectedIds.value.filter((id) => String(id) !== String(featureId))
      : // otherwise, we add it to the select list
        selectedIds.value.concat([String(featureId)]);
  }

  /**
   * @param  {...String} ids
   */
  function select(...ids) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids.map(String)]));
  }

  /**
   * @param {string[]} ids
   */
  function setSelectedIds(ids) {
    selectedIds.value = ids;
  }

  /**
   * @param  {...String} ids
   */
  function unselect(...ids) {
    selectedIds.value = selectedIds.value.filter((id) => ids.map(String).includes(String(id)) === false);
  }

  function unselectAll() {
    selectedIds.value = [];
  }

  function bindFeatureState(map, layerId) {
    const layer = map.value
      .getLayers()
      .getArray()
      .find((l) => l.get("name") === layerId);
    const source = layer?.getSource();
    if (!source) return;

    watch(hoveredId, (id, previousId) => {
      if (previousId) {
        const feature = source.getFeatureById(previousId);
        if (feature) feature.set("hover", false);
      }
      if (id) {
        const feature = source.getFeatureById(id);
        if (feature) feature.set("hover", true);
      }
      layer.changed();
    });

    watch(
      () => selectedIds,
      (ids) => {
        collection.value.features.forEach((feature) => {
          const f = source.getFeatureById(feature.id);
          if (f) f.set("selected", ids.value.includes(feature.id));
        });
        layer.changed();
      },
      { deep: true },
    );

    watch(activeId, (id, previousId) => {
      if (previousId) {
        const feature = source.getFeatureById(previousId);
        if (feature) feature.set("selected", false);
      }
      if (id) {
        const feature = source.getFeatureById(id);
        if (feature) feature.set("selected", true);
      }
      layer.changed();
    });
  }

  function bindFeatureInteraction(map, layerId) {
    const layer = map.value
      .getLayers()
      .getArray()
      .find((l) => l.get("name") === layerId);
    const source = layer?.getSource();

    if (!source) return;

    map.value.on("pointermove", (e) => {
      if (e.dragging) return;
      const feature = map.value.forEachFeatureAtPixel(e.pixel, (f, layerCandidate) => {
        return layerCandidate === layer ? f : null;
      });
      if (feature) {
        hoveredId.value = feature.getId();
      } else {
        hoveredId.value = null;
      }
    });
  }

  /**
   * Update feature properties based on a matching Feature ID
   *
   * @param {CartoBioFeature[]} target
   * @param {CartoBioFeature[]} source
   * @returns {CartoBioFeature[]}
   */
  function mergeFeatures(target, source) {
    let res = target.map((feature) => {
      const matchingFeature = source.find(({ id }) => feature.id === id);

      if (matchingFeature) {
        source = source.filter(({ id }) => feature.id !== id);
        return {
          ...feature,
          properties: JSON.parse(
            JSON.stringify({
              ...feature.properties,
              ...matchingFeature.properties,
            }),
          ),
        };
      }

      return feature;
    });

    if (source.length > 0) {
      res = res.concat(source);
    }
    return res;
  }

  /**
   * Update/replace properties of a single feature
   * @param {CartoBioFeature} feature
   * @returns {Promise<void>}
   */
  function updateSingleFeature({ id, properties, geometry }) {
    const storage = useCartoBioStorage();
    storage.addSyncOperation(
      recordId.value,
      new SyncOperation(SyncOperation.ACTIONS.UPDATE_FEATURE, { properties, geometry }, id),
    );
  }

  /**
   * Creates or updates multiple features properties
   * @param {CartoBioFeatureCollection} featureCollection
   * @returns {Promise<void>}
   */
  async function updateFeatureCollectionProperties(featureCollection) {
    const storage = useCartoBioStorage();
    storage.addSyncOperation(
      recordId.value,
      new SyncOperation(SyncOperation.ACTIONS.UPDATE_COLLECTION, featureCollection),
    );
  }

  /**
   * Delete a single feature
   * @return {Promise<void>}
   */
  async function deleteSingleFeature({ id, reason }) {
    const storage = useCartoBioStorage();
    storage.addSyncOperation(recordId.value, new SyncOperation(SyncOperation.ACTIONS.DELETE_FEATURE, { reason }, id));
  }

  /**
   * @param {CartoBioFeature[]} features
   */
  function updateMatchingFeatures(features) {
    collection.value.features = mergeFeatures(collection.value.features, features);
  }

  function commitCandidate() {
    collection.value.features = [...candidateCollection.value.features];
  }

  function $reset() {
    selectedIds.value = [];
    activeId.value = null;
    hoveredId.value = null;
    setAll([]);
    setCandidate([]);
  }

  return {
    recordId,
    activeId,
    hoveredId,
    selectedIds,
    // computed
    activeFeature,
    all,
    allCandidate,
    allSelected,
    collection,
    hasFeatures,
    hoveredFeature,
    hasPac,
    isDirty,
    selectedFeatures,
    // methods
    $reset,
    bindFeatureState,
    bindFeatureInteraction,
    getFeatureById,
    select,
    setSelectedIds,
    setAll,
    setCandidate,
    commitCandidate,
    toggleAllSelected,
    toggleSingleSelected,
    unselectAll,
    unselect,
    updateSingleFeature,
    updateFeatureCollectionProperties,
    deleteSingleFeature,
    updateMatchingFeatures,
  };
});
