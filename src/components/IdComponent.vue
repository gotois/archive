<template>
  <QForm
    ref="nameForm"
    class="q-gutter-md"
    autocapitalize="off"
    autocomplete="off"
    :autofocus="$q.platform.is.desktop"
    greedy
    @submit="emit('complete')"
  >
    <QInput
      v-if="keypair"
      :hint="$t('tutorial.data.hint')"
      hide-hint
      :model-value="keypair.id"
      color="secondary"
      :dense="$q.platform.is.desktop"
      readonly
      hide-bottom-space
    />
    <KeypairComponent v-else @key="uploadKey" />
    <!-- todo заменить на vue3-q-tel-input
    <QInput
      v-model.trim="phone"
      name="tel"
      type="tel"
      color="secondary"
      :error-message="$t('consumer.phoneRules')"
      autocomplete="off"
      :clearable="true"
      :fill-mask="true"
      stack-label
      :dense="$q.platform.is.desktop"
      :hide-bottom-space="!phone"
      :filled="Boolean(phone)"
      :label="$t('consumer.phone')"
      square
      outlined
      no-error-icon
    >
      <template #prepend>
        <QIcon name="phone" />
      </template>
    </QInput-->
    <QStepperNavigation class="no-margin q-pt-md q-pl-md">
      <QBtn
        color="accent"
        type="submit"
        :disable="!consumerValid"
        :label="$t('tutorial.data.submit')"
        :class="{
          'full-width': !$q.platform.is.desktop,
        }"
        :loading="$q.loading.isActive"
        icon-right="app_registration"
      />
    </QStepperNavigation>
  </QForm>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, QBtn, QForm, QInput, QStepperNavigation } from 'quasar'
import KeypairComponent from 'components/KeypairComponent.vue'
import type { DIDTable } from '../types/models'

const emit = defineEmits(['complete'])
const $q = useQuasar()
const i18n = useI18n()
const $t = i18n.t

const keypair = ref<DIDTable>(null)

const consumerValid = computed(() => {
  return Boolean(keypair.value?.id)
})

function uploadKey(key: DIDTable) {
  keypair.value = key
}
</script>
