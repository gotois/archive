<template>
  <QToolbarTitle
    v-if="!($q.platform.is.mobile && $q.platform.is.android)"
    class="text-center non-selectable"
  >
    <QIcon
      class="orientation-landscape"
      name="img:/icons/safari-pinned-tab.svg"
    />
    {{ $t('header.title') }}
    <QBadge
      outline
      rounded
      transparent
      align="top"
      color="accent"
      class="absolute q-ml-xs cursor-pointer"
      :label="$t('navigation.version', { version: navigatorVersion })"
      @click="onOpenRepo"
    />
  </QToolbarTitle>
</template>
<script lang="ts" setup>
import { toRef } from 'vue'
import { QToolbarTitle, QBadge, QIcon, openURL } from 'quasar'
import pkg from '../../package.json'

const navigatorVersion = toRef(pkg, 'version')

function onOpenRepo() {
  const [domain, repo] = pkg.repository.split(':')
  openURL(`https://${domain}.com/${repo}`, undefined, {
    noopener: true,
    noreferrer: true,
  })
}
</script>
