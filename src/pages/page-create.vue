<template>
  <q-page class="bg-grey-1">
    <q-scroll-area visible class="absolute-full fit">
      <q-card
        flat
        square
        bordered
        style="max-width: 600px; margin-left: auto; margin-right: auto"
        class="q-pa-md q-ma-md"
      >
        <contract-form-component
          class="q-pa-md"
          :class="{
            'col-xs-6': $q.platform.is.desktop,
          }"
          :style="{
            height: '500px',
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
import { defineAsyncComponent } from 'vue'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'

const ContractFormComponent = defineAsyncComponent(
  () => import('components/ContractFormComponent.vue'),
)

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
