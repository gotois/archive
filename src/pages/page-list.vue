<template>
  <q-page>
    <q-inner-loading :showing="loadingVisible">
      <q-spinner-hourglass
        color="info"
        size="6em"
      />
    </q-inner-loading>
    <q-scroll-area v-show="!isContractsEmpty" visible style="height: calc(100vh - 100px);">
      <archive-list-component
        :loading="loadingVisible"
        :contracts="contracts"
        class="q-pa-md"
        :class="{
          'col-xs-6': $q.platform.is.desktop || $q.platform.is.ipad,
        }"
        style="margin: auto;"
        :style="{
          width: $q.platform.is.desktop ? '600px' : 'auto'
        }"
        :pagination-count="paginationCount"
        @on-paginate="onPaginate"
        @on-remove="onRemove"
      />
    </q-scroll-area>
    <template v-if="!loadingVisible && isContractsEmpty">
      <q-banner
        :inline-actions="!$q.platform.is.mobile"
        :class="{
          'col-6': $q.platform.is.desktop,
        }"
        class="q-pa-lg flex flex-center self-center text-black text-center"
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
            <q-btn flat color="accent" icon="explore" label="На главную" :to="{ name: 'archive', query: {page: 1} }" />
          </template>
          <template v-else>
            <q-btn flat color="accent" label="Добавить" :to="{ name: 'create' }" />
          </template>
        </template>
      </q-banner>
    </template>
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-fab
        glossy
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
      >
        <q-fab-action push square color="primary" label="Создать документ" :to="{ name: 'create' }" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import {ref, computed, getCurrentInstance} from 'vue'
import {useRouter, LocationQuery} from 'vue-router'
import {useMeta} from 'quasar'
import ArchiveListComponent from 'components/ArchiveListComponent.vue'
import {useStore} from '../store'
import {contractTypes} from '../services/contractTypes'
import {FormatContract} from '../types/models'

const {$t} = getCurrentInstance().appContext.config.globalProperties

const metaData = {
  title: 'Архив',
}

const store = useStore()
const router = useRouter()

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

async function onRemove(item: FormatContract) {
  await store.dispatch('removeContract', item)
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
