<template>
  <Fragment>
    <input type="search" ref="input" :list="listId" v-model="search" @input="handleInputChange" autocomplete="disabled" />
    <datalist :id="listId">
      <option v-for="item in items" :key="getValue(item)+getText(item)" :value="getValue(item)">{{ getText(item) }}</option>
    </datalist>
  </Fragment>
</template>
<script>
import {Fragment} from 'vue-fragment'

export default {
  components: {
    Fragment
  },

  props: {
    appendIcon: {
      default: 'search'
    },
    hideNoData: {
      default: true
    },
    openOnClear: {
      default: true
    },
    lastItem: {
      type: Number,
      default: 20
    },
    itemText: {
      default: 'text'
    },
    itemValue: {
      default: 'value'
    }
  },

  data () {
    return {
      items: [],
      listId: 'list-' + (Math.random() * 1000000),
      selectedItem: null,
      search: ''
    }
  },

  created () {
    if (this.$attrs.value) {
      this.selectItem(this.$attrs.value)
    }

    // this.$on('update:searchInput', (value) => this.search = value)
  },

  // beforeUpdate () {
  //   if (this.value !== undefined) {
  //     this.items = this.searchFor({ val: this.value, accessor: this.getValue })
  //   }
  // },

  computed: {
    textValue () {
      return this.selectedItem ? this.getText(this.selectedItem) : this.value
    }
  },

  methods: {
    getValue (item) {
      const {itemValue} = this
      return typeof itemValue === 'function' ? itemValue(item) : item[itemValue]
    },

    getText (item) {
      const {itemText} = this
      return typeof itemText === 'function' ? itemText(item) : item[itemText]
    },

    handleInputChange ($event) {
      const val = $event.target.value

      // listen to datalist selection
      if ($event.inputType === 'insertReplacementText') {
        this.selectItem(val)
        return
      }

      // perform a search
      if (val && val.length > 2) {
        this.items = this.searchFor({ val, accessor: this.getText })
      }

      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },

    selectItem (val) {
      this.selectedItem = this.searchOne({ val, accessor: this.getValue })
      this.search = this.getText(this.selectedItem)
    },

    searchFor ({ val, accessor }) {
      if (val === undefined) {
        return []
      }

      const searches = (Array.isArray(val) ? val : [val]).map(v => v.toLocaleLowerCase())
      const entries = this.$attrs['lazy-items']()

      return entries
        .filter(item => searches.find(search => accessor(item).toLocaleLowerCase().includes(search)))
        .slice(0, this.lastItem)
    },

    searchOne ({ val, accessor }) {
      return this.$attrs['lazy-items']().find((item => accessor(item) === val))
    }
  },

  watch: {
    selectedItem (item) {
      this.$emit('input', this.getValue(item))
    }
  }
}
</script>
