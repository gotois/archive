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
    </span>
    <slot />
  </QToolbarTitle>
</template>
<script lang="ts" setup>
import { QToolbarTitle, QIcon } from 'quasar'
import { useRouter } from 'vue-router'
import { open } from '../helpers/urlHelper'
import pkg from '../../package.json'
import { ROUTE_NAMES } from '../router/routes'

const router = useRouter()

const [domain, repo] = pkg.repository.split(':')

async function onOpenRepo(e: Event) {
  e.preventDefault()
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  switch (router.currentRoute.value.name) {
    case ROUTE_NAMES.FILTER:
    case ROUTE_NAMES.SEARCH:
    case ROUTE_NAMES.SUPPORT:
    case ROUTE_NAMES.ARCHIVE:
      return router.push({
        name: ROUTE_NAMES.ARCHIVE,
        query: {
          page: 1,
        },
      })
    default: {
      return open(`https://${domain}.com/${repo}`)
    }
  }
}
</script>
