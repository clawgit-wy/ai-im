<template>
  <div ref="messagesRef" class="chat-messages-container">
    <template v-for="msg in messages" :key="msg.id">
      <!-- 系统消息 -->
      <div v-if="msg.system" class="message-system">
        {{ msg.text }}
      </div>

      <!-- 普通消息 -->
      <div v-else class="message-item" :class="{ sent: msg.sender === 'user' }">
        <!-- 头像 -->
        <div class="message-avatar" :class="avatarClass(msg)" :style="avatarStyle(msg)">
          {{ msg.avatar }}
        </div>

        <!-- 消息内容 -->
        <div class="message-content">
          <!-- 发送者信息(非自己消息显示) -->
          <div v-if="msg.sender !== 'user'" class="message-sender">
            {{ msg.name }}
            <span v-if="msg.isAI" class="sender-tag" :class="msg.aiType">
              {{ msg.aiType === 'agent' ? '智能体' : '机器人' }}
            </span>
          </div>

          <!-- 消息文本 -->
          <div class="message-text" v-html="msg.text"></div>

          <!-- 时间 -->
          <span v-if="msg.time" class="message-time">{{ msg.time }}</span>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-if="messages.length === 0" class="empty-messages">
      <span class="text-48px opacity-20">💬</span>
      <p class="text-13px opacity-40 mt-12px">开始新的对话</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/hooks/useChat'

defineOptions({ name: 'ChatMessages' })

const props = defineProps<{
  /** 消息列表 */
  messages: ChatMessage[]
}>()

const messagesRef = ref<HTMLElement>()

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }
)

onMounted(() => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
})

function avatarClass(msg: ChatMessage) {
  if (msg.sender === 'user') return 'sent'
  if (msg.isAI) return msg.aiType === 'agent' ? 'agent' : 'ai'
  return ''
}

function avatarStyle(msg: ChatMessage) {
  if (msg.sender === 'user' || !msg.avatarBg) return {}
  return { background: msg.avatarBg }
}
</script>

<style scoped>
.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 70%;
  animation: fadeIn 0.3s ease;
}

.message-item.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #13987f, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message-avatar.sent {
  background: linear-gradient(135deg, #4a9eff, #13987f);
}

.message-avatar.ai {
  background: linear-gradient(135deg, #00b894, #00cec9);
}

.message-avatar.agent {
  background: linear-gradient(135deg, #fd79a8, #e84393);
}

.message-content {
  background: #fdfdfd;
  padding: 12px 15px;
  border-radius: 2px 18px 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

:global(html[data-theme='dark']) .message-content {
  background: #262626;
}

.message-item.sent .message-content {
  background: #13987f;
  color: #fff;
  border-radius: 18px 2px 18px 18px;
}

.message-sender {
  font-size: 11px;
  color: #5c6166;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

:global(html[data-theme='dark']) .message-sender {
  color: #8b93a7;
}

.sender-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
}

.sender-tag.bot {
  background: rgba(0, 184, 148, 0.12);
  color: #00b894;
}

.sender-tag.agent {
  background: rgba(253, 121, 168, 0.12);
  color: #e84393;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 10px;
  color: #5c6166;
  margin-top: 5px;
  display: block;
}

:global(html[data-theme='dark']) .message-time {
  color: #8b93a7;
}

.message-item.sent .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-system {
  align-self: center;
  font-size: 12px;
  color: #5c6166;
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 6px;
  max-width: 80%;
  text-align: center;
}

:global(html[data-theme='dark']) .message-system {
  color: #8b93a7;
  background: #2d2d2d;
}

.empty-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
