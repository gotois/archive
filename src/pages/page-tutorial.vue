<template>
  <q-page class="bg-grey-1">
    <q-scroll-area visible class="absolute-full fit">
      <q-stepper
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
        <q-step
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
          <q-stepper-navigation>
            <q-btn
              color="secondary"
              :label="$t('tutorial.info.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step
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
          <q-stepper-navigation>
            <q-btn
              color="secondary"
              :label="$t('tutorial.agreement.ok')"
              :class="{
                'full-width': !$q.platform.is.desktop,
              }"
              @click="$refs.stepper.next()"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="3" :title="$t('tutorial.data.title')" icon="assignment">
          <p v-show="$q.platform.is.desktop" class="text-h4">
            {{ $t('tutorial.data.title') }}
          </p>
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <q-space class="q-pa-xs"></q-space>
          <q-btn-group
            v-if="!loggedIn"
            outline
            rounded
            stretch
            class="full-width"
          >
            <q-btn
              color="accent"
              type="button"
              label="Использовать ФИО"
              icon="login"
              no-caps
              @click="onOfflineAuthorize"
            >
              <q-tooltip
                >Оффлайн режим. Данные необходимы для создания
                документов</q-tooltip
              >
            </q-btn>
            <q-btn
              color="accent"
              type="button"
              label="Использовать WebID"
              icon="login"
              no-caps
              @click="onOnlineAuthorize"
            >
              <q-tooltip
                >Онлайн режим. Данные необходимы для создания
                документов</q-tooltip
              >
            </q-btn>
          </q-btn-group>

          <q-form
            v-if="loggedIn"
            ref="nameForm"
            class="q-gutter-md"
            autocapitalize="off"
            autocomplete="off"
            autofocus
            greedy
            @submit="onFinish"
          >
            <q-input
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
                <q-icon name="face" />
              </template>
            </q-input>
            <p class="text-body2">
              {{ $t('tutorial.otp') }}
            </p>
            <v-otp-input
              input-classes="otp-input"
              separator="-"
              :num-inputs="4"
              :is-input-num="true"
              :conditional-class="['first', '', '', 'last']"
              :placeholder="['*', '*', '*', '*']"
              @on-change="handleOnChange"
              @on-complete="handleOnComplete"
            />
            <q-stepper-navigation class="q-mb-md">
              <q-btn
                color="accent"
                type="submit"
                :outline="consumer.length === 0"
                :label="$t('tutorial.complete')"
                :class="{
                  'full-width': !$q.platform.is.desktop,
                }"
                icon="login"
              />
            </q-stepper-navigation>
          </q-form>
        </q-step>
      </q-stepper>
    </q-scroll-area>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, useMeta } from 'quasar'
import VOtpInput from 'vue3-otp-input'
import {
  handleIncomingRedirect,
  login,
  getDefaultSession,
} from '@inrupt/solid-client-authn-browser'
import PrivacyComponent from 'components/PrivacyComponent.vue'
import { useStore } from '../store'
import pkg from '../../package.json'
import { createContract } from '../services/pdfHelper'
import {
  OIDC_ISSUER,
  CLIENT_NAME,
  getProfileName,
  initPod,
} from '../services/podHelper'

const { description, version, productName } = pkg
const $q = useQuasar()
const store = useStore()
const router = useRouter()

const searchParams = new URLSearchParams(window.location.search)

const step = ref(Number(searchParams.get('step') ?? 1))
const consumer = ref('')
const pin = ref('')
const loggedIn = ref(false)

const metaData = {
  'title': 'Примите лицензионное соглашение',
  'og:title': 'Лицензионное соглашение',
}

function onOfflineAuthorize() {
  loggedIn.value = true
}

async function onOnlineAuthorize() {
  const redirectUrl =
    window.location.origin +
    window.location.pathname +
    '?step=' +
    String(step.value)
  await login({
    oidcIssuer: OIDC_ISSUER,
    redirectUrl: redirectUrl,
    clientName: CLIENT_NAME,
  })
  loggedIn.value = true
}

async function onFinish() {
  $q.loading.show()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const html = PrivacyComponent.render().children[0].children as string
  const contractPDF = await createContract(
    html,
    $q.platform.is.name === 'firefox',
  )
  const newContract = {
    agent_name: consumer.value,
    participant_name: productName + ' ' + version,
    instrument_name: 'Пользовательское соглашение',
    instrument_description: description,
    startTime: new Date(),
    images: contractPDF,
  }
  try {
    if (getDefaultSession().info.isLoggedIn) {
      await initPod()
    }

    await store.dispatch('addContract', newContract)
    await store.dispatch('consumerName', consumer.value)
    await store.dispatch('Tutorial/tutorialComplete')
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
  if (pin.value.length === 4) {
    if (window.confirm('Действительно сохранить пин?')) {
      await store.dispatch('Auth/setCode', pin.value)
    }
  }
  await router.push('/create')
}

const handleOnChange = (value: string) => {
  pin.value = value
}

const handleOnComplete = (value: string) => {
  pin.value = value
}

useMeta(metaData)

void (async () => {
  if (navigator.onLine) {
    await handleIncomingRedirect()
    const isLoggedIn = getDefaultSession().info.isLoggedIn
    loggedIn.value = isLoggedIn

    if (isLoggedIn) {
      consumer.value = await getProfileName()
    }
  }
})()
</script>
