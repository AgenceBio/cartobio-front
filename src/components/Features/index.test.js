import { describe, test, expect } from 'vitest'
import { createGroupingKeys, diff, getFeatureGroups, GROUPE_CULTURE, GROUPE_ILOT, GROUPE_NIVEAU_CONVERSION } from './index.js'

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

  test('collection is split in two groups based on a single value field', async () => {
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
