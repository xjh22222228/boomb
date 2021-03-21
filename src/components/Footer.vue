<template>
  <footer class="footer">
    Copyright © 2021 <a href="https://github.com/xjh22222228" target="_blank">xiejiahe</a>
    <div><a href="https://github.com/xjh22222228/bed" target="_blank">Bed </a> v{{ version }} MIT</div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const pkg = require('../../package.json')

export default defineComponent({
  name: 'Footer',

  setup() {
    return {
      version: pkg.version
    }
  }
})
</script>

<style lang="scss" scoped>
.footer {
  z-index: 99;
  text-align: center;
  color: #666;
  background: #475050;
  color: #fff;
  padding: 30px 0;
  font-size: 16px;

  a {
    text-decoration: none;
    color: #fff;
  }
}
</style>
