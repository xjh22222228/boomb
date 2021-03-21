<template>
  <section class="login">
    <div class="wrapper">
      <h2 class="title">Bed</h2>

      <div class="form">
        <el-input
          v-model="id"
          placeholder="xjh22222228/public"
          class="mb20"
        >
          <template #prepend>&nbsp;&nbsp;&nbsp;I D&nbsp;&nbsp;</template>
          <template #prefix>
            <i class="el-input__icon el-icon-user"></i>
          </template>
        </el-input>

        <el-input
          v-model="branch"
          placeholder="main"
          class="mb20"
        >
          <template #prepend>&nbsp;分 支</template>
          <template #prefix>
            <i class="el-input__icon el-icon-attract"></i>
          </template>
        </el-input>

        <el-input
          v-model="token"
          placeholder="输入Token进行验证"
          class="mb20"
          type="password"
        >
          <template #prepend>Token</template>
          <template #prefix>
            <i class="el-input__icon el-icon-lock"></i>
          </template>
        </el-input>
        <el-button
          type="primary"
          @click="handleLogin"
          :loading="loading"
          class="w100"
          :disabled="!valid"
        >
          登 录
        </el-button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { verifyToken } from '@/services'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'Login',

  setup() {
    const id = ref('')
    const branch = ref('main')
    const token = ref('')
    const loading = ref(false)
    const valid = computed<boolean>(() => Boolean(id.value && branch.value && token.value))

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

    return {
      id,
      branch,
      token,
      valid,
      loading,
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
