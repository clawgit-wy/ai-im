/**
 * Tauri 环境兼容工具
 * 在浏览器 / Mock 环境下安全调用 Tauri API，避免因缺少 __TAURI_INTERNALS__ 导致崩溃。
 */
import { getCurrentWebviewWindow, type WebviewWindow } from '@tauri-apps/api/webviewWindow'

/**
 * 判断当前是否运行在 Tauri 环境中
 * Tauri 注入 `window.__TAURI_INTERNALS__`，浏览器中不存在。
 */
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

/**
 * 安全获取当前 WebviewWindow
 * - Tauri 环境：返回真实窗口实例
 * - 浏览器 / Mock 环境：返回 null，调用方需做空值守卫
 */
export const getCurrentWindowSafe = (): WebviewWindow | null => {
  if (!isTauri()) return null
  try {
    return getCurrentWebviewWindow()
  } catch (err) {
    console.warn('[tauri] getCurrentWebviewWindow 调用失败:', err)
    return null
  }
}

/**
 * 防御性地执行依赖 Tauri 窗口的操作
 * @param fn 接收真实 WebviewWindow 的回调
 * @param fallback 浏览器环境下的兜底逻辑
 */
export const withWindow = async <T>(
  fn: (win: WebviewWindow) => T | Promise<T>,
  fallback?: () => T | Promise<T> | void
): Promise<T | void> => {
  const win = getCurrentWindowSafe()
  if (!win) {
    return fallback?.()
  }
  return fn(win)
}
