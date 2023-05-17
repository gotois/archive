<template>
  <QBar dense>
    <div>Мои договоры</div>
    <QIcon name="img:/icons/safari-pinned-tab.svg" />
    <QSpace />
    <QIcon v-if="connectionSupports" :name="signalIcon(connectionType)" />
    <div v-if="batteryLevel >= 0" class="gt-xs">{{ batteryLevel * 100 }}%</div>
    <QIcon
      v-if="batterySupports"
      :name="batteryIcon(batteryLevel, batteryCharning)"
    />
    <div>{{ time }}</div>
  </QBar>
</template>
<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { date, QSpace, QBar, QIcon } from 'quasar'

const batteryCharning = ref(false)
const batteryLevel = ref(-1)
const connectionType = ref('')

const connectionSupports = computed(() => Reflect.has(navigator, 'connection'))
const batterySupports = computed(() => Reflect.has(navigator, 'getBattery'))
const time = computed(() => date.formatDate(new Date(), 'HH:mm'))

// todo добавить оставшиеся иконки в зависимости от состояния батареи
function batteryIcon(batteryLevel, batteryCharning) {
  if (batteryCharning) {
    return 'battery_charging_full'
  } else {
    return 'battery_full'
  }
}

function signalIcon(connectionType: string) {
  switch (connectionType) {
    case '3g': {
      return '3g_mobiledata'
    }
    case '4g': {
      return '4g_mobiledata'
    }
    case '5g': {
      return '5g_mobiledata'
    }
    default: {
      return 'signal_cellular_null'
    }
  }
}

function watchConnection() {
  /* eslint-disable */
  connectionType.value = navigator.connection.effectiveType
  navigator.connection.addEventListener('change', () => {
    console.log(
      `Connection type changed to ${navigator.connection.effectiveType}`,
    )
    connectionType.value = navigator.connection.effectiveType
  })
  /* eslint-enable */
}

async function watchBattery() {
  /* eslint-disable */
  const battery = await navigator.getBattery()
  batteryCharning.value = battery.charging
  batteryLevel.value = battery.level

  battery.addEventListener("chargingchange", () => {
    console.log(`Battery charging - ${battery.charging ? 'Yes' : 'No'}`)
    batteryCharning.value = battery.charging
  });

  battery.addEventListener('levelchange', () => {
    console.log(`Battery level: ${battery.level * 100}%`)
    batteryLevel.value = battery.level
  })
  /* eslint-enable */
}

onMounted(async () => {
  if (Reflect.has(navigator, 'connection')) {
    watchConnection()
  }
  if (Reflect.has(navigator, 'getBattery')) {
    await watchBattery()
  }
})
</script>
