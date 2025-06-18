<template>
  <div class="agent-builder-container">
    <div class="agent-builder-header">
      <div class="header-content">
        <h1>Agent Builder</h1>
        <p>Create and manage AI agents for different use cases</p>
      </div>
      <div class="header-actions">
        <Button 
          icon="pi pi-plus" 
          label="New Agent" 
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <div class="agent-types-section">
      <h2>Agent Types</h2>
      <div class="agent-types-grid">
        <Card 
          v-for="agentType in agentTypes" 
          :key="agentType.id"
          class="agent-type-card"
          @click="selectAgentType(agentType)"
        >
          <template #content>
            <div class="agent-type-content">
              <div class="type-icon">
                <i :class="agentType.icon"></i>
              </div>
              <h3>{{ agentType.name }}</h3>
              <p>{{ agentType.description }}</p>
              <div class="type-features">
                <Tag 
                  v-for="feature in agentType.features" 
                  :key="feature"
                  :value="feature"
                  class="feature-tag"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="agents-list-section">
      <div class="list-header">
        <h2>Your Agents</h2>
        <div class="list-controls">
          <InputText 
            v-model="searchQuery" 
            placeholder="Search agents..."
            class="search-input"
          />
          <Dropdown 
            v-model="typeFilter" 
            :options="typeFilterOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by type"
          />
        </div>
      </div>

      <DataTable 
        :value="filteredAgents" 
        :paginator="true" 
        :rows="10"
        class="agents-table"
      >
        <Column field="name" header="Name" sortable>
          <template #body="{ data }">
            <div class="agent-name">
              <i :class="getAgentTypeIcon(data.type)"></i>
              <span>{{ data.name }}</span>
              <Tag 
                :value="data.status" 
                :severity="data.status === 'active' ? 'success' : 'secondary'"
              />
            </div>
          </template>
        </Column>
        
        <Column field="type" header="Type" sortable>
          <template #body="{ data }">
            {{ getAgentTypeName(data.type) }}
          </template>
        </Column>
        
        <Column field="description" header="Description">
          <template #body="{ data }">
            <span class="description-text">{{ data.description }}</span>
          </template>
        </Column>
        
        <Column field="usageCount" header="Usage" sortable>
          <template #body="{ data }">
            {{ data.usageCount }}
          </template>
        </Column>
        
        <Column field="lastUsed" header="Last Used" sortable>
          <template #body="{ data }">
            {{ formatDate(data.lastUsed) }}
          </template>
        </Column>
        
        <Column header="Actions">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button 
                icon="pi pi-eye" 
                class="p-button-text p-button-sm"
                @click="viewAgent(data)"
              />
              <Button 
                icon="pi pi-pencil" 
                class="p-button-text p-button-sm"
                @click="editAgent(data)"
              />
              <Button 
                icon="pi pi-copy" 
                class="p-button-text p-button-sm"
                @click="duplicateAgent(data)"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-text p-button-sm p-button-danger"
                @click="deleteAgent(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create Agent Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      header="Create New Agent"
      :modal="true"
      :style="{ width: '800px' }"
      class="agent-dialog"
    >
      <div class="dialog-content">
        <div class="agent-type-selection" v-if="!selectedAgentType">
          <h3>Select Agent Type</h3>
          <div class="type-selection-grid">
            <div 
              v-for="agentType in agentTypes" 
              :key="agentType.id"
              class="type-option"
              @click="selectedAgentType = agentType"
            >
              <i :class="agentType.icon"></i>
              <span>{{ agentType.name }}</span>
            </div>
          </div>
        </div>

        <div class="agent-configuration" v-if="selectedAgentType">
          <div class="config-header">
            <Button 
              icon="pi pi-arrow-left" 
              class="p-button-text"
              @click="selectedAgentType = null"
            />
            <h3>{{ selectedAgentType.name }} Configuration</h3>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label>Name *</label>
              <InputText 
                v-model="agentForm.name" 
                placeholder="Enter agent name"
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <Textarea 
                v-model="agentForm.description" 
                placeholder="Enter agent description"
                rows="3"
                class="w-full"
              />
            </div>

            <!-- Interactive Agent Configuration -->
            <div v-if="selectedAgentType.id === 'interactive'" class="agent-config">
              <h4>Interactive Agent Settings</h4>
              
              <div class="form-group">
                <label>Model</label>
                <Dropdown 
                  v-model="agentForm.model" 
                  :options="availableModels" 
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select model"
                  class="w-full"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Temperature</label>
                  <InputNumber 
                    v-model="agentForm.temperature" 
                    :min="0" 
                    :max="2" 
                    :step="0.1"
                    class="w-full"
                  />
                </div>
                <div class="form-group">
                  <label>Max Tokens</label>
                  <InputNumber 
                    v-model="agentForm.maxTokens" 
                    :min="1" 
                    :max="4000"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>System Prompt</label>
                <Dropdown 
                  v-model="agentForm.systemPrompt" 
                  :options="availablePrompts" 
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select system prompt"
                  class="w-full"
                />
              </div>

              <div class="form-group">
                <label>RAG Configuration</label>
                <Dropdown 
                  v-model="agentForm.ragConfig" 
                  :options="availableRAGs" 
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select RAG (optional)"
                  class="w-full"
                />
              </div>

              <div class="form-group">
                <div class="form-check">
                  <Checkbox 
                    v-model="agentForm.allowSharing" 
                    :binary="true"
                  />
                  <label>Allow chat sharing</label>
                </div>
              </div>
            </div>

            <!-- API Agent Configuration -->
            <div v-if="selectedAgentType.id === 'api'" class="agent-config">
              <h4>API Agent Settings</h4>
              
              <div class="form-group">
                <label>Prompt Discovery</label>
                <div class="radio-group">
                  <div class="radio-option">
                    <RadioButton 
                      v-model="agentForm.promptDiscovery" 
                      value="auto-sync"
                    />
                    <label>Auto-sync (Updates automatically with prompt changes)</label>
                  </div>
                  <div class="radio-option">
                    <RadioButton 
                      v-model="agentForm.promptDiscovery" 
                      value="snapshot"
                    />
                    <label>Snapshot (Fixed version at creation time)</label>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Base Prompt</label>
                <Dropdown 
                  v-model="agentForm.basePrompt" 
                  :options="availablePrompts" 
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select base prompt"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Workflow Agent Configuration -->
            <div v-if="selectedAgentType.id === 'workflow'" class="agent-config">
              <h4>Workflow Agent Settings</h4>
              
              <div class="form-group">
                <label>Execution Mode</label>
                <Dropdown 
                  v-model="agentForm.executionMode" 
                  :options="executionModes" 
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select execution mode"
                  class="w-full"
                />
              </div>

              <div class="form-group">
                <label>Workflow Steps</label>
                <div class="workflow-steps">
                  <div 
                    v-for="(step, index) in agentForm.workflowSteps" 
                    :key="index"
                    class="workflow-step"
                  >
                    <InputText 
                      v-model="step.name" 
                      placeholder="Step name"
                      class="step-name"
                    />
                    <Textarea 
                      v-model="step.description" 
                      placeholder="Step description"
                      rows="2"
                      class="step-description"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      class="p-button-text p-button-sm p-button-danger"
                      @click="removeWorkflowStep(index)"
                    />
                  </div>
                  
                  <Button 
                    icon="pi pi-plus" 
                    label="Add Step" 
                    class="p-button-outlined"
                    @click="addWorkflowStep"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancel" 
          class="p-button-text" 
          @click="closeDialog"
        />
        <Button 
          label="Create Agent" 
          @click="createAgent"
          :disabled="!agentForm.name || !selectedAgentType"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import { format } from 'date-fns'

// Reactive data
const showCreateDialog = ref(false)
const selectedAgentType = ref(null)
const searchQuery = ref('')
const typeFilter = ref('')

// Agent types
const agentTypes = ref([
  {
    id: 'interactive',
    name: 'Interactive Agent',
    description: 'Chat-based agent for direct user interactions',
    icon: 'pi pi-comments',
    features: ['Real-time Chat', 'Model Selection', 'RAG Integration', 'Shareable']
  },
  {
    id: 'api',
    name: 'API Agent',
    description: 'Stateless agent for API endpoints',
    icon: 'pi pi-cloud',
    features: ['HTTP Trigger', 'Prompt-based', 'Auto-sync', 'Edge Integration']
  },
  {
    id: 'workflow',
    name: 'Workflow Agent',
    description: 'Multi-step automation agent',
    icon: 'pi pi-sitemap',
    features: ['Multi-step', 'Automation', 'Tool Chaining', 'Programmable']
  },
  {
    id: 'multimodal',
    name: 'Multimodal Agent',
    description: 'Text, image, and audio processing (Coming Soon)',
    icon: 'pi pi-image',
    features: ['Text + Image', 'Audio Support', 'Advanced Models', 'Coming Soon'],
    disabled: true
  }
])

// Form data
const agentForm = ref({
  name: '',
  description: '',
  model: '',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: '',
  ragConfig: '',
  allowSharing: true,
  promptDiscovery: 'auto-sync',
  basePrompt: '',
  executionMode: '',
  workflowSteps: []
})

// Mock data
const availableModels = ref([
  { id: 'gpt-4', name: 'GPT-4 (OpenAI)' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)' },
  { id: 'claude-3', name: 'Claude 3 (Anthropic)' },
  { id: 'azion-edge-ai-1', name: 'Azion Edge AI Model 1' }
])

const availablePrompts = ref([
  { id: 'prompt-1', name: 'Customer Support Template' },
  { id: 'prompt-2', name: 'Code Review Template' },
  { id: 'prompt-3', name: 'Content Creation Template' }
])

const availableRAGs = ref([
  { id: 'rag-1', name: 'Company Documentation' },
  { id: 'rag-2', name: 'Product Knowledge Base' },
  { id: 'rag-3', name: 'Technical Documentation' }
])

const executionModes = ref([
  { label: 'Sequential', value: 'sequential' },
  { label: 'Parallel', value: 'parallel' },
  { label: 'Conditional', value: 'conditional' }
])

const agents = ref([
  {
    id: '1',
    name: 'Customer Support Bot',
    type: 'interactive',
    description: 'Handles customer inquiries and support tickets',
    status: 'active',
    usageCount: 1250,
    lastUsed: new Date('2024-06-17')
  },
  {
    id: '2',
    name: 'Code Review API',
    type: 'api',
    description: 'Automated code review for pull requests',
    status: 'active',
    usageCount: 89,
    lastUsed: new Date('2024-06-16')
  },
  {
    id: '3',
    name: 'Content Workflow',
    type: 'workflow',
    description: 'Multi-step content creation and approval process',
    status: 'inactive',
    usageCount: 23,
    lastUsed: new Date('2024-06-10')
  }
])

const typeFilterOptions = ref([
  { label: 'All Types', value: '' },
  { label: 'Interactive', value: 'interactive' },
  { label: 'API', value: 'api' },
  { label: 'Workflow', value: 'workflow' }
])

// Computed properties
const filteredAgents = computed(() => {
  let filtered = agents.value

  if (searchQuery.value) {
    filtered = filtered.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(agent => agent.type === typeFilter.value)
  }

  return filtered
})

// Methods
const selectAgentType = (agentType: any) => {
  if (!agentType.disabled) {
    selectedAgentType.value = agentType
    showCreateDialog.value = true
  }
}

const getAgentTypeIcon = (type: string) => {
  const typeMap = {
    'interactive': 'pi pi-comments',
    'api': 'pi pi-cloud',
    'workflow': 'pi pi-sitemap',
    'multimodal': 'pi pi-image'
  }
  return typeMap[type] || 'pi pi-cog'
}

const getAgentTypeName = (type: string) => {
  const typeMap = {
    'interactive': 'Interactive',
    'api': 'API',
    'workflow': 'Workflow',
    'multimodal': 'Multimodal'
  }
  return typeMap[type] || type
}

const viewAgent = (agent: any) => {
  console.log('View agent:', agent)
}

const editAgent = (agent: any) => {
  console.log('Edit agent:', agent)
}

const duplicateAgent = (agent: any) => {
  console.log('Duplicate agent:', agent)
}

const deleteAgent = (agent: any) => {
  if (confirm(`Are you sure you want to delete "${agent.name}"?`)) {
    const index = agents.value.findIndex(a => a.id === agent.id)
    if (index > -1) {
      agents.value.splice(index, 1)
    }
  }
}

const addWorkflowStep = () => {
  agentForm.value.workflowSteps.push({
    name: '',
    description: ''
  })
}

const removeWorkflowStep = (index: number) => {
  agentForm.value.workflowSteps.splice(index, 1)
}

const createAgent = () => {
  const newAgent = {
    id: Date.now().toString(),
    name: agentForm.value.name,
    type: selectedAgentType.value.id,
    description: agentForm.value.description,
    status: 'active',
    usageCount: 0,
    lastUsed: new Date()
  }
  
  agents.value.push(newAgent)
  closeDialog()
}

const closeDialog = () => {
  showCreateDialog.value = false
  selectedAgentType.value = null
  agentForm.value = {
    name: '',
    description: '',
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    ragConfig: '',
    allowSharing: true,
    promptDiscovery: 'auto-sync',
    basePrompt: '',
    executionMode: '',
    workflowSteps: []
  }
}

const formatDate = (date: Date) => {
  return format(date, 'MMM dd, yyyy')
}
</script>

<style scoped>
.agent-builder-container {
  padding: 2rem;
  background-color: #000000;
  min-height: 100vh;
}

.agent-builder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333333;
}

.header-content h1 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.header-content p {
  color: #888888;
  margin: 0;
}

.agent-types-section {
  margin-bottom: 3rem;
}

.agent-types-section h2 {
  color: #ffffff;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.agent-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.agent-type-card {
  background-color: #111111;
  border: 1px solid #333333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-type-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.agent-type-card[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.agent-type-content {
  text-align: center;
  padding: 1.5rem;
}

.type-icon {
  margin-bottom: 1rem;
}

.type-icon i {
  font-size: 3rem;
  color: #007bff;
}

.agent-type-content h3 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.agent-type-content p {
  color: #cccccc;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.type-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.feature-tag {
  font-size: 0.8rem;
}

.agents-list-section {
  margin-top: 3rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-header h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
}

.list-controls {
  display: flex;
  gap: 1rem;
}

.search-input {
  width: 250px;
}

.agent-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.agent-name i {
  color: #007bff;
}

.description-text {
  color: #cccccc;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.agent-dialog .dialog-content {
  min-height: 400px;
}

.agent-type-selection h3 {
  color: #ffffff;
  margin-bottom: 1rem;
}

.type-selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #333333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-option:hover {
  border-color: #007bff;
  background-color: #1a1a1a;
}

.type-option i {
  font-size: 2rem;
  color: #007bff;
}

.type-option span {
  color: #ffffff;
  font-weight: 500;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333333;
}

.config-header h3 {
  color: #ffffff;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check label {
  margin: 0;
}

.agent-config {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333333;
}

.agent-config h4 {
  color: #ffffff;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-option label {
  margin: 0;
  color: #cccccc;
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workflow-step {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #333333;
  border-radius: 6px;
  background-color: #1a1a1a;
  position: relative;
}

.step-name {
  font-weight: 500;
}

.step-description {
  font-size: 0.9rem;
}

.workflow-step .p-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.w-full {
  width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .agent-types-grid {
    grid-template-columns: 1fr;
  }
  
  .list-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .type-selection-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
