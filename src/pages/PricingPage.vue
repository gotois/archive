<template>
  <QPage class="full-height">
    <QScrollArea class="absolute-full fit">
      <div
        class="items-start q-pa-md justify-center self-start q-gutter-md"
        :class="{
          'row': $q.platform.is.desktop,
          'items-stretch': $q.platform.is.mobile,
        }"
      >
        <QCard bordered class="col bg-white text-black col-3">
          <QCardSection class="text-center">
            <div class="text-h5 text-weight-bolder">
              {{ $t('pricing.free.title') }}
            </div>
            <div class="text-subtitle2 text-weight-light q-pb-md">
              {{ $t('pricing.free.description') }}
            </div>
            <div>
              <span class="vertical-middle text-h3">{{ basePrice }}</span>
              {{ $t('pricing.free.price') }}
            </div>
            <QBtn
              class="full-width q-mt-md"
              color="white"
              text-color="black"
              :label="$t('pricing.free.ok')"
            />
          </QCardSection>
          <QSeparator inset />
          <QCardSection>
            <QList dense bordered class="rounded-borders bg-grey-1">
              <QTree
                class="full-width"
                :nodes="freeSupport"
                node-key="label"
                text-color="black"
              />
              <QTree
                class="full-width"
                :nodes="freeFunctional"
                node-key="label"
                text-color="black"
              />
            </QList>
          </QCardSection>
        </QCard>
        <QCard bordered class="bg-white text-black col-3">
          <QCardSection class="text-center">
            <div class="text-h5 text-weight-bolder">
              {{ $t('pricing.premium.title') }}
            </div>
            <div class="text-subtitle2 text-weight-light q-pb-md">
              {{ $t('pricing.premium.description') }}
            </div>
            <div>
              <span class="vertical-middle text-weight-bolder text-h3">
                {{ premiumPrice }}
              </span>
              {{ $t('pricing.premium.price') }}
            </div>
            <QBtn
              class="full-width q-mt-md"
              color="primary"
              text-color="white"
              :label="$t('pricing.premium.ok')"
              @click="onPremium"
            />
          </QCardSection>
          <QSeparator inset />
          <QCardSection>
            <QList dense bordered class="rounded-borders bg-grey-1">
              <QTree
                class="full-width"
                :nodes="premiumSupport"
                node-key="label"
                text-color="black"
              />
              <QTree
                class="full-width"
                :nodes="premiumFunctional"
                node-key="label"
                text-color="black"
              />
            </QList>
          </QCardSection>
        </QCard>
        <QCard bordered class="bg-white text-black col-3">
          <QCardSection class="text-center">
            <div class="text-h5 text-weight-bolder">
              {{ $t('pricing.vip.title') }}
            </div>
            <div class="text-subtitle2 text-weight-light q-pb-md">
              {{ $t('pricing.vip.description') }}
            </div>
            <div>
              <span class="vertical-middle text-weight-bolder text-h3">
                {{ vipPrice }}
              </span>
              {{ $t('pricing.vip.price') }}
            </div>
            <QBtn
              class="full-width q-mt-md"
              color="black"
              text-color="white"
              :label="$t('pricing.vip.ok')"
              @click="onContactSale"
            />
          </QCardSection>
          <QSeparator inset />
          <QCardSection>
            <QList dense bordered class="rounded-borders bg-grey-1">
              <QTree
                class="full-width"
                :nodes="vipSupport"
                node-key="label"
                text-color="black"
              />
              <QTree
                class="full-width"
                :nodes="vipFunctional"
                node-key="label"
                text-color="black"
              />
            </QList>
          </QCardSection>
        </QCard>
      </div>
    </QScrollArea>
  </QPage>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useMeta,
  QPage,
  QScrollArea,
  QCard,
  QCardSection,
  QBtn,
  QSeparator,
  QList,
  QTree,
} from 'quasar'

const $t = useI18n().t

const basePrice = '$0'
const premiumPrice = '$20'
const vipPrice = '$200'

const freeSupport = ref([
  {
    label: $t('pricing.free.support.title'),
    children: [
      { label: $t('pricing.free.support.values.1') },
      { label: $t('pricing.free.support.values.2') },
    ],
  },
])
const premiumSupport = ref([
  {
    label: $t('pricing.premium.support.title'),
    children: [
      { label: $t('pricing.premium.support.values.1') },
      { label: $t('pricing.premium.support.values.2') },
    ],
  },
])
const vipSupport = ref([
  {
    label: $t('pricing.vip.support.title'),
    children: [
      { label: $t('pricing.vip.support.values.1') },
      { label: $t('pricing.vip.support.values.2') },
      { label: $t('pricing.vip.support.values.3') },
    ],
  },
])
const freeFunctional = ref([
  {
    label: $t('pricing.free.functions.title'),
    children: [
      { label: $t('pricing.free.functions.values.1') },
      { label: $t('pricing.free.functions.values.2') },
    ],
  },
])
const premiumFunctional = ref([
  {
    label: $t('pricing.premium.functions.title'),
    children: [
      { label: $t('pricing.premium.functions.values.1') },
      { label: $t('pricing.premium.functions.values.2') },
      { label: $t('pricing.premium.functions.values.3') },
      { label: $t('pricing.premium.functions.values.4') },
      { label: $t('pricing.premium.functions.values.5') },
      { label: $t('pricing.premium.functions.values.6') },
      { label: $t('pricing.premium.functions.values.7') },
    ],
  },
])
const vipFunctional = ref([
  {
    label: $t('pricing.vip.functions.title'),
    children: [
      { label: $t('pricing.vip.functions.values.1') },
      { label: $t('pricing.vip.functions.values.2') },
    ],
  },
])

function onPremium() {
  alert('Premium is under construction')
}

function onContactSale() {
  alert('Contact Sale is under construction')
}

const metaData = {
  'title': $t('pages.pricing.title'),
  'og:title': $t('pages.pricing.title'),
}

useMeta(metaData)
</script>
