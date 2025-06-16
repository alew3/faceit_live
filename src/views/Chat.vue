<template>
  <div class="chat-container">
    <!-- Chat Header -->
    <div class="chat-header">
      <h1>Chat</h1>
      <div class="chat-controls">
        <Dropdown 
          v-model="selectedModel" 
          :options="models" 
          optionLabel="name" 
          placeholder="Selecionar Modelo"
          class="w-14rem"
        />
        <Dropdown 
          v-model="selectedPrompt" 
          :options="prompts" 
          optionLabel="name" 
          placeholder="Selecionar Prompt"
          class="w-14rem"
        />
        <Dropdown 
          v-model="selectedRAG" 
          :options="rags" 
          optionLabel="name" 
          placeholder="Selecionar RAG"
          class="w-14rem"
        />
        <Button 
          icon="pi pi-share-alt" 
          label="Compartilhar" 
          class="p-button-outlined"
          @click="shareChat"
        />
      </div>
    </div>

    <div class="chat-layout">
      <!-- Chat Sidebar -->
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <h3>Histórico de Chats</h3>
          <Button 
            icon="pi pi-plus" 
            class="p-button-rounded p-button-text"
            @click="newChat"
          />
        </div>
        
        <div class="chat-history">
          <div 
            v-for="chat in chatHistory" 
            :key="chat.id"
            class="chat-history-item"
            :class="{ active: chat.id === currentChatId }"
            @click="selectChat(chat.id)"
          >
            <div class="chat-history-content">
              <div class="chat-title">{{ chat.title }}</div>
              <div class="chat-date">{{ formatDate(chat.date) }}</div>
            </div>
            <div class="chat-actions">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-sm"
                @click.stop="renameChat(chat.id)"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-sm"
                @click.stop="deleteChat(chat.id)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Main Area -->
      <div class="chat-main">
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="message in currentMessages" 
            :key="message.id"
            class="message"
            :class="message.type"
          >
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="chat-input-container">
            <Textarea 
              v-model="newMessage"
              placeholder="Digite sua mensagem..."
              :autoResize="true"
              rows="1"
              class="chat-input"
              @keydown.enter.prevent="sendMessage"
            />
            <Button 
              icon="pi pi-send" 
              class="p-button-rounded"
              @click="sendMessage"
              :disabled="!newMessage.trim()"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  data() {
    return {
      selectedModel: null,
      selectedPrompt: null,
      selectedRAG: null,
      newMessage: '',
      currentChatId: 1,
      models: [
        { name: 'GPT-4', value: 'gpt-4', provider: 'OpenAI' },
        { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', provider: 'OpenAI' },
        { name: 'Claude 3', value: 'claude-3', provider: 'Anthropic' },
        { name: 'Azion Edge AI Model 1', value: 'azion-edge-1', provider: 'Azion' },
        { name: 'Azion Edge AI Model 2', value: 'azion-edge-2', provider: 'Azion' }
      ],
      prompts: [
        { name: 'Assistente Geral', value: 'general-assistant' },
        { name: 'Análise de Código', value: 'code-analysis' },
        { name: 'Suporte Técnico', value: 'tech-support' },
        { name: 'Criação de Conteúdo', value: 'content-creation' }
      ],
      rags: [
        { name: 'Documentação Técnica', value: 'tech-docs' },
        { name: 'Base de Conhecimento', value: 'knowledge-base' },
        { name: 'Políticas da Empresa', value: 'company-policies' }
      ],
      chatHistory: [
        {
          id: 1,
          title: 'Discussão sobre API',
          date: new Date('2024-01-15'),
          messages: [
            { id: 1, type: 'user', text: 'Como posso integrar a API da Azion?', timestamp: new Date() },
            { id: 2, type: 'assistant', text: 'Para integrar a API da Azion, você pode começar seguindo nossa documentação...', timestamp: new Date() }
          ]
        },
        {
          id: 2,
          title: 'Configuração de Edge Functions',
          date: new Date('2024-01-14'),
          messages: [
            { id: 1, type: 'user', text: 'Preciso de ajuda com Edge Functions', timestamp: new Date() },
            { id: 2, type: 'assistant', text: 'Claro! Edge Functions são executadas no edge da rede...', timestamp: new Date() }
          ]
        }
      ]
    }
  },
  computed: {
    currentMessages() {
      const chat = this.chatHistory.find(c => c.id === this.currentChatId)
      return chat ? chat.messages : []
    }
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return

      const chat = this.chatHistory.find(c => c.id === this.currentChatId)
      if (chat) {
        chat.messages.push({
          id: Date.now(),
          type: 'user',
          text: this.newMessage,
          timestamp: new Date()
        })

        // Simulate AI response
        setTimeout(() => {
          chat.messages.push({
            id: Date.now() + 1,
            type: 'assistant',
            text: 'Esta é uma resposta simulada do assistente AI.',
            timestamp: new Date()
          })
          this.scrollToBottom()
        }, 1000)
      }

      this.newMessage = ''
      this.scrollToBottom()
    },
    newChat() {
      const newChatId = Math.max(...this.chatHistory.map(c => c.id)) + 1
      this.chatHistory.unshift({
        id: newChatId,
        title: 'Novo Chat',
        date: new Date(),
        messages: []
      })
      this.currentChatId = newChatId
    },
    selectChat(chatId) {
      this.currentChatId = chatId
    },
    renameChat(chatId) {
      const chat = this.chatHistory.find(c => c.id === chatId)
      if (chat) {
        const newTitle = prompt('Novo nome do chat:', chat.title)
        if (newTitle) {
          chat.title = newTitle
        }
      }
    },
    deleteChat(chatId) {
      if (confirm('Tem certeza que deseja deletar este chat?')) {
        this.chatHistory = this.chatHistory.filter(c => c.id !== chatId)
        if (this.currentChatId === chatId && this.chatHistory.length > 0) {
          this.currentChatId = this.chatHistory[0].id
        }
      }
    },
    shareChat() {
      this.$toast.add({
        severity: 'success',
        summary: 'Chat Compartilhado',
        detail: 'Link de compartilhamento copiado para a área de transferência',
        life: 3000
      })
    },
    formatDate(date) {
      return date.toLocaleDateString('pt-BR')
    },
    formatTime(date) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  },
  mounted() {
    this.scrollToBottom()
  }
}
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.chat-header h1 {
  margin: 0;
  color: #495057;
}

.chat-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.chat-layout {
  display: flex;
  flex: 1;
  gap: 1rem;
  min-height: 0;
}

.chat-sidebar {
  width: 300px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.chat-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.chat-sidebar-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #495057;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
}

.chat-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-history-item:hover {
  background-color: #f8f9fa;
}

.chat-history-item.active {
  background-color: #e3f2fd;
  border-left: 3px solid #1976d2;
}

.chat-history-content {
  flex: 1;
}

.chat-title {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.chat-date {
  font-size: 0.875rem;
  color: #6c757d;
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

.chat-main {
  flex: 1;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  position: relative;
}

.message.user .message-content {
  background: #1976d2;
  color: white;
}

.message.assistant .message-content {
  background: #f8f9fa;
  color: #495057;
}

.message-text {
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.chat-input-area {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.chat-input-container {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
}
</style>

