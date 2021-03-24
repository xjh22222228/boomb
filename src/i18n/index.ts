import { createI18n } from 'vue-i18n'

let locale = window.localStorage.getItem('locale')

if (!locale) {
  if (window.navigator.language === 'zh-CN') {
    locale = 'zh-CN'
  } else {
    locale = 'en'
  }
}

export default createI18n({
  locale,

  messages: {
    en: {
      what: 'What is Battle?',
      getToken: 'Apply for Token',
      about: 'About Battle',
      report: 'BUG / Suggest',
      info: 'Current Info',
      login: 'Login',
      placeholder: 'Enter token verify',
      uploadFile: 'Upload Files',
      createDir: 'Create Directory',
      changeFile: 'Change File',
      fileName: 'File Name',
      dirName: 'Name',
      fileSize: 'File Size',
      noData: 'Empty~ Drag the file here',
      bulkDel: 'Delete',
      allCheck: 'Check',
      total: 'Total {len} item',
      confirmDel: 'Are you sure you want to delete {len} files?',
      ok: 'OK',
      cancel: 'Cancel',
      all: 'All',
      refresh: 'Refresh',
      asc: 'ASC',
      desc: 'DESC',
      description: `
        <p class="mb10"><a href="https://github.com/xjh22222228/battle" target="_blank">Battle</a> is used to easily manage your Github storage gallery.</p>
        <p class="mb10">Some friends will use it as a picture bed. This is entirely a matter of your personal choice and has nothing to do with the author.</p>
        <p class="mb10">Share in the spirit of open source, if it helps you, <a href="https://github.com/xjh22222228/battle" target="_blank">Star</a> will support it!</p>
      `
    },

    'zh-CN': {
      what: 'Battle是什么?',
      getToken: '去申请TOken',
      about: '关于 Battle',
      report: 'BUG / 建议',
      info: '当前信息',
      login: '登 录',
      placeholder: '输入Token进行验证',
      uploadFile: '上传文件',
      createDir: '新建文件夹',
      changeFile: '更换文件',
      fileName: '文件名',
      dirName: '目录名',
      fileSize: '文件大小',
      noData: '空空如也~，赶紧将文件拖到这里吧~',
      bulkDel: '批量删除',
      allCheck: '全选',
      total: '共 {len} 项',
      confirmDel: '您确定要删除{len}个文件吗？',
      ok: '确定',
      cancel: '取消',
      all: '全部',
      refresh: '刷新',
      asc: '升序',
      desc: '降序',
      description: `
        <p class="mb10"><a href="https://github.com/xjh22222228/battle" target="_blank">Battle</a> 是用于轻松管理您的 Github 存储图库。</p>
        <p class="mb10">有的小伙伴会把它当做图床使用，这完全是您个人选择问题，与作者无任何关系。</p>
        <p class="mb10">以开源的精神分享，如果对您有帮助，<a href="https://github.com/xjh22222228/battle" target="_blank">Star</a> 支持一下！</p>
      `
    }
  }
});
