<template>
  <q-page class="row content-center items-stretch justify-center">
    <contract-form-component
      class="col-xs-11"
    ></contract-form-component>
  </q-page>
</template>

<script lang="ts">
import ContractFormComponent from 'components/ContractFormComponent.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex',

  components: {
    ContractFormComponent
  },

  setup() {
    return {
    }
  }
})
</script>
