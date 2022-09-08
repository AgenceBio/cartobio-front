import Conversion from './Conversion.vue'
import Culture from './Culture.vue'
import Engagement from './Engagement.vue'

const actions = {
  UPDATE_CONVERSION: ({ feature, value }) => {
    feature.properties.conversion_niveau = value.niveau
    feature.properties.conversion_niveau_date = value.date
  },

  UPDATE_CULTURE: ({ feature, value }) => {
    feature.properties.TYPE = value
  },

  UPDATE_ENGAGEMENT: ({ feature, value }) => {
    feature.properties.engagement_date = value
  },
}


export { Conversion, Culture, Engagement, actions }
