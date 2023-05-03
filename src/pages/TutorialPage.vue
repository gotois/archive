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
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.info.body'))"
          ></div>
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
          <div
            class="text-body1"
            style="white-space: break-spaces"
            v-html="parse($t('tutorial.agreement.body'))"
          >
          </div>
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
        <QStep
          :name="tutorialFinalStep"
          :title="$t('tutorial.data.title')"
          icon="assignment"
        >
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.data.title') }}
          </p>
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <QSpace class="q-pa-xs" />
          <template v-if="!userComplete && !isLoggedIn">
            <p>
              {{ $t('oidc.linkNameStart') }}
              <span>
                {{ $t('oidc.name') }}
                <QTooltip>{{ $t('oidc.tutorialHint') }}</QTooltip>
              </span>
              {{ $t('oidc.linkNameEnd') }}
            </p>
            <OIDCIssuerComponent @on-complete="onOnlineAuthorize" />
          </template>
          <template v-else>
            <p class="text-body1">
              {{ $t('tutorial.signHint') }}
            </p>
            <QForm
              ref="nameForm"
              class="q-gutter-md q-mt-md"
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
                type="text"
                autocomplete="on"
                clearable
                outlined
                @focus="(e) => e.target.scrollIntoView()"
              >
                <template #prepend>
                  <QIcon name="face" />
                </template>
              </QInput>
              <QInput
                v-model="email"
                :label="$t('consumer.email')"
                name="email"
                type="email"
                :rules="['email']"
                autocomplete="off"
                clearable
                outlined
              >
                <template #prepend>
                  <QIcon name="email" />
                </template>
              </QInput>
              <QStepperNavigation class="q-pa-md no-margin">
                <QBtn
                  color="accent"
                  type="submit"
                  square
                  :outline="!consumer?.length && !email?.length"
                  :label="$t('tutorial.complete')"
                  :class="{
                    'full-width': !$q.platform.is.desktop,
                  }"
                  icon="login"
                />
              </QStepperNavigation>
            </QForm>
          </template>
        </QStep>
      </QStepper>
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
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
  QTooltip,
  exportFile,
  SessionStorage,
} from 'quasar'
import { marked } from 'marked'
import useAuthStore from 'stores/auth'
import tutorialStore from 'stores/tutorial'
import useContractStore from 'stores/contract'
import useProfileStore from 'stores/profile'
import usePodStore from 'stores/pod'
import pkg from '../../package.json'
import { createContractPDF } from '../services/pdfHelper'
import solidAuth from '../services/authHelper'
import { generateKeyPair, exportKeyPair } from '../services/cryptoHelper'
import { keys } from '../services/databaseHelper'
import { ContractTable } from '../types/models'

const { parse } = marked

const OIDCIssuerComponent = defineAsyncComponent(
  () => import('components/OIDCIssuerComponent.vue'),
)

const $q = useQuasar()
const router = useRouter()
const podStore = usePodStore()
const authStore = useAuthStore()
const contractStore = useContractStore()
const profileStore = useProfileStore()

const { description, version, productName, bugs } = pkg
const searchParams = new URLSearchParams(window.location.search)
const tutorialFinalStep = 3
const stepParam = 'step'

const step = ref(Number(searchParams.get(stepParam) ?? 1))
const consumer = ref('')
const email = ref('')
const userComplete = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)

const metaData = {
  'title': 'Примите лицензионное соглашение',
  'og:title': 'Лицензионное соглашение',
}

async function onOnlineAuthorize(oidcIssuer: string) {
  if (!oidcIssuer) {
    const confirmMessage =
      'Вы не сможете подписывать договоры цифровой подписью без WebId.\nПродолжить использование в режиме Offline?'
    if (window.confirm(confirmMessage)) {
      userComplete.value = true
      await keys.destroy()
      return
    }
    userComplete.value = false
    return
  }

  $q.loading.show()
  SessionStorage.remove('connect')
  const redirectUrl =
    window.location.origin +
    window.location.pathname +
    `?${stepParam}=` +
    String(step.value)
  try {
    await solidAuth({
      redirectUrl: redirectUrl,
      oidcIssuer: oidcIssuer,
      restorePreviousSession: false,
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
  $q.loading.show()

  try {
    const keyPair = await generateKeyPair()
    // если нет доступа к WebID, используем для идентификации fingerprint от keyPair
    if (!authStore.webId) {
      /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/ban-ts-comment */
      // @ts-ignore
      authStore.webId = 'did:key:' + (keyPair.fingerprint() as string)
      /* eslint-enable @typescript-eslint/no-unsafe-call */
    }
  } catch (e) {
    $q.notify({
      type: 'error',
      color: 'negative',
      message: 'Генерация ключей закончилась ошибкой: ' + String(e.message),
      position: 'center',
      progress: false,
    })
    $q.loading.hide()
    return
  }

  const keysJSON = await exportKeyPair()
  const status = exportFile('keys.json', keysJSON)
  if (status) {
    $q.notify({
      type: 'positive',
      message: 'Ключи сгенерированы и хранятся в памяти Вашего устройства.',
    })
  } else {
    $q.notify({
      type: 'warning',
      message: 'Ваш ключ сохранен в вашем браузере.',
    })
  }

  try {
    const response = await fetch('docs/privacy.md')
    const md = await response.text()
    const html = parse(md)
    const contractPDF = await createContractPDF(html)
    const newContract: ContractTable = {
      agent_name: consumer.value,
      agent_email: email.value,
      participant_name: productName + ' ' + version,
      participant_email: bugs.email,
      instrument_name: 'Пользовательское соглашение',
      instrument_description: description,
      startTime: new Date(),
      images: contractPDF,
    }
    if (isLoggedIn.value) {
      await podStore.initPod()
    }
    await contractStore.addContract({
      contractData: newContract,
      usePod: isLoggedIn.value,
    })
    profileStore.consumerName(consumer.value)
    profileStore.consumerEmail(email.value)
    tutorialStore().tutorialComplete()
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
      message: 'Что-то пошло не так: ' + String(e.message),
      position: 'center',
      progress: false,
      timeout: 99999999999,
    })
  } finally {
    $q.loading.hide()
  }
}

useMeta(metaData)

onMounted(() => {
  const { query } = router.currentRoute.value

  // Если пользователь отменил вход через WebId, возвращаем его на страницу подтверждения
  if (query.error === 'access_denied') {
    step.value = tutorialFinalStep
    return
  }
})
</script>
