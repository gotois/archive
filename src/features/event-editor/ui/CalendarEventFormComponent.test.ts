import { defineComponent, h } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

const eventStoreMock = vi.hoisted(() => ({
  createEvent: vi.fn(),
  editEvent: vi.fn(),
}))

vi.mock('../model/store', () => ({
  default: () => eventStoreMock,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/shared/lib/detector', async () => {
  const { computed } = await import('vue')
  return { isTMA: computed(() => false) }
})

vi.mock('quasar', async (importOriginal) => {
  const original = await importOriginal<typeof import('quasar')>()
  return {
    ...original,
    useQuasar: () => ({
      platform: { is: { desktop: true } },
      notify: vi.fn(),
      dialog: vi.fn(),
    }),
  }
})

import CalendarEventFormComponent from './CalendarEventFormComponent.vue'

const formStub = defineComponent({
  name: 'QForm',
  emits: ['submit'],
  setup(_, { emit, expose, slots }) {
    expose({ validate: async () => true })
    return () =>
      h(
        'form',
        {
          onSubmit: (event: Event) => {
            event.preventDefault()
            emit('submit')
          },
        },
        slots.default?.(),
      )
  },
})

describe('CalendarEventFormComponent', () => {
  test('creates a new event when the form is submitted', async () => {
    const wrapper = shallowMount(CalendarEventFormComponent, {
      props: {
        task: {
          id_task: 0,
          targetType: 'Person',
          name: 'Новое событие',
          start_date: '2026-07-22T10:00:00.000Z',
          end_date: '2026-07-22T11:00:00.000Z',
        },
        readonly: false,
        taskId: null,
      },
      global: {
        stubs: {
          QForm: formStub,
          QCardActions: {
            template: '<div><slot /></div>',
          },
        },
      },
    })

    expect(wrapper.html()).toContain('label="Создать"')
    await wrapper.find('form').trigger('submit')

    expect(eventStoreMock.createEvent).toHaveBeenCalledOnce()
  })
})
