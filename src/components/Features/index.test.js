import { describe, test, expect, vi } from 'vitest'
import {
  applyCadastreGeometries,
  FeatureNotFoundError,
  bounds,
  createGroupingKeys,
  cultureLabel,
  diff,
  featureName,
  getFeatureGroups,
  groupingChoices,
  sortByAccessor
} from './index.js'
import { GROUPE_NONE, GROUPE_CULTURE, GROUPE_ILOT, GROUPE_NIVEAU_CONVERSION } from './index.js'
import { feature as newFeature, featureCollection } from '@turf/helpers'
import axios from 'axios'
import { legalProjectionSurface } from "@/utils/features.js"

const geometry = {
  type: "Polygon",
  coordinates: [
    [
      [
        5.00742078063729,
        44.71418584175069
      ],
      [
        5.00619098801252,
        44.71418584175069
      ],
      [
        5.00619098801252,
        44.71353436914191
      ],
      [
        5.00742078063729,
        44.71353436914191
      ],
      [
        5.00742078063729,
        44.71418584175069
      ]
    ]
  ]
}

const feature = {
  "type": "Feature",
  "properties": {
    "reference": true
  },
  "geometry": {
    "coordinates": [
      [
        [
          2.825121146516608,
          44.30042614674991
        ],
        [
          2.825121146516608,
          44.260111501833876
        ],
        [
          2.901018077685336,
          44.260111501833876
        ],
        [
          2.901018077685336,
          44.30042614674991
        ],
        [
          2.825121146516608,
          44.30042614674991
        ]
      ]
    ],
    "type": "Polygon"
  }
}

const disjointCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              2.90958708604353,
              44.2513437881818
            ],
            [
              2.90958708604353,
              44.218891881070846
            ],
            [
              2.9695701445478733,
              44.218891881070846
            ],
            [
              2.9695701445478733,
              44.2513437881818
            ],
            [
              2.90958708604353,
              44.2513437881818
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}

const overlappingFeatureCollection = {
  ...disjointCollection,
  features: [...disjointCollection.features, {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "coordinates": [
        [
          [
            2.868473399543859,
            44.27746261051493
          ],
          [
            2.868473399543859,
            44.236778856895285
          ],
          [
            2.9383267386661487,
            44.236778856895285
          ],
          [
            2.9383267386661487,
            44.27746261051493
          ],
          [
            2.868473399543859,
            44.27746261051493
          ]
        ]
      ],
      "type": "Polygon"
    }
  }]
}

describe('diff', () => {
  test('feature remains untouched', () => {
    expect(diff(feature, disjointCollection)).toEqual(feature)
  })

  test('feature does not contain overlapping area', () => {
    expect(diff(feature, overlappingFeatureCollection)).toEqual({
      ...feature,
      geometry: {
        "coordinates": [
          [
            [
              2.825121146516608,
              44.260111501833876
            ],
            [
              2.868473399543859,
              44.260111501833876
            ],
            [
              2.868473399543859,
              44.27746261051493
            ],
            [
              2.901018077685336,
              44.27746261051493
            ],
            [
              2.901018077685336,
              44.30042614674991
            ],
            [
              2.825121146516608,
              44.30042614674991
            ],
            [
              2.825121146516608,
              44.260111501833876
            ]
          ]
        ],
        "type": "Polygon"
      }
    })
  })
})

describe('createGroupingKeys', () => {
  test('group on single items', () => {
    expect(createGroupingKeys(['01.92', 'AB', 2019])).toEqual(['01.92-AB-2019'])
  })

  test('group on multiple items', () => {
    expect(createGroupingKeys([['01.92', '01.26.1'], 'AB', 2019])).toEqual(['01.92-AB-2019', '01.26.1-AB-2019'])
    expect(createGroupingKeys([['01.21.12', '01.21.12'], 'AB', 2019])).toEqual(['01.21.12-AB-2019'])
  })
})

describe('getFeatureGroups()', () => {
  const feature1 = {
    type: "Feature",
    geometry,
    properties: {
      conversion_niveau: 'AB',
      NUMERO_I: '1',
      cultures: [
        {
          CPF: '01.26.1'
        }
      ]
    }
  }
  const feature2 = {
    type: "Feature",
    geometry,
    properties: {
      NUMERO_I: '2',
      conversion_niveau: 'AB',
      cultures: [
        {
          CPF: '01.21.12',
          surface: '7.0000'
        },
        {
          CPF: '01.92',
          surface: '1.0000'
        }
      ]
    }
  }

  const feature3 = {
    type: "Feature",
    geometry,
    properties: {
      NUMERO_I: '2',
      conversion_niveau: 'C1',
      cultures: [
        {
          CPF: '01.21.12',
          surface: '7.0000'
        }
      ]
    }
  }

  const feature4 = {
    type: "Feature",
    geometry,
    properties: {
      id: '99999',
      cultures: []
    }
  }

  test('collection is not split if there an explicit pivot of NONE', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2]
    }

    expect(getFeatureGroups(collection, GROUPE_NONE)).toEqual([
      {
        label: '',
        key: 'none',
        pivot: GROUPE_NONE,
        features: collection.features,
        surface: '1,41'
      }
    ])
    expect(getFeatureGroups(collection, [])).toEqual([
      {
        label: '',
        key: 'none',
        pivot: [],
        features: collection.features,
        surface: '1,41'
      }
    ])
  })

  test('collection is split in three groups based on a single value field (GROUPE_ILOT)', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2, feature4]
    }

    const expectation = [
      {
        label: 'Îlot 1',
        key: '1',
        mainKey: '1',
        pivot: GROUPE_ILOT,
        features: [feature1],
        surface: 7048.2314453125,
      },
      {
        label: 'Îlot 2',
        key: '2',
        mainKey: '2',
        pivot: GROUPE_ILOT,
        features: [feature2],
        surface: 7048.2314453125,
      },
      {
        label: 'Non précisé ou hors-PAC',
        key: '__nogroup__',
        mainKey: '__nogroup__',
        pivot: GROUPE_ILOT,
        features: [feature4],
        surface: 7048.2314453125,
      }
    ]

    expect(getFeatureGroups(collection, GROUPE_ILOT)).toEqual(expectation)
  })

  test('collection is split in three groups, based on multiple value field (GROUPE_CULTURE)', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2, feature4]
    }

    const expectation = [
      {
        label: 'Absence de culture',
        key: '__nogroup__',
        mainKey: '__nogroup__',
        pivot: GROUPE_CULTURE,
        features: [feature4],
        surface: 7048.2314453125,
      },
      {
        label: 'Gel fixe, friche, gel spécifique n’entrant pas en rotation',
        key: '01.92',
        mainKey: '01.92',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7048.2314453125,
      },
      {
        label: 'Olives',
        key: '01.26.1',
        mainKey: '01.26.1',
        pivot: GROUPE_CULTURE,
        features: [feature1],
        surface: 7048.2314453125,
      },
      {
        label: 'Raisin de cuve',
        key: '01.21.12',
        mainKey: '01.21.12',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7048.2314453125,
      }
    ]

    expect(getFeatureGroups(collection, GROUPE_CULTURE)).toEqual(expectation)
    expect(getFeatureGroups(collection)).toEqual(expectation)
  })

  test('collection is split in four groups, based on multiple value field and multiple pivot (GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION)', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2, feature3, feature4]
    }

    const expectation = [
      {
        label: 'Absence de culture',
        key: '__nogroup__-__nogroup__',
        mainKey: '__nogroup__',
        pivot: GROUPE_CULTURE,
        features: [feature4],
        surface: 7048.2314453125,
      },
      {
        label: 'Gel fixe, friche, gel spécifique n’entrant pas en rotation',
        key: '01.92-AB',
        mainKey: '01.92',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7048.2314453125,
      },
      {
        label: 'Olives',
        key: '01.26.1-AB',
        mainKey: '01.26.1',
        pivot: GROUPE_CULTURE,
        features: [feature1],
        surface: 7048.2314453125,
      },
      {
        label: 'Raisin de cuve',
        key: '01.21.12-AB',
        mainKey: '01.21.12',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7048.2314453125,
      },
      {
        label: 'Raisin de cuve',
        key: '01.21.12-C1',
        mainKey: '01.21.12',
        pivot: GROUPE_CULTURE,
        features: [feature3],
        surface: 7048.2314453125,
      }
    ]

    expect(getFeatureGroups(collection, [GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION])).toEqual(expectation)
  })
})

describe('cultureLabel', () => {
  test('returns CPF label', () => {
    const feature = {
      id: 1,
      properties: {
        cultures: [{ CPF: '01.21.12' }]
      }
    }

    expect(cultureLabel(feature.properties.cultures.at(0))).toEqual('Raisin de cuve')
  })

  test('returns unknown CPF label', () => {
    const feature = {
      id: 1,
      properties: {
        cultures: [{ CPF: '999.990.999' }]
      }
    }

    expect(cultureLabel(feature.properties.cultures.at(0))).toEqual(groupingChoices[GROUPE_CULTURE].labelUnknown)
  })

  test('returns unknown culture label', () => {
    expect(cultureLabel(undefined)).toEqual(groupingChoices[GROUPE_CULTURE].labelNoGroup)
    expect(cultureLabel()).toEqual(groupingChoices[GROUPE_CULTURE].labelNoGroup)
    expect(cultureLabel('')).toEqual(groupingChoices[GROUPE_CULTURE].labelNoGroup)
  })
})

describe('featureName', () => {
  test('no name to be found', () => {
    const feature = {
      id: 1,
      properties: {}
    }

    expect(featureName(feature)).toEqual('-')
    expect(featureName(feature, { placeholder: '' })).toEqual('')
  })

  test('get as custom name', () => {
    const feature = {
      id: 1,
      properties: {
        NOM: 'Les muriers'
      }
    }

    expect(featureName(feature)).toEqual('Les muriers')
    expect(featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.' })).toEqual('Les muriers')
  })

  test('get as ILOT.PARCELLE (PAC reference)', () => {
    const feature = {
      id: 1,
      properties: {
        NUMERO_I: '1',
        NUMERO_P: '1'
      }
    }

    expect(featureName(feature)).toEqual('ilot 1, parcelle 1')
    expect(featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.' })).toEqual('1.1')
  })

  test('get as ILOT.PARCELLE + NOM', () => {
    const feature = {
      id: 1,
      properties: {
        NOM: 'les muriers',
        NUMERO_I: '1',
        NUMERO_P: '1'
      }
    }

    expect(featureName(feature)).toEqual('ilot 1, parcelle 1 (les muriers)')
    expect(featureName(feature, { explicitName: false, ilotLabel: '', parcelleLabel: '', separator: '.' })).toEqual('1.1')
    expect(featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.' })).toEqual('1.1 (les muriers)')
  })

  test('get as ILOT (because PARCELLE is not parseable)', () => {
    const feature = {
      id: 1,
      properties: {
        NUMERO_I: '1',
        NUMERO_P: '???'
      }
    }

    expect(featureName(feature)).toEqual('ilot 1')
    expect(featureName(feature, { ilotLabel: '', parcelleLabel: '', separator: '.' })).toEqual('1')
  })

  test('get as a single cadastre ref (without prefix)', () => {
    const feature = {
      id: 1,
      properties: {
        cadastre: '26108000ZI0239'
      }
    }

    expect(featureName(feature)).toEqual('Reférence cadastrale ZI 0239')
  })

  test('get as a single cadastre ref (with prefix)', () => {
    const feature = {
      id: 1,
      properties: {
        cadastre: '26108001ZI0239'
      }
    }

    expect(featureName(feature)).toEqual('Reférence cadastrale 001 ZI 0239')
  })

  test('get as multiple cadastre ref', () => {
    const feature = {
      id: 1,
      properties: {
        cadastre: ['26108001ZI0239', '26108001ZI0240']
      }
    }

    expect(featureName(feature)).toEqual('Parcelles 0239, 0240')
    expect(featureName(feature, { separator: '-'})).toEqual('Parcelles 0239-0240')
  })
})

describe('bounds', () => {
  const DEFAULT_BOUNDS = bounds.DEFAULT_BOUNDS

  test('returns default bounds with an empty/null object', () => {
    expect(bounds(featureCollection([]))).toEqual(DEFAULT_BOUNDS)
    expect(bounds(null)).toEqual(DEFAULT_BOUNDS)
  })

  test('it works with anormal empty geometries', () => {
    const emptyGeometryFeature = {
      ...feature,
      geometry: {
        type: 'Polygon',
        coordinates: []
      },
    }
    expect(bounds(featureCollection([emptyGeometryFeature]))).toEqual(DEFAULT_BOUNDS)
  })

  test('it works with regular GeoJSON objects', () => {
    expect(bounds(geometry)).toEqual([5.00619098801252, 44.71353436914191, 5.00742078063729, 44.71418584175069])
    expect(bounds(feature)).toEqual([2.825121146516608, 44.260111501833876, 2.901018077685336, 44.30042614674991])
    expect(bounds(overlappingFeatureCollection)).toEqual([2.868473399543859, 44.218891881070846, 2.9695701445478733, 44.27746261051493])
  })
})

describe('sortByAccessor()', () => {
  const obj1 = {
    properties: {
      name: 'AAA',
      NUMERO_I: 2
    }
  }

  const obj2 = {
    properties: {
      name: 'ZZZ',
      NUMERO_I: 1
    }
  }

  const obj3 = {
    properties: {}
  }

  test('it sorts numerical values', () => {
    const sortFn = sortByAccessor(f => f.properties.NUMERO_I || Infinity)
    expect([obj1, obj2, obj3].sort(sortFn)).toEqual([obj2, obj1, obj3])
  })

  test('it sorts alpha values as well', () => {
    const sortFn = sortByAccessor(f => f.properties.name || '')
    expect([obj1, obj2, obj3].sort(sortFn)).toEqual([obj3, obj1, obj2])
  })
})

describe('legalProjectionSurface', () => {
  test('with a FeatureCollection', () => {
    expect(legalProjectionSurface(overlappingFeatureCollection)).toBeCloseTo(42482781.974121094, 1)
  })

  test('with an array of Features', () => {
    expect(legalProjectionSurface([feature])).toBeCloseTo(27130107.84790039, 1)
  })

  test('with a Feature', () => {
    expect(legalProjectionSurface(feature)).toBeCloseTo(27130107.84790039, 1)
  })
})

describe('applyCadastreGeometries()', () => {
  const baseCollection = featureCollection([
    {
      id: 1,
      type: 'Feature',
      properties: {
        cadastre: ['014000000D0006'],
        cultures: [{ id: 1, CPF: '01.21.12', variete: '1511' }]
      }
    },
    {
      id: 2,
      type: 'Feature',
      properties: {
        cadastre: ['010640000A0542'],
        cultures: [{ id: 1, CPF: '01.21.12', variete: '1511' }]
      }
    }
  ])

  const coordinates = [[ [5.493242, 45.786051], [5.493575, 45.786161], [5.493797, 45.786222], [5.493977, 45.786274], [5.493908, 45.786348], [5.494475, 45.786546], [5.49448, 45.786536], [5.494527, 45.78643], [5.494579, 45.786321], [5.493653, 45.786048], [5.493292, 45.785947], [5.493242, 45.786051] ]]

  vi.mocked(axios.get).mockResolvedValue({
    data: featureCollection([
      {
        type: 'Feature',
        geometry: {
          type: 'Point'
        },
        properties: {
          id: '014000000D0447',
          departmentcode: '01',
          municipalitycode: '400',
          section: 'OD',
          sheet: '03',
          number: '0006',
          city: 'Seillonnaz',
          _type: 'parcel',
          truegeometry: {
            type: 'Polygon',
            coordinates
          }
        }
      }
    ])
  })

  test('two hits features', () => {
    const result = applyCadastreGeometries(baseCollection)

    const expectation = {
      featureCollection: featureCollection([
        newFeature(
          { type: 'Polygon', coordinates },
          { ...baseCollection.features.at(0).properties, COMMUNE_LABEL: 'Seillonnaz', COMMUNE: '01400' },
          { id: 1 }
        ),
        newFeature(
          { type: 'Polygon', coordinates },
          { ...baseCollection.features.at(1).properties, COMMUNE_LABEL: 'Seillonnaz', COMMUNE: '01400' },
          { id: 2 }
        )
      ]),
      warnings: []
    }

    return expect(result).resolves.toMatchObject(expectation)
  })

  test('one hit and one miss features', () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: featureCollection([])
    })

    const result = applyCadastreGeometries(baseCollection)

    const expectation = {
      featureCollection: featureCollection([
        newFeature(
          { type: 'Polygon', coordinates },
          { ...baseCollection.features.at(1).properties, COMMUNE_LABEL: 'Seillonnaz', COMMUNE: '01400' },
          { id: 2 }
        )
      ]),
      warnings: [new FeatureNotFoundError('014000000D0006')]
    }

    return expect(result).resolves.toMatchObject(expectation)
  })
})


