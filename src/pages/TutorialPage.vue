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
            <p
              >Введите адрес своего
              <span
                >OIDC Issuer
                <QTooltip
                  >OIDC Issuer это адрес Вашего SOLID сервера</QTooltip
                ></span
              >
              получения Вашего WebID:</p
            >
            <OIDCIssuerComponent @on-complete="onOnlineAuthorize" />
          </template>
          <template v-else>
            <!-- todo: нужен способ выгрузить ключи в файл -->
            <!--            <p class="text-body1"-->
            <!--              >Ключи сгенерированы и хранятся в памяти Вашего устройства.</p-->
            <!--            >-->
            <p class="text-body1"
              >Для подписания первого договора используйте свое имя.</p
            >
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
                autocomplete="on"
                outlined
                @focus="(e) => e.target.scrollIntoView()"
              >
                <template #prepend>
                  <QIcon name="face" />
                </template>
              </QInput>
              <QStepperNavigation class="q-pa-md no-margin">
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
          </template>
        </QStep>
      </QStepper>
    </QScrollArea>
  </QPage>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, nextTick } from 'vue'
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
} from 'quasar'
import PrivacyComponent from 'components/PrivacyComponent.vue'
import AuthStore from 'stores/auth'
import TutorialStore from 'stores/tutorial'
import ContractStore from 'stores/contract'
import ProfileStore from 'stores/profile'
import pkg from '../../package.json'
import { createContractPDF } from '../services/pdfHelper'
import { solidAuth, initPod, getProfileName } from '../services/podHelper'
import { ContractTable } from '../types/models'

const OIDCIssuerComponent = defineAsyncComponent(
  () => import('components/OIDCIssuerComponent.vue'),
)

const { description, version, productName } = pkg
const $q = useQuasar()
const authStore = AuthStore()
const tutorialStore = TutorialStore()
const contractStore = ContractStore()
const profileStore = ProfileStore()

const router = useRouter()

const searchParams = new URLSearchParams(window.location.search)
const tutorialFinalStep = 3

const step = ref(Number(searchParams.get('step') ?? 1))
const consumer = ref('')
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
      return
    }
    userComplete.value = false
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
      sessionRestoreCallback: () => authStore.openIdHandleIncoming(),
      loginCallback: () => {
        $q.localStorage.set('restorePreviousSession', true)
        authStore.openIdHandleIncoming()
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
    await contractStore.addContract({
      contractData: newContract,
      usePod: isLoggedIn.value,
    })
    profileStore.consumerName(consumer.value)
    tutorialStore.tutorialComplete()
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

useMeta(metaData)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
void nextTick(async () => {
  const { query } = router.currentRoute.value

  // Если пользователь отменил вход через WebId, возвращаем его на страницу подтверждения
  if (query.error === 'access_denied') {
    step.value = tutorialFinalStep
    return
  }
  // Если пользователь вошел через WebId, авторизуем
  if (query.code && query.state) {
    $q.loading.show()
    await solidAuth({
      restorePreviousSession: true,
      async loginCallback() {
        if (!profileStore.consumer) {
          const profileName = await getProfileName()
          profileStore.consumerName(profileName)
        }
      },
    })
    authStore.openIdHandleIncoming()
    $q.loading.hide()
  }
})
</script>
