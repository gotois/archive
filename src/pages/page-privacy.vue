<template>
  <privacy-component></privacy-component>
</template>

<script lang="ts" setup>
import {useMeta} from 'quasar'
import PrivacyComponent from 'components/PrivacyComponent'

const metaData = {
  title: 'Пользовательское соглашение',
}

useMeta(metaData)
</script>
