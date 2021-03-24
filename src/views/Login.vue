<template>
  <section class="login">
    <div class="wrapper">
      <h2 class="title">Battle</h2>

      <div class="form">
        <el-input
          v-model="id"
          placeholder="xjh22222228/battle"
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

        <el-input
          v-model="token"
          :placeholder="t('placeholder')"
          class="mb20"
          type="password"
          @keyup.enter="handleLogin"
        >
          <template #prepend>&nbsp;Token&nbsp;</template>
          <template #prefix>
            <i class="el-input__icon el-icon-lock"></i>
          </template>
        </el-input>

        <div class="mb20 tar">
          <a href="https://github.com/settings/tokens" target="_blank">
            {{ t('getToken') }}
          </a>
        </div>

        <el-button
          type="primary"
          @click="handleLogin"
          :loading="loading"
          class="w100"
          :disabled="!valid"
        >
          {{ t('Login') }}
        </el-button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import config from '../../config'
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { verifyToken } from '@/services'
import { IBranch } from '@/store'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Login',

  setup() {
    const { t } = useI18n()
    const store = useStore()
    const id = ref(config.id)
    const branch = ref(config.branch)
    const token = ref(config.token)
    const loading = ref(false)
    const valid = computed<boolean>(() => {
      const vid = id.value.split('/').length === 2
      return Boolean(vid && branch.value && token.value)
    })
    const branchAll = computed<IBranch[]>(() => store.state.branchAll)

    const handleLogin = function() {
      loading.value = true
      verifyToken(id.value.split('/')[0], token.value).then((res) => {
        if (res.status !== 200) return

        window.localStorage.setItem('id', id.value)
        window.localStorage.setItem('branch', branch.value)
        window.localStorage.setItem('token', token.value)
        window.location.reload()
      }).finally(() => {
        loading.value = false
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

    return {
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
.login {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f0f2f5 url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg);
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.wrapper {
  z-index: 99;
  margin-top: 100px;

  .title {
    font-size: 42px;
    text-align: center;
  }

  .form {
    margin-top: 50px;
    padding: 30px 20px;
    background: #fff;
    width: 500px;
    border-radius: 5px;
  }
}
</style>
