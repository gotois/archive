<template>
  <QToolbarTitle class="non-selectable">
    <QIcon
      v-show="!$q.dark.isActive"
      class="orientation-landscape"
      style="vertical-align: text-top"
      name="img:/icons/safari-pinned-tab.svg"
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
import { QToolbarTitle, QTooltip, QIcon, openURL } from 'quasar'
import pkg from '../../package.json'

const navigatorVersion = toRef(pkg, 'version')
const [domain, repo] = pkg.repository.split(':')

function onOpenRepo() {
  openURL(`https://${domain}.com/${repo}`, undefined, {
    noopener: true,
    noreferrer: true,
  })
}
</script>
