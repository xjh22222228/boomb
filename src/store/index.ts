// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

import { nextTick } from 'vue'
import bytes from 'bytes'
import config from '@/config'
import router from '@/router'
import { createStore } from 'vuex'
import { createFile, getUser, readDir, deleteFile, getBranchAll, deleteDir } from '@/services'
import { isSuccess } from '@/utils/http'
import { getBase64, getFileEncode, getExtname } from '@/utils'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FileEncode } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Timestamp conflict
let n = 0;

type User = {
  login: string,
  id: number
  name: string
  email: string
  avatar_url: string
  bio: string
  html_url: string
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

type State = {
  user: User
  token: string|null
  isLogin: boolean
  cacheDir: {
    [path: string]: IFile[]
  },
  branchAll: IBranch[],
  loading: boolean
}

export default createStore<State>({
  state() {
    return {
      user: {
        name: '',
        email: '',
        avatar_url: '',
        login: '',
        id: 0,
        bio: '',
        html_url: ''
      },
      token: config.token,
      isLogin: config.isLogin,

      // 缓存目录列表
      cacheDir: {},
      branchAll: [],

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
    saveUser(state, user: User) {
      state.user = user
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
  },

  actions: {
    async getUser({ commit, state }) {
      if (!state.isLogin) return

      const res = await getUser()
      if (isSuccess(res.status)) {
        commit('saveUser', res.data)
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
