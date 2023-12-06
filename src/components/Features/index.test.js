import { describe, test, expect } from 'vitest'
import { bounds, createGroupingKeys, diff, featureName, getFeatureGroups, surface } from './index.js'
import { GROUPE_NONE, GROUPE_CULTURE, GROUPE_ILOT, GROUPE_NIVEAU_CONVERSION } from './index.js'
import { featureCollection } from '@turf/helpers'

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

  test('collection is split in two groups based on a single value field', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2]
    }

    const expectation = [
      {
        label: 'Îlot 1',
        key: '1',
        mainKey: '1',
        pivot: GROUPE_ILOT,
        features: [feature1],
        surface: 7055.2689844296965,
      },
      {
        label: 'Îlot 2',
        key: '2',
        mainKey: '2',
        pivot: GROUPE_ILOT,
        features: [feature2],
        surface: 7055.2689844296965,
      }
    ]

    expect(getFeatureGroups(collection, GROUPE_ILOT)).toEqual(expectation)
  })

  test('collection is split in two groups, based on multiple value field', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2]
    }

    const expectation = [
      {
        label: 'Gel fixe, friche, gel spécifique n’entrant pas en rotation',
        key: '01.92',
        mainKey: '01.92',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7055.2689844296965,
      },
      {
        label: 'Olives',
        key: '01.26.1',
        mainKey: '01.26.1',
        pivot: GROUPE_CULTURE,
        features: [feature1],
        surface: 7055.2689844296965,
      },
      {
        label: 'Raisin de cuve',
        key: '01.21.12',
        mainKey: '01.21.12',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7055.2689844296965,
      }
    ]

    expect(getFeatureGroups(collection, GROUPE_CULTURE)).toEqual(expectation)
    expect(getFeatureGroups(collection)).toEqual(expectation)
  })

  test('collection is split in four groups, based on multiple value field and multiple pivot', () => {
    const collection = {
      type: "FeatureCollection",
      features: [feature1, feature2, feature3]
    }

    const expectation = [
      {
        label: 'Gel fixe, friche, gel spécifique n’entrant pas en rotation',
        key: '01.92-AB',
        mainKey: '01.92',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7055.2689844296965,
      },
      {
        label: 'Olives',
        key: '01.26.1-AB',
        mainKey: '01.26.1',
        pivot: GROUPE_CULTURE,
        features: [feature1],
        surface: 7055.2689844296965,
      },
      {
        label: 'Raisin de cuve',
        key: '01.21.12-AB',
        mainKey: '01.21.12',
        pivot: GROUPE_CULTURE,
        features: [feature2],
        surface: 7055.2689844296965,
      },
      {
        label: 'Raisin de cuve',
        key: '01.21.12-C1',
        mainKey: '01.21.12',
        pivot: GROUPE_CULTURE,
        features: [feature3],
        surface: 7055.2689844296965,
      }
    ]

    expect(getFeatureGroups(collection, [GROUPE_CULTURE, GROUPE_NIVEAU_CONVERSION])).toEqual(expectation)

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

  test('get as ILOT (because PARCELLE is not parseable)', () => {
    const feature = {
      id: 1,
      properties: {
        NUMERO_I: '1',
        NUMERO_P: '???'
      }
    }

    expect(featureName(feature)).toEqual('ilot 1')
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

  test('it works with regular GeoJSON objects', () => {
    expect(bounds(geometry)).toEqual([5.00619098801252, 44.71353436914191, 5.00742078063729, 44.71418584175069])
    expect(bounds(feature)).toEqual([2.825121146516608, 44.260111501833876, 2.901018077685336, 44.30042614674991])
    expect(bounds(overlappingFeatureCollection)).toEqual([2.868473399543859, 44.218891881070846, 2.9695701445478733, 44.27746261051493])
  })
})

describe('surface', () => {
  test('with a FeatureCollection', () => {
    expect(surface(overlappingFeatureCollection)).toBeCloseTo(42505773.88, 1)
  })

  test('with an array of Features', () => {
    expect(surface([feature])).toBeCloseTo(27145758.11, 1)
  })

  test('with a Feature', () => {
    expect(surface(feature)).toBeCloseTo(27145758.11, 1)
  })

  test('with a Geometry', () => {
    expect(surface(geometry)).toBeCloseTo(7055.26, 1)
  })
})
