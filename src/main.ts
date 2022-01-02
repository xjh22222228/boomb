// Copyright 2021 the xiejiahe. All rights reserved. MIT license.

import 'element-plus/dist/index.css'
import 'normalize.css'
import './global.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
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
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElDrawer,
  ElIcon
} from 'element-plus'

import FileCard from '@/components/FileCard.vue'
import FileList from '@/components/FileList.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Loading from '@/components/Loading.vue'
import Action from '@/components/Action.vue'
import ActionApp from '@/components/ActionApp.vue'
import Sort from '@/components/Sort.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import Language from '@/components/Language.vue'
import FileEncodeRuleDialog from '@/components/FileEncodeRuleDialog.vue'
import CreateDirDialog from '@/components/CreateDirDialog.vue'

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
app.component(ElRadio.name, ElRadio)
app.component(ElRadioGroup.name, ElRadioGroup)
app.component(ElDrawer.name, ElDrawer)
app.component(ElIcon.name, ElIcon)

app.component('FileCard', FileCard)
app.component('FileList', FileList)
app.component('Header', Header)
app.component('Footer', Footer)
app.component('Loading', Loading)
app.component('Action', Action)
app.component('ActionApp', ActionApp)
app.component('Sort', Sort)
app.component('ContextMenu', ContextMenu)
app.component('Language', Language)
app.component('FileEncodeRuleDialog', FileEncodeRuleDialog)
app.component('CreateDirDialog', CreateDirDialog)

app
  .use(store)
  .use(router)
  .use(i18n)
  .mount('#xiejiahe-app')
