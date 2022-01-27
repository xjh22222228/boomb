<template>
  <div class="g-loading">
    <svg viewBox="25 25 50 50" class="circular">
      <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
    </svg>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
@keyframes my-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes loading-dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:90,150;stroke-dashoffset:-40px}100%{stroke-dasharray:90,150;stroke-dashoffset:-120px}}.g-loading{z-index:2;position:absolute;top:0;left:0;right:0;bottom:0;background:#fff;display: flex;justify-content: center;align-items: center;}.circular{width:30px;height:30px;animation:my-rotate 2s linear infinite;}.path{stroke-dasharray:90,150;stroke-dashoffset:0;stroke-width:3;stroke:#409eff;stroke-linecap:round;animation:loading-dash 1.5s ease-in-out infinite}
</style>
