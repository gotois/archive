<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
      'light-dimmed': isDragging,
    }"
    @dragenter="dragenter"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
    @click="checkFabOutclick"
  >
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
          :limit="LIMIT"
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
          <template v-else-if="contractStore.contractsCount > 0">
            <QSpinner color="primary" size="3em" />
          </template>
          <template v-else>
            {{ $t('archive.empty') }}
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
            :to="{ name: ROUTE_NAMES.ARCHIVE, query: { page: 1 } }"
          />
        </template>
      </QBanner>
    </template>
    <QPageSticky v-if="!isTMA" position="bottom-right" :offset="[18, 18]">
      <QFab
        ref="fab"
        hide-label
        glossy
        push
        icon="add"
        direction="up"
        vertical-actions-align="right"
        color="accent"
        :class="{
          'bg-white': !$q.dark.isActive,
          'bg-dark': $q.dark.isActive,
        }"
        @hide="clearFabData"
      >
        <QFile
          v-model="files"
          style="width: 200px"
          :label="$t('files.type')"
          :counter="Boolean(files.length)"
          :accept="`${PNG_MIME_TYPE}, ${JPG_MIME_TYPE}, ${PDF_MIME_TYPE}`"
          color="primary"
          label-color="primary"
          class="shadow-1"
          unelevated
          borderless
          filled
          :hide-hint="!$q.platform.is.desktop"
          :hide-bottom-space="!$q.platform.is.desktop"
          :dense="$q.platform.is.desktop"
          multiple
          square
          :bg-color="$q.dark.isActive ? 'dark' : 'white'"
          @update:model-value="onFileSelect"
        >
          <template #prepend>
            <QIcon name="attach_file" color="primary" />
          </template>
          <QTooltip>{{ $t('files.hint') }}</QTooltip>
        </QFile>
        <QInput
          v-model.trim="urlFrom"
          style="width: 200px"
          square
          flat
          unelevated
          borderless
          filled
          :hide-hint="!$q.platform.is.desktop"
          :hide-bottom-space="!$q.platform.is.desktop"
          :dense="$q.platform.is.desktop"
          color="primary"
          label-color="primary"
          :bg-color="$q.dark.isActive ? 'dark' : 'white'"
          class="no-margin shadow-1"
          :label="'URL'"
        >
          <template #prepend>
            <QIcon name="add" color="primary" />
          </template>
          <template #after>
            <QBtn
              v-if="validUrlString(urlFrom)"
              unelevated
              text-color="primary"
              dense
              square
              icon-right="check"
              class="no-margin"
              :to="{
                name: 'sign',
                query: {
                  from: urlFrom,
                },
              }"
            />
          </template>
          <QTooltip>{{ 'Use .ttl from SOLiD' }}</QTooltip>
        </QInput>
      </QFab>
    </QPageSticky>
    <QDialog
      v-model="creatingNewContract"
      maximized
      :allow-focus-outside="false"
      position="top"
      persistent
      no-shake
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <QCard
        style="max-width: 640px"
        :class="{
          'bg-white text-white': !$q.dark.isActive,
          'bg-dark text-white': $q.dark.isActive,
        }"
      >
        <QBar :dense="false" :dark="false" class="bg-grey-2">
          <QSpace />
          <QBtn
            v-close-popup
            flat
            color="dark"
            icon="close"
            @click="clearFabData"
          />
        </QBar>
        <QScrollArea visible style="height: calc(100dvh - 32px)">
          <QCardSection class="q-pt-none">
            <ContractFormComponent
              v-if="dogovor"
              :dogovor="dogovor"
              :signing="false"
              @on-create="onCreateContract"
            />
          </QCardSection>
        </QScrollArea>
      </QCard>
    </QDialog>
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
  QSpinner,
  QBanner,
  QBtn,
  QPageSticky,
  QInput,
  QFab,
  QFile,
  QIcon,
  QTooltip,
  QDialog,
  QCard,
  QCardSection,
  QBar,
  QSpace,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useAuthStore from 'stores/auth'
import useContractStore from 'stores/contract'
import usePodStore from 'stores/pod'
import useNotification from 'stores/notification'
import { ROUTE_NAMES } from '../router/routes'
import Dogovor from '../services/contractGeneratorService'
import { validUrlString, open } from '../helpers/urlHelper'
import {
  PDF_MIME_TYPE,
  PNG_MIME_TYPE,
  JPG_MIME_TYPE,
} from '../helpers/mimeTypes'
import { isTMA } from '../helpers/twaHelper'
import { FormatContract } from '../types/models'

const ArchiveListComponent = defineAsyncComponent({
  loader: () => import('components/ArchiveListComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    class: 'absolute-full',
  }),
})
const ContractFormComponent = defineAsyncComponent({
  loader: () => import('components/ContractFormComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    style: { height: '460px' },
  }),
})

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const contractStore = useContractStore()
const podStore = usePodStore()
const authStore = useAuthStore()
const notificationStore = useNotification()

const metaData = {
  'title': $t('pages.archive.title'),
  'og:title': $t('pages.archive.title'),
}
const LIMIT = 5
const NOTIFICATION_TIMER = 30000

const currentPage = toRef(router.currentRoute.value.query, 'page')
const scrollAreaRef = ref<InstanceType<typeof QScrollArea> | null>(null)
const fab = ref<InstanceType<typeof QFab> | null>(null)
const { isLoggedIn } = storeToRefs(authStore)
const { formatContracts } = storeToRefs(contractStore)
const isSearch = computed(
  () => router.currentRoute.value.name === ROUTE_NAMES.SEARCH,
)
const isFilter = computed(
  () => router.currentRoute.value.name === ROUTE_NAMES.FILTER,
)
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
const files = ref([])
const creatingNewContract = ref(false)
const dogovor = ref<InstanceType<typeof Dogovor> | null>(null)
const urlFrom = ref('')
const isDragging = ref(false)

watch(
  () => router.currentRoute.value.query,
  (value) => {
    contractStore.contracts = [] // clear before load
    currentPage.value = String(value.page)
  },
)

useMeta(metaData)

function dragenter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function dragover(e: Event) {
  e.preventDefault()
  isDragging.value = true
}

function dragleave() {
  isDragging.value = false
}

function checkFabOutclick(e: Event) {
  if (!(fab.value.$el as HTMLElement).contains(e.target as HTMLElement)) {
    fab.value.hide()
    e.preventDefault()
  }
}

function drop(e: DragEvent) {
  e.preventDefault()
  const files: File[] = Array.from(e.dataTransfer.files).filter(
    (file: File) => {
      switch (file.type) {
        case PDF_MIME_TYPE:
        case PNG_MIME_TYPE:
        case JPG_MIME_TYPE:
          return true
        default:
          return false
      }
    },
  )
  onFileSelect(files)
  isDragging.value = false
}

function clearFabData() {
  files.value = []
  urlFrom.value = ''
}

function onCreateContract(dogovor: Dogovor) {
  const dogovorName =
    dogovor.presentation.verifiableCredential[0].credentialSubject.instrument
      .name
  $q.notify({
    message: $t('components.contractForm.submitDate.success', {
      id: dogovorName,
    }),
    type: 'positive',
    actions: [
      {
        label: $t('components.contractForm.submitDate.redirect'),
        color: 'white',
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        handler() {
          return router.push({
            name: ROUTE_NAMES.FILTER,
            query: {
              name: dogovorName,
              page: 1,
            },
          })
        },
      },
    ],
  })

  creatingNewContract.value = false
}

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
}

async function removeContract(item: FormatContract) {
  try {
    await contractStore.removeContract({
      contract: item,
      usePod: isLoggedIn.value,
    })
    scrollAreaRef.value.setScrollPosition('vertical', 0, 150)
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

function onFileSelect(files: File[]) {
  fab.value.hide()
  const filesUrls = []
  for (const file of files) {
    filesUrls.push({
      contentUrl: URL.createObjectURL(file),
      encodingFormat: file.type,
      caption: file.name,
    })
  }
  if (filesUrls.length === 0) {
    return
  }
  dogovor.value = Dogovor.mintContract({
    files: filesUrls,
  })
  creatingNewContract.value = true
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
  if (typeof router.currentRoute.value.query.action === 'string') {
    open(router.currentRoute.value.query.action)
    return
  }
  setTimeout(() => {
    notificationStore.check()
  }, NOTIFICATION_TIMER)
})

onMounted(async () => {
  await updateContracts(router.currentRoute.value.query)
})
</script>
