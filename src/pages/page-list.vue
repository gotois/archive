<template>
  <q-page>
    <q-inner-loading :showing="loadingVisible && isContractsEmpty">
      <q-spinner-hourglass
        color="info"
        size="6em"
      />
    </q-inner-loading>
    <q-scroll-area v-show="!isContractsEmpty" ref="scrollAreaRef" visible class="absolute-full fit">
      <archive-list-component
        :loading="loadingVisible"
        :contracts="contracts"
        class="q-pa-md"
        :class="{
          'col-xs-6': $q.platform.is.desktop || $q.platform.is.ipad,
        }"
        :style="{
          margin: 'auto',
          width: $q.platform.is.desktop ? '600px' : 'auto'
        }"
        :pagination-count="paginationCount"
        @on-paginate="onPaginate"
        @on-remove="onRemove"
        @on-edit="onEdit"
      />
    </q-scroll-area>
    <template v-if="!loadingVisible && isContractsEmpty">
      <q-banner
        :class="{
          'col-6': $q.platform.is.desktop,
        }"
        rounded
        class="q-pa-lg flex absolute-center flex-center self-center text-black-9 text-center"
        style="width: 500px"
      >
        <template v-if="!isSearch" #avatar>
          <q-icon name="add_task" color="secondary" />
        </template>
        <template #default>
          <template v-if="isSearch">{{ $t('archive.searchEmpty') }}</template>
          <template v-else>{{ archiveEmptyText }}</template>
        </template>
        <template #action>
          <template v-if="isSearch">
            <q-btn flat color="accent" icon="explore" :label="$t('list.explore')" :to="{ name: 'archive', query: { page: 1 } }" />
          </template>
          <template v-else>
            <q-btn flat color="accent" :label="$t('list.add')" :to="{ name: 'create' }" />
          </template>
        </template>
      </q-banner>
    </template>
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-fab
        push
        hide-label
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
      >
        <q-fab-action push square color="primary" :label="$t('list.create')" :to="{ name: 'create' }" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import {ref, computed, getCurrentInstance, defineAsyncComponent} from 'vue'
import {useRouter, LocationQuery} from 'vue-router'
import {useMeta} from 'quasar'
import {useStore} from '../store'
import {contractTypes} from '../services/contractTypes'
import {FormatContract} from '../types/models'

const ArchiveListComponent = defineAsyncComponent(
  () => import('components/ArchiveListComponent.vue')
)

// eslint-disable-next-line @typescript-eslint/unbound-method
const {$t} = getCurrentInstance().appContext.config.globalProperties

const metaData = {
  title: 'Архив договоров',
  'og:title': 'Архив договоров',
}

const store = useStore()
const router = useRouter()

const limit = ref(5)
const loadingVisible = ref(true)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const scrollAreaRef = ref(null)

async function onPaginate(page: number) {
  loadingVisible.value = true
  await router.push({
    name: router.currentRoute.value.name,
    query: {
      page: page,
      filter: router.currentRoute.value.query?.filter
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  scrollAreaRef.value.setScrollPosition('vertical', 0, 150)
}

async function onRemove(item: FormatContract) {
  await store.dispatch('removeContract', item)
}

async function onEdit(item: FormatContract) {
  const value = window.prompt('Введите новое описание:')
  if (!value) {
    return
  }
  item.instrument.description = value
  await store.dispatch('editContract', item)
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

const isSearch = computed(() => {
  return Boolean(router.currentRoute.value.query.filter)
})

const archiveEmptyText = computed(() => {
  const randomContractType = Math.floor(Math.random() * (contractTypes.length - 1))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/restrict-plus-operands
  return $t('archive.empty') + '. Например: ' + contractTypes[randomContractType].toLowerCase() + '.'
})

const contracts = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
  return Array.from(store.getters.contracts)
})

const paginationCount = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return Math.ceil(store.getters.contractsCount / limit.value)
})

const isContractsEmpty = computed(() => {
  return contracts.value.length === 0
})

useMeta(metaData)

router.afterEach((to) => updateContracts(to.query))
void (updateContracts)(router.currentRoute.value.query)
</script>
