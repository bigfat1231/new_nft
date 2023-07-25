import type { RouteRecordRaw } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

export default [
  {
    path: '/',
    component: BaseLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/Home/Home.vue'),
      },
    ],
  },
] as RouteRecordRaw[]
