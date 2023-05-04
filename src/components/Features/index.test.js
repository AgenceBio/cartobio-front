import { describe, test, expect } from 'vitest'
import { diff } from './index.js'

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
