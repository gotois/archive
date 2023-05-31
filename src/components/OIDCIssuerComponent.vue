<template>
  <div class="full-width">
    <QSelect
      v-model.trim="oidcIssuer"
      class="full-width"
      :label="label"
      type="url"
      use-input
      square
      :options="['login.inrupt.com', 'login.inrupt.net']"
      autofocus
      bottom-slots
      :prefix="prefix"
      :rules="[checkUrl]"
      :hint="$t('oidc.issuerHint')"
      hide-dropdown-icon
      input-debounce="0"
      clearable
      new-value-mode="add-unique"
    >
      <slot></slot>
    </QSelect>
    <QBtn
      color="accent"
      type="button"
      :label="$t('oidc.login')"
      icon="login"
      class="q-mt-md"
      :class="{
        'full-width': $q.platform.is.mobile,
      }"
      no-caps
      @click="onComplete"
    >
      <QTooltip>
        <template v-if="oidcIssuer">
          {{ $t('oidc.issuerTooltipLogin', { oidcIssuer }) }}
        </template>
        <template v-else>{{ $t('oidc.issuerTooltipEmpty') }}</template>
      </QTooltip>
    </QBtn>
  </div>
</template>

<script lang="ts" setup>
import { ref, PropType } from 'vue'
import { QSelect, QBtn, QTooltip } from 'quasar'

const emit = defineEmits(['onComplete'])
defineProps({
  label: {
    type: String as PropType<string>,
    required: true,
  },
})

const oidcIssuer = ref('')
const prefix = ref('https://')

function onComplete() {
  const url = oidcIssuer.value
  if (url && url.length) {
    emit('onComplete', prefix.value + url)
    return
  }
  emit('onComplete')
}

function checkUrl(value?: string) {
  if (value && value.length <= 3) {
    return 'Введите валидный URL Вашего провайдера.'
  }
  return true
}
</script>
