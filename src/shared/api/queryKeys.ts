export const queryKeys = {
  calendar: {
    all: ['calendar'] as const,
    subscription: (source: 'web' | 'tma', timezone: string) =>
      [...queryKeys.calendar.all, 'subscription', source, timezone] as const,
  },
}
