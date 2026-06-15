import { VueQueryPlugin } from '@tanstack/vue-query'
import { defineBoot } from '@quasar/app-vite'
import { queryClient } from '../api/queryClient'

export default defineBoot(({ app }) => {
  app.use(VueQueryPlugin, {
    queryClient,
  })
})
