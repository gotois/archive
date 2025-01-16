<template>
  <QDialog square @show="indexAllDocuments">
    <QCard
      class="full-width"
      :class="{
        'absolute-top': $q.platform.is.mobile,
      }"
    >
      <QCardSection class="no-border">
        <div class="text-h6 non-selectable">{{ $t('archive.search') }}</div>
        <QTooltip>
          {{ $t('archive.tooltip') }}
        </QTooltip>
        <InputComponent
          :autofocus="$q.platform.is.desktop"
          :label="$t('searchDialog.searchText')"
          @search="(value) => emit('search', value)"
        />
      </QCardSection>
      <QCardActions align="right" class="text-primary">
        <QBtn
          v-close-popup
          flat
          color="accent"
          :dense="$q.platform.is.desktop"
          :label="$t('searchDialog.cancel')"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  useQuasar,
  QDialog,
  QBtn,
  QCard,
  QCardSection,
  QTooltip,
  QCardActions,
} from 'quasar'
import InputComponent from 'components/SearchInputComponent.vue'
import { indexAllDocuments } from '../services/searchService'

const emit = defineEmits(['search'])

const $t = useI18n().t
const $q = useQuasar()
</script>
