// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

import 'element-plus/lib/theme-chalk/index.css'
import 'normalize.css'
import './global.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {
  ElButton,
  ElRow,
  ElCol,
  ElAvatar,
  ElInput,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElDialog,
  ElPopover,
  ElEmpty,
  ElSwitch,
  ElCheckboxGroup,
  ElCheckbox,
  ElPopconfirm,
  ElForm,
  ElFormItem,
  ElMessageBox,
  ElTooltip,
  ElSelect,
  ElOption
} from 'element-plus'

import File from '@/components/File.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Loading from '@/components/Loading.vue'
import Action from '@/components/Action.vue'
import Sort from '@/components/Sort.vue'
import ContextMenu from '@/components/ContextMenu.vue'

const app = createApp(App)

app.component(ElButton.name, ElButton)
app.component(ElRow.name, ElRow)
app.component(ElCol.name, ElCol)
app.component(ElAvatar.name, ElAvatar)
app.component(ElInput.name, ElInput)
app.component(ElBreadcrumb.name, ElBreadcrumb)
app.component(ElBreadcrumbItem.name, ElBreadcrumbItem)
app.component(ElDropdown.name, ElDropdown)
app.component(ElDropdownItem.name, ElDropdownItem)
app.component(ElDropdownMenu.name, ElDropdownMenu)
app.component(ElDialog.name, ElDialog)
app.component(ElPopover.name, ElPopover)
app.component(ElEmpty.name, ElEmpty)
app.component(ElSwitch.name, ElSwitch)
app.component(ElCheckboxGroup.name, ElCheckboxGroup)
app.component(ElCheckbox.name, ElCheckbox)
app.component(ElPopconfirm.name, ElPopconfirm)
app.component(ElForm.name, ElForm)
app.component(ElFormItem.name, ElFormItem)
app.component(ElMessageBox.name, ElMessageBox)
app.component(ElTooltip.name, ElTooltip)
app.component(ElSelect.name, ElSelect)
app.component(ElOption.name, ElOption)

app.component(File.name, File)
app.component(Header.name, Header)
app.component(Footer.name, Footer)
app.component(Loading.name, Loading)
app.component(Action.name, Action)
app.component(Sort.name, Sort)
app.component(ContextMenu.name, ContextMenu)

app
  .use(store)
  .use(router)
  .mount('#xiejiahe-app')
