<template>
  <el-dropdown placement="top" trigger="click">
    <span>文件</span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>
          升序
        </el-dropdown-item>
        <el-dropdown-item>
          降序
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Sort',

  setup() {
    return {
    }
  }
})
</script>

<style lang="scss" scoped>
.sorter {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 30px;
  padding: 5px 0 5px 130px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all .1s linear;

  &:hover {
    background: #f2f2f2;
  }
}
</style>
