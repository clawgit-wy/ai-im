# API 接口文档

## 通用说明

### 基础信息

- 基础路径：`/api`
- 请求格式：`application/json`
- 认证方式：Bearer Token（请求头 `Authorization: Bearer <token>`）

### 统一响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误码

| 错误码 | 说明 |
| --- | --- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 600 | 业务异常 |

### 列表响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    "cursor": "eyJpZCI6MTIzfQ==",
    "isLast": false,
    "list": []
  }
}
```

---

## 一、用户接口

### 1.1 用户登录

- **方法**：`POST`
- **路径**：`/api/user/login`
- **认证**：不需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| account | string | 是 | 账号（邮箱/手机号） |
| password | string | 是 | 密码 |

**请求示例**：

```json
{
  "account": "user@example.com",
  "password": "123456"
}
```

**响应数据**：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| userInfo | UserInfo | 用户信息 |
| token | string | 访问令牌 |

```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "userInfo": {
      "uid": 1,
      "name": "用户1",
      "avatar": "https://example.com/avatar.png",
      "email": "user@example.com",
      "phone": "13800138000",
      "onlineStatus": 1,
      "lastOptTime": 1717000000000
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 1.2 用户注册

- **方法**：`POST`
- **路径**：`/api/user/register`
- **认证**：不需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码 |

**响应数据**：`UserInfo`

### 1.3 获取用户信息

- **方法**：`GET`
- **路径**：`/api/user/info`
- **认证**：需要

**响应数据**：`UserInfo`

### 1.4 修改用户信息

- **方法**：`PUT`
- **路径**：`/api/user/info`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 否 | 用户名 |
| avatar | string | 否 | 头像URL |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |

**响应数据**：无

### 1.5 修改密码

- **方法**：`PUT`
- **路径**：`/api/user/password`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| oldPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码 |

**响应数据**：无

### 1.6 退出登录

- **方法**：`POST`
- **路径**：`/api/user/logout`
- **认证**：需要

**响应数据**：无

---

## 二、消息接口

### 2.1 发送消息

- **方法**：`POST`
- **路径**：`/api/chat/msg`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |
| msgType | number | 是 | 消息类型（0文本 1图片 2文件 3语音 4视频 5表情 6系统 7回复） |
| body | object | 是 | 消息体 |
| body.content | string | 否 | 文本内容（文本消息时） |
| body.replyMsgId | number | 否 | 回复的消息ID（回复消息时） |

**请求示例**：

```json
{
  "sessionId": 1,
  "msgType": 0,
  "body": {
    "content": "你好"
  }
}
```

**响应数据**：`MessageType`

```json
{
  "success": true,
  "code": 200,
  "data": {
    "fromUser": {
      "uid": 1,
      "username": "用户1",
      "avatar": "https://example.com/avatar.png"
    },
    "message": {
      "id": 100,
      "sessionId": 1,
      "type": 0,
      "body": { "content": "你好" },
      "sendTime": 1717000000000,
      "messageMark": {
        "userLike": 0,
        "userDislike": 0,
        "likeCount": 0,
        "dislikeCount": 0
      }
    },
    "sendTime": "2025-06-01 12:00:00"
  }
}
```

### 2.2 接收消息（轮询）

- **方法**：`GET`
- **路径**：`/api/chat/msg/recv`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| cursor | string | 否 | 游标（上次获取的最后一条消息ID） |

**响应数据**：`ListResponse<MessageType>`

### 2.3 获取历史消息

- **方法**：`GET`
- **路径**：`/api/chat/msg/page`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |
| cursor | string | 否 | 游标 |
| pageSize | number | 否 | 每页条数（默认20） |

**响应数据**：`ListResponse<MessageType>`

### 2.4 撤回消息

- **方法**：`PUT`
- **路径**：`/api/chat/msg/recall`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| msgId | number | 是 | 消息ID |
| sessionId | number | 是 | 会话ID |

**响应数据**：无

### 2.5 标记消息已读

- **方法**：`PUT`
- **路径**：`/api/chat/msg/read`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |

**响应数据**：无

---

## 三、群组接口

### 3.1 创建群组

- **方法**：`POST`
- **路径**：`/api/chat/group`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| groupName | string | 是 | 群名称 |
| avatar | string | 否 | 群头像 |
| uidList | number[] | 是 | 成员uid列表 |

**响应数据**：

```json
{
  "success": true,
  "code": 200,
  "data": { "id": 100 }
}
```

### 3.2 获取群成员列表

- **方法**：`GET`
- **路径**：`/api/chat/group/members`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |

**响应数据**：`ListResponse<GroupMember>`

### 3.3 添加群成员

- **方法**：`POST`
- **路径**：`/api/chat/group/member`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |
| uidList | number[] | 是 | 成员uid列表 |

**响应数据**：无

### 3.4 移除群成员

- **方法**：`DELETE`
- **路径**：`/api/chat/group/member`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |
| uid | number | 是 | 成员uid |

**响应数据**：无

### 3.5 退出群组

- **方法**：`DELETE`
- **路径**：`/api/chat/group/exit`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sessionId | number | 是 | 会话ID |

**响应数据**：无

---

## 四、日程接口

### 4.1 获取日程列表

- **方法**：`GET`
- **路径**：`/api/schedule/list`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| startDate | number | 否 | 开始时间戳 |
| endDate | number | 否 | 结束时间戳 |
| type | string | 否 | 日程类型 |

**响应数据**：`ListResponse<Schedule>`

### 4.2 获取日程详情

- **方法**：`GET`
- **路径**：`/api/schedule/detail`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 日程ID |

**响应数据**：`Schedule`

### 4.3 创建日程

- **方法**：`POST`
- **路径**：`/api/schedule`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 是 | 日程标题 |
| content | string | 否 | 日程内容 |
| startTime | number | 是 | 开始时间戳 |
| endTime | number | 是 | 结束时间戳 |
| allDay | boolean | 否 | 是否全天 |
| remindTime | number | 否 | 提醒时间（分钟） |
| type | string | 否 | 日程类型 |

**响应数据**：`Schedule`

### 4.4 更新日程

- **方法**：`PUT`
- **路径**：`/api/schedule`
- **认证**：需要

**请求参数**：同创建日程，额外包含 `id` 字段

**响应数据**：无

### 4.5 删除日程

- **方法**：`DELETE`
- **路径**：`/api/schedule`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 日程ID |

**响应数据**：无

---

## 五、工作流接口（机器人）

### 5.1 获取工作流列表

- **方法**：`GET`
- **路径**：`/api/robot/list`
- **认证**：需要

**响应数据**：`ListResponse<Workflow>`

### 5.2 获取工作流详情

- **方法**：`GET`
- **路径**：`/api/robot/detail`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 工作流ID |

**响应数据**：`Workflow`

### 5.3 创建工作流

- **方法**：`POST`
- **路径**：`/api/robot`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 工作流名称 |
| description | string | 否 | 工作流描述 |
| avatar | string | 否 | 头像 |
| prompt | string | 否 | 提示词 |
| modelConfig | object | 否 | 模型配置 |
| modelConfig.model | string | 否 | 模型名称 |
| modelConfig.temperature | number | 否 | 温度（0-2） |
| modelConfig.maxTokens | number | 否 | 最大Token数 |
| enabled | boolean | 否 | 是否启用 |

**响应数据**：`Workflow`

### 5.4 更新工作流

- **方法**：`PUT`
- **路径**：`/api/robot`
- **认证**：需要

**请求参数**：同创建工作流，额外包含 `id` 字段

**响应数据**：无

### 5.5 删除工作流

- **方法**：`DELETE`
- **路径**：`/api/robot`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 工作流ID |

**响应数据**：无

---

## 六、智能体接口

### 6.1 获取智能体列表

- **方法**：`GET`
- **路径**：`/api/agent/list`
- **认证**：需要

**响应数据**：`ListResponse<Agent>`

### 6.2 获取智能体详情

- **方法**：`GET`
- **路径**：`/api/agent/detail`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 智能体ID |

**响应数据**：`Agent`

### 6.3 创建智能体

- **方法**：`POST`
- **路径**：`/api/agent`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 智能体名称 |
| description | string | 否 | 智能体描述 |
| avatar | string | 否 | 头像 |
| systemPrompt | string | 否 | 系统提示词 |
| pluginIds | number[] | 否 | 关联插件ID列表 |
| modelConfig | object | 否 | 模型配置 |
| enabled | boolean | 否 | 是否启用 |

**响应数据**：`Agent`

### 6.4 更新智能体配置

- **方法**：`PUT`
- **路径**：`/api/agent`
- **认证**：需要

**请求参数**：同创建智能体，额外包含 `id` 字段

**响应数据**：无

### 6.5 删除智能体

- **方法**：`DELETE`
- **路径**：`/api/agent`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 智能体ID |

**响应数据**：无

---

## 七、插件接口

### 7.1 获取插件列表

- **方法**：`GET`
- **路径**：`/api/plugin/list`
- **认证**：需要

**响应数据**：`ListResponse<Plugin>`

```json
{
  "success": true,
  "code": 200,
  "data": {
    "cursor": "",
    "isLast": true,
    "list": [
      {
        "id": 1,
        "name": "截图工具",
        "description": "快速截图、标注、编辑和分享功能。",
        "icon": "📸",
        "version": "1.2.0",
        "author": "官方",
        "status": 1,
        "downloadUrl": "",
        "config": {},
        "enabled": true,
        "installTime": 1717000000000,
        "updateTime": 1717000000000
      }
    ]
  }
}
```

### 7.2 获取插件详情

- **方法**：`GET`
- **路径**：`/api/plugin/detail`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 插件ID |

**响应数据**：`Plugin`

### 7.3 安装插件

- **方法**：`POST`
- **路径**：`/api/plugin/install`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pluginId | number | 是 | 插件ID（市场插件） |

**响应数据**：`Plugin`

### 7.4 卸载插件

- **方法**：`DELETE`
- **路径**：`/api/plugin/uninstall`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 插件ID |

**响应数据**：无

### 7.5 更新插件配置

- **方法**：`PUT`
- **路径**：`/api/plugin`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 插件ID |
| name | string | 否 | 插件名称 |
| config | object | 否 | 插件配置 |
| enabled | boolean | 否 | 是否启用 |

**响应数据**：无

### 7.6 启用/禁用插件

- **方法**：`PUT`
- **路径**：`/api/plugin/toggle`
- **认证**：需要

**请求参数**：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 是 | 插件ID |
| enabled | boolean | 是 | 是否启用 |

**响应数据**：无

---

## 数据模型

### UserInfo

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| uid | number | 用户唯一标识 |
| name | string | 用户名 |
| avatar | string | 用户头像 |
| email | string | 邮箱 |
| phone | string | 手机号 |
| onlineStatus | number | 在线状态（1在线 2离线） |
| lastOptTime | number | 最后上下线时间 |

### Schedule

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 日程ID |
| title | string | 日程标题 |
| content | string | 日程内容 |
| startTime | number | 开始时间戳 |
| endTime | number | 结束时间戳 |
| allDay | boolean | 是否全天 |
| remindTime | number | 提醒时间（分钟） |
| type | string | 日程类型 |
| completed | boolean | 是否完成 |
| createTime | number | 创建时间戳 |

### Workflow

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 工作流ID |
| name | string | 工作流名称 |
| description | string | 工作流描述 |
| aiType | number | AI类型（0无 1机器人 2智能体） |
| avatar | string | 头像 |
| prompt | string | 提示词 |
| modelConfig | object | 模型配置 |
| enabled | boolean | 是否启用 |
| createTime | number | 创建时间戳 |

### Agent

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 智能体ID |
| name | string | 智能体名称 |
| description | string | 智能体描述 |
| avatar | string | 头像 |
| systemPrompt | string | 系统提示词 |
| pluginIds | number[] | 关联插件ID列表 |
| modelConfig | object | 模型配置 |
| enabled | boolean | 是否启用 |
| createTime | number | 创建时间戳 |

### Plugin

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | number | 插件ID |
| name | string | 插件名称 |
| description | string | 插件描述 |
| icon | string | 插件图标 |
| version | string | 插件版本 |
| author | string | 插件作者 |
| status | number | 插件状态（0已内置 1已安装 2未安装 3下载中） |
| downloadUrl | string | 下载地址 |
| config | object | 插件配置 |
| enabled | boolean | 是否启用 |
| installTime | number | 安装时间戳 |
| updateTime | number | 更新时间戳 |
