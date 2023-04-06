<template>
  <QPage class="bg-grey-1">
    <QScrollArea
      ref="scrollAreaRef"
      :delay="500"
      :visible="$q.platform.is.desktop"
      class="absolute-full fit"
    >
      <ArchiveListComponent
        :loading="loadingVisible"
        :contracts="contracts"
        class="q-mt-md q-mb-md q-ml-auto q-mr-auto"
        :class="{
          'col-xs-6': $q.platform.is.desktop || $q.platform.is.ipad,
        }"
        :style="{
          'max-width': $q.platform.is.desktop ? '720px' : 'auto',
        }"
        :pagination-count="isContractsEmpty ? 0 : paginationCount"
        @on-paginate="onPaginate"
        @on-remove="onRemove"
        @on-edit="onEdit"
      />
    </QScrollArea>
    <template v-if="!loadingVisible && isContractsEmpty">
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
          <template v-if="isSearch">{{ $t('archive.searchEmpty') }}</template>
          <template v-else
            >{{ $t('archive.empty') }}
            Например:
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
        <template #action>
          <template v-if="isSearch">
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
  getCurrentInstance,
  defineAsyncComponent,
  h,
  onMounted,
} from 'vue'
import { useRouter, LocationQuery } from 'vue-router'
import {
  useMeta,
  useQuasar,
  QSkeleton,
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
import { contractTypes } from '../services/contractTypes'
import { FormatContract } from '../types/models'

const ArchiveListComponent = defineAsyncComponent({
  loader: () => import('components/ArchiveListComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    class: 'absolute-full',
  }),
})

// eslint-disable-next-line @typescript-eslint/unbound-method
const { $t } = getCurrentInstance().appContext.config.globalProperties
const $q = useQuasar()
const contractStore = useContractStore()
const podStore = usePodStore()
const profileStore = useProfileStore()

const metaData = {
  'title': 'Архив договоров',
  'og:title': 'Архив договоров',
}
const router = useRouter()
const authStore = useAuthStore()

const limit = ref(5)
const loadingVisible = ref(true)
const scrollAreaRef = ref<QScrollArea>(null)
const isLoggedIn = computed(() => authStore.isLoggedIn)

const isSearch = computed(() => Boolean(router.currentRoute.value.query.filter))
const archiveEmptyText = computed(() => {
  const randomContractType = Math.floor(
    Math.random() * (contractTypes.length - 1),
  )
  return contractTypes[randomContractType]
})
const contracts = computed(() => contractStore.formatContracts)
const paginationCount = computed(() =>
  Math.ceil(contractStore.contractsCount / limit.value),
)
const isContractsEmpty = computed(() => contracts.value.length === 0)

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
  const offset = (page - 1) * limit.value
  const query = String(filter ?? '')

  switch (router.currentRoute.value.name) {
    case 'search': {
      await contractStore.searchFromContracts({
        query,
        offset,
        limit: limit.value,
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
        limit: limit.value,
      })
      break
    }
  }
  if ($q.loading.isActive) {
    $q.loading.hide()
  }
  loadingVisible.value = false
}

onMounted(async () => {
  router.afterEach((to) => updateContracts(to.query))
  void updateContracts(router.currentRoute.value.query)

  if (profileStore.consumer) {
    await contractStore.loadContractNames()
  }
})
</script>
