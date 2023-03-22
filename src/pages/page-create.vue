<template>
  <q-page class="bg-grey-1">
    <q-scroll-area visible class="absolute-full fit non-selectable">
      <q-card
        flat
        square
        bordered
        style="max-width: 600px"
        class="q-pa-md q-ml-auto q-mr-auto q-mt-md q-mb-md"
      >
        <contract-form-component
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
      </q-card>
    </q-scroll-area>
  </q-page>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, h } from 'vue'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'

const ContractFormComponent = defineAsyncComponent({
  loader: () => import('components/ContractFormComponent.vue'),
  loadingComponent: h('q-skeleton', { style: 'height: 460px' }),
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
