<template>
  <div class="chat-input-area">
    <!-- 工具栏 -->
    <div class="input-tools">
      <n-tooltip trigger="hover">
        <template #trigger>
          <button class="tool-btn" @click="showEmojiPanel = !showEmojiPanel">😊</button>
        </template>
        表情
      </n-tooltip>
      <n-tooltip trigger="hover">
        <template #trigger>
          <button class="tool-btn" @click="handleAttachFile">📎</button>
        </template>
        文件
      </n-tooltip>
      <n-tooltip trigger="hover">
        <template #trigger>
          <button class="tool-btn" @click="handleScreenshot">📸</button>
        </template>
        截图
      </n-tooltip>
      <n-tooltip trigger="hover">
        <template #trigger>
          <button class="tool-btn" @click="handleVoiceInput">🎤</button>
        </template>
        语音
      </n-tooltip>
      <n-tooltip trigger="hover">
        <template #trigger>
          <button class="tool-btn" :class="{ active: isGroup }" :disabled="!isGroup" @click="emit('at-mention')">
            📢
          </button>
        </template>
        {{ isGroup ? '@提及' : '仅群组支持@提及' }}
      </n-tooltip>
    </div>

    <!-- 表情面板 -->
    <div v-if="showEmojiPanel" class="emoji-panel">
      <span
        v-for="emoji in emojiList"
        :key="emoji"
        class="emoji-item"
        @click="insertEmoji(emoji)">
        {{ emoji }}
      </span>
    </div>

    <!-- 输入行 -->
    <div class="input-row">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="message-input"
        placeholder="输入消息，Enter发送，Shift+Enter换行..."
        rows="1"
        @keydown="handleKeyDown"
        @input="autoResize"></textarea>
      <n-button type="primary" :disabled="!inputText.trim()" @click="handleSend">
        发送
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ChatInput' })

defineProps<{
  /** 是否群组对话 */
  isGroup: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  'at-mention': []
}>()

const inputText = ref('')
const showEmojiPanel = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()

const emojiList = [
  '😀', '😊', '😂', '🤣', '😍', '🥰', '😎', '🤔',
  '👍', '👎', '👏', '🎉', '❤️', '🔥', '✨', '🌟'
]

function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
  showEmojiPanel.value = false
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize(e: Event) {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
}

function insertEmoji(emoji: string) {
  inputText.value += emoji
  textareaRef.value?.focus()
}

function handleAttachFile() {
  window.$message?.info('选择文件功能')
}

function handleScreenshot() {
  window.$message?.info('截图功能已启动')
}

function handleVoiceInput() {
  window.$message?.info('语音输入已启动')
}

/** 插入@提及文本 */
function insertMention(name: string) {
  inputText.value += `@${name} `
  textareaRef.value?.focus()
}

defineExpose({ insertMention })
</script>

<style scoped>
.chat-input-area {
  padding: 12px 20px;
  border-top: 1px solid var(--line-color, #e3e3e3);
  background: #ffffff;
}

:global(html[data-theme='dark']) .chat-input-area {
  background: #1b1b1b;
}

.input-tools {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f0f0f0;
  border: none;
  color: #18181c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

:global(html[data-theme='dark']) .tool-btn {
  background: #2d2d2d;
  color: #ffffff;
}

.tool-btn:hover {
  background: #f3f3f3;
  color: #13987f;
}

:global(html[data-theme='dark']) .tool-btn:hover {
  background: #353535;
}

.tool-btn.active {
  background: #13987f;
  color: #fff;
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.emoji-panel {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 8px;
  margin-bottom: 8px;
  background: #f7f7f7;
  border-radius: 8px;
  border: 1px solid #e3e3e3;
}

:global(html[data-theme='dark']) .emoji-panel {
  background: #252525;
  border-color: #404040;
}

.emoji-item {
  font-size: 24px;
  text-align: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.emoji-item:hover {
  background: #f0f0f0;
}

:global(html[data-theme='dark']) .emoji-item:hover {
  background: #2d2d2d;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  background: #f0f0f0;
  border: 1px solid #e3e3e3;
  border-radius: 6px;
  padding: 8px 12px;
  color: #18181c;
  font-size: 14px;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: 'PingFang', v-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.2s ease;
}

:global(html[data-theme='dark']) .message-input {
  background: #2d2d2d;
  border-color: #404040;
  color: #ffffff;
}

.message-input::placeholder {
  color: #5c6166;
}

:global(html[data-theme='dark']) .message-input::placeholder {
  color: #8b93a7;
}

.message-input:focus {
  border-color: #13987f;
  box-shadow: 0 0 0 2px rgba(19, 152, 127, 0.2);
}
</style>
