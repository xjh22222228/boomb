// Copyright 2021 the xiejiahe. All rights reserved. MIT license.
// https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication
// https://docs.github.com/en/rest/reference
// https://docs.github.com/en/rest/reference/permissions-required-for-github-apps

import config from '@/config'
import { get, put, del } from '@/utils/http'
import { encode } from 'js-base64'
import { IFile } from '@/store'

const id = config.id
const [author] = id.split('/')

// 获取目录列表
export function readDir(name: string) {
  if (name === '/' || !name) {
    name = ''
  }
  if (name.startsWith('//')) {
    name = name.slice(1)
  }
  return get(`/repos/${id}/contents${name}`, {
    params: {
      ref: config.branch
    }
  })
}

// 获取用户信息
export function getUser() {
  return get(`/users/${author}`)
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
  branch: string = config.branch
) {
  return get(`/repos/${id}/contents/${path}`, {
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
    branch = config.branch,
    isEncode = true
  }: Iupdate
) {
  return put(`/repos/${id}/contents/${file.path}`, {
    message: `rebot(CI): update ${file.path}`,
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
    branch = config.branch,
    isEncode = true
  }: Iupdate,
) {
  if (path!.startsWith('/')) {
    path = path!.slice(1)
  }

  return put(`/repos/${id}/contents/${path}`, {
    message: `rebot(CI): create ${path}`,
    branch,
    content: isEncode ? encode(content) : content,
  })
}

// 删除文件
export async function deleteFile(file: IFile) {
  return del(`/repos/${id}/contents/${file.path}`, {
    params: {
      ref: config.branch,
      message: `rebot(CI): delete ${file.path}`,
      sha: file.sha
    }
  })
}

export enum CDN {
  Github = 1,
  Jsdelivr
}

// 获取文件CDN
export function getCdn(cdn: CDN, path: string, isCache: boolean = true) {
  if (path === '/' || !path) {
    path = ''
  }
  if (path.startsWith('//')) {
    path = path.slice(1)
  }

  let url = ''

  switch (cdn) {
    case CDN.Github:
      url = `https://raw.githubusercontent.com/${id}/${config.branch}/${path}`
      break

    case CDN.Jsdelivr:
      url = `https://cdn.jsdelivr.net/gh/${id}@${config.branch}/${path}`
      break
  }

  if (isCache) {
    url += `?t=${Date.now()}`
  }

  return url
}

// 获取仓库下的所有分支
export function getBranchAll(owner: string) {
  return get(`/repos/${owner}/branches`)
}
