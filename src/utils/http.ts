// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

import axios from 'axios'
import NProgress from 'nprogress'
import config from '@/config'
import store from '@/store'
import { ElNotification } from 'element-plus'

const token = config.token
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

const headers: any = {}

if (token) {
  headers.Authorization = `token ${token}`
}

const instance = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 600000 * 3, // 30 minute
  headers
})

interface ResponseData {
  status: number
  message?: string
  data?: any
}

instance.interceptors.request.use(config => {
  startLoad()

  // 不缓存
  if (config.method === 'get') {
    config.params = {
      t: Date.now(),
      ...config.params
    }
  }

  return config
}, error => {
  NProgress.done()
  console.error(error)
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
      message: `${data.message || resp.statusText || '未知错误'}`
    })
  }
  
  return resp
}, error => {
  console.error('Response', error)
  ElNotification({
    type: 'error',
    title: `${error.response?.status ?? 1001}`,
    message: error.response?.data?.message || '未知错误'
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
