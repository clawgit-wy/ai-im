import { describe, it, expect, vi } from 'vitest'
import Mitt from '@/utils/Bus'

describe('utils/Bus (mitt 事件总线)', () => {
  describe('emit / on', () => {
    it('应能注册监听并触发事件', () => {
      const handler = vi.fn()
      Mitt.on('test-event', handler)

      Mitt.emit('test-event', { value: 1 })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ value: 1 })
    })

    it('同一事件可注册多个监听器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      Mitt.on('multi-event', handler1)
      Mitt.on('multi-event', handler2)

      Mitt.emit('multi-event', 'hello')

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler1).toHaveBeenCalledWith('hello')
      expect(handler2).toHaveBeenCalledWith('hello')
    })

    it('支持传递复杂对象', () => {
      const handler = vi.fn()
      const data = { name: 'test', list: [1, 2, 3], nested: { a: true } }
      Mitt.on('complex-event', handler)

      Mitt.emit('complex-event', data)

      expect(handler).toHaveBeenCalledWith(data)
    })

    it('支持传递 undefined 作为事件数据', () => {
      const handler = vi.fn()
      Mitt.on('undefined-event', handler)

      Mitt.emit('undefined-event')

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('off', () => {
    it('off 应移除指定监听器', () => {
      const handler = vi.fn()
      Mitt.on('off-event', handler)
      Mitt.off('off-event', handler)

      Mitt.emit('off-event', 'data')

      expect(handler).not.toHaveBeenCalled()
    })

    it('off 未注册的监听器不应报错', () => {
      const handler = vi.fn()
      expect(() => Mitt.off('not-exist', handler)).not.toThrow()
    })

    it('移除一个监听器后其他监听器仍能正常工作', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      Mitt.on('remain-event', handler1)
      Mitt.on('remain-event', handler2)

      Mitt.off('remain-event', handler1)
      Mitt.emit('remain-event', 'data')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })
  })

  describe('all (事件映射)', () => {
    it('应暴露 all 属性作为 Map', () => {
      expect(Mitt.all).toBeInstanceOf(Map)
    })

    it('注册事件后 all 应包含对应 key', () => {
      const handler = vi.fn()
      Mitt.on('all-test', handler)

      expect(Mitt.all.has('all-test')).toBe(true)
    })

    it('移除监听器后 all 中对应 key 仍存在但 handlers 列表为空', () => {
      const handler = vi.fn()
      Mitt.on('all-off-test', handler)
      Mitt.off('all-off-test', handler)

      const handlers = Mitt.all.get('all-off-test')
      expect(handlers).toBeDefined()
      expect(handlers!.length).toBe(0)
    })
  })
})
