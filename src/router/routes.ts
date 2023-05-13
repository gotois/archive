import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    name: 'main',
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'archive',
        component: () => import('pages/ArchivePage.vue'),
      },
      {
        path: 'filter',
        name: 'filter',
        component: () => import('pages/ArchivePage.vue'),
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/ArchivePage.vue'),
      },
      {
        path: 'feedback',
        name: 'feedback',
        component: () => import('pages/FeedbackPage.vue'),
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
        component: () => import('pages/AuthPage.vue'),
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
        component: () => import('pages/CreatePage.vue'),
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
        component: () => import('pages/TutorialPage.vue'),
      },
    ],
  },
  {
    path: '/privacy',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'privacy',
        component: () => import('pages/PrivacyPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/UnknownPage.vue'),
  },
]

export default routes
