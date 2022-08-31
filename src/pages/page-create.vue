<template>
  <q-page class="full-height">
    <q-scroll-area style="height: calc(100vh - 100px);">
      <contract-form-component
        class="q-pa-sm"
        style="width: 400px; margin: auto"
        :class="{
          'col-xs-6': $q.platform.is.desktop,
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
