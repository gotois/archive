import { Dark, LocalStorage } from 'quasar'
import { boot } from 'quasar/wrappers'
import type { RouteLocationRaw, Router } from 'vue-router'
import { normalizeLocale } from '@/i18n'
import { ROUTE_NAMES } from '@/shared/config/routes'
import { isChatGPT } from '@/shared/lib/detector'
import {
  HOST_BRIDGE_KEY,
  initializeHostBridge,
  type ChatGPTModalState,
  type HostBridge,
} from '@/shared/lib/hostBridge'

export function getModalState(
  input?: Record<string, unknown>,
): ChatGPTModalState | undefined {
  if (
    input?.mode !== 'create' &&
    input?.mode !== 'view' &&
    input?.mode !== 'edit'
  ) {
    return undefined
  }
  const taskId =
    typeof input.taskId === 'number' && Number.isFinite(input.taskId)
      ? input.taskId
      : undefined
  if (input.mode !== 'create' && taskId === undefined) {
    return undefined
  }
  return {
    mode: input.mode,
    taskId,
  }
}

export function getInitialRoute(
  input?: Record<string, unknown>,
): RouteLocationRaw {
  const modal = getModalState(input)
  if (modal?.mode === 'create') {
    return { name: ROUTE_NAMES.NEW }
  }
  if (modal?.mode === 'view') {
    return {
      name: ROUTE_NAMES.VIEW,
      params: { taskId: modal.taskId },
    }
  }
  if (modal?.mode === 'edit') {
    return {
      name: ROUTE_NAMES.EDIT,
      params: { taskId: modal.taskId },
    }
  }
  return { name: ROUTE_NAMES.CALENDAR }
}

function applyHostPreferences(bridge: HostBridge): void {
  Dark.set(bridge.theme === 'dark')
  if (bridge.locale) {
    LocalStorage.set('locale', normalizeLocale(bridge.locale))
  }
}

async function openInitialRoute(
  router: Router,
  bridge: HostBridge,
): Promise<void> {
  await router.isReady()
  await router.replace(getInitialRoute(bridge.toolInput))
}

export default boot(({ app, router }) => {
  const bridge = initializeHostBridge()
  app.provide(HOST_BRIDGE_KEY, bridge)

  if (!isChatGPT.value) {
    return
  }

  document.documentElement.classList.add('chatgpt-host')
  openInitialRoute(router, bridge).catch((error) => {
    console.error('Unable to open ChatGPT route:', error)
  })
  if (!bridge.isAvailable) {
    return
  }

  applyHostPreferences(bridge)
  bridge.subscribe(() => {
    applyHostPreferences(bridge)
  })
})
