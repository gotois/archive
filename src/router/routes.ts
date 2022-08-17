import {RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'archive',
        component: () => import('pages/page-list.vue'),
      },
      {
        path: 'filter',
        name: 'filter',
        component: () => import('pages/page-list.vue'),
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/page-list.vue'),
      },
    ],
  },
  {
    path: '/archive',
    redirect: '/',
  },
  {
    path: '/auth',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'auth',
        component: () => import('pages/page-auth.vue'),
      },
    ],
  },
  {
    path: '/create',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'create',
        component: () => import('pages/page-create.vue'),
      },
    ],
  },
  {
    path: '/tutorial',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'tutorial',
        component: () => import('pages/page-tutorial.vue'),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/page-404.vue'),
  },
]

export default routes
