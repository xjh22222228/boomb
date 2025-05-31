// Copyright 2021-present the xiejiahe. All rights reserved. MIT license.
import bytes from 'bytes'
import router from '@/router'
import { nextTick } from 'vue'
import { defineStore } from 'pinia'
import {
  createFile,
  getGithubUser,
  getGiteeUser,
  readDir,
  deleteFile,
  getBranchAll,
  deleteDir,
  getRepos,
  getOrgs,
  buildGiteePages,
} from '@/services'
import { isSuccess } from '@/utils/http'
import { getBase64, getFileEncode, getExtname, getFileUrl } from '@/utils'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FileEncode } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { getLocalToken, getLocalIsLogin } from '@/utils/storage'
import { isGiteeProvider } from '@/utils/storage'
import type { AxiosResponse } from 'axios'

// Timestamp conflict
let n = 0

// user or org
export interface IUser {
  login: string
  id: number
  avatar_url: string
  repos_url: string
  organizations_url: string
  name?: string
  type?: 'User' | 'Organization'
  [key: string]: any
}

export interface IFile {
  name: string
  type: 'dir' | 'file'
  path: string
  sizeLabel: string
  size: number | null // Gitee 有可能返回 null
  sha: string
  [key: string]: any
}

export interface IBranch {
  name: string
  protected: boolean
}

export interface IRepo {
  id: number
  name: string
}

export interface IGiteeToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
  created_at: number
}

export interface IUploadQueue extends Pick<IFile, 'size' | 'path' | 'type'> {
  progress: number
  name: string
  url: string
  status?: 'uploading' | 'success' | 'error'
  errorMsg?: string
}

interface State {
  userAll: IUser[]
  user: IUser
  token: string | null
  isLogin: boolean
  cacheDir: Record<string, IFile[]>
  branchAll: IBranch[]
  repos: IRepo[]
  loading: boolean
  showFileEncode: boolean
  giteeTokenData: IGiteeToken | null
  uploadQueue: IUploadQueue[]
}

const localUser = localStorage.getItem('user')
const defUser = localUser ? JSON.parse(localUser) : null

const localGiteeTokenData = localStorage.getItem('giteeTokenData')
const defGiteeTokenData = localGiteeTokenData
  ? JSON.parse(localGiteeTokenData)
  : null

export const useStore = defineStore('main', {
  state: (): State => ({
    userAll: [],
    user: defUser || {},
    token: getLocalToken(),
    isLogin: getLocalIsLogin(),
    branchAll: [],
    repos: [],
    showFileEncode: false,
    giteeTokenData: defGiteeTokenData,
    uploadQueue: [],
    cacheDir: {},
    loading: true, // 读取缓存不加载Loading
  }),

  getters: {
    getCachedDir:
      (state) =>
      (route: RouteLocationNormalizedLoaded): IFile[] => {
        const path = (route.query.path as string) || '/'
        return state.cacheDir[path] || []
      },
  },

  actions: {
    saveFileEncode(show: boolean) {
      this.showFileEncode = show
    },

    saveToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    saveUser(user: IUser) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    saveDir({ data, path = '/' }: { data: IFile[]; path: string }) {
      this.cacheDir[path] = data
    },

    saveBranchAll(branchAll: IBranch[]) {
      this.branchAll = branchAll.filter((b: IBranch) => !b.protected)
    },

    saveLoading(loading: boolean) {
      this.loading = loading
    },

    saveRepos(repos: IRepo[]) {
      this.repos = repos
    },

    saveUserAll(users: IUser[]) {
      users.forEach((user: IUser) => {
        this.userAll.push({
          type: 'Organization',
          ...user,
        })
      })
    },

    saveGiteeTokenData(tokenInfo: IGiteeToken) {
      this.giteeTokenData = tokenInfo
      this.token = tokenInfo.access_token
      localStorage.setItem('token', tokenInfo.access_token)
      localStorage.setItem('giteeTokenData', JSON.stringify(tokenInfo))
    },

    removeUploadQueueByIdx(idx: number) {
      this.uploadQueue.splice(idx, 1)
    },

    async getUser() {
      if (!this.token) return

      const res = await (isGiteeProvider() ? getGiteeUser() : getGithubUser())
      if (isSuccess(res.status)) {
        this.saveUser(res.data)
      }
      return res
    },

    async getRepos() {
      const res = await getRepos()
      if (isSuccess(res.status)) {
        this.saveRepos(res.data)
      }
    },

    async getOrgs() {
      const res = await getOrgs()
      if (isSuccess(res.status)) {
        this.saveUserAll(res.data)
      }
    },

    async getDir(path: string) {
      path ||= '/'
      if (!this.isLogin) return

      window.scroll(0, 0)

      // 先读取缓存
      if (this.cacheDir[path]) {
        this.saveLoading(false)
        this.saveDir({
          data: this.cacheDir[path],
          path,
        })
      }

      return readDir(path)
        .then((res) => {
          if (isSuccess(res.status)) {
            const data = res.data
              .map((item: IFile) => {
                item.sizeLabel = (
                  item.size != null ? bytes(item.size) : ''
                ) as string
                return item
              })
              .sort((a: IFile, b: IFile) => (a.size ?? 0) - (b.size ?? 0))
              .filter(
                (item: IFile) =>
                  !(item.type === 'file' && item.name === '.gitkeep'),
              )

            this.saveDir({
              data,
              path,
            })
          }
        })
        .catch(() => {
          router.replace('/')
        })
        .finally(() => {
          this.saveLoading(true)
        })
    },

    // 新建文本文件
    async newFile({
      fileName,
      content,
      path,
      isTemp,
    }: {
      fileName?: string
      content: string
      path: string
      isTemp: boolean
    }) {
      fileName ||= uuidv4() + '.txt'

      const res = await createFile({
        content,
        path: isTemp ? `.temp/${fileName}` : `${path}/${fileName}`,
      })

      if (isSuccess(res.status)) {
        ElMessage({
          type: 'success',
          message: 'Success！',
        })
      }

      return res
    },

    // 创建文件
    async createFile(
      files: { file: File; route: RouteLocationNormalizedLoaded }[],
    ) {
      const promises: Promise<AxiosResponse>[] = []
      let path: string = ''
      for (let i = 0; i < files.length; i++) {
        const { file, route } = files[i]
        path = route.query.path as string
        const { url: base64 } = await getBase64(file)
        const dir = this.getCachedDir(route)
        let fileName = file.name

        // Repeat
        const exists = dir.some((item) => item.name === fileName)
        const extname = getExtname(file)
        const fileEncode = getFileEncode()

        switch (fileEncode) {
          case FileEncode.RawName:
            if (exists) {
              ElMessage.error(`文件 ${fileName} 已存在`)
              return
            }
            break

          case FileEncode.NumRawName:
            if (exists) {
              const now = `${Date.now()}`.slice(-5)
              fileName = `${now}-${fileName}`
            }
            break

          case FileEncode.UUID:
            fileName = `${uuidv4()}${extname}`
            break

          case FileEncode.Timestamp:
            n++
            fileName = `${Date.now() + n}${extname}`
            break
        }

        const payload = {
          content: base64,
          path: `${path || ''}/${fileName}`,
          isEncode: false,
          onUploadProgress: (progressEvent: any) => {
            const complete =
              ((progressEvent.loaded / progressEvent.total) * 100) | 0
            const idx = this.uploadQueue.findIndex(
              (item: IUploadQueue) => item.path === payload.path,
            )
            if (idx !== -1) {
              this.uploadQueue[idx].progress = complete >= 100 ? 99 : complete
            }
          },
        }
        this.uploadQueue.unshift({
          name: fileName,
          progress: 0,
          url: '',
          size: file.size,
          type: 'file',
          path: payload.path,
          status: 'uploading',
        })
        promises.push(createFile(payload))
      }

      if (promises.length > 0) {
        const activedEls = document.querySelectorAll('.file.actived')
        activedEls.forEach((el) => {
          el.classList.remove('actived')
        })
        try {
          // Github: Promise.all 不能并行创建/否则会出现409 (暂不处理)
          const allRes = await Promise.allSettled<AxiosResponse>(promises)
          if (isGiteeProvider()) {
            await buildGiteePages()
          }
          await this.getDir(path)
          await nextTick()

          allRes.forEach((res) => {
            if (res.status === 'fulfilled') {
              const { data, status } = res.value
              const { content } = data
              const idx = this.uploadQueue.findIndex((item) =>
                item.path.endsWith(content.path),
              )

              if (isSuccess(status)) {
                const el = document.getElementById('file-' + content.name)
                if (el) {
                  el.classList.add('actived')
                  el.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
                if (idx !== -1) {
                  this.uploadQueue[idx].status = 'success'
                  this.uploadQueue[idx].progress = 100
                  this.uploadQueue[idx].url = getFileUrl(
                    this.uploadQueue[idx] as any,
                  )
                }

                ElMessage({
                  type: 'success',
                  message: `${content.path} Successed！`,
                })
              } else {
                if (idx !== -1) {
                  this.uploadQueue[idx].status = 'error'
                  this.uploadQueue[idx].errorMsg = 'Failed'
                }
                ElMessage.error('Failed')
              }
            }

            if (res.status === 'rejected') {
              const { path } = JSON.parse(res.reason.config.data)
              const idx = this.uploadQueue.findIndex(
                (item) => item.name === path,
              )
              if (idx !== -1) {
                this.uploadQueue[idx].status = 'error'
                this.uploadQueue[idx].errorMsg = res.reason.message
              }
            }
          })

          return allRes
        } catch (error) {
          console.error(error)
        }
      }
    },

    async mkdir(path: string) {
      try {
        return await createFile({
          content: '',
          // .gitkeep 允许空目录
          path: `${path}/.gitkeep`,
          isEncode: false,
        })
      } catch (error) {
        console.error(error)
      }
    },

    async deleteFile(file: IFile) {
      return await deleteFile(file)
    },

    async deleteDir(dirPath: string) {
      return deleteDir(dirPath)
    },

    async getBranchAll(owner: string) {
      const res = await getBranchAll(owner)
      this.saveBranchAll(res.data || [])
      return res
    },
  },
})
