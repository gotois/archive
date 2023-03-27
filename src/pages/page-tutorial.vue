<template>
  <q-page class="bg-grey-1">
    <q-scroll-area visible class="absolute-full fit">
      <q-stepper
        ref="stepper"
        v-model="step"
        color="primary"
        flat
        vertical
        animated
        class="q-pa-md q-card--bordered q-ml-auto q-mr-auto q-mt-md q-mb-md"
        style="max-width: 600px"
        transition-next="slide-down"
      >
        <q-step
          :name="1"
          :title="$t('tutorial.info.title')"
          icon="create_new_folder"
          :done="step > 1"
        >
          <p class="text-body1" style="white-space: break-spaces">{{
            $t('tutorial.info.body')
          }}</p>
          <q-stepper-navigation>
            <q-btn
              color="secondary"
              :label="$t('tutorial.info.ok')"
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
          <p class="text-body1" style="white-space: break-spaces">{{
            $t('tutorial.agreement.body')
          }}</p>
          <q-stepper-navigation>
            <q-btn
              color="secondary"
              :label="$t('tutorial.agreement.ok')"
              @click="$refs.stepper.next()"
            />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="3" :title="$t('tutorial.data.title')" icon="assignment">
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <q-space class="q-pa-xs"></q-space>
          <q-btn
            color="accent"
            type="button"
            label="WebID"
            icon="login"
            no-caps
            @click="onAuthorize"
          >
            <q-tooltip>Данные необходимы для создания документов</q-tooltip>
          </q-btn>

          <q-form
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
              style="width: 300px"
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
            <q-stepper-navigation>
              <q-btn
                color="accent"
                type="submit"
                :outline="consumer.length === 0"
                :label="$t('tutorial.complete')"
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

const step = ref(1)
const consumer = ref('')
const pin = ref('')

const metaData = {
  'title': 'Примите лицензионное соглашение',
  'og:title': 'Лицензионное соглашение',
}

async function onAuthorize() {
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: OIDC_ISSUER,
      redirectUrl: window.location.href,
      clientName: CLIENT_NAME,
    })
  }
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
    // todo - инициировать pod только если есть интернет и webId
    await initPod()

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
  await handleIncomingRedirect()
  const profileName = await getProfileName()
  consumer.value = profileName
})()
</script>
