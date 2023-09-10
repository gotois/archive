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
            ref="contractForm"
            :class="{
              'col-xs-6': $q.platform.is.desktop,
            }"
            :agent-legal="Boolean($route.query.agentLegal) as boolean"
            :instrument-description="
              $route.query.instrumentDescription as string
            "
            :instrument-name="$route.query.instrumentName as string"
            :participant-email="$route.query.participantEmail as string"
            :participant-name="$route.query.participantName as string"
            :participant-url="$route.query.participantUrl as string"
            :images="$route.query.images as string[]"
            :start-time="
              $route.query.startTime
                ? new Date($route.query.startTime as string)
                : null
            "
            :end-time="
              $route.query.endTime
                ? new Date($route.query.endTime as string)
                : null
            "
            @on-create="onCreate"
          />
        </QCard>
        <QSpace class="q-pb-xs" />
      </QPullToRefresh>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, h, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
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

const ContractFormComponent = defineAsyncComponent({
  loader: () => import('components/ContractFormComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    style: { height: '460px' },
  }),
})

const $t = useI18n().t
const router = useRouter()

const contractForm = ref<InstanceType<typeof ContractFormComponent> | null>(
  null,
)
const metaData = {
  'title': $t('pages.create.title'),
  'og:title': $t('pages.create.title'),
}

async function onCreate(value: string) {
  await router.push({
    name: ROUTE_NAMES.FILTER,
    query: {
      name: value,
      page: 1,
    },
  })
}

function onRefresh(done: () => void) {
  contractForm.value.resetForm(true)
  done()
}

useMeta(metaData)
</script>
