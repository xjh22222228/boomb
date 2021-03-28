// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import config from '@/config'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    alias: ['/oauth/redirect'],
    name: 'Login',
    component: Login
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NoMatch',
    redirect: '/'
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

const { isLogin } = config

router.beforeEach((to) => {
  if (to.name === 'Login' && isLogin) {
    router.replace('/')
  } else {
    if (!isLogin && to.name !== 'Login') {
      router.replace('/login')
    }
  }
})

export default router
