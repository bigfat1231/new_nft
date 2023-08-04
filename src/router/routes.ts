import type { RouteRecordRaw } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

export default [
  {
    path: '/',
    component: BaseLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/Home/Home.vue'),
      },
      {
        name: 'address',
        path: 'address/:address',
        component: () => import('@/views/Address/Address.vue'),
      },
      {
        name: 'tokens',
        path: 'tokens/:address/:txid',
        component: () => import('@/views/Address/Tokens'),
      },
    ],
  },
] as RouteRecordRaw[]
