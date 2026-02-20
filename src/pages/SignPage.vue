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
            :signing="true"
            @create="createContract"
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
import { ROUTE_NAMES } from '../router/routes'
import ContractPod from '../services/contractGeneratorService'
import type { VerifiableCredential, ContractTable } from '../types/models'

const ContractFormComponent = defineAsyncComponent({
  loader: () => import('components/ContractFormComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    style: { height: '460px' },
  }),
})

const props = defineProps<{
  taskId: string
}>()

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()

const contractForm = ref<InstanceType<typeof ContractFormComponent> | null>(
  null,
)
const contract = ref<VerifiableCredential>(null)

const metaData = {
  'title': $t('pages.sign.title'),
  'og:title': $t('pages.sign.title'),
}

function createContract(newContract: ContractTable) {
  $q.notify({
    message: $t('components.contractForm.submitDate.success', {
      id: newContract.name.toLocaleLowerCase(),
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
              name: newContract.name,
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
    const link = router.currentRoute.value.query.from as string
    contract.value = await ContractPod.fromSolidUrl(link)
  } catch (error: unknown) {
    console.error(error)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.response?.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Access Denied',
      })
    } else {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: error?.message,
      })
    }
    await router.push({
      path: '/',
      replace: true,
    })
  } finally {
    $q.loading.hide()
  }
})

useMeta(metaData)
</script>
