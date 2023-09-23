<template>
  <QToolbarTitle class="non-selectable">
    <QIcon
      v-show="!$q.dark.isActive"
      class="cursor-pointer orientation-landscape"
      style="vertical-align: text-top"
      name="img:/icons/safari-pinned-tab.svg"
      @click="onOpenRepo"
    />
    <span
      v-if="!$q.platform.is.android"
      class="cursor-pointer text-center"
      @click="onOpenRepo"
    >
      {{ $t('productName') }}
      <QTooltip>
        {{ $t('navigation.version', { version: navigatorVersion }) }}
      </QTooltip>
    </span>
    <slot />
  </QToolbarTitle>
</template>
<script lang="ts" setup>
import { toRef } from 'vue'
import { QToolbarTitle, QTooltip, QIcon } from 'quasar'
import { open } from '../helpers/urlHelper'
import pkg from '../../package.json'

const navigatorVersion = toRef(pkg, 'version')
const [domain, repo] = pkg.repository.split(':')

function onOpenRepo() {
  open(`https://${domain}.com/${repo}`)
}
</script>
