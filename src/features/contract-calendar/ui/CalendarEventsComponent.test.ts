import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, test, vi } from 'vitest'
import useGeoStore from '@/shared/model/geo'
import CalendarEventsComponent from './CalendarEventsComponent.vue'
import { getCalendarContracts } from '../model/getCalendarContracts'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('../model/getCalendarContracts', () => ({
  getCalendarContracts: vi.fn(),
}))

const QDateStub = defineComponent({
  name: 'QDate',
  props: {
    modelValue: { type: [String, Date], default: '' },
    events: { type: Array, default: (): string[] => [] },
    options: { type: Array, default: (): string[] => [] },
  },
  emits: ['navigation', 'update:modelValue'],
  template: '<div data-test="calendar-date" />',
})

const wrappers: VueWrapper[] = []

function mountCalendar(): VueWrapper {
  const pinia = createPinia()
  setActivePinia(pinia)
  const geoStore = useGeoStore()
  geoStore.timeZone = 'Europe/Moscow'
  const wrapper = mount(CalendarEventsComponent, {
    global: {
      plugins: [pinia],
      stubs: {
        QDate: QDateStub,
      },
    },
  })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.clearAllMocks()
})

describe('CalendarEventsComponent loading', () => {
  test('ignores an obsolete request result', async () => {
    let resolveFirstRequest: (
      value: Awaited<ReturnType<typeof getCalendarContracts>>,
    ) => void
    const firstRequest = new Promise<
      Awaited<ReturnType<typeof getCalendarContracts>>
    >((resolve) => {
      resolveFirstRequest = resolve
    })
    vi.mocked(getCalendarContracts)
      .mockReturnValueOnce(firstRequest)
      .mockResolvedValueOnce([
        {
          id: 2,
          title: 'Current',
          start: '2030/04/02',
          end: '2030/04/02',
        },
      ])
    const wrapper = mountCalendar()

    wrapper.findComponent(QDateStub).vm.$emit('navigation', {
      year: 2030,
      month: 4,
    })
    await vi.waitFor(() => {
      expect(getCalendarContracts).toHaveBeenCalledTimes(2)
    })
    await vi.waitFor(() => {
      expect(wrapper.findComponent(QDateStub).props('events')).toEqual([
        '2030/04/02',
      ])
    })

    resolveFirstRequest!([
      {
        id: 1,
        title: 'Obsolete',
        start: '2029/01/01',
        end: '2029/01/01',
      },
    ])
    await flushPromises()

    expect(wrapper.findComponent(QDateStub).props('events')).toEqual([
      '2030/04/02',
    ])
  })
})
