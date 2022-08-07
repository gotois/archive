<template>
  <q-page class="row content-center items-stretch justify-center">
    <contract-form-component
      class="col-xs-11"
    ></contract-form-component>
  </q-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useMeta} from 'quasar'
import ContractFormComponent from 'components/ContractFormComponent.vue'

const metaData = {
  title: 'Создание договора',
}

export default defineComponent({
  name: 'PageIndex',
  components: {
    ContractFormComponent,
  },
  setup() {
    useMeta(metaData)
  },
})
</script>
