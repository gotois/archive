<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
    }"
  >
    <QScrollArea visible class="absolute-full fit q-pl-md q-pr-md">
      <QIcon
        class="flex q-ml-auto q-mr-auto q-ma-md bg-white rounded-borders"
        name="img:/icons/safari-pinned-tab.svg"
        size="128px"
      />
      <div class="text-center">
        {{ pkg.productName }}
      </div>
      <div class="text-center">
        {{ $t('navigation.version', { version: navigatorVersion }) }};
      </div>
      <div class="q-ma-md text-center">
        <QChip
          icon="note"
          class="cursor-pointer q-pa-md self-end no-margin"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :label="$t('navigation.score')"
          @click="onOpenNPS"
        />
        <QSeparator color="transparent" />
        <QChip
          icon="support"
          class="cursor-pointer q-pa-md self-end no-margin"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :label="$t('navigation.support.free.label')"
          @click="onOpenSupport"
        >
          <QTooltip
            v-if="
              $q.platform.is.mac ||
              $q.platform.is.linux ||
              $q.platform.is.win ||
              $q.platform.is.safari
            "
          >
            <!--todo поддержать логику premium/vip-->
            {{ $t('navigation.support.free.tooltip') }}
          </QTooltip>
        </QChip>
      </div>
      <div class="q-ma-md text-center">
        <QChip
          icon="telegram"
          class="cursor-pointer q-pa-md self-end"
          :dense="$q.platform.is.desktop"
          square
          clickable
          :label="'Telegram channel'"
          :click="() => open('https://t.me/turbostate')"
        />
      </div>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  useMeta,
  useQuasar,
  QIcon,
  QScrollArea,
  QPage,
  QChip,
  QTooltip,
  QSeparator,
} from 'quasar'
import { open } from '../helpers/urlHelper'
import { ROUTE_NAMES } from '../router/routes'
import pkg from '../../package.json'

const router = useRouter()
const $q = useQuasar()
const $t = useI18n().t

const navigatorVersion = toRef(pkg, 'version')

const metaData = {
  'title': 'About',
  'og:title': 'About',
}

function onOpenNPS() {
  // todo для VIP
  // ... - https://docs.google.com/forms/d/e/1FAIpQLSdowzB3yyvMAQjlv_gWye1teBhV5LcYxXeX2PJjDDhsir5Fnw/viewform?usp=sf_link

  // Для Free и Premium
  open(
    'https://docs.google.com/forms/d/e/1FAIpQLSdY3ao4duiZFp9jmM3-9d25gFFgWeklksssLDl4WZcoMS_CeQ/viewform?usp=sf_link',
  )
}

function onOpenSupport() {
  return router.push({
    name: ROUTE_NAMES.SUPPORT,
  })
}

useMeta(metaData)
</script>
