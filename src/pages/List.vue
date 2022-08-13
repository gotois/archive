<template>
  <q-page padding class="col justify-center full-height">
    <q-inner-loading :showing="loadingVisible">
      <q-spinner-hourglass
        color="info"
        size="6em"
      />
    </q-inner-loading>
    <archive-list-component
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
import {Router, useRouter, LocationQuery} from 'vue-router'
import {Store as VuexStore} from 'vuex'
import {useMeta} from 'quasar'
import {StateInterface, useStore} from '../store'
import {contractTypes} from '../services/contractTypes'
import ArchiveListComponent from 'components/ArchiveListComponent.vue'

const metaData = {
  title: 'Архив',
}

let router: Router
let store: VuexStore<StateInterface>

const searchText = ref('')
const limit = ref(5)
const loadingVisible = ref(true)

async function onPaginate(page: number) {
  loadingVisible.value = true
  await router.push({
    name: router.currentRoute.value.name,
    query: {
      page: page,
      filter: router.currentRoute.value.query?.filter
    },
  })
}

async function updateContracts({ page, filter }: LocationQuery|{page: number, filter: string}) {
  page = Number(page || 1)
  const offset = (page - 1) * limit.value
  const query = String(filter ?? '')

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
  loadingVisible.value = false
}

function main() {
  store = useStore()
  router = useRouter()
  useMeta(metaData)

  router.afterEach((to) => updateContracts(to.query))
  void (updateContracts)(router.currentRoute.value.query)

  return {
    searchText,
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
  setup() {
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
