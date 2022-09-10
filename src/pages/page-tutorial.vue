<template>
  <q-page>
    <q-scroll-area visible class="absolute-full fit">
      <q-stepper
        ref="stepper"
        v-model="step"
        color="primary"
        flat
        vertical
        animated
      >
        <q-step
          :name="1"
          :title="$t('tutorial.agreement.title')"
          icon="article"
          :done="step > 1"
        >
          <p class="text-body1">{{ $t('tutorial.agreement.body') }}</p>
          <q-stepper-navigation>
            <q-btn color="secondary" :label="$t('tutorial.agreement.ok')" @click="$refs.stepper.next()" />
          </q-stepper-navigation>
        </q-step>
        <q-step
          :name="2"
          :title="$t('tutorial.data.title')"
          icon="assignment"
        >
          <p class="text-body1">{{ $t('tutorial.data.body') }}</p>
          <q-space class="q-pa-xs"></q-space>
          <q-form
            ref="nameForm"
            class="q-gutter-md"
            autocorrect="off"
            autocapitalize="off"
            autocomplete="off"
            greedy
            @submit="onFinish"
          >
            <q-input
              v-model="consumer"
              :label="$t('consumer.type')"
              :rules="[ val => val && val.length > 0 || $t('consumer.rules')]"
              :hint="$t('consumer.hint')"
              name="consumer"
              autocomplete="on"
              outlined
              @focus="e => e.target.scrollIntoView()"
            >
              <template #prepend>
                <q-icon name="face" />
              </template>
            </q-input>
            <p class="text-body">
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
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useQuasar, useMeta} from 'quasar'
import VOtpInput from 'vue3-otp-input'
import {useStore} from '../store'
import {createContract} from '../services/pdfHelper'
import PrivacyComponent from 'components/PrivacyComponent.vue'
import pkg from '../../package.json'

const {description, version, productName} = pkg
const $q = useQuasar()
const store = useStore()
const router = useRouter()

const step = ref(1)
const consumer = ref('')
const pin = ref('')

const metaData = {
  title: 'Обучение',
}

async function onFinish() {
  $q.loading.show()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const html = PrivacyComponent.render().children[0].children as string
  const contractPDF = await createContract(html, $q.platform.is.name === 'firefox')
  const newContract = {
    'agent_name': consumer.value,
    'participant_name': productName + ' ' + version,
    'instrument_name': 'Пользовательское соглашение',
    'instrument_description': description,
    'startTime': new Date(),
    'images': contractPDF,
  }
  try {
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
</script>
