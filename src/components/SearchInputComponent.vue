<template>
  <div
    :class="{
      'light-dimmed': isDragging,
    }"
    class="flex self-end"
    @dragenter="dragenter"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <!-- FIXME нужно объединить это в один умный Input
    где пользователь будет выбирать уже существующие события из БД
    и добавлять их к своим запросам
    запросы будут отпраавляться в метод Chat Секретаря  -->

    <QSelect
      ref="select"
      v-model.trim="searchText"
      :hide-hint="!$q.platform.is.desktop"
      :hide-bottom-space="!$q.platform.is.desktop"
      autocomplete="off"
      spellcheck="false"
      color="primary"
      class="no-margin"
      input-class="text-left q-pb-md"
      :dense="$q.platform.is.desktop"
      style="width: 100%"
      label-color="primary"
      input-debounce="50"
      :options="searchOptions"
      :maxlength="256"
      :label="label"
      :bg-color="$q.dark.isActive ? 'dark' : 'grey-1'"
      :behavior="$q.platform.is.ios ? 'dialog' : 'menu'"
      use-input
      hide-dropdown-icon
      hide-selected
      stack-label
      autofocus
      square
      fill-input
      new-value-mode="add-unique"
      @input-value="onInput"
      @update:model-value="sendChat(inputText)"
      @filter="onFilterSelect"
    >
      <template #prepend>
        <QBtnDropdown
          :model-value="showed"
          class="text-weight-light no-margin"
          content-class="no-shadow no-border no-border-radius"
          no-caps
          flat
          unelevated
          square
          dense
          :transition-duration="0"
          persistent
          :disable-dropdown="false"
          :disable-main-btn="false"
          size="xm"
          align="left"
          :ripple="false"
          text-color="black-9"
          :fab-mini="$q.platform.is.desktop"
          :fab="!$q.platform.is.desktop"
          @update:model-value="
            () => {
              console.log('change model value')
            }
          "
        >
          <QItem dense>
            <QItemSection no-wrap>
              <QFile
                v-model="files"
                :label="$t('files.type')"
                :counter="Boolean(files.length)"
                :accept="`${PNG_MIME_TYPE}, ${JPG_MIME_TYPE}, ${PDF_MIME_TYPE}`"
                color="primary"
                label-color="primary"
                class="shadow-1 cursor-pointer"
                unelevated
                borderless
                flat
                round
                filled
                :hide-hint="!$q.platform.is.desktop"
                :hide-bottom-space="!$q.platform.is.desktop"
                :dense="$q.platform.is.desktop"
                multiple
                square
                :bg-color="$q.dark.isActive ? 'dark' : 'white'"
                @update:model-value="onFileSelect"
              >
                <template #prepend>
                  <QIcon name="attach_file" color="primary" />
                </template>
                <QTooltip>{{ $t('files.hint') }}</QTooltip>
              </QFile>
            </QItemSection>
          </QItem>
        </QBtnDropdown>
      </template>
      <template #no-option>
        <QItem>
          <QItemSection class="text-grey non-selectable">
            {{ $t('archive.notfound') }}
          </QItemSection>
        </QItem>
      </template>
      <template #append>
        <template v-if="!searching">
          <QBtn
            v-if="hasText"
            class="cursor-pointer"
            hide-label
            glossy
            square
            push
            icon="send"
            vertical-actions-align="right"
            color="primary"
            :class="{
              'bg-dark': !$q.dark.isActive,
              'secondary': $q.dark.isActive,
            }"
            @click="sendChat(inputText)"
          />
        </template>
        <!--template v-else-if="searching">
          <QSpinner color="primary" />
        </template-->
      </template>
    </QSelect>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, PropType, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useQuasar,
  QSelect,
  QItem,
  QItemSection,
  QSpinner,
  QIcon,
  QFile,
  QTooltip,
  QBtnDropdown,
  QBtn,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import useChatStore from 'stores/chat'
import useAuthStore from 'stores/auth'
import useGeoStore from 'stores/geo'
import useTutorialStore from 'stores/tutorial'
import {
  PDF_MIME_TYPE,
  PNG_MIME_TYPE,
  JPG_MIME_TYPE,
} from '../helpers/mimeTypes'
import { VerifiableCredential } from '../types/models'
import { miniSearch } from '../services/searchService'
import { ROUTE_NAMES } from '../router/routes'
import { readFilePromise } from '../helpers/fileHelper'
import { createPDF } from '../helpers/pdfHelper'

const $q = useQuasar()
const $t = useI18n().t
const chatStore = useChatStore()
const authStore = useAuthStore()
const geoStore = useGeoStore()
const tutorialStore = useTutorialStore()
const router = useRouter()

const select = ref<InstanceType<typeof QSelect> | null>(null)
const searchText = ref('')
const searchOptions = ref([])
const searching = ref(false)
const inputText = ref('')
const showed = ref(false)
const hasText = computed(() => inputText.value !== '')
const isDragging = ref(false)
const files = ref([])
const contract = ref<VerifiableCredential>(null)

const creatingNewContract = ref(false)

const emit = defineEmits(['sent', 'send'])

function onInput(value: string) {
  inputText.value = value
}

defineProps({
  label: {
    type: String as PropType<string>,
    default: '',
  },
})

async function sendChat(value: string) {
  if (!value.length) {
    return
  }
  emit('send', value)
  clearText()
  select.value.blur()
  try {
    const { credentialSubject } = await chatStore.send([
      {
        type: 'Note',
        content: value,
        mediaType: 'text/plain',
      },
      geoStore.point,
    ])
    emit('sent', credentialSubject.object.contentMap.ru)
  } catch (error) {
    console.error(error)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (error.message) {
      case 'Unauthorized': {
        $q.notify({
          message: 'JWT expired',
          type: 'error',
          actions: [
            {
              label: 'Авторизоваться заново',
              handler() {
                authStore.logout()
                tutorialStore.tutorialComplete(false)
                void router.push({
                  name: ROUTE_NAMES.TUTORIAL,
                })
              },
            },
          ],
        })
        break
      }
      default: {
        $q.notify({
          type: 'negative',
          message: error.message as string,
        })
      }
    }
  }
}

function dragenter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function dragover(e: Event) {
  e.preventDefault()
  isDragging.value = true
}

function dragleave() {
  isDragging.value = false
}

function drop(e: DragEvent) {
  e.preventDefault()
  const files: File[] = Array.from(e.dataTransfer.files).filter(
    (file: File) => {
      switch (file.type) {
        case PDF_MIME_TYPE:
        case PNG_MIME_TYPE:
        case JPG_MIME_TYPE:
          return true
        default:
          return false
      }
    },
  )
  onFileSelect(files)
  isDragging.value = false
}

function onFileSelect(files: File[]) {
  const filesUrls = []
  for (const file of files) {
    filesUrls.push({
      url: URL.createObjectURL(file),
      encodingFormat: file.type,
      caption: file.name,
    })
  }
  if (filesUrls.length === 0) {
    return
  }
}

function sent(value: string) {
  if (!value.length) {
    return
  }
  emit('search', value)
  select.value.blur()
  clearText()
}

function clearText() {
  searchText.value = ''
  select.value.updateInputValue('')
  searchOptions.value = []
  searching.value = false
}

function onFilterSelect(
  val: string,
  update: (callback: () => void, callback2: (ref: QSelect) => void) => void,
  abort: () => void,
) {
  if (searching.value) {
    abort()
  }
  if (val.length < 3) {
    abort()
    return
  }
  searching.value = true

  abort()
  setTimeout(() => {
    update(
      () => {
        if (val === '') {
          /* empty */
        } else {
          const suggestionElement = new Set()
          miniSearch.autoSuggest(val, {
            fuzzy: (term) => (term.length > 3 ? 0.2 : null),
            processTerm: (term) => term.toLowerCase(),
            boost: {
              instrument_name: 2,
            },
            prefix: true,
            filter: (searchResult) => {
              if (suggestionElement.has(searchResult.instrument_name)) {
                return false
              }
              suggestionElement.add(searchResult.instrument_name)
              return true
            },
          })
          searchOptions.value = Array.from(suggestionElement)
        }
        searching.value = false
      },
      (ref) => {
        if (
          val !== '' &&
          ref.options.length > 0 &&
          ref.getOptionIndex() === -1
        ) {
          ref.setOptionIndex(-1)
          ref.moveOptionSelection(1, true)
        }
      },
    )
  }, 500)
}

onMounted(() => {
  select.value.showPopup()
  select.value.focus()
})
</script>
