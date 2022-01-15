// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

export default {
  id: window.localStorage.getItem('id') || '',

  repo: window.localStorage.getItem('repo') || '',

  branch: window.localStorage.getItem('branch') || '',

  token: window.localStorage.getItem('token') || '',

  isLogin: !!window.localStorage.getItem('isLogin')
}
