<template>
  <div class="agent-builder-container">
    <!-- Header -->
    <div class="agent-builder-header">
      <h1>Agent Builder</h1>
      <div class="agent-builder-actions">
        <Button 
          icon="pi pi-plus" 
          label="Novo Agente" 
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Agents List -->
    <div class="agent-builder-main">
      <Card>
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span>Seus Agentes</span>
            <InputText 
              v-model="searchTerm" 
              placeholder="Buscar agentes..."
              class="w-20rem"
            />
          </div>
        </template>
        <template #content>
          <DataTable 
            :value="filteredAgents" 
            :paginator="true" 
            :rows="10"
            responsiveLayout="scroll"
          >
            <Column field="name" header="Nome" sortable>
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-cog"></i>
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="type" header="Tipo">
              <template #body="slotProps">
                <Chip 
                  :label="getTypeLabel(slotProps.data.type)"
                  :class="getTypeClass(slotProps.data.type)"
                />
              </template>
            </Column>
            <Column field="model" header="Modelo" />
            <Column field="status" header="Status">
              <template #body="slotProps">
                <Chip 
                  :label="slotProps.data.status === 'active' ? 'Ativo' : 'Inativo'"
                  :class="slotProps.data.status === 'active' ? 'p-chip-success' : 'p-chip-danger'"
                />
              </template>
            </Column>
            <Column field="usage" header="Uso">
              <template #body="slotProps">
                <Badge :value="slotProps.data.usage" />
              </template>
            </Column>
            <Column field="lastUsed" header="Último Uso" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.lastUsed) }}
              </template>
            </Column>
            <Column header="Ações">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-eye" 
                    class="p-button-rounded p-button-text"
                    @click="viewAgent(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-rounded p-button-text"
                    @click="editAgent(slotProps.data)"
                  />
                  <Button 
                    v-if="slotProps.data.type === 'interactive'"
                    icon="pi pi-comments" 
                    class="p-button-rounded p-button-text"
                    @click="testAgent(slotProps.data)"
                    title="Testar no Chat"
                  />
                  <Button 
                    v-if="slotProps.data.type === 'api'"
                    icon="pi pi-external-link" 
                    class="p-button-rounded p-button-text"
                    @click="viewAPI(slotProps.data)"
                    title="Ver API"
                  />
                  <Button 
                    icon="pi pi-copy" 
                    class="p-button-rounded p-button-text"
                    @click="duplicateAgent(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-rounded p-button-text p-button-danger"
                    @click="deleteAgent(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Create/Edit Agent Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :header="editingAgent ? 'Editar Agente' : 'Novo Agente'"
      :style="{ width: '80vw' }"
      :modal="true"
    >
      <TabView>
        <TabPanel header="Configuração Básica">
          <div class="flex flex-column gap-3">
            <div class="field">
              <label for="agentName">Nome</label>
              <InputText 
                id="agentName"
                v-model="agentForm.name" 
                class="w-full"
              />
            </div>
            
            <div class="field">
              <label for="agentDescription">Descrição</label>
              <Textarea 
                id="agentDescription"
                v-model="agentForm.description" 
                :autoResize="true"
                rows="3"
                class="w-full"
              />
            </div>

            <div class="field">
              <label for="agentType">Tipo de Agente</label>
              <Dropdown 
                id="agentType"
                v-model="agentForm.type" 
                :options="agentTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecionar tipo"
                class="w-full"
                @change="onTypeChange"
              />
              <small class="text-muted">{{ getTypeDescription(agentForm.type) }}</small>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Configuração do Modelo" v-if="agentForm.type">
          <div class="flex flex-column gap-3">
            <div class="field">
              <label for="agentModel">Modelo</label>
              <Dropdown 
                id="agentModel"
                v-model="agentForm.model" 
                :options="models"
                optionLabel="name"
                optionValue="value"
                placeholder="Selecionar modelo"
                class="w-full"
              />
            </div>

            <div class="field">
              <label for="temperature">Temperature</label>
              <div class="flex align-items-center gap-3">
                <Slider 
                  id="temperature"
                  v-model="agentForm.temperature" 
                  :min="0" 
                  :max="2" 
                  :step="0.1"
                  class="w-full"
                />
                <InputNumber 
                  v-model="agentForm.temperature" 
                  :min="0" 
                  :max="2" 
                  :step="0.1"
                  :minFractionDigits="1"
                  :maxFractionDigits="1"
                  class="w-6rem"
                />
              </div>
              <small class="text-muted">0 = Determinístico, 2 = Criativo</small>
            </div>

            <div class="field">
              <label for="maxTokens">Max Tokens</label>
              <InputNumber 
                id="maxTokens"
                v-model="agentForm.maxTokens" 
                :min="1" 
                :max="4000"
                class="w-full"
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel header="System Prompt">
          <div class="flex flex-column gap-3">
            <div class="field">
              <label for="systemPrompt">System Prompt</label>
              <div class="flex gap-2 mb-2">
                <Dropdown 
                  v-model="selectedPrompt" 
                  :options="prompts"
                  optionLabel="name"
                  optionValue="content"
                  placeholder="Selecionar prompt existente"
                  class="w-20rem"
                  @change="onPromptSelect"
                />
                <Button 
                  icon="pi pi-plus" 
                  label="Novo Prompt"
                  class="p-button-outlined"
                  @click="createNewPrompt"
                />
              </div>
              <Textarea 
                id="systemPrompt"
                v-model="agentForm.systemPrompt" 
                :autoResize="true"
                rows="8"
                class="w-full"
                placeholder="Digite o system prompt do agente..."
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel header="RAG & Tools">
          <div class="flex flex-column gap-3">
            <div class="field">
              <label for="agentRAG">AutoRAG</label>
              <Dropdown 
                id="agentRAG"
                v-model="agentForm.rag" 
                :options="rags"
                optionLabel="name"
                optionValue="value"
                placeholder="Selecionar AutoRAG (opcional)"
                class="w-full"
              />
            </div>

            <div class="field">
              <label>Ferramentas (Tools)</label>
              <div class="grid">
                <div 
                  v-for="tool in availableTools" 
                  :key="tool.value"
                  class="col-12 md:col-6 lg:col-4"
                >
                  <div class="field-checkbox">
                    <input 
                      type="checkbox" 
                      :id="tool.value"
                      :value="tool.value"
                      v-model="agentForm.tools"
                    />
                    <label :for="tool.value" class="ml-2">
                      <strong>{{ tool.name }}</strong>
                      <br>
                      <small class="text-muted">{{ tool.description }}</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Configurações Avançadas" v-if="agentForm.type">
          <div class="flex flex-column gap-3">
            <div v-if="agentForm.type === 'interactive'" class="field">
              <div class="field-checkbox">
                <input 
                  type="checkbox" 
                  id="allowSharing"
                  v-model="agentForm.allowSharing"
                />
                <label for="allowSharing" class="ml-2">Permitir compartilhamento de chat</label>
              </div>
            </div>

            <div v-if="agentForm.type === 'api'" class="field">
              <label for="promptDiscovery">Prompt Discovery</label>
              <div class="flex flex-column gap-2">
                <div class="field-radiobutton">
                  <input 
                    type="radio" 
                    id="autoSync"
                    value="auto-sync"
                    v-model="agentForm.promptDiscovery"
                  />
                  <label for="autoSync" class="ml-2">
                    <strong>Auto-sync</strong> - Atualização automática do Workload
                  </label>
                </div>
                <div class="field-radiobutton">
                  <input 
                    type="radio" 
                    id="snapshot"
                    value="snapshot"
                    v-model="agentForm.promptDiscovery"
                  />
                  <label for="snapshot" class="ml-2">
                    <strong>Snapshot</strong> - Versão fixa no momento da criação
                  </label>
                </div>
              </div>
            </div>

            <div v-if="agentForm.type === 'workflow'" class="field">
              <label for="workflowConfig">Configuração do Workflow</label>
              <Textarea 
                id="workflowConfig"
                v-model="agentForm.workflowConfig" 
                :autoResize="true"
                rows="5"
                class="w-full"
                placeholder="Configuração JSON do workflow..."
              />
            </div>
          </div>
        </TabPanel>
      </TabView>

      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="closeDialog"
        />
        <Button 
          :label="editingAgent ? 'Atualizar' : 'Criar'" 
          icon="pi pi-check"
          @click="saveAgent"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
export default {
  name: 'AgentBuilder',
  data() {
    return {
      searchTerm: '',
      showCreateDialog: false,
      editingAgent: null,
      selectedPrompt: null,
      agentForm: {
        name: '',
        description: '',
        type: '',
        model: '',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: '',
        rag: null,
        tools: [],
        allowSharing: true,
        promptDiscovery: 'auto-sync',
        workflowConfig: ''
      },
      agentTypes: [
        {
          label: 'Interactive Agent (Chat)',
          value: 'interactive',
          description: 'Agente para interações diretas em formato de chat'
        },
        {
          label: 'API Agent (Stateless)',
          value: 'api',
          description: 'Agente stateless para uso via API'
        },
        {
          label: 'Workflow Agent',
          value: 'workflow',
          description: 'Agente para execução programática e automações'
        },
        {
          label: 'Multimodal Agent (Em breve)',
          value: 'multimodal',
          description: 'Agente capaz de operar com múltiplas entradas',
          disabled: true
        }
      ],
      models: [
        { name: 'GPT-4', value: 'gpt-4', provider: 'OpenAI' },
        { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', provider: 'OpenAI' },
        { name: 'Claude 3', value: 'claude-3', provider: 'Anthropic' },
        { name: 'Azion Edge AI Model 1', value: 'azion-edge-1', provider: 'Azion' },
        { name: 'Azion Edge AI Model 2', value: 'azion-edge-2', provider: 'Azion' }
      ],
      prompts: [
        { name: 'Assistente Geral', content: 'Você é um assistente útil e prestativo.' },
        { name: 'Suporte Técnico', content: 'Você é um especialista em suporte técnico.' },
        { name: 'Análise de Código', content: 'Você é um especialista em análise de código.' }
      ],
      rags: [
        { name: 'Documentação Técnica', value: 'tech-docs' },
        { name: 'Base de Conhecimento', value: 'knowledge-base' },
        { name: 'Políticas da Empresa', value: 'company-policies' }
      ],
      availableTools: [
        {
          name: 'Web Search',
          value: 'web-search',
          description: 'Busca informações na web'
        },
        {
          name: 'Calculator',
          value: 'calculator',
          description: 'Realiza cálculos matemáticos'
        },
        {
          name: 'Code Interpreter',
          value: 'code-interpreter',
          description: 'Executa e analisa código'
        },
        {
          name: 'File Reader',
          value: 'file-reader',
          description: 'Lê e analisa arquivos'
        },
        {
          name: 'Email Sender',
          value: 'email-sender',
          description: 'Envia emails automaticamente'
        },
        {
          name: 'Database Query',
          value: 'database-query',
          description: 'Consulta bases de dados'
        }
      ],
      agents: [
        {
          id: 1,
          name: 'Assistente de Suporte',
          description: 'Agente para atendimento ao cliente',
          type: 'interactive',
          model: 'gpt-4',
          status: 'active',
          usage: 156,
          lastUsed: new Date('2024-01-15')
        },
        {
          id: 2,
          name: 'API de Análise',
          description: 'Agente para análise de dados via API',
          type: 'api',
          model: 'claude-3',
          status: 'active',
          usage: 89,
          lastUsed: new Date('2024-01-14')
        },
        {
          id: 3,
          name: 'Workflow de Processamento',
          description: 'Agente para processamento automatizado',
          type: 'workflow',
          model: 'azion-edge-1',
          status: 'inactive',
          usage: 23,
          lastUsed: new Date('2024-01-10')
        }
      ]
    }
  },
  computed: {
    filteredAgents() {
      if (!this.searchTerm) return this.agents
      
      return this.agents.filter(agent => 
        agent.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  methods: {
    getTypeLabel(type) {
      const typeMap = {
        'interactive': 'Interactive',
        'api': 'API',
        'workflow': 'Workflow',
        'multimodal': 'Multimodal'
      }
      return typeMap[type] || type
    },
    getTypeClass(type) {
      const classMap = {
        'interactive': 'p-chip-info',
        'api': 'p-chip-success',
        'workflow': 'p-chip-warning',
        'multimodal': 'p-chip-secondary'
      }
      return classMap[type] || ''
    },
    getTypeDescription(type) {
      const agent = this.agentTypes.find(t => t.value === type)
      return agent ? agent.description : ''
    },
    onTypeChange() {
      // Reset form when type changes
      this.agentForm.tools = []
      this.agentForm.allowSharing = true
      this.agentForm.promptDiscovery = 'auto-sync'
      this.agentForm.workflowConfig = ''
    },
    onPromptSelect() {
      if (this.selectedPrompt) {
        this.agentForm.systemPrompt = this.selectedPrompt
      }
    },
    createNewPrompt() {
      this.$toast.add({
        severity: 'info',
        summary: 'Redirecionando',
        detail: 'Redirecionando para criação de novo prompt...',
        life: 3000
      })
    },
    viewAgent(agent) {
      this.editingAgent = agent
      this.agentForm = { ...agent }
      this.showCreateDialog = true
    },
    editAgent(agent) {
      this.viewAgent(agent)
    },
    testAgent(agent) {
      this.$toast.add({
        severity: 'info',
        summary: 'Testando Agente',
        detail: `Abrindo chat para testar: ${agent.name}`,
        life: 3000
      })
    },
    viewAPI(agent) {
      this.$toast.add({
        severity: 'info',
        summary: 'API do Agente',
        detail: `Visualizando API para: ${agent.name}`,
        life: 3000
      })
    },
    duplicateAgent(agent) {
      const newAgent = {
        ...agent,
        id: Math.max(...this.agents.map(a => a.id)) + 1,
        name: agent.name + ' (Cópia)',
        usage: 0,
        lastUsed: new Date()
      }
      this.agents.push(newAgent)
      this.$toast.add({
        severity: 'success',
        summary: 'Agente Duplicado',
        detail: 'Agente duplicado com sucesso',
        life: 3000
      })
    },
    deleteAgent(agent) {
      if (confirm('Tem certeza que deseja deletar este agente?')) {
        this.agents = this.agents.filter(a => a.id !== agent.id)
        this.$toast.add({
          severity: 'success',
          summary: 'Agente Deletado',
          detail: 'Agente deletado com sucesso',
          life: 3000
        })
      }
    },
    saveAgent() {
      if (this.editingAgent) {
        // Update existing agent
        const index = this.agents.findIndex(a => a.id === this.editingAgent.id)
        this.agents[index] = { ...this.agentForm }
      } else {
        // Create new agent
        const newAgent = {
          ...this.agentForm,
          id: Math.max(...this.agents.map(a => a.id)) + 1,
          status: 'active',
          usage: 0,
          lastUsed: new Date()
        }
        this.agents.push(newAgent)
      }
      
      this.closeDialog()
      this.$toast.add({
        severity: 'success',
        summary: this.editingAgent ? 'Agente Atualizado' : 'Agente Criado',
        detail: this.editingAgent ? 'Agente atualizado com sucesso' : 'Agente criado com sucesso',
        life: 3000
      })
    },
    closeDialog() {
      this.showCreateDialog = false
      this.editingAgent = null
      this.selectedPrompt = null
      this.agentForm = {
        name: '',
        description: '',
        type: '',
        model: '',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: '',
        rag: null,
        tools: [],
        allowSharing: true,
        promptDiscovery: 'auto-sync',
        workflowConfig: ''
      }
    },
    formatDate(date) {
      return date.toLocaleDateString('pt-BR')
    }
  }
}
</script>

<style scoped>
.agent-builder-container {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.agent-builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.agent-builder-header h1 {
  margin: 0;
  color: #495057;
}

.agent-builder-actions {
  display: flex;
  gap: 1rem;
}

.agent-builder-main {
  flex: 1;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.field-checkbox {
  margin-bottom: 0.5rem;
}

.field-radiobutton {
  margin-bottom: 0.5rem;
}

.text-muted {
  color: #6c757d;
}

.p-chip-info {
  background-color: #cce7ff;
  color: #004085;
}

.p-chip-success {
  background-color: #d4edda;
  color: #155724;
}

.p-chip-warning {
  background-color: #fff3cd;
  color: #856404;
}

.p-chip-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.p-chip-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}
</style>

