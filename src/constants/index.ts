// Copyright 2021-present the xiejiahe. All rights reserved. MIT license.
// https://docs.github.com/cn/github/authenticating-to-github/authorizing-oauth-apps
// https://docs.github.com/en/developers/apps/scopes-for-oauth-apps
// https://gitee.com/api/v5/oauth_doc#/

const isDev = import.meta.env.DEV

export const GITHUB_CLIENT_ID = isDev
  ? '6c3876cacce17b985c85'
  : 'Ov23liITcTTwWgDlbMsI'

export const GITEE_CLIENT_ID = isDev
  ? 'aa5a2788213b2765a4e0262b3316b3851a0a15e8cca22167ddc0daadfab42001'
  : '27d3ea8d22538df0c1c844420273a533dfb117414829a2166b8643b97640bc0d'

export const GITEE_CLIENT_SECRET = isDev
  ? 'e051ed02fc6c8484ef640b0bb0ec1fea16d4f4ee5115436f46496b030302db8b'
  : 'd4a49714ec9c16a58fff79937e70be40e1bf902be407a1036e6cc7696662b05a'

export const REDIRECT_URI = `${window.location.origin}/oauth/redirect`

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${GITHUB_CLIENT_ID}&scope=public_repo%20read:user`

export const GITEE_AUTH_URL = `https://gitee.com/oauth/authorize?client_id=${GITEE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
