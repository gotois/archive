<template>
  <q-dialog square @show="indexAllDocuments">
    <q-card
      :style="{
        'min-width': $q.platform.is.desktop ? '380px' : '',
      }"
      :class="{
        'full-width': $q.platform.is.mobile,
        'fixed-top': $q.platform.is.mobile,
      }"
    >
      <q-card-section>
        <div class="text-h6 non-selectable">{{ $t('archive.search') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none no-border">
        <q-form greedy autofocus>
          <q-tooltip>
            {{ $t('archive.tooltip') }}
          </q-tooltip>
          <q-select
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
            new-value-mode="add-unique"
            clearable
            fill-input
            @filter="onFilterSelect"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ $t('archive.notfound') }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-form>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn
          v-close-popup
          flat
          :dense="$q.platform.is.desktop"
          :label="$t('searchDialog.cancel')"
        />
        <q-btn
          v-close-popup
          color="accent"
          icon-right="search"
          :outline="searchOptions.length === 0"
          :disable="searchOptions.length === 0"
          :dense="$q.platform.is.desktop"
          :label="$t('searchDialog.search')"
          @click="onSearchText"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { QSelect, useQuasar } from 'quasar'
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

function onSearchText() {
  if (!searchText.value.length) {
    return
  }
  emit('onSearch', searchText.value)
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
