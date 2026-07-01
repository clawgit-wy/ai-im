import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Http, computedToken, type HttpParams } from '@/services/http'

// 测试环境(非 Tauri)下 http.ts 使用原生 window.fetch，因此 mock 全局 fetch
const mockFetch = vi.fn()
beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('services/http', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 每次测试前清空 token
    computedToken.clear()
    localStorage.clear()
  })

  describe('HttpParams 类型', () => {
    it('应支持构建合法的 GET 请求参数', () => {
      const params: HttpParams = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        query: { page: 1, size: 10 }
      }
      expect(params.method).toBe('GET')
      expect(params.headers!['Content-Type']).toBe('application/json')
      expect(params.query!.page).toBe(1)
    })

    it('应支持构建合法的 POST 请求参数', () => {
      const params: HttpParams = {
        method: 'POST',
        body: { name: 'test', value: 123 }
      }
      expect(params.method).toBe('POST')
      expect(params.body!.name).toBe('test')
      expect(params.body!.value).toBe(123)
    })

    it('应支持构建合法的 PUT 请求参数', () => {
      const params: HttpParams = {
        method: 'PUT',
        body: { id: 1, name: 'updated' }
      }
      expect(params.method).toBe('PUT')
      expect(params.body!.id).toBe(1)
    })

    it('应支持构建合法的 DELETE 请求参数', () => {
      const params: HttpParams = {
        method: 'DELETE',
        query: { id: 1 }
      }
      expect(params.method).toBe('DELETE')
      expect(params.query!.id).toBe(1)
    })

    it('应支持 isBlob 选项', () => {
      const params: HttpParams = {
        method: 'GET',
        isBlob: true
      }
      expect(params.isBlob).toBe(true)
    })

    it('应支持可选 headers', () => {
      const params: HttpParams = { method: 'GET' }
      expect(params.headers).toBeUndefined()
    })
  })

  describe('Http 函数 - 参数构建', () => {
    it('GET 请求应正确拼接查询参数', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, code: 200, message: 'ok', data: { id: 1 } })
      }
      mockFetch.mockResolvedValue(mockResponse)

      const url = 'https://example.com/api/test'
      await Http(url, { method: 'GET', query: { page: 1, size: 10 } })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('?')
      expect(calledUrl).toContain('page=1')
      expect(calledUrl).toContain('size=10')
    })

    it('POST 请求应将 body 序列化为 JSON', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, code: 200, message: 'ok', data: {} })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await Http('https://example.com/api/test', {
        method: 'POST',
        body: { name: 'test' }
      })

      const fetchOptions = mockFetch.mock.calls[0][1] as RequestInit
      expect(fetchOptions.method).toBe('POST')
      expect(fetchOptions.body).toBe(JSON.stringify({ name: 'test' }))
    })

    it('GET 请求不应包含 body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, code: 200, message: 'ok', data: {} })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await Http('https://example.com/api/test', { method: 'GET' })

      const fetchOptions = mockFetch.mock.calls[0][1] as RequestInit
      expect(fetchOptions.body).toBeUndefined()
    })

    it('无 query 时 URL 不应包含问号', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, code: 200, message: 'ok', data: {} })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await Http('https://example.com/api/test', { method: 'GET' })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).not.toContain('?')
    })

    it('应正确传递自定义 headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ success: true, code: 200, message: 'ok', data: {} })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await Http('https://example.com/api/test', {
        method: 'GET',
        headers: { Authorization: 'Bearer token123' }
      })

      const fetchOptions = mockFetch.mock.calls[0][1] as RequestInit
      const headers = fetchOptions.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer token123')
    })

    it('isBlob 为 true 时应返回 ArrayBuffer', async () => {
      const arrayBuffer = new ArrayBuffer(10)
      const mockResponse = {
        ok: true,
        status: 200,
        arrayBuffer: async () => arrayBuffer,
        json: async () => ({ success: true, code: 200, message: 'ok', data: {} })
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await Http('https://example.com/api/test', {
        method: 'GET',
        isBlob: true
      })

      expect(result).toBe(arrayBuffer)
    })
  })

  describe('Http 函数 - 错误处理', () => {
    it('HTTP 状态码非 2xx 应抛出错误', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ success: false, code: 404, message: 'Not Found', data: null })
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        Http('https://example.com/api/test', { method: 'GET' })
      ).rejects.toThrow('HTTP error! status: 404')
    })

    it('fetch 抛出异常应被捕获并重新抛出', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(
        Http('https://example.com/api/test', { method: 'GET' })
      ).rejects.toThrow('Network error')
    })
  })

  describe('computedToken', () => {
    it('初始状态 token 应为空字符串', () => {
      expect(computedToken.get()).toBe('')
    })

    it('set 后应能通过 get 获取', () => {
      computedToken.set('my-token')
      expect(computedToken.get()).toBe('my-token')
    })

    it('set 后应存入 localStorage', () => {
      computedToken.set('stored-token')
      expect(localStorage.getItem('TOKEN')).toBe('stored-token')
    })

    it('从 localStorage 读取 token（缓存未命中时）', () => {
      // beforeEach 已 clear 内存缓存，此时直接设置 localStorage
      localStorage.setItem('TOKEN', 'local-token')
      // get 应从 localStorage 读取（因为内存缓存为空）
      expect(computedToken.get()).toBe('local-token')
    })

    it('get 在缓存命中时不应重复读取 localStorage', () => {
      computedToken.set('cached-token')
      // 第二次 get 应直接返回缓存值
      const spy = vi.spyOn(Storage.prototype, 'getItem')
      expect(computedToken.get()).toBe('cached-token')
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('clear 应清除内存缓存和 localStorage', () => {
      computedToken.set('temp-token')
      computedToken.clear()
      expect(computedToken.get()).toBe('')
      expect(localStorage.getItem('TOKEN')).toBeNull()
    })
  })
})
