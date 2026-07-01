import { describe, it, expect } from 'vitest'
import {
  MittEnum,
  ThemeEnum,
  StoresEnum,
  ChatTypeEnum,
  MsgEnum,
  OnlineEnum,
  RoleEnum,
  AITypeEnum,
  PluginStatusEnum,
  ViewModeEnum,
  RCodeEnum,
  URLEnum
} from '@/enums'

describe('enums/index', () => {
  describe('MittEnum', () => {
    it('应定义全部 6 个事件', () => {
      expect(Object.keys(MittEnum).filter((k) => isNaN(Number(k)))).toHaveLength(6)
    })

    it('枚举值应为从 0 开始的连续数字', () => {
      expect(MittEnum.SWITCH_MODULE).toBe(0)
      expect(MittEnum.SEND_MESSAGE).toBe(1)
      expect(MittEnum.SHRINK_WINDOW).toBe(2)
      expect(MittEnum.UPDATE_UNREAD).toBe(3)
      expect(MittEnum.OPEN_SETTINGS).toBe(4)
      expect(MittEnum.TOGGLE_THEME).toBe(5)
    })
  })

  describe('ThemeEnum', () => {
    it('应包含 light / dark / os 三种主题', () => {
      expect(ThemeEnum.LIGHT).toBe('light')
      expect(ThemeEnum.DARK).toBe('dark')
      expect(ThemeEnum.OS).toBe('os')
    })

    it('应有 3 个枚举成员', () => {
      const values = Object.values(ThemeEnum)
      expect(values).toHaveLength(3)
    })
  })

  describe('StoresEnum', () => {
    it('每个 store 名称应为字符串', () => {
      expect(StoresEnum.SETTING).toBe('setting')
      expect(StoresEnum.USER).toBe('user')
      expect(StoresEnum.CHAT).toBe('chat')
      expect(StoresEnum.SCHEDULE).toBe('schedule')
      expect(StoresEnum.ROBOT).toBe('robot')
      expect(StoresEnum.AGENT).toBe('agent')
      expect(StoresEnum.PLUGIN).toBe('plugin')
      expect(StoresEnum.GLOBAL).toBe('global')
    })

    it('应有 8 个 store', () => {
      const keys = Object.keys(StoresEnum).filter((k) => isNaN(Number(k)))
      expect(keys).toHaveLength(8)
    })

    it('所有值应唯一', () => {
      const values = Object.values(StoresEnum)
      expect(new Set(values).size).toBe(values.length)
    })
  })

  describe('ChatTypeEnum', () => {
    it('单聊应为 1', () => {
      expect(ChatTypeEnum.SINGLE).toBe(1)
    })

    it('群聊应为 2', () => {
      expect(ChatTypeEnum.GROUP).toBe(2)
    })
  })

  describe('MsgEnum', () => {
    it('应包含 8 种消息类型', () => {
      const keys = Object.keys(MsgEnum).filter((k) => isNaN(Number(k)))
      expect(keys).toHaveLength(8)
    })

    it('TEXT 应为 0', () => {
      expect(MsgEnum.TEXT).toBe(0)
    })

    it('枚举值应为从 0 到 7 的连续数字', () => {
      expect(MsgEnum.TEXT).toBe(0)
      expect(MsgEnum.IMAGE).toBe(1)
      expect(MsgEnum.FILE).toBe(2)
      expect(MsgEnum.VOICE).toBe(3)
      expect(MsgEnum.VIDEO).toBe(4)
      expect(MsgEnum.EMOJI).toBe(5)
      expect(MsgEnum.SYSTEM).toBe(6)
      expect(MsgEnum.REPLY).toBe(7)
    })
  })

  describe('OnlineEnum', () => {
    it('在线应为 1', () => {
      expect(OnlineEnum.ONLINE).toBe(1)
    })

    it('离线应为 2', () => {
      expect(OnlineEnum.OFFLINE).toBe(2)
    })
  })

  describe('RoleEnum', () => {
    it('群主应为 1', () => {
      expect(RoleEnum.OWNER).toBe(1)
    })

    it('管理员应为 2', () => {
      expect(RoleEnum.ADMIN).toBe(2)
    })

    it('普通成员应为 3', () => {
      expect(RoleEnum.MEMBER).toBe(3)
    })

    it('机器人应为 4', () => {
      expect(RoleEnum.BOT).toBe(4)
    })
  })

  describe('AITypeEnum', () => {
    it('无AI应为 0', () => {
      expect(AITypeEnum.NONE).toBe(0)
    })

    it('机器人应为 1', () => {
      expect(AITypeEnum.BOT).toBe(1)
    })

    it('智能体应为 2', () => {
      expect(AITypeEnum.AGENT).toBe(2)
    })
  })

  describe('PluginStatusEnum', () => {
    it('应包含 4 种状态', () => {
      const keys = Object.keys(PluginStatusEnum).filter((k) => isNaN(Number(k)))
      expect(keys).toHaveLength(4)
    })

    it('BUILTIN 应为 0', () => {
      expect(PluginStatusEnum.BUILTIN).toBe(0)
    })
  })

  describe('ViewModeEnum', () => {
    it('列表模式应为 0', () => {
      expect(ViewModeEnum.LIST).toBe(0)
    })

    it('网格模式应为 1', () => {
      expect(ViewModeEnum.GRID).toBe(1)
    })
  })

  describe('RCodeEnum', () => {
    it('成功应为 200', () => {
      expect(RCodeEnum.OK).toBe('200')
    })

    it('请求错误应为 400', () => {
      expect(RCodeEnum.FAIL).toBe('400')
    })

    it('服务器异常应为 500', () => {
      expect(RCodeEnum.SERVE_EXCEPTION).toBe('500')
    })

    it('业务异常应为 600', () => {
      expect(RCodeEnum.BUSINESS_EXCEPTION).toBe('600')
    })
  })

  describe('URLEnum', () => {
    it('用户路径应为 /api/user', () => {
      expect(URLEnum.USER).toBe('/api/user')
    })

    it('聊天路径应为 /api/chat', () => {
      expect(URLEnum.CHAT).toBe('/api/chat')
    })

    it('日程路径应为 /api/schedule', () => {
      expect(URLEnum.SCHEDULE).toBe('/api/schedule')
    })

    it('机器人路径应为 /api/robot', () => {
      expect(URLEnum.ROBOT).toBe('/api/robot')
    })

    it('智能体路径应为 /api/agent', () => {
      expect(URLEnum.AGENT).toBe('/api/agent')
    })

    it('插件路径应为 /api/plugin', () => {
      expect(URLEnum.PLUGIN).toBe('/api/plugin')
    })

    it('所有 URL 值应以 /api 开头', () => {
      const urls = Object.values(URLEnum)
      urls.forEach((url) => {
        expect(url.startsWith('/api')).toBe(true)
      })
    })

    it('所有 URL 值应唯一', () => {
      const urls = Object.values(URLEnum)
      expect(new Set(urls).size).toBe(urls.length)
    })
  })
})
