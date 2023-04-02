<template>
  <div class="full-width">
    <QSelect
      v-model="oidcIssuer"
      class="full-width"
      label="Адрес URL"
      use-input
      square
      :options="['login.inrupt.com', 'login.inrupt.net']"
      autofocus
      bottom-slots
      :prefix="prefix"
      :rules="[checkUrl]"
      :hint="'URL Вашего SOLID провайдера'"
      hide-dropdown-icon
      input-debounce="0"
      clearable
      new-value-mode="add-unique"
    />
    <QBtn
      color="accent"
      type="button"
      label="Войти"
      icon="login"
      class="q-mt-md"
      :class="{
        'full-width': $q.platform.is.mobile,
      }"
      no-caps
      @click="emit('onComplete', prefix + oidcIssuer)"
    >
      <QTooltip>
        <template v-if="oidcIssuer">Войдите через {{ oidcIssuer }}.</template>
        <template v-else>
          Данные необходимы для подписания договоров.
        </template>
      </QTooltip>
    </QBtn>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { QSelect, QBtn, QTooltip } from 'quasar'

const emit = defineEmits(['onComplete'])

const oidcIssuer = ref<string>(null)
const prefix = ref('https://')

function checkUrl(value?: string) {
  if (value && value.length <= 3) {
    return 'Введите валидный URL Вашего провайдера.'
  }
  return true
}
</script>
