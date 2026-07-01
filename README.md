# AI-IM 智能助手桌面应用

基于 **Tauri 2.0 + Vue 3 + TypeScript** 构建的跨平台智能即时通讯桌面应用，集成 AI 对话、日程管理、机器人、智能体、插件系统等功能。

## 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Tauri | 2.0 | 跨平台桌面应用框架 |
| Vue 3 | 3.5+ | 渐进式 JavaScript 框架（`<script setup>` 语法） |
| TypeScript | 5.6+ | 类型安全 |
| Naive UI | 2.40+ | Vue 3 组件库 |
| Pinia | 2.2+ | 状态管理（支持持久化） |
| UnoCSS | 0.62+ | 原子化 CSS 引擎 |
| Vue Router | 4.4+ | 路由管理 |
| Vite | 5.4 | 构建工具 |

## 环境要求

| 工具 | 最低版本 | 说明 |
| --- | --- | --- |
| Node.js | >= 18 | JavaScript 运行时 |
| pnpm | >= 8 | 包管理器 |
| Rust | stable | Tauri 后端编译 |
| Tauri CLI | 2.0 | Tauri 命令行工具 |

### 安装 Rust

```bash
# macOS / Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# 访问 https://rustup.rs/ 下载安装
```

### 安装 pnpm

```bash
npm install -g pnpm
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 开发运行

```bash
# 仅前端开发（浏览器调试）
pnpm dev

# Tauri 桌面应用开发（推荐）
pnpm tauri:dev
```

开发服务器地址：`http://localhost:6130`

### 3. 构建打包

```bash
# 仅构建前端
pnpm build

# 构建桌面应用安装包
pnpm tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下。

## 项目结构

```
ai-im/
├── src/                          # 前端源码
│   ├── components/               # 公共组件
│   │   └── common/               # 通用组件（NaiveProvider 等）
│   ├── enums/                    # 全局枚举定义
│   ├── router/                   # 路由配置
│   ├── services/                 # API 服务层
│   │   ├── apis.ts               # API 接口定义
│   │   ├── http.ts               # HTTP 请求封装
│   │   └── types.ts              # 类型定义
│   ├── stores/                   # Pinia 状态管理
│   │   ├── chat.ts               # 对话状态
│   │   ├── global.ts             # 全局状态
│   │   ├── setting.ts            # 设置状态
│   │   ├── user.ts               # 用户状态
│   │   └── plugin.ts             # 插件状态
│   ├── typings/                  # 类型声明
│   ├── utils/                    # 工具函数
│   ├── views/                    # 页面视图
│   │   ├── chat/                 # 对话模块
│   │   ├── schedule/             # 日程模块
│   │   ├── robot/                # 机器人模块
│   │   ├── agent/                # 智能体模块
│   │   ├── plugin/               # 插件模块
│   │   └── settings/             # 设置模块
│   │       └── components/       # 设置子组件
│   ├── App.vue                   # 根组件
│   └── main.ts                   # 应用入口
├── src-tauri/                    # Tauri 后端
│   ├── src/                      # Rust 源码
│   ├── capabilities/             # 权限配置
│   ├── Cargo.toml                # Rust 依赖
│   └── tauri.conf.json           # Tauri 配置
├── docs/                         # 项目文档
│   ├── API.md                    # API 接口文档
│   └── DEPLOY.md                 # 部署说明
├── package.json
├── vite.config.ts                # Vite 配置
├── uno.config.ts                 # UnoCSS 配置
└── tsconfig.json                 # TypeScript 配置
```

## 功能模块

### 对话模块（Chat）

- 单聊 / 群聊消息收发
- 文本、图片、文件、语音、视频消息
- 消息回复、撤回、已读标记
- AI 辅助对话

### 日程模块（Schedule）

- 日程创建、编辑、删除
- 全天 / 定时日程
- 日程提醒（可配置提前时间）
- 日程类型分类

### 机器人模块（Robot）

- 工作流管理（创建、编辑、删除）
- 自定义提示词与模型配置
- 机器人对话交互
- 模型参数调节（温度、Token 限制）

### 智能体模块（Agent）

- 智能体创建与配置
- 系统提示词设定
- 插件关联与调用
- 模型配置管理

### 插件模块（Plugin）

- 插件安装 / 卸载
- 插件启用 / 禁用
- 插件市场与本地安装
- 插件设置管理

### 设置模块（Settings）

- **账户设置**：用户名、邮箱、手机号编辑，修改密码，退出登录
- **外观设置**：主题模式（浅色 / 深色 / 跟随系统）、主题色选择、字体大小、窗口透明度、窗口阴影
- **通知设置**：消息提醒、日程提醒、声音提醒开关，日程提前提醒时间
- **应用更新**：版本检查、自动更新开关、更新通道选择（稳定版 / 测试版）

## API 接口

详细的 API 接口文档请参考 [docs/API.md](./docs/API.md)。

### 接口概览

| 模块 | 路径前缀 | 说明 |
| --- | --- | --- |
| 用户 | `/api/user` | 登录、注册、用户信息、修改密码、退出 |
| 消息 | `/api/chat` | 消息发送、接收、历史记录、已读标记 |
| 群组 | `/api/chat/group` | 群组创建、成员管理、退出群组 |
| 日程 | `/api/schedule` | 日程增删改查 |
| 工作流 | `/api/robot` | 机器人工作流增删改查 |
| 智能体 | `/api/agent` | 智能体增删改查与配置 |
| 插件 | `/api/plugin` | 插件安装、卸载、启用、禁用 |

## 开发指南

### 代码规范

- 使用 `<script setup lang="ts">` 语法
- 使用 Naive UI 组件库
- 使用 UnoCSS 原子化类名进行样式开发
- Pinia Store 使用 Setup Store 语法
- 遵循 TSDoc 注释规范

### 路径别名

| 别名 | 路径 |
| --- | --- |
| `@` | `src` |
| `~` | 项目根目录 |

### 自动导入

项目配置了 `unplugin-auto-import` 和 `unplugin-vue-components`：

- Vue / Vue Router / Pinia 的 API 自动导入
- `src/components/**` 下的组件自动注册
- Naive UI 组件自动按需导入

## 部署

详细的部署说明请参考 [docs/DEPLOY.md](./docs/DEPLOY.md)。

## License

MIT
