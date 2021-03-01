<script>
import VAutoComplete from 'vuetify/lib/components/VAutocomplete'

export default VAutoComplete.extend({
  inheritAttrs: true,

  data () {
    return {
      search: null
    }
  },

  created () {
    this.$on('update:searchInput', (value) => this.search = value)
  },

  beforeUpdate () {
    if (this.value !== undefined) {
      this.cachedItems = this.searchFor({ val: this.value, accessor: this.getValue })
      this.setSelectedItems()
    }
  },

  methods: {
    searchFor ({ val, accessor }) {
      const searches = (Array.isArray(val) ? val : [val]).map(v => v.toLocaleLowerCase())
      const entries = this.$attrs['lazy-items']()

      return entries
        .filter(item => searches.find(search => accessor(item).toLocaleLowerCase().includes(search)))
        .slice(0, this.lastItem)
    }
  },

  watch: {
    search (val) {
      if (val && val.length > 2) {
        this.cachedItems = this.searchFor({ val, accessor: this.getText })
      }
    }
  }
})
</script>
