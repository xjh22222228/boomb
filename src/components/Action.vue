<template>
  <div class="wrapper">
    <el-dropdown placement="top">
        <img src="@/assets/liqueur.svg" alt="" class="img">

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleInfo" v-if="isLogin">当前信息</el-dropdown-item>
          <el-dropdown-item>
            <a href="https://issue-helper.vercel.app/?repo=xjh22222228/battle" target="_blank">BUG / 建议</a>
          </el-dropdown-item>
          <el-dropdown-item @click="handleAbout">关于 Battle</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import config from '../../config'
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'

export default defineComponent({
  name: 'Action',

  setup() {
    const store = useStore()
    const isLogin = computed(() => store.state.isLogin)

    const handleAbout = function() {
      ElMessageBox.confirm('', {
        title: 'Battle 是什么?',
        dangerouslyUseHTMLString: true,
        message: `
          <p class="mb10"><a href="https://github.com/xjh22222228/battle" target="_blank">Battle</a> 是用于轻松管理您的 Github 存储图库。</p>
          <p class="mb10">有的小伙伴会把它当做图床使用，这完全是您个人选择问题，与作者无任何关系。</p>
          <p class="mb10">以开源的精神分享，如果对您有帮助，<a href="https://github.com/xjh22222228/battle" target="_blank">Star</a> 支持一下！</p>
        `,
      }).catch(() => {})
    }

    const handleInfo = function() {
      ElMessageBox.confirm('', {
        title: '当前登录信息',
        dangerouslyUseHTMLString: true,
        message: `
          <p class="mb10">Token: ${config.token}</p>
          <p class="mb10">ID: <a href="https://github.com/${config.id}" target="_blank">${config.id}</a></p>
          <p class="mb10">分支: ${config.branch}</p>
        `,
      }).catch(() => {})
    }

    return {
      isLogin,
      handleAbout,
      handleInfo
    }
  }
})
</script>

<style lang="scss" scoped>
.wrapper {
  position: fixed;
  bottom: 150px;
  right: 30px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.img {
  width: 30px;
}
</style>
