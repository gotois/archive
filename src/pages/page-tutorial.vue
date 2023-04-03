<template>
  <QPage class="bg-grey-1">
    <QScrollArea visible class="absolute-full fit">
      <QStepper
        ref="stepper"
        v-model="step"
        color="primary"
        flat
        alternative-labels
        contracted
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
      >
        <QStep
          :name="1"
          :title="$t('tutorial.info.title')"
          icon="create_new_folder"
          :done="step > 1"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.info.title') }}
          </p>
          <p class="text-body1" style="white-space: break-spaces">{{
            $t('tutorial.info.body')
          }}</p>
          <QStepperNavigation>
            <QBtn
              color="secondary"
              :label="$t('tutorial.info.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </QStepperNavigation>
        </QStep>
        <QStep
          :name="2"
          :title="$t('tutorial.agreement.title')"
          icon="article"
          :done="step > 2"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.agreement.title') }}
          </p>
          <p class="text-body1" style="white-space: break-spaces">{{
            $t('tutorial.agreement.body')
          }}</p>
          <QStepperNavigation>
            <QBtn
              color="secondary"
              :label="$t('tutorial.agreement.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </QStepperNavigation>
        </QStep>
        <QStep :name="3" :title="$t('tutorial.data.title')" icon="assignment">
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.data.title') }}
          </p>
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <QSpace class="q-pa-xs" />
          <p v-if="!showForm"
            >Введите адрес своего OIDC Issuer для получения Вашего WebID:</p
          >
          <OIDCIssuerComponent
            v-if="!showForm"
            @on-complete="onOnlineAuthorize"
          />
          <QForm
            v-if="showForm"
            ref="nameForm"
            class="q-gutter-md"
            autocapitalize="off"
            autocomplete="off"
            autofocus
            greedy
            @submit="onFinish"
          >
            <QInput
              v-model="consumer"
              :label="$t('consumer.type')"
              :rules="[
                (val) => (val && val.length > 0) || $t('consumer.rules'),
              ]"
              name="consumer"
              autocomplete="on"
              outlined
              @focus="(e) => e.target.scrollIntoView()"
            >
              <template #prepend>
                <QIcon name="face" />
              </template>
            </QInput>
            <p class="text-body2">
              {{ $t('tutorial.otp') }}
            </p>
            <VOtpInput
              :value="pin"
              input-classes="otp-input"
              separator="-"
              :num-inputs="pinLength"
              :is-input-num="true"
              :conditional-class="['first', '', '', 'last']"
              :placeholder="['*', '*', '*', '*']"
              @on-complete="handleOnComplete"
            />
            <QStepperNavigation class="q-mb-md">
              <QBtn
                color="accent"
                type="submit"
                :outline="consumer.length === 0"
                :label="$t('tutorial.complete')"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                icon="login"
              />
            </QStepperNavigation>
          </QForm>
        </QStep>
      </QStepper>
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useQuasar,
  useMeta,
  QPage,
  QScrollArea,
  QStepper,
  QStep,
  QStepperNavigation,
  QBtn,
  QSpace,
  QForm,
  QInput,
  QIcon,
} from 'quasar'
import VOtpInput from 'vue3-otp-input'
import PrivacyComponent from 'components/PrivacyComponent.vue'
import OIDCIssuerComponent from 'components/OIDCIssuerComponent.vue'
import { useStore } from '../store'
import pkg from '../../package.json'
import { createContractPDF } from '../services/pdfHelper'
import { solidAuth, getProfileName, initPod } from '../services/podHelper'
import { ContractTable } from '../types/models'

const { description, version, productName } = pkg
const $q = useQuasar()
const store = useStore()
const router = useRouter()

const searchParams = new URLSearchParams(window.location.search)

const step = ref(Number(searchParams.get('step') ?? 1))
const consumer = ref('')
const pin = ref('')
const showForm = ref(false)
const pinLength = ref(4)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLoggedIn = computed(() => store.getters['Auth/isLoggedIn'] as boolean)

const metaData = {
  'title': 'Примите лицензионное соглашение',
  'og:title': 'Лицензионное соглашение',
}

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    const confirmMessage =
      'Вы не сможете подписывать договоры цифровой подписью без WebId.\nПродолжить использование в режиме Offline?'
    if (window.confirm(confirmMessage)) {
      showForm.value = true
      return
    }
    showForm.value = false
    return
  }

  $q.loading.show()
  const redirectUrl =
    window.location.origin +
    window.location.pathname +
    '?step=' +
    String(step.value)
  try {
    await solidAuth({
      redirectUrl,
      oidcIssuer: oidcIssuer,
      sessionRestoreCallback: () =>
        void store.dispatch('Auth/openIdHandleIncoming'),
      loginCallback: () => {
        $q.localStorage.set('restorePreviousSession', true)
        void store.dispatch('Auth/openIdHandleIncoming')
      },
    })
  } catch (e) {
    console.error(e)
    $q.notify({
      color: 'negative',
      message: 'Произошла ошибка входа через OIDC',
    })
  } finally {
    $q.loading.hide()
  }
}

async function onFinish() {
  if (pin.value.length === pinLength.value) {
    if (window.confirm('Пин ' + pin.value + ' будет сохранен?')) {
      await store.dispatch('Auth/setCode', pin.value)
    }
  }
  $q.loading.show()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const html = PrivacyComponent.render().children[0].children as string
  const contractPDF = await createContractPDF(
    html,
    $q.platform.is.name === 'firefox',
  )

  const newContract: ContractTable = {
    agent_name: consumer.value,
    participant_name: productName + ' ' + version,
    instrument_name: 'Пользовательское соглашение',
    instrument_description: description,
    startTime: new Date(),
    images: contractPDF,
  }
  try {
    if (isLoggedIn.value) {
      await initPod()
    }
    await store.dispatch('addContract', {
      contractData: newContract,
      usePod: isLoggedIn.value,
    })
    await store.dispatch('consumerName', consumer.value.trim())
    await store.dispatch('Tutorial/tutorialComplete')
    await router.push({
      name: 'filter',
      query: {
        filter: newContract.instrument_name,
        page: 1,
      },
    })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'error',
      color: 'negative',
      message: 'Что-то пошло не так',
      position: 'center',
      progress: false,
      timeout: 99999999999,
    })
    return
  } finally {
    $q.loading.hide()
  }
}

const handleOnComplete = (value: string) => {
  pin.value = value
}

useMeta(metaData)

void (async () => {
  if (isLoggedIn.value) {
    showForm.value = true
    consumer.value = await getProfileName()
  }
})()
</script>
