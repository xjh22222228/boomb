// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import NewFile from '@/views/NewFile.vue'
import Mobile from '@/views/Mobile.vue'
import { isMobile } from '@/utils'
import { getLocalIsLogin } from '@/utils/storage'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: isMobile() ? Mobile : Home
  },
  {
    path: '/app',
    name: 'Mobile',
    component: Mobile
  },
  {
    path: '/login',
    alias: ['/oauth/redirect'],
    name: 'Login',
    component: Login
  },
  {
    path: '/file/new',
    name: 'NewFile',
    component: NewFile
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NoMatch',
    redirect: '/'
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const isLogin = getLocalIsLogin()
  if (to.name === 'Login' && isLogin) {
    router.replace('/')
  } else {
    if (!isLogin && to.name !== 'Login') {
      router.replace('/login')
    }
  }
})

export default router
