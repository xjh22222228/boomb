// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

import bytes from 'bytes'
import config from '../../config'
import router from '@/router'
import { createStore } from 'vuex'
import { createFile, getUser, readDir, deleteFile } from '@/services'
import { isSuccess } from '@/utils/http'
import { getBase64 } from '@/utils'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'

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
  type: string
  path: string
  sizeLabel: string
  size: number
  sha: string
}

type State = {
  user: User
  token: string|null
  isLogin: boolean
  dir: IFile[]
  cacheDir: {
    [key: string]: IFile[]
  }
}

const token = config.token

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
      token,
      isLogin: !!token,
      dir: [],

      // 缓存目录列表
      cacheDir: {}
    }
  },

  mutations: {
    saveUser(state, user: User) {
      state.user = user
    },

    saveDir(state, { data, path }) {
      state.cacheDir[path] = data
      state.dir = data
        .map((item: IFile) => {
          item.sizeLabel = bytes(item.size)
          return item
        })
        .sort((a: IFile, b: IFile) => a.size - b.size)
    }
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

      // 先读取缓存
      if (state.cacheDir[path]) {
        commit('saveDir', {
          data: state.cacheDir[path],
          path
        })
      }

      readDir(path).then(res => {
        if (isSuccess(res.status)) {
          commit('saveDir', {
            data: res.data,
            path
          })
        }
      }).catch(() => {
        router.replace('/')
      })
    },

    async createFile(
      { dispatch, state },
      { file, route }: { file: File, route: RouteLocationNormalizedLoaded }
    ) {
      const path = route.query.path
      const base64 = await getBase64(file)
      let fileName = file.name
      const now = `${Date.now()}`.slice(-5)
      const dirs: IFile[] = state.dir
      const exists = dirs.some(item => item.name === fileName)
      if (exists) {
        fileName = `${now}-${fileName}`
      }

      createFile({
        content: base64,
        path: `${path || ''}/${fileName}`,
        isEncode: false
      }).then(res => {
        if (isSuccess(res.status)) {
          dispatch('getDir', path)
          ElMessage({
            type: 'success',
            message: '上传成功！'
          })
        }
      })
    },

    async mkdir(_, path: string) {
      try {
        await createFile({
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
      await deleteFile(file)
    }
  },

  modules: {
  }
})
