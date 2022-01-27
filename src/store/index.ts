// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.
import bytes from 'bytes'
import router from '@/router'
import { nextTick } from 'vue'
import { createStore } from 'vuex'
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
  buildGiteePages
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
let n = 0;

// user or org
export type IUser = {
  login: string,
  id: number
  avatar_url: string
  repos_url: string
  organizations_url: string
  name?: string
  type?: 'User'|'Organization'
  [key: string]: any
}

export type IFile = {
  name: string
  type: 'dir' | 'file'
  path: string
  sizeLabel: string
  size: number|null // Gitee 有可能返回 null
  sha: string
  [key: string]: any
}

export type IBranch = {
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

type State = {
  userAll: IUser[],
  user: IUser
  token: string|null
  isLogin: boolean
  cacheDir: Record<string, IFile[]>
  branchAll: IBranch[],
  repos: IRepo[],
  loading: boolean
  showFileEncode: boolean
  giteeTokenData: IGiteeToken|null
  uploadQueue: IUploadQueue[]
}

const localUser = localStorage.getItem('user')
const defUser = localUser ? JSON.parse(localUser) : null

const localGiteeTokenData = localStorage.getItem('giteeTokenData')
const defGiteeTokenData = localGiteeTokenData ? JSON.parse(localGiteeTokenData) : null

export default createStore<State>({
  state() {
    return {
      userAll: [],
      user: defUser || {},
      token: getLocalToken(),
      isLogin: getLocalIsLogin(),
      branchAll: [],
      repos: [],
      showFileEncode: false,
      giteeTokenData: defGiteeTokenData,
      uploadQueue: [],

      // 缓存目录列表
      cacheDir: {},
      loading: true, // 读取缓存不加载Loading
    }
  },

  getters: {
    getDir: (state: State) => (route: RouteLocationNormalizedLoaded): IFile[] => {
      const path = route.query.path as string
      return state.cacheDir[path] || []
    }
  },

  mutations: {
    saveFileEncode(state, show: boolean) {
      state.showFileEncode = show
    },

    saveToken(state, token: string) {
      state.token = token
      localStorage.setItem('token', token)
    },

    saveUser(state, user: IUser) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    saveDir(state, { data, path }) {
      state.cacheDir[path] = data
    },

    saveBranchAll(state, branchAll: IBranch[]) {
      state.branchAll = branchAll.filter((b: IBranch) => !b.protected)
    },

    saveLoading(state, loading: boolean) {
      state.loading = loading
    },

    saveRepos(state, repos: IRepo[]) {
      state.repos = repos
    },

    saveUserAll(state, users: IUser[]) {
      users.forEach((user: IUser) => {
        state.userAll.push({
          type: 'Organization',
          ...user
        })
      })
    },

    saveGiteeTokenData(state, tokenInfo: IGiteeToken) {
      state.giteeTokenData = tokenInfo
      state.token = tokenInfo.access_token
      localStorage.setItem('token', tokenInfo.access_token)
      localStorage.setItem('giteeTokenData', JSON.stringify(tokenInfo))
    },

    removeUploadQueueByIdx(state, idx: number) {
      state.uploadQueue.splice(idx, 1)
    }
  },

  actions: {
    async getUser({ commit, state }) {
      if (!state.token) return

      const res = await (isGiteeProvider() ? getGiteeUser() : getGithubUser())
      if (isSuccess(res.status)) {
        commit('saveUser', res.data)
      }
      return res
    },

    async getRepos({ commit }) {
      const res = await getRepos()
      if (isSuccess(res.status)) {
        commit('saveRepos', res.data)
      }
    },

    async getOrgs({ commit }) {
      const res = await getOrgs()
      if (isSuccess(res.status)) {
        commit('saveUserAll', res.data)
      }
    },

    async getDir({ commit, state }, path: string) {
      if (!state.isLogin) return

      window.scroll(0, 0)

      // 先读取缓存
      if (state.cacheDir[path]) {
        commit('saveLoading', false)
        commit('saveDir', {
          data: state.cacheDir[path],
          path
        })
      }

      return readDir(path).then(res => {
        if (isSuccess(res.status)) {
          const data = res.data
            .map((item: IFile) => {
              item.sizeLabel = item.size != null ? bytes(item.size) : ''
              return item
            })
            .sort((a: IFile, b: IFile) => (a.size ?? 0) - (b.size ?? 0))
            .filter((item: IFile) => !(item.type === 'file' && item.name === '.gitkeep'))

          commit('saveDir', {
            data,
            path
          })
        }
      }).catch(() => {
        router.replace('/')
      }).finally(() => {
        commit('saveLoading', true)
      })
    },

    // 新建文本文件
    async newFile(
      _,
      {
        fileName,
        content,
        path,
        isTemp
      } : {
        fileName: string,
        content: string,
        path: string,
        isTemp: boolean
      }
    ) {

      fileName ||= uuidv4() + '.txt'

      const res = await createFile({
        content,
        path: isTemp ? `.temp/${fileName}` : `${path}/${fileName}`,
      })

      if (isSuccess(res.status)) {
        ElMessage({
          type: 'success',
          message: 'Success！'
        })
      }

      return res
    },

    // 创建文件
    async createFile(
      { dispatch, getters, state },
      files: { file: File, route: RouteLocationNormalizedLoaded }[]
    ) {
      const promises: Promise<AxiosResponse>[] = []
      let path: string = ''
      for (let i = 0; i < files.length; i++) {
        const { file, route } = files[i]
        path = route.query.path as string
        const { url: base64 } = await getBase64(file)
        const dir: IFile[] = getters.getDir(route)
        let fileName = file.name

        // Repeat
        const exists = dir.some(item => item.name === fileName)
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
          onUploadProgress(progressEvent: any) {
            const complete = (progressEvent.loaded / progressEvent.total * 100 | 0)
            const idx = state.uploadQueue.findIndex(item => item.path === payload.path)
            if (idx !== -1) {
              state.uploadQueue[idx].progress = complete >= 100 ? 99 : complete
            }
          }
        }
        state.uploadQueue.unshift({
          name: fileName,
          progress: 0,
          url: '',
          size: file.size,
          type: 'file',
          path: payload.path,
          status: 'uploading'
        })
        promises.push((createFile(payload)))
      }

      if (promises.length > 0) {
        const activedEls = document.querySelectorAll('.file.actived')
        activedEls.forEach(el => {
          el.classList.remove('actived')
        })
        try {
          // Github: Promise.all 不能并行创建/否则会出现409 (暂不处理)
          const allRes = await Promise.allSettled<AxiosResponse>(promises)
          if (isGiteeProvider()) {
            await buildGiteePages()
          }
          await dispatch('getDir', path)
          await nextTick()

          allRes.forEach(res => {
            if (res.status === 'fulfilled') {
              const { data, status } = res.value
              const { content } = data
              const idx = state.uploadQueue.findIndex(item => item.path.endsWith(content.path))

              if (isSuccess(status)) {
                const el = document.getElementById('file-' + content.name)
                if (el) {
                  el.classList.add('actived')
                  el.scrollIntoView({
                    behavior: 'smooth'
                  })
                }
                if (idx !== -1) {
                  state.uploadQueue[idx].status = 'success'
                  state.uploadQueue[idx].progress = 100
                  state.uploadQueue[idx].url = getFileUrl(state.uploadQueue[idx] as any)
                }

                ElMessage({
                  type: 'success',
                  message: `${content.path} Successed！`
                })
              } else {
                if (idx !== -1) {
                  state.uploadQueue[idx].status = 'error'
                  state.uploadQueue[idx].errorMsg = 'Failed'
                }
                ElMessage.error('Failed') 
              }
            }

            if (res.status === 'rejected'){
              const { path } = JSON.parse(res.reason.config.data)
              const idx = state.uploadQueue.findIndex(item => item.name === path)
              if (idx !== -1) {
                state.uploadQueue[idx].status = 'error'
                state.uploadQueue[idx].errorMsg = res.reason.message
              }
            }
          })

          return allRes
        } catch (error) {
          console.error(error)
        }
      }
    },

    async mkdir(_, path: string) {
      try {
        return await createFile({
          content: '',
          // .gitkeep 允许空目录
          path: `${path}/.gitkeep`,
          isEncode: false
        })
      } catch (error) {
        console.error(error)
      }
    },

    async deleteFile(_, file: IFile) {
      return await deleteFile(file)
    },

    async deleteDir(_, dirPath: string) {
      return await deleteDir(dirPath)
    },

    async getBranchAll({ commit }, owner) {
      const res = await getBranchAll(owner)
      commit('saveBranchAll', res.data || [])
      return res
    }
  },

  modules: {
  }
})
