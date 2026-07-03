/**
 * SQLite 持久化数据库 + JWT认证 + 密码哈希
 */
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

// ========== 类型定义 ==========
export interface DBUser {
  uid: number
  name: string
  avatar: string
  email: string
  phone: string
  password: string
  onlineStatus: number
  lastOptTime: number
}

export interface DBSession {
  id: number
  name: string
  avatar: string
  type: number // 1单聊 2群聊
  lastMsg: string
  time: number
  unread: number
  aiEnabled: number
}

export interface DBMessage {
  id: number
  sessionId: number
  fromUid: number
  fromName: string
  fromAvatar: string
  type: number
  content: string
  sendTime: number
}

export interface DBGroupMember {
  id?: number
  uid: number
  sessionId: number
  username: string
  avatar: string
  role: number
  onlineStatus: number
  joinTime: number
}

export interface DBSchedule {
  id: number
  title: string
  content: string
  startTime: number
  endTime: number
  allDay: number
  remindTime: number
  type: string
  completed: number
  createTime: number
}

export interface DBWorkflow {
  id: number
  name: string
  description: string
  avatar: string
  prompt: string
  apiKey: string
  endpoint: string
  enabled: number
  createTime: number
}

export interface DBAgent {
  id: number
  name: string
  description: string
  avatar: string
  systemPrompt: string
  modelConfig: string
  enabled: number
  createTime: number
}

export interface DBPlugin {
  id: number
  name: string
  description: string
  icon: string
  version: string
  author: string
  status: number
  enabled: number
  installTime: number
  updateTime: number
}

// ========== 常量 ==========
const JWT_SECRET = 'ai-im-jwt-secret-2026'
const DB_PATH = path.join(process.cwd(), 'server', 'data', 'ai-im.db')

// ========== 初始化数据库 ==========
// 确保数据目录存在
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 创建 SQLite 数据库实例
export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// 验证码存储 (内存中临时存储)
export const verifyCodes = new Map<string, { code: string; expires: number }>()

// ========== 创建表结构 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY,
    name TEXT,
    avatar TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    onlineStatus INTEGER,
    lastOptTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    name TEXT,
    avatar TEXT,
    type INTEGER,
    lastMsg TEXT,
    time INTEGER,
    unread INTEGER,
    aiEnabled INTEGER
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER,
    fromUid INTEGER,
    fromName TEXT,
    fromAvatar TEXT,
    type INTEGER,
    content TEXT,
    sendTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid INTEGER,
    sessionId INTEGER,
    username TEXT,
    avatar TEXT,
    role INTEGER,
    onlineStatus INTEGER,
    joinTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    startTime INTEGER,
    endTime INTEGER,
    allDay INTEGER,
    remindTime INTEGER,
    type TEXT,
    completed INTEGER,
    createTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    avatar TEXT,
    prompt TEXT,
    apiKey TEXT,
    endpoint TEXT,
    enabled INTEGER,
    createTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    avatar TEXT,
    systemPrompt TEXT,
    modelConfig TEXT,
    enabled INTEGER,
    createTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS plugins (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    icon TEXT,
    version TEXT,
    author TEXT,
    status INTEGER,
    enabled INTEGER,
    installTime INTEGER,
    updateTime INTEGER
  );
`)

// ========== 种子数据 ==========
function todayAt(hours: number, minutes: number): number {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

function tomorrowAt(hours: number, minutes: number): number {
  return todayAt(hours, minutes) + 86400000
}

function seedData() {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
  if (userCount > 0) return

  const hashedPassword = bcrypt.hashSync('123456', 10)
  const now = Date.now()

  // 插入用户
  const insertUser = db.prepare('INSERT INTO users (uid, name, avatar, email, phone, password, onlineStatus, lastOptTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  insertUser.run(1, '用户1', '👤', 'user@example.com', '13800138000', hashedPassword, 1, now)
  insertUser.run(2, '张三', '👨', 'zhangsan@example.com', '13800138001', hashedPassword, 2, now - 3600000)
  insertUser.run(3, '李四', '👩', 'lisi@example.com', '13800138002', hashedPassword, 1, now - 7200000)
  insertUser.run(4, '小明', '🧑', 'xiaoming@example.com', '13800138003', hashedPassword, 1, now - 86400000)

  // 插入会话
  const insertSession = db.prepare('INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  insertSession.run(1, 'AI助手', '🤖', 1, '你好，有什么可以帮助你的吗？', now - 1800000, 2, 1)
  insertSession.run(2, '张三', '👨', 1, '今天的会议安排好了', now - 5400000, 0, 0)
  insertSession.run(3, '李四', '👩', 1, '文件已发送，请查收', now - 86400000, 0, 0)
  insertSession.run(4, '日程机器人', '🤖', 1, '明天下午3点有会议安排', now - 86400000, 0, 1)
  insertSession.run(5, '项目团队群', '👥', 2, '小明: 需求文档已更新', now - 172800000, 3, 1)
  insertSession.run(6, '技术交流群', '👥', 2, '王五: 有人用过Tauri吗？', now - 259200000, 0, 0)

  // 插入消息 (会话1)
  const insertMessage = db.prepare('INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)')
  insertMessage.run(1, 0, 'AI助手', '🤖', 1, '你好！我是你的智能助手，有什么可以帮助你的吗？', now - 2400000)
  insertMessage.run(1, 1, '我', '👤', 1, '我想了解今天有哪些日程安排？', now - 2340000)
  insertMessage.run(1, 0, 'AI助手', '🤖', 1, '你今天有以下日程安排：\n\n📅 09:00 - 晨会\n📅 14:00 - 项目评审会议\n📅 16:30 - 与客户电话沟通', now - 2280000)
  insertMessage.run(1, 1, '我', '👤', 1, '好的，帮我提醒一下14点的会议', now - 2220000)
  insertMessage.run(1, 0, 'AI助手', '🤖', 1, '已设置提醒，我会在13:50提醒你参加项目评审会议。需要我帮你准备会议材料吗？', now - 2160000)

  // 插入消息 (会话5)
  insertMessage.run(5, 0, '系统', '⚙️', 7, '张三 创建了群组「项目团队群」', now - 86400000)
  insertMessage.run(5, 2, '张三', '👨', 1, '大家好，这是我们的项目沟通群', now - 86300000)
  insertMessage.run(5, 3, '李四', '👩', 1, '收到！', now - 86200000)
  insertMessage.run(5, 0, '日程机器人', '🤖', 1, '检测到群组已创建，我可以帮大家管理日程安排。', now - 86100000)
  insertMessage.run(5, 4, '小明', '🧑', 1, '需求文档已更新，请查看', now - 172800000)

  // 插入群成员 (会话5 - 项目团队群)
  const insertMember = db.prepare('INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)')
  insertMember.run(2, 5, '张三', '👨', 1, 2, now - 86400000)
  insertMember.run(3, 5, '李四', '👩', 2, 1, now - 86400000)
  insertMember.run(4, 5, '小明', '🧑', 3, 1, now - 86400000)
  insertMember.run(1, 5, '我', '👤', 3, 1, now - 86400000)

  // 插入单聊会话成员关系 (会话1-4: AI助手、张三、李四、日程机器人)
  // 会话1: AI助手 (用户1参与)
  insertMember.run(1, 1, '我', '👤', 1, 1, now - 86400000)
  // 会话2: 张三 (用户1与张三的私聊)
  insertMember.run(1, 2, '我', '👤', 1, 1, now - 86400000)
  insertMember.run(2, 2, '张三', '👨', 2, 2, now - 86400000)
  // 会话3: 李四 (用户1与李四的私聊)
  insertMember.run(1, 3, '我', '👤', 1, 1, now - 86400000)
  insertMember.run(3, 3, '李四', '👩', 2, 1, now - 86400000)
  // 会话4: 日程机器人 (用户1参与)
  insertMember.run(1, 4, '我', '👤', 1, 1, now - 86400000)
  // 会话6: 技术交流群 (用户1参与)
  insertMember.run(1, 6, '我', '👤', 3, 1, now - 86400000)

  // 插入日程
  const insertSchedule = db.prepare('INSERT INTO schedules (id, title, content, startTime, endTime, allDay, remindTime, type, completed, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  insertSchedule.run(1, '晨会', '团队日常沟通会议', todayAt(9, 0), todayAt(9, 30), 0, 10, 'meeting', 1, now - 86400000)
  insertSchedule.run(2, '项目评审会议', '会议室A301', todayAt(14, 0), todayAt(15, 30), 0, 10, 'meeting', 0, now - 86400000)
  insertSchedule.run(3, '客户电话沟通', '讨论项目进度', todayAt(16, 30), todayAt(17, 0), 0, 5, 'call', 0, now - 86400000)
  insertSchedule.run(4, '团队周会', '本周工作总结与下周计划', tomorrowAt(14, 0), tomorrowAt(15, 0), 0, 15, 'meeting', 0, now)

  // 插入工作流
  const insertWorkflow = db.prepare('INSERT INTO workflows (id, name, description, avatar, prompt, apiKey, endpoint, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  insertWorkflow.run(1, '日程助手', '智能管理日程安排，自动提醒重要事项', '📅', '你是一个日程管理助手...', '', '', 1, now - 86400000 * 7)
  insertWorkflow.run(2, '翻译助手', '支持多语言实时翻译，自动识别语言类型', '🌐', '你是一个翻译助手...', 'app-dify-xxx', 'https://api.dify.ai/v1', 1, now - 86400000 * 5)
  insertWorkflow.run(3, '数据分析', '自动生成数据报表，智能分析数据趋势', '📊', '你是一个数据分析助手...', '', '', 0, now - 86400000 * 3)
  insertWorkflow.run(4, '邮件助手', '智能邮件管理，自动分类和回复', '📧', '你是一个邮件助手...', 'app-dify-yyy', 'https://api.dify.ai/v1', 1, now - 86400000)
  insertWorkflow.run(5, '文档生成', '根据模板自动生成各类文档', '📝', '你是一个文档生成助手...', '', '', 0, now)

  // 插入智能体
  const insertAgent = db.prepare('INSERT INTO agents (id, name, description, avatar, systemPrompt, modelConfig, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  insertAgent.run(1, 'Claude', '擅长代码生成、文本创作和复杂推理任务。适合编程、写作和分析场景。', '🤖', 'You are Claude, a helpful AI assistant.', JSON.stringify({ model: 'claude-3-opus', temperature: 0.7, maxTokens: 4096 }), 1, now - 86400000 * 30)
  insertAgent.run(2, 'Hermes', '专注于对话交互和知识问答。响应快速，适合日常对话和快速查询。', '🧠', 'You are Hermes, a fast and knowledgeable AI assistant.', JSON.stringify({ model: 'hermes-2-pro', temperature: 0.8, maxTokens: 2048 }), 1, now - 86400000 * 20)
  insertAgent.run(3, '自定义智能体', '用户自定义的智能体，可以配置特定的模型、提示词和工具链。', '🎯', '', JSON.stringify({ model: 'gpt-4', temperature: 0.7, maxTokens: 4096 }), 0, now - 86400000)

  // 插入插件
  const insertPlugin = db.prepare('INSERT INTO plugins (id, name, description, icon, version, author, status, enabled, installTime, updateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  insertPlugin.run(1, '截图工具', '快速截图、标注、编辑和分享功能。支持全屏、区域、窗口截图。', '📸', '1.0.0', 'AI-IM Team', 0, 1, now - 86400000 * 30, now - 86400000 * 30)
  insertPlugin.run(2, 'IT工具箱', '开发人员常用工具集合：JSON格式化、Base64编码、正则测试、时间转换等。', '🔧', '1.2.0', 'AI-IM Team', 0, 1, now - 86400000 * 25, now - 86400000 * 10)
  insertPlugin.run(3, 'Markdown编辑器', '实时预览Markdown编辑，支持导出PDF、HTML等格式。', '📝', '1.1.0', 'AI-IM Team', 0, 1, now - 86400000 * 20, now - 86400000 * 5)
  insertPlugin.run(4, '颜色选择器', '颜色拾取、转换和配色方案生成工具。', '🎨', '0.9.0', 'Community', 2, 0, 0, 0)
  insertPlugin.run(5, '网络工具', 'IP查询、DNS解析、端口扫描、网络测速等工具。', '🌐', '0.8.0', 'Community', 2, 0, 0, 0)
}

// 执行种子数据初始化
seedData()

// ========== 工具函数 ==========

/** 统一成功响应 */
export function success<T>(data: T, message = '操作成功') {
  return { success: true, code: 200, message, data }
}

/** 统一失败响应 */
export function fail(message = '操作失败', code = 400) {
  return { success: false, code, message, data: null }
}

/** 列表响应格式 */
export function listResponse<T>(list: T[], cursor = '', isLast = true) {
  return { cursor, isLast, list }
}

/** 生成 JWT Token */
export function generateToken(uid: number): string {
  const user = db.prepare('SELECT name FROM users WHERE uid = ?').get(uid) as { name: string } | undefined
  return jwt.sign({ uid, name: user?.name || '' }, JWT_SECRET, { expiresIn: '7d' })
}

/** 验证 JWT Token */
export function verifyToken(authHeader?: string): { uid: number; name: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: number; name: string }
    return { uid: decoded.uid, name: decoded.name }
  } catch {
    return null
  }
}

/** 使用 bcryptjs 哈希密码 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/** 验证密码 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

/** 获取下一个自增ID (用于非AUTOINCREMENT表) */
export function getNextId(table: string): number {
  // users表主键是uid，其他表是id
  const idCol = table === 'users' ? 'uid' : 'id'
  const row = db.prepare(`SELECT MAX(${idCol}) as maxId FROM ${table}`).get() as { maxId: number | null } | undefined
  return (row?.maxId || 0) + 1
}

/** 广播消息到指定会话的所有在线用户 */
export function notifySession(sessionId: number, data: any) {
  const broadcast = (globalThis as any).broadcastToSession
  if (broadcast) broadcast(sessionId, data)
}

/** 推送消息到指定用户 */
export function notifyUser(uid: number, data: any) {
  const broadcast = (globalThis as any).broadcastToUser
  if (broadcast) broadcast(uid, data)
}
