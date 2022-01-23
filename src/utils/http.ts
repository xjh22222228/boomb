// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.

import axios from 'axios'
import NProgress from 'nprogress'
import store from '@/store'
import { ElNotification } from 'element-plus'
import { getLocalToken, isGiteeProvider } from '@/utils/storage'
import { logout } from '@/utils'

const getToken = () => getLocalToken()
const defaultTitle = document.title

function startLoad() {
  if (!store.state.loading) {
    return
  }
  const loadingEl = document.getElementById('loading')
  document.title = 'Boomb...Boomb...Boomb'
  NProgress.start()
  if (loadingEl) {
    loadingEl.style.display = 'block'
  }
}

function stopLoad() {
  const loadingEl = document.getElementById('loading')
  document.title = defaultTitle
  NProgress.done()
  if (loadingEl) {
    loadingEl.style.display = 'none'
  }
}

const instance = axios.create({
  baseURL: isGiteeProvider()
    ? 'https://gitee.com/api/v5'
    : 'https://api.github.com',
  timeout: 600000 * 3, // 30 minute
})

interface ResponseData {
  status: number
  message?: string
  data?: any
}

instance.interceptors.request.use(async config => {
  startLoad()

  // Gitee token 有时间限制
  if (isGiteeProvider()) {
    const tokenData = store.state.giteeTokenData
    if (tokenData) {
      const { expires_in, created_at } = tokenData
      const now = Date.now() / 1000
      if (created_at + expires_in <= now) {
        logout()
      }
    }
  }

  const token = getToken()
  const method = config.method?.toLowerCase()
  if (token) {
    if (isGiteeProvider()) {
      if (method === 'get' || method === 'delete') {
        config.params = {
          access_token: token,
          ...config.params
        }
      }
      if (method === 'post' || method === 'put') {
        config.data = {
          access_token: token,
          ...config.data
        }
      }
    } else {
      config.headers = {
        ...config.headers,
        Authorization: `token ${token}`
      }
    }
  }

  // 不缓存
  if (method === 'get') {
    config.params = {
      t: Date.now(),
      ...config.params
    }
  }

  return config
}, error => {
  NProgress.done()
  return error
})

instance.interceptors.response.use(resp => {
  stopLoad()

  const status: number = resp.status
  const data: ResponseData = resp.data

  if (!isSuccess(status)) {
    ElNotification({
      type: 'error',
      title: `${status}`,
      message: `${data.message || resp.statusText || 'Unknown error'}`,
    })
  }
  
  return resp
}, error => {
  const status = error.response?.status
  if (status === 401) {
    logout()
  }
  ElNotification({
    type: 'error',
    title: `${status ?? 1001}`,
    message: error.response?.data?.message || error.message || 'Unknown error'
  })
  stopLoad()
  return Promise.reject(error)
})

export function isSuccess(status: number) {
  return status >= 200 && status <= 299
}

export const get = instance.get
export const post = instance.post
export const patch = instance.patch
export const del = instance.delete
export const put = instance.put

export default instance
