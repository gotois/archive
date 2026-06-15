import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import useGeoStore from 'stores/geo'
import useSecretaryStore from 'stores/secretary'
import { calendarApi } from '../api/modules/calendar.api'
import { queryKeys } from '../api/queryKeys'
import { isTMA } from '../composables/detector'

export function useCalendarSubscriptionQuery() {
  const geoStore = useGeoStore()
  const secretaryStore = useSecretaryStore()
  const source = computed(() => (isTMA.value ? 'tma' : 'web'))

  return useQuery({
    queryKey: computed(() =>
      queryKeys.calendar.subscription(source.value, geoStore.timezone),
    ),
    queryFn: () =>
      calendarApi.getSubscription({
        source: source.value,
        timezone: geoStore.timezone,
        authorization: secretaryStore.auth,
      }),
  })
}
