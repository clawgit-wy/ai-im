import { isTauri } from '@/utils/tauri'
import type { ApiResponse } from '@/services/types'

/**
 * 请求 fetch 实现
 * - Tauri 环境：使用 @tauri-apps/plugin-http 的 fetch（绕过浏览器 CORS 限制）
 * - 浏览器 / Mock 环境：使用原生 fetch，配合本地 Mock Server（已开启 CORS）
 */

/**
 * @description 请求参数
 * @property {"GET"|"POST"|"PUT"|"DELETE"} method 请求方法
 * @property {Record<string, string>} [headers] 请求头
 * @property {Record<string, any>} [query] 请求参数
 * @property {any} [body] 请求体
 * @property {boolean} [isBlob] 是否为Blob
 * @return HttpParams
 */
export type HttpParams = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  query?: Record<string, any>
  body?: any
  isBlob?: boolean
}

/**
 * @description HTTP 请求实现
 * @template T
 * @param {string} url 请求地址
 * @param {HttpParams} options 请求参数
 * @param {boolean} [fullResponse=false] 是否返回完整响应
 * @returns {Promise<T>} 请求结果
 */
async function Http<T>(url: string, options: HttpParams, fullResponse?: boolean): Promise<T> {
  const inTauri = isTauri()
  console.log('[HTTP] 开始请求:', options.method, url, 'isTauri:', inTauri)

  // 构建请求头（Tauri HTTP 插件对 Headers 对象兼容性更好）
  const httpHeaders: Record<string, string> = { ...(options.headers || {}) }

  // 构建 fetch 请求选项
  const fetchOptions: any = {
    method: options.method,
    headers: httpHeaders
  }

  // 判断是否需要添加请求体
  if (options.body !== undefined && options.body !== null) {
    if (!(options.body instanceof FormData || options.body instanceof URLSearchParams)) {
      fetchOptions.body = JSON.stringify(options.body)
      console.log('[HTTP] 请求体:', fetchOptions.body)
    } else {
      fetchOptions.body = options.body
    }
  }

  // 添加查询参数
  if (options.query) {
    const queryString = new URLSearchParams(options.query).toString()
    url += `?${queryString}`
  }

  try {
    console.log('[HTTP] fetchOptions:', JSON.stringify({ method: fetchOptions.method, hasBody: !!fetchOptions.body, hasHeaders: !!fetchOptions.headers }))

    // 获取 fetch 实现
    let doFetch: typeof fetch
    if (inTauri) {
      console.log('[HTTP] 使用 Tauri HTTP 插件 fetch')
      const mod = await import('@tauri-apps/plugin-http')
      doFetch = mod.fetch
    } else {
      console.log('[HTTP] 使用原生 fetch')
      doFetch = window.fetch.bind(window)
    }

    console.log('[HTTP] 发起 fetch 调用...')
    const res = await doFetch(url, fetchOptions)
    console.log('[HTTP] fetch 完成, status:', res.status, 'ok:', res.ok)

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[HTTP] 请求失败: ${res.status}`, errText)
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    let data: any
    if (options.isBlob) {
      console.log('[HTTP] 读取 arrayBuffer')
      data = await res.arrayBuffer()
    } else {
      // 统一使用 res.text() + JSON.parse()，兼容 Tauri 和浏览器
      console.log('[HTTP] 读取响应文本...')
      let text = await res.text()
      // Tauri HTTP 插件的 res.text() 可能返回包含 null 字节(\u0000)或 BOM 的文本，
      // 导致 JSON.parse() 抛出 "Unrecognized token" 错误
      // 清除 null 字节、BOM 及其他不可见控制字符
      text = text.replace(/\u0000/g, '').replace(/^\uFEFF/, '').trim()
      console.log('[HTTP] 响应文本长度:', text.length, '内容预览:', text.substring(0, 200))
      try {
        data = text ? JSON.parse(text) : {}
        console.log('[HTTP] JSON解析成功')
      } catch (parseErr) {
        console.error('[HTTP] JSON解析失败:', parseErr, '原始文本:', text)
        throw new Error(`响应JSON解析失败: ${parseErr}`)
      }
    }

    if (fullResponse) {
      return { data, resp: res } as any
    }

    console.log('[HTTP] 请求成功, 返回数据')
    return data
  } catch (err) {
    console.error(`[HTTP] 请求异常: ${options.method} ${url}`, err)
    throw err
  }
}

/**
 * 获取token
 */
function getToken() {
  let tempToken = ''
  return {
    get() {
      if (tempToken) return tempToken
      const token = localStorage.getItem('TOKEN')
      if (token) {
        tempToken = token
      }
      return tempToken
    },
    set(token: string) {
      tempToken = token
      localStorage.setItem('TOKEN', token)
    },
    clear() {
      tempToken = ''
      localStorage.removeItem('TOKEN')
    }
  }
}

export const computedToken = getToken()

// fetch 请求响应拦截器
const responseInterceptor = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  query: any,
  body: any
): Promise<T> => {
  const token = computedToken.get()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let httpParams: HttpParams = {
    method,
    headers
  }

  if (method === 'GET') {
    httpParams = {
      ...httpParams,
      query
    }
  } else {
    if (query && Object.keys(query).length) {
      url = `${url}?${new URLSearchParams(query).toString()}`
    }
    httpParams = {
      ...httpParams,
      body
    }
  }

  try {
    const data = await Http<ApiResponse<T>>(url, httpParams)

    // 检查服务端返回是否成功
    if (!data.success) {
      window.$message?.error(data.message)
      return Promise.reject(`http error: ${data.message}`)
    }
    return Promise.resolve(data.data)
  } catch (err) {
    return Promise.reject(`http error: ${err}`)
  }
}

/** GET请求 */
const get = async <T>(url: string, query?: any): Promise<T> => {
  return responseInterceptor<T>(url, 'GET', query, {})
}

/** POST请求 */
const post = async <T>(url: string, body?: any): Promise<T> => {
  return responseInterceptor<T>(url, 'POST', {}, body)
}

/** PUT请求 */
const put = async <T>(url: string, body?: any): Promise<T> => {
  return responseInterceptor<T>(url, 'PUT', {}, body)
}

/** DELETE请求 */
const del = async <T>(url: string, body?: any): Promise<T> => {
  return responseInterceptor<T>(url, 'DELETE', {}, body)
}

export default {
  get,
  post,
  put,
  delete: del
}

export { Http }
