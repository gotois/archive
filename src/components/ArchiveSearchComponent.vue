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
        <SearchInputComponent
          autofocus
          :label="$t('searchDialog.searchText')"
          @search="(value) => $emit('onSearch', value)"
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
import {
  QDialog,
  QBtn,
  QCard,
  QCardSection,
  QTooltip,
  QCardActions,
} from 'quasar'
import SearchInputComponent from 'components/SearchInputComponent.vue'
import { indexAllDocuments } from '../services/searchService'

defineEmits(['onSearch'])
</script>
