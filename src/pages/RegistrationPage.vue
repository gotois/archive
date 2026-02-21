<template>
  <QPage
    :class="{
      'bg-transparent': $q.dark.isActive,
      'bg-grey-1': !$q.dark.isActive,
    }"
  >
    <QScrollArea ref="scroll" visible class="absolute-full fit">
      <QStepper
        ref="stepper"
        v-model.number="step"
        color="primary"
        flat
        alternative-labels
        contracted
        :header-class="isTMA ? 'hidden' : ''"
        :swipeable="false"
        :animated="!$q.platform.is.desktop"
        :vertical="!$q.platform.is.desktop"
        class="q-pa-md q-card--bordered q-ml-auto q-mr-auto q-mt-md q-mb-md"
        :class="{
          'no-margin': $q.platform.is.mobile,
          'no-padding': $q.platform.is.mobile,
        }"
        :style="{
          'max-width': $q.platform.is.desktop ? '720px' : 'auto',
        }"
        :transition-next="$q.platform.is.desktop ? 'slide-left' : 'slide-down'"
        @update:model-value="onStep"
      >
        <QStep
          :name="STEP.WELCOME"
          :title="$t('tutorial.welcome.title')"
          icon="create_new_folder"
          done-color="positive"
          :done="step > STEP.WELCOME"
        >
          <QIcon
            class="flex q-ml-auto q-mr-auto q-ma-md bg-white rounded-borders"
            name="img:/icons/safari-pinned-tab.svg"
            size="128px"
          />
          <p v-show="$q.platform.is.desktop" class="text-h4 text-center">
            {{ $t('tutorial.welcome.title') }}
          </p>
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.welcome.body'))"
          ></div>
          <QList class="q-mb-md">
            <QExpansionItem
              :label="$t('tutorial.info.title')"
              icon="create_new_folder"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.info.body'))"
                  ></div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
            <QExpansionItem
              :label="$t('tutorial.agreement.title')"
              :caption="$t('tutorial.agreement.caption')"
              icon="article"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.agreement.body'))"
                  >
                  </div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
            <QExpansionItem
              :label="$t('tutorial.wallet.title')"
              :caption="$t('tutorial.wallet.caption')"
              icon="wallet"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.wallet.body'))"
                  >
                  </div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
            <QExpansionItem
              :label="$t('tutorial.safety.title')"
              :caption="$t('tutorial.safety.caption')"
              icon="safety_divider"
              :dense="$q.platform.is.desktop"
              :dense-toggle="$q.platform.is.desktop"
            >
              <QCard>
                <QCardSection>
                  <div
                    class="text-body1"
                    style="white-space: break-spaces"
                    v-html="parse($t('tutorial.safety.body'))"
                  >
                  </div>
                </QCardSection>
              </QCard>
            </QExpansionItem>
          </QList>
          <p class="text-caption no-margin text-weight-light">
            {{ $t('tutorial.welcome.hint') }}
          </p>
          <QStepperNavigation>
            <SelectRegistration
              @registered="registrationComplete"
              @authed="pageComplete"
            />
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="STEP.FINAL"
          :title="$t('tutorial.data.title')"
          done-color="positive"
          icon="assignment"
          class="q-pb-md"
          :done="step > STEP.FINAL"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.data.title', { name: getPersonLD.name }) }}
          </p>
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <QSpace class="q-pa-xs" />
          <IdComponent @complete="onFinish" />
        </QStep>
      </QStepper>
    </QScrollArea>
    <CreateNewDogovor
      v-if="creatingNewContract"
      :contract="contract"
      :signing="true"
      maximized
      @done="pageComplete"
      @hide="creatingNewContract = false"
    />
  </QPage>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  QCard,
  QCardSection,
  QExpansionItem,
  QIcon,
  QList,
  QPage,
  QScrollArea,
  QSpace,
  QStep,
  QStepper,
  QStepperNavigation,
  useMeta,
  useQuasar,
} from 'quasar'
import { storeToRefs } from 'pinia'
import useTutorialStore from 'stores/tutorial'
import useProfileStore from 'stores/profile'
import pkg from '../../package.json'
import { isTMA } from '../composables/detector'
import { ROUTE_NAMES, STEP } from '../router/routes'
import { parse } from '../helpers/markdownHelper'
import CreateNewDogovor from 'components/CreateNewDogovor.vue'
import type { VerifiableCredential } from '../types/models'

const SelectRegistration = defineAsyncComponent(
  () => import('components/SelectRegistration.vue'),
)

const $t = useI18n().t
const $q = useQuasar()
const router = useRouter()
const profileStore = useProfileStore()
const tutorialStore = useTutorialStore()

const stepParam = 'step'

function getCurrentStep() {
  const searchParams = new URLSearchParams(window.location.search)

  if (searchParams.get(stepParam)) {
    return Number(searchParams.get(stepParam))
  }
}

const scroll = ref<InstanceType<typeof QScrollArea> | null>(null)
const stepper = ref<InstanceType<typeof QStepper> | null>(null)
const step = ref(getCurrentStep() ?? STEP.WELCOME)
const creatingNewContract = ref(false)
const contract = ref<VerifiableCredential>(null)

const { getPersonLD, phone, email } = storeToRefs(profileStore)

watch(
  () => step.value,
  (value) => {
    setMeta(value)
  },
)

function setMeta(value: number) {
  switch (value as STEP) {
    case STEP.WELCOME: {
      useMeta({
        'title': $t('pages.tutorial.welcome.title'),
        'og:title': $t('pages.tutorial.welcome.title'),
      })
      break
    }
    case STEP.FINAL: {
      useMeta({
        'title': $t('pages.tutorial.final.title'),
        'og:title': $t('pages.tutorial.final.title'),
      })
      break
    }
    default: {
      useMeta({
        'title': pkg.productName,
        'og:title': pkg.productName,
      })
      break
    }
  }
}

function registrationComplete(vc: VerifiableCredential) {
  contract.value = vc
  stepper.value.next()
}

function pageComplete() {
  tutorialStore.tutorialComplete(true)
  void router.push({
    name: ROUTE_NAMES.ARCHIVE,
  })
}

async function onFinish() {
  $q.loading.show()

  // запрашивание уведомления
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }

  try {
    profileStore.consumerEmail(email.value)
    profileStore.consumerPhone(phone.value)
    await profileStore.setAvatar(email.value)
    creatingNewContract.value = true
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'error',
      color: 'negative',
      message: String(error.message),
      position: 'bottom',
      progress: false,
      timeout: 99999999999,
    })
  } finally {
    $q.loading.hide()
  }
}

async function onStep(step: number) {
  await router.push({
    query: {
      ...router.currentRoute.value.query,
      step: step,
    },
    replace: true,
  })
  scroll.value.setScrollPosition('vertical', step * 30, 100)
}

setMeta(step.value)
</script>
