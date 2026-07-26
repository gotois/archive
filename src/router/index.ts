import { route } from 'quasar/wrappers'
import { createAppRouter } from '@/app/router'
import { isChatGPT } from '@/shared/lib/detector'

export default route(() =>
  createAppRouter({
    sessionMode: isChatGPT.value ? 'external' : 'internal',
  }),
)
