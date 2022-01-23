// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.
import { Provider } from '@/types'

let isLogin: boolean
let provider: Provider

export function getLocalId(): string {
  return localStorage.getItem('id') || ''
}

export function getLocalRepo(): string {
  return localStorage.getItem('repo') || ''
}

export function getLocalBranch(): string {
  return localStorage.getItem('branch') || ''
}

export function getLocalToken(): string {
  return localStorage.getItem('token') || ''
}

export function getLocalIsLogin(): boolean {
  if (typeof isLogin === 'undefined') {
    return isLogin = !!localStorage.getItem('isLogin')  
  }
  return isLogin
}

export function getLocalProvider(): Provider {
  if (provider) {
    return provider
  }
  const p = localStorage.getItem('provider')
  if (p) {
    provider = Number(p)
  }
  return provider = Number(p || Provider.Github)
}

export function isGiteeProvider(): boolean {
  return getLocalProvider() === Provider.Gitee
}
