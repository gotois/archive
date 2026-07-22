import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import useGeoStore from '@/shared/model/geo'
import useSecretaryStore from '@/entities/secretary-auth'
import { queryKeys } from '@/shared/api/queryKeys'
import { isTMA } from '@/shared/lib/detector'
import { calendarApi } from '../api/calendarApi'

export function useCalendarSubscriptionQuery() {
  const geoStore = useGeoStore()
  const secretaryStore = useSecretaryStore()
  const source = computed(() => (isTMA.value ? 'tma' : 'web'))

  return useQuery({
    queryKey: computed(() =>
      queryKeys.calendar.subscription(source.value, geoStore.timeZone),
    ),
    queryFn: () =>
      calendarApi.getSubscription({
        timezone: geoStore.timeZone,
        authorization: secretaryStore.auth,
      }),
  })
}
