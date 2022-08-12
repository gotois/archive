<template>
  <q-page padding class="col justify-center full-height">
    <q-inner-loading :showing="loadingVisible">
      <q-spinner-hourglass
        color="info"
        size="6em"
      />
    </q-inner-loading>
    <archive-list-component
      :page="currentPage"
      :loading="loadingVisible"
      :contracts="contracts"
      :pagination-count="paginationCount"
      @on-paginate="onPaginate"
    />
    <template v-if="!loadingVisible">
      <template v-if="paginationCount < 1">
        <div v-if="isSearch" class="col-12 q-pa-lg flex flex-center self-start">
          <q-banner inline-actions class="text-center text-black">
            <template #avatar>
              <q-icon name="explore" color="secondary" />
            </template>
            <template #default>
              {{ $t('archive.searchEmpty') }}
            </template>
            <template #action>
              <q-btn flat color="primary" label="Очистить" to="/archive" />
            </template>
          </q-banner>
        </div>
        <template v-else>
          <q-banner inline-actions class="col-12 q-pa-lg flex flex-center self-center text-black">
            <template #avatar>
              <q-icon name="add_task" color="secondary" />
            </template>
            <template #default>
              {{ archiveEmptyText }}
            </template>
            <template #action>
              <q-btn flat color="accent" label="Добавить" to="/create"/>
            </template>
          </q-banner>
        </template>
      </template>
    </template>
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-fab
        glossy
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
      >
        <q-fab-action push square color="primary" label="Создать документ" to="/create" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {Router, useRouter} from 'vue-router'
import {Store as VuexStore} from 'vuex'
import {QVueGlobals, useMeta, useQuasar} from 'quasar'
import {StateInterface, useStore} from '../store'
import {contractTypes} from '../services/contractTypes'
import ArchiveListComponent from 'components/ArchiveListComponent.vue'

const metaData = {
  title: 'Архив',
}

let $q: QVueGlobals
let router: Router
let store: VuexStore<StateInterface>

const searchText = ref('')
const limit = ref(5)
const currentPage = ref(1)
const loadingVisible = ref(false)

async function setContracts() {
  const offset = (currentPage.value - 1) * limit.value
  const queryFilter = searchText.value

  if (queryFilter.length > 0) { // searching
    await store.dispatch('searchFromContracts', {queryFilter: queryFilter, offset, limit: limit.value})
  } else { // all
    await store.dispatch('loadAllContracts', {offset, limit: limit.value})
  }
}

function setValues({page, filter}: {page: string|string[], filter: string|string[]}) {
  currentPage.value = Number(page ?? 1)
  searchText.value = String(filter ?? '')
}

function onPaginate(page: number): void {
  const filter = searchText.value

  if (filter.length) {
    void router.push({
      path: 'archive',
      query: {
        page: Number(page),
        filter,
      },
    })
  } else {
    void router.push({
      path: 'archive',
      query: {
        page: Number(page),
      },
    })
  }
}

function routerFunc() {
  const {page, filter} = router.currentRoute.value.query
  setValues({
    page,
    filter,
  })
  loadingVisible.value = true

  void (async (): Promise<void> => {
    try {
      await setContracts()
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: 'Связь с базой данных не установлена',
        timeout: 1000 * 1000,
        actions: [
          {
            label: 'Закрыть',
            color: 'white',
            handler: () => { /* ... */ },
          },
        ],
      })
    } finally {
      loadingVisible.value = false
    }
  })()

  return {
    onPaginate,
  }
}

function main() {
  $q = useQuasar()
  router = useRouter()
  store = useStore()

  return {
    searchText,
    currentPage,
    loadingVisible,
    ...routerFunc(),
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'List',
  components: {
    ArchiveListComponent,
  },
  async beforeRouteUpdate(to) {
    setValues({
      page: to.query.page,
      filter: to.query.filter,
    })
    await setContracts()
  },
  setup() {
    useMeta(metaData)
    return main()
  },
  computed: {
    isSearch() {
      return Boolean(this.$router.currentRoute.value.query.filter)
    },
    archiveEmptyText() {
      const randomContractType = Math.floor(Math.random() * (contractTypes.length - 1))
      return this.$t('archive.empty') + '. Например: ' + contractTypes[randomContractType].toLowerCase() + '.'
    },
    contracts() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      return Array.from(store.getters.contracts)
    },
    paginationCount() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return Math.ceil(store.getters.contractsCount / limit.value)
    },
  },
})
</script>
