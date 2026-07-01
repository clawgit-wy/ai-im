/// <reference types="vite/client" />

import type {
  MessageApiInjection,
  DialogApiInjection,
  NotificationApiInjection,
  LoadingBarApiInjection,
  ModalApiInjection
} from 'naive-ui'

declare global {
  interface Window {
    /** Naive UI 消息提示 */
    $message: MessageApiInjection
    /** Naive UI 对话框 */
    $dialog: DialogApiInjection
    /** Naive UI 通知 */
    $notification: NotificationApiInjection
    /** Naive UI 加载条 */
    $loadingBar: LoadingBarApiInjection
    /** Naive UI 模态框 */
    $modal: ModalApiInjection
  }

  interface ViewTransition {
    ready: Promise<void>
  }

  interface Document {
    startViewTransition?: (callback: () => Promise<void> | void) => ViewTransition
  }
}

/** 通用类型 */
declare namespace Common {
  /**
   * 策略模式
   * [状态, 为true时执行的回调函数]
   */
  type StrategyAction = [boolean, () => void]

  /** 选项数据 */
  type OptionWithKey<K> = { value: K; label: string }
}

/** 构建时间 */
declare const PROJECT_BUILD_TIME: string

export {}
