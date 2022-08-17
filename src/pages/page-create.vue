<template>
  <q-page class="row content-center items-stretch justify-center">
    <contract-form-component
      class="q-pa-sm"
      :class="{
        'col-xs-6': $q.platform.is.desktop,
      }"
      @on-create="onCreate"
    />
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
