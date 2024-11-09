import { RouteRecordRaw } from 'vue-router'

export enum ROUTE_NAMES {
  ROOT = 'main',
  PROMO = 'promo',
  ARCHIVE = 'archive',
  FILTER = 'filter',
  SEARCH = 'search',
  SUPPORT = 'support',
  AUTH = 'auth',
  SIGN = 'sign',
  TUTORIAL = 'tutorial',
  PRIVACY = 'privacy',
  LOGIN = 'login',
  CALENDAR = 'calendar',
}

export enum STEP {
  WELCOME = 1,
  OIDC = 2,
  FINAL = 3,
}

const routes: RouteRecordRaw[] = [
  {
    name: ROUTE_NAMES.ROOT,
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.ARCHIVE,
        component: () => import('pages/ArchivePage.vue'),
      },
      {
        path: ROUTE_NAMES.FILTER,
        name: ROUTE_NAMES.FILTER,
        component: () => import('pages/ArchivePage.vue'),
      },
      {
        path: ROUTE_NAMES.SEARCH,
        name: ROUTE_NAMES.SEARCH,
        component: () => import('pages/ArchivePage.vue'),
      },
      {
        path: ROUTE_NAMES.SUPPORT,
        name: ROUTE_NAMES.SUPPORT,
        component: () => import('pages/SupportPage.vue'),
      },
    ],
  },
  {
    path: '/archive',
    redirect: '/',
  },
  {
    path: '/' + ROUTE_NAMES.PROMO,
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.PROMO,
        component: () => import('pages/WelcomePage.vue'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.AUTH,
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.AUTH,
        component: () => import('pages/AuthPage.vue'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.SIGN,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.SIGN,
        component: () => import('pages/SignPage.vue'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.TUTORIAL,
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.TUTORIAL,
        component: () => import('pages/RegistrationPage.vue'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.PRIVACY,
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.PRIVACY,
        component: () => import('pages/PrivacyPage.vue'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.CALENDAR,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.CALENDAR,
        component: () => import('pages/CalendarPage.vue'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.LOGIN,
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.LOGIN,
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
