<template>
  <footer class="footer">
    <div class="flag">
      <a
        href="https://github.com/xjh22222228/boomb"
        target="_blank"
        class="ch"
      >
        Bo💣mb
        <img class="icon" src="@/assets/github.svg" alt="">
      </a>
      v{{ version }} MIT
    </div>

    Copyright © 2021 boomb.com
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const pkg = require('../../package.json')

export default defineComponent({
  name: 'Footer',

  setup() {
    return {
      version: pkg.version,
    }
  }
})
</script>

<style lang="scss" scoped>
.footer {
  z-index: 11;
  text-align: center;
  color: #666;
  background: #475050;
  color: #fff;
  padding: 15px 0;
  font-size: 16px;

  .flag {
    margin-bottom: 5px;
  }

  .icon {
    width: 25px;
    height: 25px;
    vertical-align: top;
  }
}
</style>
