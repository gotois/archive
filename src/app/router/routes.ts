import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/config/routes'

const routes: RouteRecordRaw[] = [
  {
    name: ROUTE_NAMES.ROOT,
    path: '/',
    component: () => import('@/app/layouts/main'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.ARCHIVE,
        component: () => import('@/pages/archive'),
      },
      {
        path: ROUTE_NAMES.FILTER,
        name: ROUTE_NAMES.FILTER,
        component: () => import('@/pages/filter'),
      },
      {
        path: ROUTE_NAMES.SEARCH,
        name: ROUTE_NAMES.SEARCH,
        component: () => import('@/pages/search'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.ARCHIVE,
    redirect: '/',
  },
  {
    path: '/' + ROUTE_NAMES.PROMO,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.PROMO,
        component: () => import('@/pages/promo'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.OTP,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.OTP,
        component: () => import('@/pages/otp'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.SUPPORT,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.SUPPORT,
        component: () => import('@/pages/support'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.PRIVACY,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.PRIVACY,
        component: () => import('@/pages/privacy'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.CALENDAR,
    component: () => import('@/app/layouts/main'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.CALENDAR,
        component: () => import('@/pages/calendar'),
      },
      {
        path: ':taskId/' + ROUTE_NAMES.VIEW,
        name: ROUTE_NAMES.VIEW,
        component: () => import('@/pages/event-view'),
        props: true,
      },
      {
        path: ':taskId/' + ROUTE_NAMES.EDIT,
        name: ROUTE_NAMES.EDIT,
        component: () => import('@/pages/event-edit'),
        props: true,
      },
      {
        path: ROUTE_NAMES.NEW,
        name: ROUTE_NAMES.NEW,
        component: () => import('@/pages/event-new'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.CALENDAR_IMPORT,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.CALENDAR_IMPORT,
        component: () => import('@/pages/calendar-import'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.LOGIN,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.LOGIN,
        component: () => import('@/pages/login'),
      },
    ],
  },
  {
    path: '/' + ROUTE_NAMES.ABOUT,
    component: () => import('@/app/layouts/empty'),
    children: [
      {
        path: '',
        name: ROUTE_NAMES.ABOUT,
        component: () => import('@/pages/about'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/not-found'),
  },
]

export default routes
