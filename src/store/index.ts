// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.

import { nextTick } from 'vue'
import bytes from 'bytes'
import router from '@/router'
import { createStore } from 'vuex'
import {
  createFile,
  getUser,
  readDir,
  deleteFile,
  getBranchAll,
  deleteDir,
  getRepos,
  getOrgs
} from '@/services'
import { isSuccess } from '@/utils/http'
import { getBase64, getFileEncode, getExtname } from '@/utils'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FileEncode } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { getLocalToken, getLocalIsLogin } from '@/utils/storage'

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
  size: number
  sha: string
}

export type IBranch = {
  name: string
  protected: boolean
}

export interface IRepo {
  id: number
  name: string
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
}

const localUser = window.localStorage.getItem('user')
const defUser = localUser ? JSON.parse(localUser) : null

export default createStore<State>({
  state() {
    return {
      userAll: [],
      user: defUser || {},
      token: getLocalToken(),
      isLogin: getLocalIsLogin(),

      // 缓存目录列表
      cacheDir: {},
      branchAll: [],
      repos: [],

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
    saveUser(state, user: IUser) {
      state.user = user
      window.localStorage.setItem('user', JSON.stringify(user))
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
  },

  actions: {
    async getUser({ commit, state }) {
      if (!state.isLogin) return

      const res = await getUser()
      if (isSuccess(res.status)) {
        commit('saveUser', res.data)
      }
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
              item.sizeLabel = bytes(item.size)
              return item
            })
            .sort((a: IFile, b: IFile) => a.size - b.size)
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

    async createFile(
      { dispatch, getters },
      { file, route }: { file: File, route: RouteLocationNormalizedLoaded }
    ) {
      const path = route.query.path
      const base64 = await getBase64(file)
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

      return await createFile({
        content: base64,
        path: `${path || ''}/${fileName}`,
        isEncode: false
      }).then(res => {
        if (isSuccess(res.status)) {
          dispatch('getDir', path).then(async () => {
            await nextTick()
            const el = document.getElementById('file-' + fileName)
            if (el) {
              el.classList.add('actived')
              el.scrollIntoView({
                behavior: 'smooth'
              })
            }
          })
          ElMessage({
            type: 'success',
            message: '上传成功！'
          })
        }
      })
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
