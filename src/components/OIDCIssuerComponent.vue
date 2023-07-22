<template>
  <div class="full-width">
    <QSelect
      v-model.trim="oidcIssuer"
      class="full-width"
      :label="label"
      :behavior="$q.platform.is.ios ? 'dialog' : 'menu'"
      :options="loginOptions"
      :prefix="prefix"
      :rules="[checkUrl]"
      :hint="$t('oidc.issuerHint')"
      type="url"
      use-input
      square
      autofocus
      bottom-slots
      filled
      hide-dropdown-icon
      map-options
      input-debounce="0"
      clearable
      new-value-mode="add-unique"
      @clear="() => (oidcIssuer = '')"
    >
      <slot></slot>
    </QSelect>
    <QBtn
      type="button"
      class="q-mt-md"
      :class="{
        'full-width': $q.platform.is.mobile,
      }"
      :color="oidcIssuer.length ? 'accent' : 'secondary'"
      :label="oidcIssuer ? $t('oidc.login') : $t('oidc.skip')"
      :loading="$q.loading.isActive"
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

const loginOptions = ref(['login.inrupt.com', 'login.inrupt.net'])
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
