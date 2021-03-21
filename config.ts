// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

export default {
  id: window.localStorage.getItem('id') ?? '',

  branch: window.localStorage.getItem('branch') ?? '',

  token: window.localStorage.getItem('token') ?? '',
}
