<template>
  <q-page class="row justify-center full-height">
    <q-inner-loading :showing="loadingVisible">
      <q-spinner-hourglass
        color="primary"
        size="6em"
      />
    </q-inner-loading>
    <template v-if="!loadingVisible">
      <q-form
        class="col-10 q-pa-md q-gutter-sm self-start"
        @submit="onSearchText"
      >
        <q-input
          v-model="searchText"
          :label="$t('archive.search')"
          input-class="text-left">
          <template #append>
            <q-icon
              class="cursor-pointer"
              name="search"
              @click="onSearchText"/>
          </template>
        </q-input>
      </q-form>
      <q-virtual-scroll
        v-if="contracts.length"
        :items="contracts"
        separator
        class="col-12"
      >
        <template #default="{ item, index }">
          <q-card
            :key="index"
            class="q-ma-lg"
            flat
            square
            bordered>
            <div class="row justify-between q-pa-md">
              <p class="text-h6 text-uppercase text-weight-bold no-margin" :style="checkItemEndTime(item)">{{ item.instrument.name }}</p>
              <p v-if="item.instrument.description" class="text-caption text-grey">{{ item.instrument.description }}</p>
            </div>
            <q-separator v-if="item.object.length"/>
            <q-carousel
                v-if="item.object.length"
                v-model="item._currentSlide"
                transition-prev="slide-right"
                transition-next="slide-left"
                control-color="primary"
                animated
                swipeable
                :navigation="item.object.length > 1"
                infinite
              >
                <q-carousel-slide
                  v-for="(object, objectIndex) in item.object"
                  :key="objectIndex"
                  class="no-margin no-padding"
                  :name="objectIndex + 1"
                >
                  <q-scroll-area class="fit">
                    <q-img
                      class="col"
                      fit="contain"
                      :ratio="1"
                      style="max-height: 400px"
                      :src="object.contentUrl"
                      loading="lazy"
                      decoding="async"
                      no-native-menu
                    />
                  </q-scroll-area>
                </q-carousel-slide>
                <template #control>
                  <q-carousel-control
                    position="top-right"
                    :offset="[18, 18]"
                  >
                    <q-btn
                      round color="white" text-color="primary"
                      icon="fullscreen"
                      @click="showFullImage(item)"
                    />
                  </q-carousel-control>
                  <q-carousel-control
                    v-if="nativeShareIsAvailable"
                    position="top-left"
                    :offset="[18, 18]"
                  >
                    <q-btn
                      round color="white" text-color="primary"
                      icon="ios_share"
                      @click="shareFullImage(item)"
                    />
                  </q-carousel-control>
                </template>
            </q-carousel>
            <q-separator/>
            <q-card-section>
              <p class="text-overline text-orange-9 no-margin">
                {{ showDate(item) }}
              </p>
              <div class="row items-center">
                <p class="text-black text-h6 text-weight-light no-margin">
                  {{ item.agent.name }}
                </p>
                <q-space/>
                <p class="text-black no-margin">
                  {{ item.participant.name }}
                </p>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </q-virtual-scroll>
      <template v-if="paginationCount >= 1">
        <div class="col-12 q-pa-lg flex flex-center self-end">
          <q-pagination
            v-model="currentPage"
            :max="paginationCount"
            direction-links
            @update:model-value="onPaginate"
          />
        </div>
      </template>
      <template v-else>
        <div class="col-12 q-pa-lg flex flex-center">
          <q-banner class="bg-red-9 text-white q-ios-padding">
            {{ $t('archive.empty') }} 😢
          </q-banner>
        </div>
      </template>
    </template>
  </q-page>
</template>

<script lang="ts">
import {QVueGlobals, useQuasar} from 'quasar'
import {useRouter} from 'vue-router'
import {
  defineComponent,
  ref,
} from 'vue'
import {db} from 'components/ContractDatabase'
import {Contract, FormatContract} from 'components/models'
import {formatterContracts} from '../services/schemaHelper'
import {isDateNotOk, formatterDate} from '../services/dateHelper'
import {jsPDF} from 'jspdf'

const closeIconBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNNDQzLjYsMzg3LjFMMzEyLjQsMjU1LjRsMTMxLjUtMTMwYzUuNC01LjQsNS40LTE0LjIsMC0xOS42bC0zNy40LTM3LjZjLTIuNi0yLjYtNi4xLTQtOS44LTRjLTMuNywwLTcuMiwxLjUtOS44LDQgIEwyNTYsMTk3LjhMMTI0LjksNjguM2MtMi42LTIuNi02LjEtNC05LjgtNGMtMy43LDAtNy4yLDEuNS05LjgsNEw2OCwxMDUuOWMtNS40LDUuNC01LjQsMTQuMiwwLDE5LjZsMTMxLjUsMTMwTDY4LjQsMzg3LjEgIGMtMi42LDIuNi00LjEsNi4xLTQuMSw5LjhjMCwzLjcsMS40LDcuMiw0LjEsOS44bDM3LjQsMzcuNmMyLjcsMi43LDYuMiw0LjEsOS44LDQuMWMzLjUsMCw3LjEtMS4zLDkuOC00LjFMMjU2LDMxMy4xbDEzMC43LDEzMS4xICBjMi43LDIuNyw2LjIsNC4xLDkuOCw0LjFjMy41LDAsNy4xLTEuMyw5LjgtNC4xbDM3LjQtMzcuNmMyLjYtMi42LDQuMS02LjEsNC4xLTkuOEM0NDcuNywzOTMuMiw0NDYuMiwzODkuNyw0NDMuNiwzODcuMXoiLz48L3N2Zz4=';
const styleRules = `
body {
  margin: 0;
}
.icon {
  position: fixed;
  right: 0;
  top: 0;
  margin: 18px;
  min-width: 1.5em;
  min-height: 1.5em;
  width: 2.5vh;
  height: 2.5vh;
  background: white;
  border-radius: 50%;
  padding: 24px;
  outline: 0;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px rgba(0, 0, 0, 0.14), 0 1px 14px rgba(0, 0, 0, 0.12);
}
`

let $q: QVueGlobals

const paginationCount = ref(0)
const contracts = ref([])
const searchText = ref('')
const limit = ref(5)
const currentPage = ref(1)
const loadingVisible = ref(false)
const nativeShareIsAvailable = ref(!!navigator.share)

function showFullImage(object: FormatContract) {
  const image = object.object[object._currentSlide - 1]
  const styleSheet = document.createElement('style')
  styleSheet.innerHTML = styleRules
  const newWin = window.open('about:blank', '_blank')
  newWin.document.write(`
     <a href="javascript: self.close()">
         <img src="${closeIconBase64}" class="icon" alt="">
     </a>
     <img width="100%" src="${image.contentUrl}" alt="">
   `)
  newWin.document.head.appendChild(styleSheet)
}

async function resizeImageA4(dataUrl: string) {
  const MAX_WIDTH = 794
  const MAX_HEIGHT = 1123

  const img = new Image()
  img.src = dataUrl
  await img.decode()
  let {width, height} = img

  // resizing logic
  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width
      width = MAX_WIDTH
    }
  } else if (height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height
    height = MAX_HEIGHT
  }

  return [width, height];
}

async function getShareData(object: FormatContract) {
  const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling']
    })
  const files = []
  let docLength = 0

  for (const image of object.object) {
    const dataUrl = image.contentUrl
    const [mimeType] = dataUrl.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)

    if (mimeType === 'application/pdf') {
      const [extension] = dataUrl.match(/[^:/]\w+(?=;|,)/)
      const res = await fetch(image.contentUrl)
      const blob: Blob = await res.blob()
      const fileName = object.instrument.name + '.' + extension
      const file = new File([new Blob([blob])], fileName, { type: mimeType })
      files.push(file)
      continue
    }

    const format = mimeType.replace('image/', '').toUpperCase()
    const [width, height] = await resizeImageA4(dataUrl)
    if (docLength != 0) {
      doc.addPage()
    }
    doc.addImage(dataUrl, format, 0, 0, width, height)
    docLength++
  }

  if (docLength > 0) {
    const output = doc.output('blob')
    doc.close()
    const file = new File([output], object.instrument.name + '.pdf')
    files.push(file)
  }

  return {
    title: object.instrument.name,
    files
  }
}

async function shareFullImage(object: FormatContract) {
  const shareData = await getShareData(object)
  try {
    await navigator.share(shareData)
  } catch (error) {
    console.warn('Sharing failed', error)
  }
}

async function setContracts() {
  loadingVisible.value = true
  contracts.value = []
  const offset = (currentPage.value - 1) * limit.value
  const queryFilter = searchText.value

  if (queryFilter.length > 0) { // searching
    const searchTerms = queryFilter.split(' ')
    const count: number = await db.contracts.where('instrument_name')
      .startsWithAnyOfIgnoreCase(searchTerms)
      .or('instrument_name')
      .anyOfIgnoreCase(searchTerms)
      .count()
    if (count) {
      const data = await db.contracts.where('instrument_name')
        .startsWithAnyOfIgnoreCase(searchTerms)
        .or('instrument_name')
        .anyOfIgnoreCase(searchTerms)
        .reverse()
        .offset(offset)
        .limit(limit.value)
        .toArray() as Contract[]
      contracts.value = formatterContracts(data)
      paginationCount.value = Math.ceil(count / limit.value)
    } else {
      paginationCount.value = 0
    }
  } else { // all
    const count: number = await db.contracts.count()
    if (count) {
      const data = await db.contracts.orderBy('startTime').reverse().offset(offset).limit(limit.value).toArray() as Contract[]
      contracts.value = formatterContracts(data)
      paginationCount.value = Math.ceil(count / limit.value)
    } else {
      paginationCount.value = 0
    }
  }
  loadingVisible.value = false
}

function setValues({page, filter}: {page: string|string[], filter: string|string[]}) {
  currentPage.value = Number(page ?? 1)
  searchText.value = String(filter ?? '')
}

function routerFunc() {
  const router = useRouter()
  setValues({
    page: router.currentRoute.value.query.page,
    filter: router.currentRoute.value.query.filter
  })

  void (async (): Promise<void> => {
    try {
      await setContracts()
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: 'Связь с базой данных не установлена',
        timeout: 1000 * 1000,
        actions: [
          { label: 'Закрыть', color: 'white', handler: () => { /* ... */ } }
        ]
      })
    }
  })()

  return {
    onPaginate(page: string): void {
      void router.push({
        path: 'archive',
        query: {
          filter: searchText.value,
          page: Number(page),
        }
      })
    },
    onSearchText(): void {
      void router.push({
        path: 'archive',
        query: {
          filter: searchText.value,
          page: 1,
        }
      })
    }
  }
}

function checkItemEndTime(item: Contract) {
  if (item.endTime < new Date()) {
    return { 'text-decoration': 'line-through' }
  }
  return {}
}

function showDate(item: Contract) {
  if (isDateNotOk(item.startTime) || isDateNotOk(item.endTime)) {
    return ''
  }
  return formatterDate.format(item.startTime)  + ' — ' +  formatterDate.format(item.endTime)
}

function main() {
  $q = useQuasar()

  return {
      contracts,
      searchText,
      currentPage,
      loadingVisible,
      paginationCount,
      nativeShareIsAvailable,
      showDate,
      showFullImage,
      shareFullImage,
      checkItemEndTime,
      ...routerFunc(),
    }
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'List',
  async beforeRouteUpdate(to) {
    setValues({
      page: to.query.page,
      filter: to.query.filter
    })
    await setContracts()
  },
  setup() {
    return main()
  }
})
</script>
