<template>
  <QToolbarTitle class="non-selectable">
    <QBadge
      transparent
      color="secondary"
      class="vertical-middle cursor-pointer"
      @click="onOpenRepo"
    >
      <QIcon
        v-show="!$q.dark.isActive && !$q.platform.is.android"
        class="orientation-landscape"
        style="vertical-align: text-top"
        name="img:/icons/safari-pinned-tab.svg"
      />
      {{ headerBadge }}
    </QBadge>
  </QToolbarTitle>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { QToolbarTitle, QIcon, QBadge, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { open } from '../helpers/urlHelper'
import pkg from '../../package.json'
import { isTMA } from '../helpers/twaHelper'
import { ROUTE_NAMES } from '../router/routes'

const router = useRouter()
const i18n = useI18n()
const $q = useQuasar()
const $t = i18n.t

const [domain, repo] = pkg.repository.split(':')

const headerBadge = computed(() => {
  let name = $t('productName') + ' '
  if (isTMA) {
    name += $t('header.telegram') + ' '
  }
  name += $t('header.demo') + ' '
  return name.trim()
})

async function onOpenRepo(e: Event) {
  e.preventDefault()
  // todo - уведомления нужно запрашивать в самом начале
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
