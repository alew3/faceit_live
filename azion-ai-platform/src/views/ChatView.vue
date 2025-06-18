<template>
  <div class="chat-container">
    <!-- Chat Sidebar -->
    <div class="chat-sidebar">
      <div class="chat-sidebar-header">
        <Button 
          icon="pi pi-plus" 
          label="New Chat" 
          class="p-button-outlined new-chat-btn"
          @click="createNewChat"
        />
      </div>
      
      <div class="chat-history">
        <div class="history-section">
          <h4>Recent Chats</h4>
          <div class="chat-history-list">
            <div 
              v-for="chat in chatHistory" 
              :key="chat.id"
              class="chat-history-item"
              :class="{ active: currentChatId === chat.id }"
              @click="selectChat(chat.id)"
            >
              <div class="chat-info">
                <span class="chat-title">{{ chat.title }}</span>
                <span class="chat-date">{{ formatDate(chat.date) }}</span>
              </div>
              <div class="chat-actions">
                <Button 
                  icon="pi pi-pencil" 
                  class="p-button-text p-button-sm"
                  @click.stop="renameChat(chat.id)"
                />
                <Button 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  @click.stop="deleteChat(chat.id)"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div class="explore-section">
          <RouterLink to="/explore-agents" class="explore-link">
            <i class="pi pi-search"></i>
            Explore Agents
          </RouterLink>
        </div>
      </div>
    </div>
    
    <!-- Main Chat Area -->
    <div class="chat-main">
      <div class="chat-header">
        <div class="chat-controls">
          <div class="control-group">
            <label>Model/Agent:</label>
            <Dropdown 
              v-model="selectedModel" 
              :options="availableModels" 
              optionLabel="name"
              optionValue="id"
              placeholder="Select Model or Agent"
              class="model-selector"
            />
          </div>
          
          <div class="control-group">
            <label>Prompt:</label>
            <Dropdown 
              v-model="selectedPrompt" 
              :options="availablePrompts" 
              optionLabel="name"
              optionValue="id"
              placeholder="Select Prompt (Optional)"
              class="prompt-selector"
            />
          </div>
          
          <div class="control-group">
            <label>RAG:</label>
            <Dropdown 
              v-model="selectedRAG" 
              :options="availableRAGs" 
              optionLabel="name"
              optionValue="id"
              placeholder="Select RAG (Optional)"
              class="rag-selector"
            />
          </div>
          
          <Button 
            icon="pi pi-share-alt" 
            label="Share" 
            class="p-button-outlined share-btn"
            @click="shareChat"
            :disabled="!canShare"
          />
        </div>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <h2>Welcome to Azion AI Studio</h2>
          <p>Select a model or agent and start chatting!</p>
        </div>
        
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{ 'user-message': message.type === 'user', 'ai-message': message.type === 'ai' }"
        >
          <div class="message-avatar">
            <i :class="message.type === 'user' ? 'pi pi-user' : 'pi pi-android'"></i>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="message.content"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <div v-if="isLoading" class="message ai-message">
          <div class="message-avatar">
            <i class="pi pi-android"></i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="input-container">
          <InputText 
            v-model="currentMessage"
            placeholder="Type your message..."
            class="message-input"
            @keyup.enter="sendMessage"
            :disabled="isLoading || !selectedModel"
          />
          <Button 
            icon="pi pi-send" 
            class="send-btn"
            @click="sendMessage"
            :disabled="isLoading || !currentMessage.trim() || !selectedModel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { format } from 'date-fns'

// Reactive data
const currentMessage = ref('')
const selectedModel = ref('')
const selectedPrompt = ref('')
const selectedRAG = ref('')
const isLoading = ref(false)
const currentChatId = ref('')
const canShare = ref(true) // This would be controlled by RBAC
const messagesContainer = ref<HTMLElement>()

// Mock data - in real app, this would come from API
const availableModels = ref([
  { id: 'gpt-4', name: 'GPT-4 (OpenAI)', type: 'external' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)', type: 'external' },
  { id: 'claude-3', name: 'Claude 3 (Anthropic)', type: 'external' },
  { id: 'azion-edge-ai-1', name: 'Azion Edge AI Model 1', type: 'edge' },
  { id: 'azion-edge-ai-2', name: 'Azion Edge AI Model 2', type: 'edge' },
  { id: 'custom-agent-1', name: 'Customer Support Agent', type: 'agent' },
  { id: 'custom-agent-2', name: 'Code Review Agent', type: 'agent' }
])

const availablePrompts = ref([
  { id: 'prompt-1', name: 'Customer Support Template' },
  { id: 'prompt-2', name: 'Code Review Template' },
  { id: 'prompt-3', name: 'Content Creation Template' },
  { id: 'prompt-4', name: 'Data Analysis Template' }
])

const availableRAGs = ref([
  { id: 'rag-1', name: 'Company Documentation' },
  { id: 'rag-2', name: 'Product Knowledge Base' },
  { id: 'rag-3', name: 'Technical Documentation' },
  { id: 'rag-4', name: 'Legal Documents' }
])

const messages = ref<Array<{
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}>>([])

const chatHistory = ref([
  {
    id: 'chat-1',
    title: 'Product Documentation Query',
    date: new Date('2024-06-17'),
    messages: []
  },
  {
    id: 'chat-2',
    title: 'Code Review Discussion',
    date: new Date('2024-06-16'),
    messages: []
  },
  {
    id: 'chat-3',
    title: 'Customer Support Chat',
    date: new Date('2024-06-15'),
    messages: []
  }
])

// Methods
const createNewChat = () => {
  const newChatId = `chat-${Date.now()}`
  currentChatId.value = newChatId
  messages.value = []
  
  chatHistory.value.unshift({
    id: newChatId,
    title: 'New Chat',
    date: new Date(),
    messages: []
  })
}

const selectChat = (chatId: string) => {
  currentChatId.value = chatId
  // In real app, load messages for this chat
  messages.value = []
}

const renameChat = (chatId: string) => {
  const chat = chatHistory.value.find(c => c.id === chatId)
  if (chat) {
    const newTitle = prompt('Enter new chat title:', chat.title)
    if (newTitle) {
      chat.title = newTitle
    }
  }
}

const deleteChat = (chatId: string) => {
  if (confirm('Are you sure you want to delete this chat?')) {
    chatHistory.value = chatHistory.value.filter(c => c.id !== chatId)
    if (currentChatId.value === chatId) {
      currentChatId.value = ''
      messages.value = []
    }
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || !selectedModel.value || isLoading.value) return
  
  const userMessage = {
    id: `msg-${Date.now()}`,
    type: 'user' as const,
    content: currentMessage.value,
    timestamp: new Date()
  }
  
  messages.value.push(userMessage)
  const messageText = currentMessage.value
  currentMessage.value = ''
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
  
  // Simulate AI response
  isLoading.value = true
  
  setTimeout(() => {
    const aiMessage = {
      id: `msg-${Date.now()}`,
      type: 'ai' as const,
      content: `This is a simulated response to: "${messageText}". In a real implementation, this would be processed by the selected model (${selectedModel.value}) with the chosen prompt and RAG configuration.`,
      timestamp: new Date()
    }
    
    messages.value.push(aiMessage)
    isLoading.value = false
    
    nextTick(() => {
      scrollToBottom()
    })
  }, 2000)
}

const shareChat = () => {
  // In real app, generate shareable link
  alert('Chat sharing functionality would be implemented here')
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatDate = (date: Date) => {
  return format(date, 'MMM dd, yyyy')
}

const formatTime = (date: Date) => {
  return format(date, 'HH:mm')
}

onMounted(() => {
  // Initialize with first chat if available
  if (chatHistory.value.length > 0) {
    currentChatId.value = chatHistory.value[0].id
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #000000;
}

.chat-sidebar {
  width: 300px;
  background-color: #111111;
  border-right: 1px solid #333333;
  display: flex;
  flex-direction: column;
}

.chat-sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #333333;
}

.new-chat-btn {
  width: 100%;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.history-section h4 {
  color: #888888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chat-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-history-item:hover {
  background-color: #1a1a1a;
}

.chat-history-item.active {
  background-color: #1a1a1a;
  border-left: 3px solid #007bff;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  display: block;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-date {
  display: block;
  color: #888888;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.chat-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.chat-history-item:hover .chat-actions {
  opacity: 1;
}

.explore-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #333333;
}

.explore-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.explore-link:hover {
  color: #0056b3;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #000000;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #333333;
  background-color: #111111;
}

.chat-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  color: #cccccc;
  font-size: 0.9rem;
  white-space: nowrap;
}

.model-selector,
.prompt-selector,
.rag-selector {
  min-width: 200px;
}

.share-btn {
  margin-left: auto;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.welcome-message {
  text-align: center;
  color: #888888;
  margin-top: 2rem;
}

.welcome-message h2 {
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.message {
  display: flex;
  gap: 1rem;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background-color: #007bff;
  color: white;
}

.ai-message .message-avatar {
  background-color: #333333;
  color: #cccccc;
}

.message-content {
  flex: 1;
}

.message-text {
  background-color: #1a1a1a;
  padding: 1rem;
  border-radius: 12px;
  color: #ffffff;
  line-height: 1.5;
}

.user-message .message-text {
  background-color: #007bff;
}

.message-time {
  font-size: 0.75rem;
  color: #888888;
  margin-top: 0.5rem;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 1rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888888;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #333333;
  background-color: #111111;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
}

.send-btn {
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .chat-sidebar {
    width: 250px;
  }
  
  .chat-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .model-selector,
  .prompt-selector,
  .rag-selector {
    min-width: auto;
  }
}
</style>

