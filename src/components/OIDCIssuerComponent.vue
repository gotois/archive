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
      :dense="$q.platform.is.desktop"
      type="url"
      :use-input="!oidcIssuer"
      disable-tab-selection
      square
      autofocus
      bottom-slots
      filled
      hide-dropdown-icon
      map-options
      input-debounce="0"
      clearable
      autocomplete="on"
      @new-value="onNewValueIssuer"
      @clear="() => (oidcIssuer = '')"
    >
      <slot />
    </QSelect>
    <QBtn
      type="button"
      class="q-mt-md"
      :class="{
        'full-width': $q.platform.is.mobile,
      }"
      :color="oidcIssuer?.length ? 'accent' : 'secondary'"
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
import { validUrlString } from '../helpers/urlHelper'

const emit = defineEmits(['onComplete'])
defineProps({
  label: {
    type: String as PropType<string>,
    required: false,
    default: undefined,
  },
})

const loginOptions = ref([
  'login.inrupt.com',
  'login.inrupt.net',
  // 'login.gotointeractive.com', // todo поддержать в будущем GIC DAO OIDC
])
const oidcIssuer = ref('')
const prefix = ref('https://')

function onNewValueIssuer(value: string, done: (value: string) => void) {
  if (loginOptions.value.includes(value)) {
    return
  }
  loginOptions.value.unshift(value)
  done(value)
}

function onComplete() {
  const url = prefix.value + oidcIssuer.value
  if (validUrlString(url)) {
    emit('onComplete', url)
    return
  }
  emit('onComplete')
}

function checkUrl(value: NonNullable<string>) {
  if (validUrlString(value)) {
    return 'Введите валидный URL SOLID провайдера.'
  }
  return true
}
</script>
