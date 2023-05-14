<template>
  <QPage class="bg-grey-1">
    <QScrollArea
      ref="scrollAreaRef"
      :delay="500"
      :visible="$q.platform.is.desktop"
      class="absolute-full fit"
    >
      <QPullToRefresh class="absolute-full fit" @refresh="onRefresh">
        <ArchiveListComponent
          draggable="false"
          :loading="loadingVisible"
          :contracts="contracts"
          class="q-mt-md q-mb-md q-ml-auto q-mr-auto"
          :class="{
            'col-xs-6': $q.platform.is.desktop || $q.platform.is.ipad,
          }"
          :style="{
            'max-width': $q.platform.is.desktop ? '720px' : 'auto',
          }"
          :page="currentPage"
          :pagination-count="isContractsEmpty ? 0 : paginationCount"
          @on-paginate="onPaginate"
          @on-remove="onRemove"
          @on-edit="onEdit"
        />
      </QPullToRefresh>
    </QScrollArea>
    <template
      v-if="!loadingVisible && isContractsEmpty && paginationCount === 0"
    >
      <QBanner
        :class="{
          'col-6': $q.platform.is.desktop,
          'full-width': $q.platform.is.mobile,
        }"
        :inline-actions="$q.platform.is.desktop"
        :dense="$q.platform.is.desktop"
        rounded
        class="q-pa-lg flex absolute-center flex-center self-center text-black-9 text-left"
        :style="{
          'max-width': $q.platform.is.desktop ? '720px' : '600px',
        }"
      >
        <template #default>
          <template v-if="isSearch">
            {{ $t('archive.searchEmpty') }}
          </template>
          <template v-else-if="isFilter">{{
            $t('archive.filterEmpty')
          }}</template>
          <template v-else>
            {{ $t('archive.empty') }}
            {{ $t('archive.example') }}
            <br />
            <QBtn
              :to="{
                name: 'create',
                query: { contractTypeName: archiveEmptyText },
              }"
              padding="none"
              unelevated
              push
              align="left"
              flat
              text-color="accent"
              type="a"
              no-caps
              :label="archiveEmptyText"
            />.
          </template>
        </template>
        <template v-if="isSearch || isFilter" #action>
          <QBtn
            flat
            align="left"
            color="accent"
            outline
            :icon="$q.platform.is.desktop ? 'explore' : ''"
            :label="$t('list.explore')"
            :to="{ name: 'archive', query: { page: 1 } }"
          />
        </template>
      </QBanner>
    </template>
    <QPageSticky position="bottom-right" :offset="[18, 18]">
      <QFab
        hide-label
        glossy
        push
        class="bg-white shadow-2"
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
      >
        <QFabAction
          push
          icon="create"
          square
          outline
          class="bg-white"
          color="primary"
          :label="$t('list.create')"
          :to="{ name: 'create' }"
        />
      </QFab>
    </QPageSticky>
  </QPage>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  h,
  onMounted,
  onBeforeMount,
  toRef,
  watch,
} from 'vue'
import { useRouter, LocationQuery } from 'vue-router'
import {
  useMeta,
  useQuasar,
  QSkeleton,
  QPullToRefresh,
  QScrollArea,
  QPage,
  QBanner,
  QBtn,
  QPageSticky,
  QFab,
  QFabAction,
} from 'quasar'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import usePodStore from 'stores/pod'
import contractTypes from '../services/contractEnum'
import { FormatContract } from '../types/models'

const ArchiveListComponent = defineAsyncComponent({
  loader: () => import('components/ArchiveListComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    class: 'absolute-full',
  }),
})

const $q = useQuasar()
const contractStore = useContractStore()
const podStore = usePodStore()
const profileStore = useProfileStore()

const metaData = {
  'title': 'Архив договоров',
  'og:title': 'Архив договоров',
}
const LIMIT = 5

const router = useRouter()
const authStore = useAuthStore()

const currentPage = toRef(router.currentRoute.value.query, 'page')
const loadingVisible = ref(true)
const scrollAreaRef = ref<QScrollArea>(null)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const isSearch = computed(() => Boolean(router.currentRoute.value.query.search))
const isFilter = computed(() => Boolean(router.currentRoute.value.query.filter))
const archiveEmptyText = computed(() => {
  const randomContractType = Math.floor(
    Math.random() * (contractTypes.length - 1),
  )
  return contractTypes[randomContractType]
})
const contracts = computed(() => contractStore.formatContracts)
const paginationCount = computed(() => {
  switch (router.currentRoute.value.name) {
    case 'search':
    case 'filter': {
      return Math.ceil(contracts.value.length / LIMIT)
    }
    default: {
      return Math.ceil(contractStore.getContractsCount / LIMIT)
    }
  }
})
const isContractsEmpty = computed(() => contracts.value.length === 0)

watch(
  () => router.currentRoute.value.query,
  (value) => {
    currentPage.value = String(value.page)
  },
)

useMeta(metaData)

async function onPaginate(page: number) {
  loadingVisible.value = true
  await router.push({
    name: router.currentRoute.value.name,
    query: {
      page: page,
      filter: router.currentRoute.value.query?.filter,
    },
  })
  scrollAreaRef.value.setScrollPosition('vertical', 0, 150)
}

async function onRemove(item: FormatContract) {
  try {
    await contractStore.removeContract({
      contractData: item,
      usePod: isLoggedIn.value,
    })
    await contractStore.loadContractNames()
    $q.notify({
      type: 'positive',
      message: 'Данные успешно удалены',
    })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: 'Произошла проблема с удалением данных',
    })
  }
}

async function onEdit(item: FormatContract) {
  const value = window.prompt('Введите новое описание:')
  if (!value) {
    return
  }
  item.instrument.description = value
  await contractStore.editContract(item)

  if (isLoggedIn.value) {
    await podStore.updateIntoPod(item)
  }
  $q.notify({
    type: 'positive',
    message: 'Данные обновлены',
  })
}

async function updateContracts({
  page,
  filter,
}: LocationQuery | { page: number; filter: string }) {
  page = Number(page || 1)
  const offset = (page - 1) * LIMIT
  const query = String(filter ?? '')

  switch (router.currentRoute.value.name) {
    case 'search': {
      await contractStore.searchFromContracts({
        query,
        offset,
        limit: LIMIT,
      })
      break
    }
    case 'filter': {
      await contractStore.filterFromContracts(query)
      break
    }
    default: {
      await contractStore.loadAllContracts({
        offset,
        limit: LIMIT,
      })
      break
    }
  }
  if ($q.loading.isActive) {
    $q.loading.hide()
  }
  loadingVisible.value = false
}

async function onRefresh(done: () => void) {
  await updateContracts(router.currentRoute.value.query)
  done()
}

router.afterEach((to) => updateContracts(to.query))

onBeforeMount(() => {
  if (!router.currentRoute.value.query.page) {
    router.currentRoute.value.query.page = '1'
  }
})

onMounted(async () => {
  await updateContracts(router.currentRoute.value.query)

  if (profileStore.consumer) {
    await contractStore.loadContractNames()
  }
})
</script>
