// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.
// https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication
// https://docs.github.com/en/rest/reference
// https://docs.github.com/en/rest/reference/permissions-required-for-github-apps

import store from '@/store'
import type { IFile } from '@/store'
import { get, put, post, del, isSuccess } from '@/utils/http'
import { encode } from 'js-base64'
import { ElMessage } from 'element-plus'
import { getLocalId, getLocalRepo, getLocalBranch, isGiteeProvider } from '@/utils/storage'
import { GITEE_CLIENT_ID, GITEE_CLIENT_SECRET, REDIRECT_URI } from '@/constants'
import { NetworkCDN } from '@/types'
import axios from 'axios'


const id = () => `${getLocalId()}/${getLocalRepo()}`
const owner = () => getLocalId()

// 获取目录列表
export function readDir(name: string) {
  if (name === '/' || !name) {
    name = ''
  }
  if (name.startsWith('//')) {
    name = name.slice(1)
  }
  return get(`/repos/${id()}/contents${name}`, {
    params: {
      ref: getLocalBranch()
    }
  })
}

// Github 获取用户信息
export function getGithubUser() {
  return get(`/users/${owner()}`)
}

// 获取用户下所有仓库
export function getRepos() {
  return get(`${store.state.user.repos_url}?page=1&per_page=999999`)
}

// 获取用户下所有组织
export function getOrgs() {
  return get(`${store.state.user.organizations_url}?page=1&per_page=999999`)
}

// 更新文件内容
type Iupdate = {
  content: string
  path?: string
  branch?: string
  isEncode?: boolean
  onUploadProgress?: (progressEvent: any) => void
}
export async function updateFileContent(
  file: IFile,
  {
    content,
    branch = getLocalBranch(),
    isEncode = true
  }: Iupdate
) {
  return put(`/repos/${id()}/contents/${file.path}`, {
    message: `boomb(update): ${file.path}`,
    branch,
    content: isEncode ? encode(content) : content,
    sha: file.sha
  })
}

// 创建文件
export async function createFile(
  {
    content,
    path,
    branch = getLocalBranch(),
    isEncode = true,
    onUploadProgress
  }: Iupdate,
) {
  let p = path
  if (path) {
    p = path.replace(/^\/*/g, '')
  }
  const method = isGiteeProvider() ? post : put
  return method(`/repos/${id()}/contents/${p}`, {
    message: `boomb(create): ${p}`,
    branch,
    content: isEncode ? encode(content) : content,
    path // 服务端不接收此参数, 用于内部
  }, {
    onUploadProgress
  })
}

// 删除目录, 不能并行否则会被BLOCK
export async function deleteDir(dirPath: string) {
  const files: IFile[] = []

  async function getAllFilePath(path: string) {
    const res = await readDir(path)
    if (isSuccess(res.status)) {
      for (let i = 0; i < res.data.length; i++) {
        const item = res.data[i] as IFile
        if (item.type === 'dir') {
          await getAllFilePath(item.path)
        } else {
          files.unshift(item)
        }
      }
    }
  }
  await getAllFilePath(dirPath)

  for (const file of files) {
    await deleteFile(file)
  }
}

// 删除文件
export async function deleteFile(file: IFile) {
  const res = await del(`/repos/${id()}/contents/${file.path}`, {
    params: {
      ref: getLocalBranch(),
      message: `boomb(delete): ${file.path}`,
      sha: file.sha
    }
  })

  if (isSuccess(res.status)) {
    ElMessage.success(`${file.path} Deleted!`)
  }

  return res
}

// 获取文件CDN
export function getCdn(cdnType: NetworkCDN, path: string, isCache: boolean = true) {
  if (path === '/' || !path) {
    path = ''
  }
  if (path.startsWith('//')) {
    path = path.slice(1)
  }

  let url = ''

  switch (cdnType) {
    case NetworkCDN.Github:
      url = `https://raw.githubusercontent.com/${id()}/${getLocalBranch()}/${path}`
      break

    case NetworkCDN.Jsdelivr:
      url = `https://cdn.jsdelivr.net/gh/${id()}@${getLocalBranch()}/${path}`
      break

    case NetworkCDN.Gitee:
      url = `https://${owner()}.gitee.io/${getLocalRepo()}/${path}`
      break
  }

  if (!isCache) {
    url += `?t=${Date.now()}`
  }

  return url
}

// 获取仓库下的所有分支
export function getBranchAll(owner: string) {
  return get(`/repos/${owner}/branches`)
}

// Github 获取token
export function getGithubToken(code: string) {
  return get('/api/oauth', {
    baseURL: import.meta.env.DEV
      ? 'http://localhost:7006'
      : 'https://github-oauth-opal.vercel.app',
    params: {
      code
    }
  })
}

// Gitee 获取token
export function getGiteeToken(code: string) {
  return post(`https://gitee.com/oauth/token?grant_type=authorization_code&code=${code}&client_id=${GITEE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`, {
    client_secret: GITEE_CLIENT_SECRET
  })
}

// Gitee 刷新token
export function giteeRefreshToken(refreshToken: string) {
  // 不走拦截器
  return axios.post(`https://gitee.com/oauth/token?grant_type=refresh_token&refresh_token=${refreshToken}`)
}

// Gitee 获取用户信息
export function getGiteeUser() {
  return get('/user')
}

// Gitee 验证是否开通 pages 服务
export async function validGiteePages() {
  return get(`/repos/${owner()}/${getLocalRepo()}/pages`)
}

// Gitee 建立Pages
export function buildGiteePages() {
  return post(`/repos/${owner()}/${getLocalRepo()}/pages/builds`)
}
