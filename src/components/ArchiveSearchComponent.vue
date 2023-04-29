<template>
  <QDialog square @show="indexAllDocuments">
    <QCard
      :style="{
        'min-width': $q.platform.is.desktop ? '380px' : '',
      }"
      :class="{
        'full-width': $q.platform.is.mobile,
        'fixed-top': $q.platform.is.mobile,
      }"
    >
      <QCardSection>
        <div class="text-h6 non-selectable">{{ $t('archive.search') }}</div>
      </QCardSection>
      <QCardSection class="q-pt-none no-border">
        <QForm greedy autofocus>
          <QTooltip>
            {{ $t('archive.tooltip') }}
          </QTooltip>
          <QSelect
            v-model="searchText"
            autocomplete="off"
            spellcheck="false"
            color="secondary"
            bg-color="white"
            input-debounce="50"
            :options="searchOptions"
            :label="$t('searchDialog.searchText')"
            use-input
            hide-dropdown-icon
            rounded
            hide-selected
            autofocus
            filled
            outlined
            square
            fill-input
            new-value-mode="add-unique"
            @update:model-value="onSearchText"
            @filter="onFilterSelect"
          >
            <template #append>
              <QIcon name="search" />
            </template>
            <template #no-option>
              <QItem>
                <QItemSection class="text-grey non-selectable">
                  {{ $t('archive.notfound') }}
                </QItemSection>
              </QItem>
            </template>
          </QSelect>
        </QForm>
      </QCardSection>
      <QCardActions align="right" class="text-primary">
        <QBtn
          v-close-popup
          flat
          color="accent"
          :dense="$q.platform.is.desktop"
          :label="$t('searchDialog.cancel')"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  useQuasar,
  QDialog,
  QSelect,
  QBtn,
  QItem,
  QCard,
  QItemSection,
  QCardSection,
  QForm,
  QIcon,
  QTooltip,
  QCardActions,
} from 'quasar'
import MiniSearch from 'minisearch'
import { db } from '../services/databaseHelper'

const emit = defineEmits(['onSearch'])

const $q = useQuasar()

const searchText = ref('')
const searchOptions = ref([])

const miniSearch: MiniSearch = new MiniSearch({
  fields: ['instrument_name', 'instrument_description'],
  storeFields: ['instrument_name', 'instrument_description'],
})

function onSearchText(value: string) {
  if (!value.length) {
    return
  }
  emit('onSearch', value)
  searchText.value = ''
}

async function indexAllDocuments() {
  if (miniSearch.documentCount === 0) {
    const documents = await db.getFulltextDocument()
    await miniSearch.addAllAsync(documents)
  }
}

function onFilterSelect(
  val: string,
  // eslint-disable-next-line no-unused-vars
  update: (callback: () => void, callback2: (ref: QSelect) => void) => void,
  abort: () => void,
) {
  if (val.length < 3) {
    abort()
    return
  }

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
</script>
