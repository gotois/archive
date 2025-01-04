<template>
  <QChatMessage
    name="Вы"
    :text="userMessages"
    :stamp="timeAgo(new Date())"
    text-html
    sent
  />
  <QChatMessage
    name="Секретарь"
    :text="botMessages"
    :stamp="timeAgo(new Date())"
    text-html
  />
</template>
<script lang="ts" setup>
import { date, QChatMessage } from 'quasar'
import { parse } from '../helpers/markdownHelper'

const userMessages = [parse('Привет'), parse('Запиши завтра на встречу')]
const botMessages = [parse('**На какое время?**')]

function timeAgo(d: Date) {
  return date.formatDate(d, 'YYYY/MM/DD HH:mm')
}
</script>
