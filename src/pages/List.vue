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
import {defineComponent, ref, watch} from 'vue'
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

const searchText = ref('INITIAL')
const limit = ref(5)
const currentPage = ref(1)
const loadingVisible = ref(true)

async function setContracts() {
  const offset = (currentPage.value - 1) * limit.value
  const query = searchText.value

  switch (router.currentRoute.value.name) {
    case 'search': {
      await store.dispatch('searchFromContracts', {query, offset, limit: limit.value})
      break
    }
    case 'filter': {
      await store.dispatch('filterFromContracts', {query})
      break
    }
    default: {
      await store.dispatch('loadAllContracts', {offset, limit: limit.value})
      break
    }
  }
}

function setValues({page, filter}: {page: number|string|string[], filter: string|string[]}) {
  currentPage.value = Number(page ?? 1)
  searchText.value = String(filter ?? '')
}

async function onPaginate(page: number) {
  const filter = searchText.value

  if (filter.length) {
    await router.push({
      name: 'filter',
      query: {
        page: Number(page),
        filter,
      },
    })
  } else {
    await router.push({
      name: 'archive',
      query: {
        page: Number(page),
      },
    })
  }
}

function main() {
  $q = useQuasar()
  store = useStore()
  router = useRouter()

  const {page, filter} = router.currentRoute.value.query
  setValues({
    page,
    filter,
  })

  return {
    searchText,
    currentPage,
    loadingVisible,
    onPaginate,
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'List',
  components: {
    ArchiveListComponent,
  },
  beforeRouteUpdate(to) {
    setValues({
      page: to.query.page,
      filter: to.query.filter,
    })
  },
  setup() {
    useMeta(metaData)

    watch(() => searchText.value, (async (newVal, oldValue) => {
      if (newVal === oldValue) {
        return
      }
      loadingVisible.value = true
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
    }))

    return main()
  },
  computed: {
    isSearch() {
      return Boolean(router.currentRoute.value.query.filter)
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
