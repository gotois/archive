<template>
  <q-page class="row content-center items-stretch justify-center">
    <contract-form-component
      class="col-xs-11 q-pa-md"
    ></contract-form-component>
  </q-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import ContractFormComponent from 'components/ContractFormComponent.vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    ContractFormComponent
  },
  setup() {
    return {
    }
  },
})
</script>
