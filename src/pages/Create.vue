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

<script lang="ts">
import {defineComponent} from 'vue'
import {useMeta} from 'quasar'
import {Router, useRouter} from 'vue-router'
import ContractFormComponent from 'components/ContractFormComponent.vue'

let router: Router

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

function main() {
  router = useRouter()

  return {
    onCreate,
  }
}

export default defineComponent({
  name: 'PageIndex',
  components: {
    ContractFormComponent,
  },
  setup() {
    useMeta(metaData)

    return main()
  },
})
</script>
