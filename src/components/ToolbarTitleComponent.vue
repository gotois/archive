<template>
  <QToolbarTitle
    class="non-selectable"
    :class="{
      'text-center': !$q.platform.is.desktop,
    }"
  >
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
      {{ launcherName }}
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
import manifest from '../../twa-manifest.json'

const launcherName = toRef(manifest, 'launcherName')
const navigatorVersion = toRef(pkg, 'version')

function onOpenRepo() {
  const [domain, repo] = pkg.repository.split(':')
  openURL(`https://${domain}.com/${repo}`, undefined, {
    noopener: true,
    noreferrer: true,
  })
}
</script>
