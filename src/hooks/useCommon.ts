import { MsgEnum } from '@/enums'
import { Ref } from 'vue'

/** 常用工具类 */
export const useCommon = () => {
  /** 回复消息 */
  const reply = ref({
    accountName: '',
    content: '',
    key: 0,
    imgCount: 0
  })

  /** 获取当前光标选取的信息(需要判断是否为空) */
  const getEditorRange = () => {
    if (window.getSelection) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount) {
        const range = selection.getRangeAt(0)
        return { range, selection }
      }
    }
    return null
  }

  /**
   * 获取messageInputDom输入框中的内容类型
   * @param messageInputDom 输入框dom
   */
  const getMessageContentType = (messageInputDom: Ref) => {
    let hasText = false
    let hasImage = false
    let hasVideo = false
    let hasFile = false

    const elements = messageInputDom.value.childNodes
    for (const element of elements) {
      if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim() !== '') {
        hasText = true
      } else if (element.tagName === 'IMG') {
        if (element.dataset.type === 'file-canvas') {
          hasFile = true
        } else {
          hasImage = true
        }
      } else if (element.tagName === 'VIDEO' || (element.tagName === 'A' && element.href.match(/\.(mp4|webm)$/i))) {
        hasVideo = true
      }
    }

    if (hasFile) {
      return MsgEnum.FILE
    } else if (hasVideo) {
      return MsgEnum.VIDEO
    } else if (hasText && hasImage) {
      return MsgEnum.IMAGE
    } else if (hasImage) {
      return MsgEnum.IMAGE
    } else {
      return MsgEnum.TEXT
    }
  }

  /**
   * 触发输入框事件(粘贴的时候需要重新触发这个方法)
   * @param element 输入框dom
   */
  const triggerInputEvent = (element: HTMLElement) => {
    if (element) {
      const event = new Event('input', {
        bubbles: true,
        cancelable: true
      })
      element.dispatchEvent(event)
    }
  }

  /**
   *  将指定节点插入到光标位置
   * @param { MsgEnum } type 插入的类型
   * @param dom dom节点
   * @param target 目标元素
   */
  const insertNode = (type: MsgEnum, dom: any, target: HTMLElement) => {
    const { selection, range } = getEditorRange()!
    // 删除选中的内容
    range?.deleteContents()
    if (type === MsgEnum.AIT) {
      // 创建一个span标签节点
      const spanNode = document.createElement('span')
      spanNode.id = 'aitSpan'
      spanNode.contentEditable = 'false'
      spanNode.classList.add('text-#13987f')
      spanNode.classList.add('select-none')
      spanNode.classList.add('cursor-default')
      spanNode.style.userSelect = 'text'
      spanNode.appendChild(document.createTextNode(`@${dom}`))
      range?.insertNode(spanNode)
      range?.collapse(false)
      const spaceNode = document.createTextNode('\u00A0')
      range?.insertNode(spaceNode)
    } else if (type === MsgEnum.TEXT) {
      range?.insertNode(document.createTextNode(dom))
    } else {
      target.appendChild(dom)
    }
    // 将光标移到选中范围的最后面
    selection?.collapseToEnd()
  }

  /**
   * 处理图片粘贴事件
   * @param file 图片文件
   * @param dom 输入框dom
   */
  const imgPaste = (file: any, dom: HTMLElement) => {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      const img = document.createElement('img')
      img.src = e.target.result
      img.style.maxHeight = '88px'
      img.style.maxWidth = '140px'
      img.style.marginRight = '6px'
      insertNode(MsgEnum.IMAGE, img, dom)
      triggerInputEvent(dom)
    }
    nextTick(() => {}).then(() => {
      reader.readAsDataURL(file)
    })
  }

  /**
   * 处理粘贴事件
   * @param e 事件对象
   * @param dom 输入框dom
   */
  const handlePaste = (e: any, dom: HTMLElement) => {
    e.preventDefault()
    if (e.clipboardData.files.length > 0) {
      for (const file of e.clipboardData.files) {
        const fileSizeInMB = file.size / 1024 / 1024
        if (fileSizeInMB > 300) {
          window.$message.warning(`文件 ${file.name} 超过300MB`)
          continue
        }
        const fileType = file.type as string
        if (fileType.startsWith('image/')) {
          imgPaste(file, dom)
        }
      }
    } else {
      const plainText = e.clipboardData.getData('text/plain')
      insertNode(MsgEnum.TEXT, plainText, dom)
      triggerInputEvent(dom)
    }
  }

  /** 去除字符串中的元素标记 */
  const removeTag = (fragment: any) =>
    new DOMParser().parseFromString(fragment, 'text/html').body.textContent || ''

  return {
    imgPaste,
    getEditorRange,
    getMessageContentType,
    insertNode,
    triggerInputEvent,
    handlePaste,
    removeTag,
    reply
  }
}
