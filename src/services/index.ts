// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.
// https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication
// https://docs.github.com/en/rest/reference
// https://docs.github.com/en/rest/reference/permissions-required-for-github-apps

import { get, put, del, isSuccess } from '@/utils/http'
import { encode } from 'js-base64'
import type { IFile } from '@/store'
import { ElMessage } from 'element-plus'
import { getLocalId, getLocalRepo, getLocalBranch } from '@/utils/storage'
import store from '@/store'

const id = () => `${getLocalId()}/${getLocalRepo()}`
const author = () => getLocalId()

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

// 获取用户信息
export function getUser() {
  return get(`/users/${author()}`)
}

// 获取用户下所有仓库
export function getRepos() {
  return get(`${store.state.user.repos_url}?page=1&per_page=999999`)
}

// 获取用户下所有组织
export function getOrgs() {
  return get(`${store.state.user.organizations_url}?page=1&per_page=999999`)
}

// 验证Token
export function verifyToken(author: string, token: string) {
  return get(`/users/${author}`, {
    headers: {
      Authorization: `token ${token}`
    }
  })
}

// 获取文件信息
export function getFileContent(
  path: string,
  branch: string = getLocalBranch()
) {
  return get(`/repos/${id()}/contents/${path}`, {
    params: {
      ref: branch
    }
  })
}

// 更新文件内容
type Iupdate = {
  content: string
  path?: string
  branch?: string
  isEncode?: boolean
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
    isEncode = true
  }: Iupdate,
) {
  if (path) {
    path = path.replace(/^\/*/g, '')
  }

  return put(`/repos/${id()}/contents/${path}`, {
    message: `boomb(create): ${path}`,
    branch,
    content: isEncode ? encode(content) : content,
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

  for (let file of files) {
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
    ElMessage.success(`${file.path} 已被删除!`)
  }

  return res
}

export enum CDN {
  Github = 1,
  Jsdelivr
}

// 获取文件CDN
export function getCdn(cdnType: CDN, path: string, isCache: boolean = true) {
  if (path === '/' || !path) {
    path = ''
  }
  if (path.startsWith('//')) {
    path = path.slice(1)
  }

  let url = ''

  switch (cdnType) {
    case CDN.Github:
      url = `https://raw.githubusercontent.com/${id()}/${getLocalBranch()}/${path}`
      break

    case CDN.Jsdelivr:
      url = `https://cdn.jsdelivr.net/gh/${id()}@${getLocalBranch()}/${path}`
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

// 授权
export function getAccessToken(code: string) {
  return get('/api/oauth', {
    baseURL: import.meta.env.DEV
      ? 'http://localhost:7006'
      : 'https://github-oauth-opal.vercel.app',
    params: {
      code
    }
  })
}
