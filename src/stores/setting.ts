import { defineStore } from 'pinia'
import { StoresEnum, ThemeEnum, ViewModeEnum } from '@/enums'

export const useSettingStore = defineStore(StoresEnum.SETTING, {
  state: () => ({
    /** 主题设置 */
    themes: {
      /** 当前主题内容 */
      content: '' as ThemeEnum,
      /** 主题模式 (light/dark/os) */
      pattern: '' as string
    },
    /** 主题色 */
    themeColor: '#13987f',
    /** 菜单显示模式 */
    showMode: ViewModeEnum.LIST,
    /** 锁屏设置 */
    lockScreen: {
      /** 是否启用锁屏 */
      enable: false,
      /** 锁屏密码 */
      password: ''
    },
    /** 自动登录 */
    autoLogin: false,
    /** 开机自启 */
    autoStartup: false,
    /** 发送快捷键 */
    sendKey: 'Enter',
    /** 窗口阴影 */
    windowShadow: true,
    /** 窗口透明度 */
    windowOpacity: 95,
    /** 字体大小 */
    fontSize: 14,
    /** 是否开启消息通知 */
    notifyEnabled: true,
    /** 是否开启日程提醒 */
    scheduleNotify: true,
    /** 是否开启声音 */
    soundEnabled: false,
    /** 日程提醒时间(分钟) */
    scheduleRemindTime: 10,
    /** 自动更新 */
    autoUpdate: true,
    /** 更新渠道 */
    updateChannel: 'stable'
  }),
  actions: {
    /** 初始化主题 */
    initTheme(theme: string) {
      this.themes.content = theme as ThemeEnum
      document.documentElement.dataset.theme = theme
      this.themes.pattern = theme
    },
    /** 切换主题 */
    toggleTheme(theme: string) {
      if (theme === ThemeEnum.OS) {
        this.themes.pattern = theme
        const os = matchMedia('(prefers-color-scheme: dark)').matches ? ThemeEnum.DARK : ThemeEnum.LIGHT
        document.documentElement.dataset.theme = os
        this.themes.content = os
      } else {
        this.themes.content = theme as ThemeEnum
        document.documentElement.dataset.theme = theme
        this.themes.pattern = theme
      }
    },
    /** 设置菜单显示模式 */
    setShowMode(showMode: ViewModeEnum): void {
      this.showMode = showMode
    },
    /** 设置主题色 */
    setThemeColor(color: string): void {
      this.themeColor = color
    }
  },
  /** 持久化存储设置数据 */
  persist: true
})
