<template>
  <Action />
  <Language />
  <div class="auth-loading" v-if="authLoad"></div>
  <div class="bg"></div>

  <section class="login">
    <div class="wrapper">
      <h2 class="title" v-if="token">
        <img :src="`${baseUrl}logo.png`" alt="boomb" draggable="false">
      </h2>

      <div class="form" v-if="token">
        <el-input
          v-model="id"
          placeholder="ID"
          class="mb20"
          disabled
        />

        <el-select
          v-model="repo"
          class="w100 mb20"
          placeholder="Select repo"
          @change="getBranch"
          :disabled="loading"
          filterable
        >
          <el-option
            v-for="item in repos"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>

        <el-select
          v-model="branch"
          class="w100 mb20"
          placeholder="Select branch"
          :disabled="loading"
          filterable
        >
          <el-option
            v-for="item in branchAll"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>

        <el-button
          type="primary"
          @click="handleLogin"
          :loading="loading"
          class="w100 mt10 mb10"
          :disabled="!valid"
        >
          {{ t('login') }}
        </el-button>

        <div class="mt10 align-center">
          <img src="@/assets/github.svg" class="github" @click="goAuth">
        </div>
      </div>

      <div v-else>
        <img src="@/assets/ready.png" class="ready" @click="goAuth" draggable="false">
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import config from '@/config'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { verifyToken, getAccessToken } from '@/services'
import type { IBranch, IRepo } from '@/store'
import { useI18n } from 'vue-i18n'
import { isSuccess } from '@/utils/http'

// https://docs.github.com/cn/github/authenticating-to-github/authorizing-oauth-apps
// https://docs.github.com/en/developers/apps/scopes-for-oauth-apps
const clientId = import.meta.env.DEV
  ? '6c3876cacce17b985c85'
  : '1bab8338449584e95414'
const callback = `${window.location.origin}/oauth/redirect`
const authUrl = `https://github.com/login/oauth/authorize?response_type=code&redirect_uri=${callback}&client_id=${clientId}&scope=repo%20repo_deployment%20read:user`
const baseUrl = import.meta.env.BASE_URL

const { t } = useI18n()
const route = useRoute()
const store = useStore()
const id = ref(config.id)
const repo = ref(config.repo)
const branch = ref(config.branch)
const token = ref(config.token)
const loading = ref(false)
const authLoad = ref(false)
const valid = computed<boolean>(() => {
  return Boolean(id.value && repo.value && branch.value)
})
const branchAll = computed<IBranch[]>(() => store.state.branchAll)
const repos = computed<IRepo[]>(() => store.state.repos)

const goAuth = function() {
  if (authLoad.value) return
  window.localStorage.clear()
  window.sessionStorage.clear()
  authLoad.value = true
  window.location.href = authUrl
}

const handleLogin = function() {
  if (!token.value || !valid.value) return

  loading.value = true
  verifyToken(id.value, token.value).then((res) => {
    if (res.status !== 200) return
    window.localStorage.setItem('branch', branch.value)
    window.localStorage.setItem('repo', repo.value)
    window.localStorage.setItem('isLogin', 'true')
    window.location.reload()
  }).finally(() => {
    loading.value = false
    authLoad.value = false
  })
}

function getBranch() {
  const userRepo = `${id.value}/${repo.value}`
  if (id.value && repo.value) {
    loading.value = true
    store.dispatch('getBranchAll', userRepo).finally(() => {
      loading.value = false
    })
  }
}

function getRepos() {
  if (!id.value || !token.value) {
    return
  }
  loading.value = true
  store.dispatch('getRepos').then(() => {
    getBranch()
  }).finally(() => {
    loading.value = false
  })
}

// Default branch
watch(branchAll, () => {
  if (branchAll.value.length > 0) {
    branch.value = branchAll.value[0].name
  } else {
    branch.value = ''
  }
}, {
  immediate: true
})

onMounted(() => {
  const { query } = route
  const code = query.code as string
  if (code) {
    authLoad.value = true
    getAccessToken(code)
      .then(res => {
        if (isSuccess(res.status)) {
          const { accessToken, user } = res.data.data
          id.value = user.login
          token.value = accessToken
          store.commit('saveUser', user)
          window.localStorage.setItem('token', accessToken)
          window.localStorage.setItem('user', JSON.stringify(user))
          window.localStorage.setItem('id', user.login)
          window.location.replace('/login')
        }
      })
      .finally(() => {
        authLoad.value = false
      })
  }

  getRepos()
})
</script>

<style lang="scss" scoped>
.bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f0f2f5 url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg);
}

.login {
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.wrapper {
  z-index: 3;
  margin-top: 100px;
  .title {
    text-align: center;
    img {
      width: 250px;
      height: 75px;
      pointer-events: none;
    }
  }
  .ready {
    width: 450px;
    cursor: pointer;
  }
  .github {
    width: 30px;
    cursor: pointer;
  }
  .form {
    margin-top: 50px;
    padding: 50px 20px 20px 20px;
    background: #fff;
    width: 500px;
    border-radius: 5px;
  }
}

@media screen and (max-width: 768px) {
  .form {
    width: initial !important;
  }
}
</style>
