<template>
  <QBar dense class="non-selectable bg-transparent text-primary">
    <div>{{ $t('productName') }}</div>
    <QIcon v-if="!$q.dark.isActive" name="img:/icons/safari-pinned-tab.svg" />
    <QSpace />
    <QIcon v-if="connectionSupports" :name="signalIcon(state.connectionType)" />
    <div v-if="state.batteryLevel >= 0" class="gt-xs">{{ batteryLevel }}%</div>
    <QIcon
      v-if="batterySupports"
      :name="batteryIcon(state.batteryLevel, state.batteryCharging)"
    />
    <div>{{ date.formatDate(now as Date, 'HH:mm') }}</div>
  </QBar>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { useQuasar, date, QSpace, QBar, QIcon } from 'quasar'

const $q = useQuasar()

const state = reactive({
  batteryCharging: false,
  batteryLevel: -1,
  connectionType: '',
})

const batteryLevel = computed(() => {
  return state.batteryLevel * 100
})

const now = ref<Date>(new Date())

const connectionSupports = Reflect.has(navigator, 'connection')
const batterySupports = Reflect.has(navigator, 'getBattery')
const updateDate = setInterval(() => {
  now.value = new Date()
}, 1000)

function batteryIcon(batteryLevel: number, batteryCharging: boolean) {
  if (batteryCharging) {
    return 'battery_charging_full'
  } else if (batteryLevel === 0) {
    return 'badge_critical_battery'
  } else if (batteryLevel <= 10) {
    return 'battery_very_low'
  } else if (batteryLevel <= 20) {
    return 'battery_low'
  } else if (batteryLevel <= 50) {
    return 'battery_horiz_050'
  } else if (batteryLevel <= 75) {
    return 'battery_horiz_075'
  } else if (batteryLevel <= 100) {
    return 'battery_full_alt'
  } else {
    return 'battery_unknown'
  }
}

function signalIcon(connectionType: string) {
  switch (connectionType) {
    case 'slow-2g': {
      return 'g_mobiledata'
    }
    case '2g': {
      return 'e_mobiledata'
    }
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
  state.connectionType.value = navigator.connection.effectiveType
  navigator.connection.addEventListener('change', () => {
    console.warn(
      `Connection type changed to ${navigator.connection.effectiveType}`,
    )
    state.connectionType.value = navigator.connection.effectiveType
  })
  /* eslint-enable */
}

// todo очищать слушатели
async function watchBattery() {
  /* eslint-disable */
  const battery = await navigator.getBattery()
  state.batteryCharging.value = battery.charging
  state.batteryLevel.value = battery.level

  battery.addEventListener('chargingchange', () => {
    console.warn(`Battery charging - ${battery.charging ? 'Yes' : 'No'}`)
    state.batteryCharging.value = battery.charging
  });

  battery.addEventListener('levelchange', () => {
    console.warn(`Battery level: ${battery.level * 100}%`)
    state.batteryLevel.value = battery.level
  })
  /* eslint-enable */
}

onMounted(async () => {
  if (connectionSupports) {
    watchConnection()
  }
  if (batterySupports) {
    await watchBattery()
  }
})
onUnmounted(() => {
  clearInterval(updateDate)
})
</script>
