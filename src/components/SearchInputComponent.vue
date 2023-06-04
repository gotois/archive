<template>
  <QSelect
    ref="select"
    v-model.trim="searchText"
    autocomplete="off"
    spellcheck="false"
    color="primary"
    label-color="primary"
    input-debounce="50"
    :options="searchOptions"
    :label="label"
    :loading="searching"
    input-class="text-right q-pb-md"
    use-input
    hide-dropdown-icon
    rounded
    hide-selected
    autofocus
    filled
    outlined
    square
    standout
    fill-input
    new-value-mode="add-unique"
    @update:model-value="onSearchText"
    @filter="onFilterSelect"
  >
    <template v-if="!searching" #append>
      <QIcon v-if="!hasText" name="search" />
      <QIcon v-else name="clear" class="cursor-pointer" @click="clearText" />
    </template>
    <template #no-option>
      <QItem>
        <QItemSection class="text-grey non-selectable">
          {{ $t('archive.notfound') }}
        </QItemSection>
      </QItem>
    </template>
  </QSelect>
</template>
<script lang="ts" setup>
import { ref, onMounted, PropType } from 'vue'
import { QSelect, QItem, QItemSection, QIcon } from 'quasar'
import { miniSearch } from '../services/searchService'

const select = ref<InstanceType<typeof QSelect> | null>(null)
const searchText = ref('')
const searchOptions = ref([])
const searching = ref(false)
const hasText = ref(false)

const emit = defineEmits(['search'])

defineProps({
  label: {
    type: String as PropType<string>,
    default: '',
  },
})

function onSearchText(value: string) {
  if (!value.length) {
    return
  }
  emit('search', value)
  select.value.blur()
  clearText()
}

function clearText() {
  searchText.value = ''
  select.value.updateInputValue('')
  searchOptions.value = []
  hasText.value = false
  searching.value = false
}
function onFilterSelect(
  val: string,
  update: (callback: () => void, callback2: (ref: QSelect) => void) => void,
  abort: () => void,
) {
  if (val.length < 3) {
    abort()
    return
  }
  searching.value = true
  hasText.value = true

  abort()
  setTimeout(() => {
    update(
      () => {
        if (val === '') {
          /* empty */
        } else {
          const suggestionElement = new Set()
          miniSearch.autoSuggest(val, {
            fuzzy: (term) => (term.length > 3 ? 0.2 : null),
            processTerm: (term) => term.toLowerCase(),
            boost: {
              instrument_name: 2,
            },
            prefix: true,
            filter: (searchResult) => {
              if (suggestionElement.has(searchResult.instrument_name)) {
                return false
              }
              suggestionElement.add(searchResult.instrument_name)
              return true
            },
          })
          searchOptions.value = Array.from(suggestionElement)
        }
        searching.value = false
      },
      (ref) => {
        if (
          val !== '' &&
          ref.options.length > 0 &&
          ref.getOptionIndex() === -1
        ) {
          ref.setOptionIndex(-1)
          ref.moveOptionSelection(1, true)
        }
      },
    )
  }, 500)
}

onMounted(() => {
  select.value.showPopup()
  select.value.focus()
})
</script>
