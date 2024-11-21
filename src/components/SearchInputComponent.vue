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
    :behavior="$q.platform.is.ios ? 'dialog' : 'menu'"
    input-class="text-right q-pb-md"
    use-input
    hide-dropdown-icon
    hide-selected
    stack-label
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
    <template #prepend>
      <QBtn
        icon="arrow_drop_down"
        flat
        square
        :fab-mini="$q.platform.is.desktop"
        :fab="!$q.platform.is.desktop"
      >
        <QMenu>
          <QList>
            <QItem v-close-popup clickable @click="filterType">
              <QItemSection>Недавно добавленные</QItemSection>
            </QItem>
            <QItem v-close-popup clickable @click="filterType">
              <QItemSection>Скоро заканчивающиеся</QItemSection>
            </QItem>
            <QItem v-close-popup clickable @click="filterType">
              <QItemSection>Недавно закрытые</QItemSection>
            </QItem>
          </QList>
        </QMenu>
      </QBtn>
    </template>
    <template #no-option>
      <QItem>
        <QItemSection class="text-grey non-selectable">
          {{ $t('archive.notfound') }}
        </QItemSection>
      </QItem>
    </template>
    <template #append>
      <template v-if="!searching">
        <QIcon v-if="!hasText" name="search" />
        <QIcon v-else name="clear" class="cursor-pointer" @click="clearText" />
      </template>
      <template v-else-if="searching">
        <QSpinner color="primary" />
      </template>
    </template>
  </QSelect>
</template>
<script lang="ts" setup>
import { ref, onMounted, PropType } from 'vue'
import {
  useQuasar,
  QBtn,
  QSelect,
  QItem,
  QItemSection,
  QSpinner,
  QIcon,
  QMenu,
  QList,
} from 'quasar'
import { miniSearch } from '../services/searchService'

const $q = useQuasar()
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

function filterType() {
  alert('WIP')

  // Filter like this?
  // const filtered = contractDates
  //   .filter(({ start, end }) => {
  //     return start >= date || date <= end
  //   })
  //   .map(({ id }) => id)
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
