import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/shared/lib/detector', async () => {
  const { computed } = await import('vue')
  return { isTMA: computed(() => false) }
})

import useCalendarSubscriptionQuery, {
  calendarApi,
} from '@/features/calendar-subscription'
import useGeoStore from '@/shared/model/geo'
import useSecretaryStore from '@/entities/secretary-auth'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCalendarSubscriptionQuery', () => {
  test('uses auth and timezone and updates the query key with timezone', async () => {
    const getSubscription = vi
      .spyOn(calendarApi, 'getSubscription')
      .mockResolvedValue('BEGIN:VCALENDAR\r\nEND:VCALENDAR')
    const pinia = createPinia()
    setActivePinia(pinia)
    const geoStore = useGeoStore()
    const secretaryStore = useSecretaryStore()
    geoStore.timeZone = 'Asia/Tokyo'
    secretaryStore.login = 'user'
    secretaryStore.password = 'password'
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const host = defineComponent({
      setup() {
        useCalendarSubscriptionQuery()
        return () => h('div')
      },
    })
    const wrapper = mount(host, {
      global: {
        plugins: [pinia, [VueQueryPlugin, { queryClient }]],
      },
    })

    await vi.waitFor(() => {
      expect(getSubscription).toHaveBeenCalledWith({
        timezone: 'Asia/Tokyo',
        authorization: `Basic ${btoa('user:password')}`,
      })
    })
    await vi.waitFor(() => {
      expect(
        queryClient.getQueryData([
          'calendar',
          'subscription',
          'web',
          'Asia/Tokyo',
        ]),
      ).toBe('BEGIN:VCALENDAR\r\nEND:VCALENDAR')
    })

    geoStore.timeZone = 'UTC'
    await vi.waitFor(() => {
      expect(getSubscription).toHaveBeenLastCalledWith({
        timezone: 'UTC',
        authorization: `Basic ${btoa('user:password')}`,
      })
    })

    wrapper.unmount()
    queryClient.clear()
  })
})
