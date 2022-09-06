<template>
  <q-page>
    <q-scroll-area visible class="absolute-full fit">
      <contract-form-component
        class="q-pa-md"
        :class="{
          'col-xs-6': $q.platform.is.desktop,
        }"
        :style="{
          margin: 'auto',
          width: $q.platform.is.desktop ? '600px' : 'auto',
          height: '500px',
        }"
        :contract-type-name="$router.currentRoute.value.query.contractTypeName"
        @on-create="onCreate"
      />
    </q-scroll-area>
  </q-page>
</template>

<script lang="ts" setup>
import {useMeta} from 'quasar'
import {useRouter} from 'vue-router'
import ContractFormComponent from 'components/ContractFormComponent.vue'

const router = useRouter()

const metaData = {
  title: 'Создание договора',
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
