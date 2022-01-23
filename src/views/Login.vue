<template>
  <Action />
  <Language />
  <div class="auth-loading" v-if="authLoad"></div>
  <div class="bg"></div>

  <section class="login">
    <div class="wrapper">
      <h2 class="title">
        <img :src="`${baseUrl}logo.png`" alt="boomb" draggable="false">
      </h2>

      <div class="form">
        <el-select
          v-model="id"
          class="w100 mb20"
          placeholder="Select ID"
          @change="getRepos"
          :disabled="loading"
          filterable
        >
          <el-option
            v-for="item in userAll"
            :key="item.login"
            :label="`${item.type}: ${item.login}`"
            :value="item.login"
          >
          </el-option>
        </el-select>

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
          <img
            src="@/assets/github2.svg"
            class="github mr10"
            @click="goAuth(Provider.Github)" 
            draggable="false"
          >

          <el-tooltip
            class="box-item"
            placement="bottom-start"
          >
            <template #content>
              <p>仓库必须开通 Gitee Pages 服务</p>
              <p>非付费 Pages 用户需手动更新</p>
            </template>
            <img
              src="@/assets/gitee.svg"
              class="github ml10"
              @click="goAuth(Provider.Gitee)"
              draggable="false"
            >
          </el-tooltip>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { getGithubToken, getGiteeToken, validGiteePages, buildGiteePages } from '@/services'
import type { IBranch, IRepo, IUser, IGiteeToken } from '@/store'
import { useI18n } from 'vue-i18n'
import { isSuccess } from '@/utils/http'
import { GITHUB_AUTH_URL, GITEE_AUTH_URL } from '@/constants'
import { Provider } from '@/types'
import { isGiteeProvider } from '@/utils/storage'
import { ElMessage } from 'element-plus'

const baseUrl = import.meta.env.BASE_URL

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const id = ref('')
const repo = ref('')
const branch = ref('')
const token = ref('')
const loading = ref(false)
const authLoad = ref(false)
const valid = computed<boolean>(() => {
  return Boolean(id.value && repo.value && branch.value)
})

const userAll = computed<IUser[]>(() => store.state.userAll)
const branchAll = computed<IBranch[]>(() => store.state.branchAll)
const repos = computed<IRepo[]>(() => store.state.repos)

const goAuth = function(p: Provider) {
  if (authLoad.value) return
  localStorage.clear()
  sessionStorage.clear()
  authLoad.value = true
  localStorage.setItem('provider', String(p))
  if (p === Provider.Github) {
    location.href = GITHUB_AUTH_URL
  } else {
    location.href = GITEE_AUTH_URL
  }
}

const handleLogin = async function() {
  if (!token.value || !valid.value) return
  
  localStorage.setItem('repo', repo.value)
  localStorage.setItem('branch', branch.value)
  loading.value = true
  if (isGiteeProvider()) {
    try {
      await validGiteePages()
      await buildGiteePages()
    } catch (error) {
      ElMessage.error({
        message: '该仓库未开通 Gitee Pages 服务',
        duration: 5000
      })
      return    
    } finally {
      loading.value = false
    }
  }
  localStorage.setItem('isLogin', 'true')
  localStorage.setItem('user', JSON.stringify(store.state.user))
  localStorage.setItem('id', id.value)
  localStorage.setItem('token', token.value)
  location.reload()
}

function getBranch() {
  const userRepo = `${id.value}/${repo.value}`
  if (id.value && repo.value) {
    branch.value = ''
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
  const user = userAll.value.find((u: IUser) => u.login === id.value)
  if (user) {
    repo.value = ''
    branch.value = ''
    window.localStorage.setItem('id', id.value)
    store.commit('saveUser', user)
    loading.value = true
    store.dispatch('getRepos').then(() => {
      getBranch()
    }).finally(() => {
      loading.value = false
    })
  }
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
    router.replace('/login')
    authLoad.value = true

    if (isGiteeProvider()) {
      getGiteeToken(code)
        .then(res => {
          if (isSuccess(res.status)) {
            const data = res.data as IGiteeToken
            store.commit('saveGiteeTokenData', data)
            store.dispatch('getUser').then(res => {
              if (!res) return
              const user = res.data as IUser
              id.value = user.login
              token.value = data.access_token
              store.commit('saveUserAll', [user])
              localStorage.setItem('id', user.login)
              store.dispatch('getOrgs')
              getRepos()
            })
          }
        })
        .finally(() => {
          authLoad.value = false
        })
    } else {
      getGithubToken(code)
        .then(res => {
          if (isSuccess(res.status)) {
            const { accessToken, user } = res.data.data
            id.value = user.login
            token.value = accessToken
            store.commit('saveUser', user)
            store.commit('saveUserAll', [user])
            localStorage.setItem('id', user.login)
            localStorage.setItem('token', accessToken)
            store.dispatch('getOrgs')
            getRepos()
          }
        })
        .finally(() => {
          authLoad.value = false
        })
    }
  }
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
