<template>
  <QPage class="bg-grey-1">
    <QScrollArea visible class="absolute-full fit non-selectable">
      <QCard
        flat
        square
        bordered
        :style="{
          'max-width': $q.platform.is.desktop ? '720px' : '600px',
        }"
        class="q-pa-md q-ml-auto q-mr-auto q-mt-md q-mb-md"
      >
        <ContractFormComponent
          :class="{
            'col-xs-6': $q.platform.is.desktop,
          }"
          :style="{
            minHeight: '460px',
          }"
          :contract-type-name="
            $router.currentRoute.value.query.contractTypeName
          "
          @on-create="onCreate"
        />
      </QCard>
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, h } from 'vue'
import { QPage, QSkeleton, useMeta, QCard, QScrollArea } from 'quasar'
import { useRouter } from 'vue-router'

const ContractFormComponent = defineAsyncComponent({
  loader: () => import('components/ContractFormComponent.vue'),
  delay: 0,
  loadingComponent: h(QSkeleton, {
    style: { height: '460px' },
  }),
})

const router = useRouter()

const metaData = {
  'title': 'Создание договора',
  'og:title': 'Создание договора',
}

async function onCreate(value: string) {
  await router.push({
    name: 'filter',
    query: {
      filter: value,
      page: 1,
    },
  })
}

useMeta(metaData)
</script>
