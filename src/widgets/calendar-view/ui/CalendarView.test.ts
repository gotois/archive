import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const host = vi.hoisted(() => ({
  isChatGPT: { __v_isRef: true, value: false },
}))

vi.mock('@/shared/lib/detector', () => ({
  isChatGPT: host.isChatGPT,
}))

vi.mock('./ScheduleCalendarView.vue', () => ({
  default: {
    template: '<div data-test="schedule-calendar" />',
  },
}))

vi.mock('./ChatGPTCalendarView.vue', () => ({
  default: {
    template: '<div data-test="chatgpt-calendar" />',
  },
}))

import CalendarView from './CalendarView.vue'

beforeEach(() => {
  host.isChatGPT.value = false
})

describe('CalendarView host presentation', () => {
  test('renders the standard calendar for regular clients', () => {
    const wrapper = mount(CalendarView)

    expect(wrapper.find('[data-test="schedule-calendar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="chatgpt-calendar"]').exists()).toBe(false)
  })

  test('renders the ChatGPT presentation inside the same widget', async () => {
    host.isChatGPT.value = true
    const wrapper = mount(CalendarView)
    await flushPromises()

    expect(wrapper.find('[data-test="chatgpt-calendar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="schedule-calendar"]').exists()).toBe(false)
  })
})
