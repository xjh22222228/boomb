// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.
// https://docs.github.com/cn/github/authenticating-to-github/authorizing-oauth-apps
// https://docs.github.com/en/developers/apps/scopes-for-oauth-apps
// https://gitee.com/api/v5/oauth_doc#/

const isDev = import.meta.env.DEV

export const GITHUB_CLIENT_ID = isDev
  ? '6c3876cacce17b985c85'
  : '1bab8338449584e95414'

export const GITEE_CLIENT_ID = isDev
  ? 'aa5a2788213b2765a4e0262b3316b3851a0a15e8cca22167ddc0daadfab42001'
  : '175a5e982677815e7b5ca88cd2c99d920fc0b03cffc433880d1531352bb81c28'

export const GITEE_CLIENT_SECRET = isDev
  ? 'e051ed02fc6c8484ef640b0bb0ec1fea16d4f4ee5115436f46496b030302db8b'
  : 'df569a930d8c02831aad7b978d5245148c0557581c292c5f376307d708494b6d'

export const REDIRECT_URI = `${window.location.origin}/oauth/redirect`

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${GITHUB_CLIENT_ID}&scope=public_repo%20read:user`

export const GITEE_AUTH_URL = `https://gitee.com/oauth/authorize?client_id=${GITEE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
