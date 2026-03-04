<template>
  <view class="chat-container">
    <view class="config-section">
      <view class="input-group">
        <input class="mini-input" v-model="userApiKey" placeholder="API Key (sk-...)" password />
        <input class="mini-input" v-model="userApiUrl" placeholder="API URL (例如 /api/v1)" />
        <input class="mini-input" v-model="userModel" placeholder="模型名称 (例如 deepseek-chat)" />
      </view>
      <view class="button-group">
        <button class="mini-btn" @click="importCard">导入角色卡</button>
        <view v-if="charaName" class="chara-tag">当前：{{ charaName }}</view>
      </view>
    </view>

    <scroll-view class="chat-list" scroll-y="true">
      <view v-for="(item, index) in chatHistory" :key="index" :class="['msg-item', item.role]">
        <view class="bubble">{{ item.content }}</view>
      </view>
    </scroll-view>

    <view class="input-box">
      <input class="input" v-model="userText" placeholder="想对角色说什么..." @confirm="sayHello" />
      <button class="send-btn" @click="sayHello">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ExifReader from 'exifreader'

// --- 1. 变量定义 (自动从缓存加载) ---
const userApiKey = ref(uni.getStorageSync('storage_key') || '')
const userApiUrl = ref(uni.getStorageSync('storage_url') || '/proxy/v1')
const userModel = ref(uni.getStorageSync('storage_model') || 'gemini-1.5-flash')

const charaName = ref('')
const charaPrompt = ref('')
const userText = ref('')
const chatHistory = ref([
  { role: 'ai', content: '配置已就绪。导入角色卡后，我将自动保存你的 API 设置。' }
])

// --- 2. 导入角色卡 ---
const importCard = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      try {
        const tempFilePath = res.tempFilePaths[0]
        const response = await fetch(tempFilePath)
        const arrayBuffer = await response.arrayBuffer()
        const tags = ExifReader.load(arrayBuffer)
        
        if (tags['chara'] && tags['chara'].description) {
          const base64String = tags['chara'].description
          const rawData = atob(base64String)
          const bytes = new Uint8Array(rawData.length)
          for (let i = 0; i < rawData.length; i++) {
            bytes[i] = rawData.charCodeAt(i)
          }
          const decoder = new TextDecoder('utf-8')
          const jsonString = decoder.decode(bytes)
          const charaJson = JSON.parse(jsonString)

          charaName.value = charaJson.name || '未知角色'
          charaPrompt.value = charaJson.description || ''
          chatHistory.value = [{ 
            role: 'ai', 
            content: charaJson.first_mes || `你好，我是 ${charaJson.name}。` 
          }]
          uni.showToast({ title: '角色卡加载成功' })
        }
      } catch (e) {
        uni.showToast({ title: '解析失败', icon: 'none' })
      }
    }
  })
}

// --- 3. 发送消息 (含自动补全与保存) ---
const sayHello = async () => {
  if (!userApiKey.value || !userText.value) return

  // A. 自动保存配置到本地，下次打开不用重填
  uni.setStorageSync('storage_key', userApiKey.value)
  uni.setStorageSync('storage_url', userApiUrl.value)
  uni.setStorageSync('storage_model', userModel.value)

  const userMsg = userText.value
  chatHistory.value.push({ role: 'user', content: userMsg })
  userText.value = ''

  // B. 路径自动补全逻辑
  let finalUrl = userApiUrl.value.trim()
  if (!finalUrl.endsWith('/chat/completions')) {
    const separator = finalUrl.endsWith('/') ? '' : '/'
    finalUrl = `${finalUrl}${separator}chat/completions`
  }

  const messages = [
    { role: "system", content: `你是 ${charaName.value}。设定：${charaPrompt.value}` },
    ...chatHistory.value.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }))
  ]

  try {
    const res = await uni.request({
      url: finalUrl,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + userApiKey.value.trim(),
        'Content-Type': 'application/json'
      },
      data: {
        model: userModel.value.trim(),
        messages: messages,
        temperature: 0.7
      }
    })

    if (res.statusCode === 200) {
      const aiReply = res.data.choices[0].message.content
      chatHistory.value.push({ role: 'ai', content: aiReply })
    } else {
      const errorDetail = res.data.error?.message || `状态码:${res.statusCode}`
      throw new Error(errorDetail)
    }
  } catch (error) {
    chatHistory.value.push({ role: 'ai', content: `（错误）：${error.message}` })
  }
}
</script>

<style>
.chat-container { display: flex; flex-direction: column; height: 100vh; background: #f4f4f4; }

/* --- 新增：配置区域样式 --- */
.config-section { 
  padding: 10px; 
  background: #fff; 
  border-bottom: 1px solid #eee; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}
.input-group { 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
}
.mini-input { 
  font-size: 12px; 
  border: 1px solid #e0e0e0; 
  padding: 6px 10px; 
  border-radius: 4px; 
  background: #fafafa;
}
.button-group { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  margin-top: 4px;
}
.mini-btn { 
  font-size: 12px; 
  margin: 0; 
  line-height: 2.2; 
  background: #f0f0f0;
  border: 1px solid #ddd;
}
.chara-tag { 
  font-size: 12px; 
  color: #007aff; 
  font-weight: bold; 
  background: #e6f2ff;
  padding: 2px 8px;
  border-radius: 10px;
}

/* --- 原有：聊天列表样式 --- */
.chat-list { flex: 1; padding: 20px; box-sizing: border-box; overflow-y: auto; }
.msg-item { display: flex; margin-bottom: 15px; }
.user { flex-direction: row-reverse; }
.bubble { 
  max-width: 80%; 
  padding: 10px 15px; 
  border-radius: 12px; 
  font-size: 14px; 
  line-height: 1.6; 
  word-break: break-all; /* 防止长文本溢出 */
}
.user .bubble { background: #007aff; color: #fff; border-bottom-right-radius: 2px; }
.ai .bubble { background: #fff; color: #333; border-bottom-left-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* --- 原有：底部输入框样式 --- */
.input-box { display: flex; padding: 10px; background: #fff; border-top: 1px solid #ddd; padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
.input { flex: 1; height: 40px; border: 1px solid #eee; padding: 0 10px; border-radius: 5px; background: #f9f9f9; }
.send-btn { margin-left: 10px; background: #007aff; color: #fff; font-size: 14px; display: flex; align-items: center; }
</style>
