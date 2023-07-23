<template>
  <QPage :class="$q.dark.isActive ? 'bg-transparent' : 'bg-grey-1'">
    <QScrollArea
      v-if="
        formatContracts.length > 0 &&
        paginationCount > 0 &&
        Number.isSafeInteger(Number(currentPage)) &&
        Number(currentPage) <= paginationCount
      "
      ref="scrollAreaRef"
      :delay="500"
      :visible="$q.platform.is.desktop"
      class="absolute-full fit"
    >
      <QPullToRefresh class="absolute-full fit" @refresh="onRefresh">
        <ArchiveListComponent
          draggable="false"
          :contracts="formatContracts"
          class="q-mt-md q-mb-md q-ml-auto q-mr-auto"
          :class="{
            'col-xs-6': $q.platform.is.desktop || $q.platform.is.ipad,
          }"
          :style="{
            'max-width': $q.platform.is.desktop ? '720px' : 'auto',
          }"
          :page="Number(currentPage)"
          :pagination-count="paginationCount"
          @on-paginate="onPaginate"
          @on-remove="onRemove"
          @on-edit="onEdit"
        />
      </QPullToRefresh>
    </QScrollArea>
    <template v-else>
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
        class="shadow-2"
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
        :class="{
          'bg-white': !$q.dark.isActive,
          'bg-dark': $q.dark.isActive,
        }"
      >
        <QFabAction
          push
          icon="create"
          square
          outline
          color="primary"
          :class="{
            'bg-white': !$q.dark.isActive,
            'bg-dark': $q.dark.isActive,
          }"
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
import { useI18n } from 'vue-i18n'
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
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import usePodStore from 'stores/pod'
import contractTypes from '../services/contractEnum'
import { ROUTE_NAMES } from '../router/routes'
import { FormatContract } from '../types/models'

const ArchiveListComponent = defineAsyncComponent({
  loader: () => import('components/ArchiveListComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    class: 'absolute-full',
  }),
})

const $t = useI18n().t
const $q = useQuasar()
const contractStore = useContractStore()
const podStore = usePodStore()

const metaData = {
  'title': $t('pages.archive.title'),
  'og:title': $t('pages.archive.title'),
}
const LIMIT = 5

const router = useRouter()
const authStore = useAuthStore()

const currentPage = toRef(router.currentRoute.value.query, 'page')
const scrollAreaRef = ref<InstanceType<typeof QScrollArea> | null>(null)
const { isLoggedIn } = storeToRefs(authStore)
const { formatContracts } = storeToRefs(contractStore)
const isSearch = computed(
  () => router.currentRoute.value.name === ROUTE_NAMES.SEARCH,
)
const isFilter = computed(
  () => router.currentRoute.value.name === ROUTE_NAMES.FILTER,
)
const archiveEmptyText = computed(() => {
  const randomContractType = Math.floor(
    Math.random() * (contractTypes.length - 1),
  )
  return contractTypes[randomContractType]
})
const paginationCount = computed(() => {
  switch (router.currentRoute.value.name) {
    case ROUTE_NAMES.SEARCH:
    case ROUTE_NAMES.FILTER: {
      return Math.ceil(formatContracts.value.length / LIMIT)
    }
    default: {
      return Math.ceil(contractStore.getContractsCount / LIMIT)
    }
  }
})

watch(
  () => router.currentRoute.value.query,
  (value) => {
    currentPage.value = String(value.page)
  },
)

useMeta(metaData)

async function onPaginate(page: number) {
  $q.loading.show()
  await router.push({
    name: router.currentRoute.value.name,
    query: {
      page: page,
      name: router.currentRoute.value.query?.name,
    },
  })
  $q.loading.hide()
  scrollAreaRef.value.setScrollPosition('vertical', 0, 150)
}

async function removeContract(item: FormatContract) {
  try {
    await contractStore.removeContract({
      contract: item,
      usePod: isLoggedIn.value,
    })
    $q.notify({
      type: 'positive',
      message: $t('contract.removeDialog.success', {
        name: item.instrument.name,
      }),
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: $t('contract.removeDialog.fail'),
    })
  }
}

function onRemove(item: FormatContract) {
  $q.notify({
    message:
      !isLoggedIn.value && item.sameAs
        ? $t('contract.removeDialog.message')
        : $t('contract.removeDialog.isLoginMessage'),
    type: 'negative',
    position: 'center',
    group: false,
    multiLine: true,
    textColor: 'white',
    timeout: 7500,
    attrs: {
      role: 'alertdialog',
    },
    actions: [
      {
        icon: 'check_circle',
        label: $t('contract.removeDialog.ok'),
        color: 'white',
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async handler() {
          await removeContract(item)
        },
      },
      {
        icon: 'cancel',
        label: $t('contract.removeDialog.cancel'),
        color: 'white',
      },
    ],
  })
}

function onEdit(item: FormatContract) {
  const dialog = $q.dialog({
    message: $t('contract.editDialog.message'),
    prompt: {
      model: item.instrument.description ?? '',
      type: 'text',
    },
    cancel: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dialog.onOk(async (value: string) => {
    try {
      item.instrument.description = value
      await editContract(item)
      $q.notify({
        type: 'positive',
        message: $t('contract.editDialog.success'),
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        color: 'negative',
        message: $t('contract.editDialog.fail'),
      })
    }
  })
}

async function editContract(item: FormatContract) {
  await contractStore.editContract(item)

  if (isLoggedIn.value) {
    await podStore.updateIntoPod(item)
  }
}

async function updateContracts({
  page,
  name,
}: LocationQuery | { page: number; name: string }) {
  page = Number(page || 1)
  if (Number.isNaN(page)) {
    return
  }
  const offset = (page - 1) * LIMIT
  const query = String(name ?? '')

  switch (router.currentRoute.value.name) {
    case ROUTE_NAMES.SEARCH: {
      await contractStore.searchFromContracts({
        query,
        offset,
        limit: LIMIT,
      })
      break
    }
    case ROUTE_NAMES.FILTER: {
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
  $q.loading.hide()
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
})
</script>
