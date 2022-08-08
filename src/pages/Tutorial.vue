<template>
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
        title="Политика конфиденциальности"
        icon="settings"
        :done="step > 1"
      >
        Разработчик не осуществляет сбор ваших персональных данных.
        <q-stepper-navigation>
          <q-btn color="primary" label="Принять" @click="$refs.stepper.next()" />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="2"
        title="Пользовательское соглашение"
        icon="create_new_folder"
        :done="step > 2"
      >
        Приложение распространяется "как есть". Разработчик не гарантирует сохранность ваших документов. Разработчик вправе внести изменения конфликтующие с вашими сохраненными документами.
        <q-stepper-navigation>
          <q-btn color="primary" label="Принять" @click="$refs.stepper.next()" />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="3"
        title="Безопасность"
        icon="assignment"
        :done="step > 3"
      >
        Приложение использует внутреннее хранилище браузера IndexDB. Это надежное хранилище, доступ к которому имеете только вы с текущего устройства.
        <q-stepper-navigation>
          <q-btn color="primary" label="Принять" @click="$refs.stepper.next()" />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="4"
        title="Установка имени"
        icon="add_comment"
      >
        УСТАНОВИТЕ ИМЯ
        <q-stepper-navigation>
          <q-btn color="primary" label="Закончить" @click="finish()" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {useMeta} from 'quasar'
import {StateInterface, useStore} from '../store'
import {
  Store as VuexStore,
} from 'vuex'
import {Router, useRouter} from 'vue-router'

let store: VuexStore<StateInterface>
let router: Router
const step = ref(1)

const metaData = {
  title: 'Обучение',
}

function finish() {
  void store.dispatch('tutorialComplete')
  void router.push({
    path: 'archive',
    query: {
      page: Number(1),
    },
  })
}

function main() {
  store = useStore()
  router = useRouter()
  useMeta(metaData)

  return {
    step,
    finish,
  }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Tutorial',
  setup () {
    return main()
  },
})
</script>
