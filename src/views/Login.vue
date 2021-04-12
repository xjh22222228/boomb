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
        <el-input
          v-model="id"
          placeholder="xjh22222228/boomb"
          class="mb20"
          @blur="handleIdBlur"
          :disabled="loading"
        >
          <template #prepend>&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp; D&nbsp;&nbsp;</template>
          <template #prefix>
            <i class="el-input__icon el-icon-user"></i>
          </template>
        </el-input>

        <el-input
          v-model="branch"
          placeholder="main"
          class="mb20"
          :disabled="loading"
        >
          <template #prepend>Branch</template>
          <template #prefix>
            <i class="el-input__icon el-icon-attract"></i>
          </template>
        </el-input>

        <el-button
          type="primary"
          @click="goAuth"
          :loading="loading"
          class="w100 mt10"
          :disabled="!valid"
        >
          {{ t('login') }}
        </el-button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import config from '@/config'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { verifyToken, getAccessToken } from '@/services'
import { IBranch } from '@/store'
import { useI18n } from 'vue-i18n'
import { isSuccess } from '@/utils/http'

// https://docs.github.com/cn/github/authenticating-to-github/authorizing-oauth-apps
// https://docs.github.com/en/developers/apps/scopes-for-oauth-apps
const clientId = process.env.NODE_ENV === 'development'
  ? '6c3876cacce17b985c85'
  : '1bab8338449584e95414'
const callback = `${window.location.origin}/oauth/redirect`
const authUrl = `https://github.com/login/oauth/authorize?response_type=code&redirect_uri=${callback}&client_id=${clientId}&scope=repo%20repo_deployment%20read:user`

export default defineComponent({
  name: 'Login',

  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const store = useStore()
    const id = ref(config.id)
    const branch = ref(config.branch)
    const token = ref(config.token)
    const loading = ref(false)
    const authLoad = ref(false)
    const valid = computed<boolean>(() => {
      const vid = id.value.split('/').length === 2
      return Boolean(vid && branch.value)
    })
    const branchAll = computed<IBranch[]>(() => store.state.branchAll)

    const goAuth = function() {
      loading.value = true
      window.localStorage.setItem('id', id.value)
      window.localStorage.setItem('branch', branch.value)
      window.location.href = authUrl
    }

    const handleLogin = function() {
      if (!token.value) return

      loading.value = true
      verifyToken(id.value.split('/')[0], token.value).then((res) => {
        if (res.status !== 200) return
        
        window.localStorage.setItem('token', token.value)
        window.localStorage.setItem('isLogin', 'true')
        window.location.reload()
      }).finally(() => {
        loading.value = false
        authLoad.value = false
      })
    }

    function handleIdBlur() {
      const splitId = id.value.split('/')
      if (splitId.length === 2 && splitId[0] && splitId[1]) {
        loading.value = true
        store.dispatch('getBranchAll', id.value).finally(() => {
          loading.value = false
        })
      }
    }

    // Default branch
    watch(branchAll, () => {
      if (branchAll.value.length > 0) {
        branch.value = branchAll.value[0].name
      }
    })

    onMounted(() => {
      const { query } = route
      const code = query.code as string
      if (code) {
        authLoad.value = true
        getAccessToken(code).then(res => {
          if (isSuccess(res.status)) {
            const { accessToken } = res.data.data
            token.value = accessToken
            handleLogin()
          }
        }).catch(() => authLoad.value = false)
      }

      handleLogin()
    })

    return {
      baseUrl: process.env.BASE_URL,
      goAuth,
      authLoad,
      t,
      branchAll,
      id,
      branch,
      token,
      valid,
      loading,
      handleIdBlur,
      handleLogin
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

  .form {
    margin-top: 50px;
    padding: 50px 20px;
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
