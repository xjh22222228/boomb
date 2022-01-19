// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.

export function getLocalId(): string {
  return window.localStorage.getItem('id') || ''
}

export function getLocalRepo(): string {
  return window.localStorage.getItem('repo') || ''
}

export function getLocalBranch(): string {
  return window.localStorage.getItem('branch') || ''
}

export function getLocalToken(): string {
  return window.localStorage.getItem('token') || ''
}

export function getLocalIsLogin(): boolean {
  return !!window.localStorage.getItem('isLogin')
}
