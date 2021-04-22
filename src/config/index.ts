// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

export default {
  // e.g. xjh22222228/boomb
  id: window.localStorage.getItem('id') ?? '',

  branch: window.localStorage.getItem('branch') ?? '',

  token: window.localStorage.getItem('token') ?? '',

  isLogin: !!window.localStorage.getItem('isLogin')
}
