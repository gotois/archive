<template>
  <QPage :class="$q.dark.isActive ? 'bg-transparent' : 'bg-grey-1'">
    <QScrollArea visible class="absolute-full fit">
      <QPullToRefresh class="absolute-full fit" @refresh="onRefresh">
        <QCard
          draggable="false"
          flat
          square
          bordered
          :style="{
            'max-width': $q.platform.is.desktop ? '720px' : '600px',
          }"
          class="q-pa-md q-ml-auto q-mr-auto q-mt-md q-mb-md"
        >
          <ContractFormComponent
            v-if="contract"
            ref="contractForm"
            :class="{
              'col-xs-6': $q.platform.is.desktop,
            }"
            :contract="contract"
            @on-create="onCreateContract"
          />
        </QCard>
        <QSpace class="q-pb-xs" />
      </QPullToRefresh>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, h, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  useMeta,
  QPage,
  QSpace,
  QSkeleton,
  QPullToRefresh,
  QCard,
  QScrollArea,
} from 'quasar'
import { useRouter } from 'vue-router'
import usePodStore from 'stores/pod'
import { ROUTE_NAMES } from '../router/routes'
import { ContractTable, Credential } from '../types/models'

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
const podStore = usePodStore()

const contractForm = ref<InstanceType<typeof ContractFormComponent> | null>(
  null,
)
const contract = ref<InstanceType<typeof Credential> | null>(null)

const metaData = {
  'title': $t('pages.create.title'),
  'og:title': $t('pages.create.title'),
}

function onCreateContract(newContract: ContractTable) {
  $q.notify({
    message: $t('components.contractForm.submitDate.success', {
      id: newContract.instrument_name.toLocaleLowerCase(),
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
              name: newContract.instrument_name,
              page: 1,
            },
          })
        },
      },
    ],
  })
}

function onRefresh(done: () => void) {
  contractForm.value.resetForm(true)
  done()
}

onMounted(async () => {
  $q.loading.show()
  try {
    const fromUrl = router.currentRoute.value.query.from as string
    contract.value = await podStore.getContract(fromUrl)
  } catch (error) {
    console.error(error)
    if (error.response.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Access Denied',
      })
    }
  } finally {
    $q.loading.hide()
  }
})

useMeta(metaData)
</script>
