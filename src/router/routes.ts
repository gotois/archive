import {RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'archive',
        component: () => import('pages/List.vue'),
      },
      {
        path: 'filter',
        name: 'filter',
        component: () => import('pages/List.vue'),
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/List.vue'),
      },
    ],
  },
  {
    path: '/archive',
    redirect: '/',
  },
  {
    path: '/create',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Create.vue'),
      },
    ],
  },
  {
    path: '/tutorial',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Tutorial.vue'),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
