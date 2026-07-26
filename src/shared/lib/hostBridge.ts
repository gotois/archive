import { inject, type InjectionKey } from 'vue'

export const CHATGPT_WIDGET_STATE_KEY = 'secretaryCalendar'

export interface ChatGPTTask {
  id_task: number
  name: string
  description?: string | null
  id_tasks_status?: number
  task_status_name?: string
  id_category?: number
  category_name?: string
  priority?: number
  created_at?: string
  updated_at?: string
  estimated_unix_time?: number
  start_date: string
  end_date?: string | null
  id_parent_task?: number
  latitude?: number
  longitude?: number
  location?: string | null
  id_cal_class?: number
  link_meeting?: string | null
  actual_start_date?: string
  actual_end_date?: string
  uid_task?: string
  i_cal_class_name?: string
  id_recurrence?: number
  notification_date_time?: string
  remind_before?: number
  sequence?: number
  attendee?: number[]
  targetType?: 'Group' | 'Person'
}

export interface ChatGPTStructuredContent {
  operation?: 'show' | 'prepare-create' | 'create' | 'edit' | 'remove'
  tasks?: ChatGPTTask[]
  selectedDate?: string
  timezone?: string
}

export interface ChatGPTModalState {
  mode: 'view' | 'edit' | 'create'
  taskId?: number
}

export interface ChatGPTWidgetState {
  content?: ChatGPTStructuredContent
}

export interface ChatGPTToolResult {
  structuredContent?: ChatGPTStructuredContent
  content?: Array<{ type: string; text?: string }>
  isError?: boolean
}

export interface OpenAIGlobals {
  toolInput?: Record<string, unknown>
  toolOutput?: ChatGPTStructuredContent
  toolResponseMetadata?: {
    mcp_tool_result?: ChatGPTToolResult
    call_tool_result?: ChatGPTToolResult
    status?: string
  }
  widgetState?: Record<string, unknown>
  theme?: 'light' | 'dark'
  locale?: string
  userLocation?: {
    timezone?: string
  }
  view?: string
  callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ChatGPTToolResult>
  requestModal?: (options?: {
    params?: Record<string, unknown>
    template?: string
  }) => Promise<unknown>
  requestClose?: () => Promise<void> | void
  notifyIntrinsicHeight?: (height?: number) => void
  openExternal?: (options: {
    href: string
    redirectUrl?: boolean
  }) => Promise<void> | void
  setWidgetState?: (state: Record<string, unknown>) => void
}

export interface HostBridge {
  readonly isAvailable: boolean
  readonly theme?: 'light' | 'dark'
  readonly locale?: string
  readonly timezone?: string
  readonly toolInput?: Record<string, unknown>
  readonly toolOutput?: ChatGPTStructuredContent
  readonly widgetState?: ChatGPTWidgetState
  callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ChatGPTToolResult>
  requestModal(params: ChatGPTModalState): Promise<boolean>
  requestClose(): Promise<void>
  notifyIntrinsicHeight(height?: number): void
  setWidgetState(state: ChatGPTWidgetState): void
  subscribe(callback: () => void): () => void
}

class PassiveHostBridge implements HostBridge {
  readonly isAvailable = false

  async callTool(): Promise<ChatGPTToolResult> {
    throw new Error('ChatGPT tools are unavailable')
  }

  async requestModal(): Promise<boolean> {
    return false
  }

  async requestClose(): Promise<void> {}

  notifyIntrinsicHeight(): void {}

  setWidgetState(): void {}

  subscribe(): () => void {
    return () => {}
  }
}

class ChatGPTHostBridge implements HostBridge {
  readonly isAvailable = true

  get openai(): OpenAIGlobals {
    return window.openai!
  }

  get theme(): 'light' | 'dark' | undefined {
    return this.openai.theme
  }

  get locale(): string | undefined {
    return this.openai.locale
  }

  get timezone(): string | undefined {
    return this.openai.userLocation?.timezone
  }

  get toolInput(): Record<string, unknown> | undefined {
    return this.openai.toolInput
  }

  get toolOutput(): ChatGPTStructuredContent | undefined {
    return this.openai.toolOutput
  }

  get widgetState(): ChatGPTWidgetState | undefined {
    const state = this.openai.widgetState?.[CHATGPT_WIDGET_STATE_KEY]
    return state && typeof state === 'object'
      ? (state as ChatGPTWidgetState)
      : undefined
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ChatGPTToolResult> {
    const result = await this.openai.callTool(name, args)
    if (result.isError) {
      const message = result.content
        ?.map((item) => item.text)
        .filter(Boolean)
        .join('\n')
      throw new Error(message || `Tool ${name} failed`)
    }
    return result
  }

  async requestModal(params: ChatGPTModalState): Promise<boolean> {
    if (!this.openai.requestModal) {
      return false
    }
    await this.openai.requestModal({
      params: params as unknown as Record<string, unknown>,
    })
    return true
  }

  async requestClose(): Promise<void> {
    await this.openai.requestClose?.()
  }

  notifyIntrinsicHeight(height?: number): void {
    this.openai.notifyIntrinsicHeight?.(height)
  }

  setWidgetState(state: ChatGPTWidgetState): void {
    this.openai.setWidgetState?.({
      ...this.openai.widgetState,
      [CHATGPT_WIDGET_STATE_KEY]: state,
    })
  }

  subscribe(callback: () => void): () => void {
    const listener = () => callback()
    window.addEventListener('openai:set_globals', listener, { passive: true })
    return () => window.removeEventListener('openai:set_globals', listener)
  }
}

export const HOST_BRIDGE_KEY: InjectionKey<HostBridge> = Symbol(
  'secretary-host-bridge',
)

let hostBridge: HostBridge = new PassiveHostBridge()

export function initializeHostBridge(): HostBridge {
  hostBridge = window.openai ? new ChatGPTHostBridge() : new PassiveHostBridge()
  return hostBridge
}

export function getHostBridge(): HostBridge {
  return hostBridge
}

export function useHostBridge(): HostBridge {
  return inject(HOST_BRIDGE_KEY, hostBridge)
}

declare global {
  interface Window {
    openai?: OpenAIGlobals
  }

  interface WindowEventMap {
    'openai:set_globals': CustomEvent<{
      globals: Partial<OpenAIGlobals>
    }>
  }
}
