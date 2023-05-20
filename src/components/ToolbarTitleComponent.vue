<template>
  <QToolbarTitle
    class="text-center non-selectable cursor-pointer"
    @click="onOpenRepo"
  >
    <QIcon
      v-show="!$q.dark.isActive"
      class="orientation-landscape"
      name="img:/icons/safari-pinned-tab.svg"
    />
    <template v-if="!$q.platform.is.android">
      {{ launcherName }}
    </template>
    <QTooltip>
      {{ $t('navigation.version', { version: navigatorVersion }) }}
    </QTooltip>
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
