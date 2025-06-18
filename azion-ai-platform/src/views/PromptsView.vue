<template>
  <div class="prompts-container">
    <div class="prompts-header">
      <div class="header-content">
        <h1>Prompts Management</h1>
        <p>Create and manage your AI prompts with directory organization</p>
      </div>
      <div class="header-actions">
        <Button 
          icon="pi pi-plus" 
          label="New Prompt" 
          @click="showCreateDialog = true"
        />
        <Button 
          icon="pi pi-folder-plus" 
          label="New Directory" 
          class="p-button-outlined"
          @click="showCreateDirectoryDialog = true"
        />
      </div>
    </div>

    <div class="prompts-content">
      <!-- Directory Tree -->
      <div class="directory-tree">
        <div class="tree-header">
          <h3>Directory Structure</h3>
        </div>
        <Tree 
          :value="directoryTree" 
          selectionMode="single"
          v-model:selectionKeys="selectedDirectory"
          @node-select="onDirectorySelect"
          class="custom-tree"
        >
          <template #default="{ node }">
            <div class="tree-node">
              <i :class="node.icon"></i>
              <span>{{ node.label }}</span>
              <div class="node-actions" v-if="node.type === 'directory'">
                <Button 
                  icon="pi pi-pencil" 
                  class="p-button-text p-button-sm"
                  @click.stop="editDirectory(node)"
                />
                <Button 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  @click.stop="deleteDirectory(node)"
                />
              </div>
            </div>
          </template>
        </Tree>
      </div>

      <!-- Prompts List -->
      <div class="prompts-list">
        <div class="list-header">
          <h3>{{ currentDirectoryName }} Prompts</h3>
          <div class="list-controls">
            <InputText 
              v-model="searchQuery" 
              placeholder="Search prompts..."
              class="search-input"
            />
            <Dropdown 
              v-model="statusFilter" 
              :options="statusOptions" 
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by status"
            />
          </div>
        </div>

        <DataTable 
          :value="filteredPrompts" 
          :paginator="true" 
          :rows="10"
          :loading="loading"
          class="prompts-table"
        >
          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <div class="prompt-name">
                <span>{{ data.name }}</span>
                <Tag 
                  :value="data.status" 
                  :severity="data.status === 'active' ? 'success' : 'secondary'"
                />
              </div>
            </template>
          </Column>
          
          <Column field="description" header="Description">
            <template #body="{ data }">
              <span class="description-text">{{ data.description }}</span>
            </template>
          </Column>
          
          <Column field="usageCount" header="Usage Count" sortable>
            <template #body="{ data }">
              <div class="usage-stats">
                <span class="usage-count">{{ data.usageCount }}</span>
                <Button 
                  icon="pi pi-chart-line" 
                  class="p-button-text p-button-sm"
                  @click="viewUsageStats(data)"
                  v-tooltip="'View usage statistics'"
                />
              </div>
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
                  @click="viewPrompt(data)"
                  v-tooltip="'View prompt'"
                />
                <Button 
                  icon="pi pi-pencil" 
                  class="p-button-text p-button-sm"
                  @click="editPrompt(data)"
                  v-tooltip="'Edit prompt'"
                />
                <Button 
                  icon="pi pi-copy" 
                  class="p-button-text p-button-sm"
                  @click="duplicatePrompt(data)"
                  v-tooltip="'Duplicate prompt'"
                />
                <Button 
                  :icon="data.status === 'active' ? 'pi pi-pause' : 'pi pi-play'" 
                  class="p-button-text p-button-sm"
                  @click="togglePromptStatus(data)"
                  :v-tooltip="data.status === 'active' ? 'Deactivate prompt' : 'Activate prompt'"
                />
                <Button 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  @click="deletePrompt(data)"
                  v-tooltip="'Delete prompt'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Create/Edit Prompt Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :header="editingPrompt ? 'Edit Prompt' : 'Create New Prompt'"
      :modal="true"
      :style="{ width: '800px' }"
      class="prompt-dialog"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label for="promptName">Name *</label>
          <InputText 
            id="promptName"
            v-model="promptForm.name" 
            placeholder="Enter prompt name"
            class="w-full"
          />
        </div>

        <div class="form-group">
          <label for="promptDescription">Description</label>
          <Textarea 
            id="promptDescription"
            v-model="promptForm.description" 
            placeholder="Enter prompt description"
            rows="3"
            class="w-full"
          />
        </div>

        <div class="form-group">
          <label for="promptDirectory">Directory</label>
          <Dropdown 
            id="promptDirectory"
            v-model="promptForm.directory" 
            :options="directoryOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select directory"
            class="w-full"
          />
        </div>

        <div class="form-group">
          <label for="promptContent">Prompt Content *</label>
          <Textarea 
            id="promptContent"
            v-model="promptForm.content" 
            placeholder="Enter your prompt content here. Use ${variable_name} for variables."
            rows="10"
            class="w-full prompt-content-editor"
          />
          <small class="form-help">
            Use ${variable_name} syntax for variables that can be replaced at runtime.
          </small>
        </div>

        <div class="form-group">
          <div class="form-check">
            <Checkbox 
              id="promptActive"
              v-model="promptForm.active" 
              :binary="true"
            />
            <label for="promptActive">Active (available for use in Chat and Agent Builder)</label>
          </div>
        </div>

        <div class="variables-section" v-if="detectedVariables.length > 0">
          <h4>Detected Variables</h4>
          <div class="variables-list">
            <Tag 
              v-for="variable in detectedVariables" 
              :key="variable"
              :value="variable"
              class="variable-tag"
            />
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
          :label="editingPrompt ? 'Update' : 'Create'" 
          @click="savePrompt"
          :disabled="!promptForm.name || !promptForm.content"
        />
      </template>
    </Dialog>

    <!-- Create Directory Dialog -->
    <Dialog 
      v-model:visible="showCreateDirectoryDialog" 
      header="Create New Directory"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label for="directoryName">Directory Name *</label>
          <InputText 
            id="directoryName"
            v-model="directoryForm.name" 
            placeholder="Enter directory name"
            class="w-full"
          />
        </div>

        <div class="form-group">
          <label for="parentDirectory">Parent Directory</label>
          <Dropdown 
            id="parentDirectory"
            v-model="directoryForm.parent" 
            :options="parentDirectoryOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select parent directory (optional)"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancel" 
          class="p-button-text" 
          @click="showCreateDirectoryDialog = false"
        />
        <Button 
          label="Create" 
          @click="createDirectory"
          :disabled="!directoryForm.name"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Tree from 'primevue/tree'
import Tag from 'primevue/tag'
import Checkbox from 'primevue/checkbox'
import { format } from 'date-fns'

// Reactive data
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)
const showCreateDirectoryDialog = ref(false)
const editingPrompt = ref(false)
const selectedDirectory = ref({})
const currentDirectoryName = ref('All')

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Form data
const promptForm = ref({
  name: '',
  description: '',
  directory: '',
  content: '',
  active: true
})

const directoryForm = ref({
  name: '',
  parent: ''
})

// Mock data
const prompts = ref([
  {
    id: '1',
    name: 'Customer Support Template',
    description: 'Standard template for customer support interactions',
    directory: 'customer-support',
    content: 'You are a helpful customer support agent. Please assist the customer with their inquiry: ${customer_inquiry}',
    status: 'active',
    usageCount: 156,
    lastUsed: new Date('2024-06-17'),
    variables: ['customer_inquiry']
  },
  {
    id: '2',
    name: 'Code Review Template',
    description: 'Template for reviewing code submissions',
    directory: 'engineering',
    content: 'Please review the following code for: ${review_criteria}. Code: ${code_snippet}',
    status: 'active',
    usageCount: 89,
    lastUsed: new Date('2024-06-16'),
    variables: ['review_criteria', 'code_snippet']
  },
  {
    id: '3',
    name: 'Legal Document Analysis',
    description: 'Template for analyzing legal documents',
    directory: 'legal',
    content: 'Analyze the following legal document for ${analysis_type}: ${document_content}',
    status: 'inactive',
    usageCount: 23,
    lastUsed: new Date('2024-06-10'),
    variables: ['analysis_type', 'document_content']
  }
])

const directoryTree = ref([
  {
    key: 'root',
    label: 'All Prompts',
    icon: 'pi pi-folder',
    type: 'root',
    children: [
      {
        key: 'customer-support',
        label: 'Customer Support',
        icon: 'pi pi-folder',
        type: 'directory',
        children: []
      },
      {
        key: 'engineering',
        label: 'Engineering',
        icon: 'pi pi-folder',
        type: 'directory',
        children: [
          {
            key: 'code-review',
            label: 'Code Review',
            icon: 'pi pi-folder',
            type: 'directory',
            children: []
          }
        ]
      },
      {
        key: 'legal',
        label: 'Legal',
        icon: 'pi pi-folder',
        type: 'directory',
        children: []
      },
      {
        key: 'marketing',
        label: 'Marketing',
        icon: 'pi pi-folder',
        type: 'directory',
        children: []
      }
    ]
  }
])

// Computed properties
const filteredPrompts = computed(() => {
  let filtered = prompts.value

  if (searchQuery.value) {
    filtered = filtered.filter(prompt => 
      prompt.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(prompt => prompt.status === statusFilter.value)
  }

  return filtered
})

const directoryOptions = computed(() => {
  const options = [{ label: 'Root', value: '' }]
  
  const addDirectoryOptions = (nodes: any[], prefix = '') => {
    nodes.forEach(node => {
      if (node.type === 'directory') {
        options.push({
          label: prefix + node.label,
          value: node.key
        })
        if (node.children) {
          addDirectoryOptions(node.children, prefix + node.label + ' / ')
        }
      }
    })
  }
  
  if (directoryTree.value[0]?.children) {
    addDirectoryOptions(directoryTree.value[0].children)
  }
  
  return options
})

const parentDirectoryOptions = computed(() => {
  return directoryOptions.value
})

const detectedVariables = computed(() => {
  const content = promptForm.value.content
  const matches = content.match(/\$\{([^}]+)\}/g)
  return matches ? matches.map(match => match.slice(2, -1)) : []
})

// Methods
const onDirectorySelect = (node: any) => {
  currentDirectoryName.value = node.label
  // Filter prompts by directory
}

const viewPrompt = (prompt: any) => {
  // Navigate to prompt detail view
  console.log('View prompt:', prompt)
}

const editPrompt = (prompt: any) => {
  editingPrompt.value = true
  promptForm.value = {
    name: prompt.name,
    description: prompt.description,
    directory: prompt.directory,
    content: prompt.content,
    active: prompt.status === 'active'
  }
  showCreateDialog.value = true
}

const duplicatePrompt = (prompt: any) => {
  promptForm.value = {
    name: prompt.name + ' (Copy)',
    description: prompt.description,
    directory: prompt.directory,
    content: prompt.content,
    active: false
  }
  editingPrompt.value = false
  showCreateDialog.value = true
}

const togglePromptStatus = (prompt: any) => {
  prompt.status = prompt.status === 'active' ? 'inactive' : 'active'
}

const deletePrompt = (prompt: any) => {
  if (confirm(`Are you sure you want to delete "${prompt.name}"?`)) {
    const index = prompts.value.findIndex(p => p.id === prompt.id)
    if (index > -1) {
      prompts.value.splice(index, 1)
    }
  }
}

const viewUsageStats = (prompt: any) => {
  // Navigate to activity history with filter
  console.log('View usage stats for:', prompt)
}

const savePrompt = () => {
  if (editingPrompt.value) {
    // Update existing prompt
    console.log('Update prompt:', promptForm.value)
  } else {
    // Create new prompt
    const newPrompt = {
      id: Date.now().toString(),
      name: promptForm.value.name,
      description: promptForm.value.description,
      directory: promptForm.value.directory,
      content: promptForm.value.content,
      status: promptForm.value.active ? 'active' : 'inactive',
      usageCount: 0,
      lastUsed: new Date(),
      variables: detectedVariables.value
    }
    prompts.value.push(newPrompt)
  }
  
  closeDialog()
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingPrompt.value = false
  promptForm.value = {
    name: '',
    description: '',
    directory: '',
    content: '',
    active: true
  }
}

const editDirectory = (node: any) => {
  console.log('Edit directory:', node)
}

const deleteDirectory = (node: any) => {
  if (confirm(`Are you sure you want to delete the directory "${node.label}"?`)) {
    console.log('Delete directory:', node)
  }
}

const createDirectory = () => {
  console.log('Create directory:', directoryForm.value)
  showCreateDirectoryDialog.value = false
  directoryForm.value = {
    name: '',
    parent: ''
  }
}

const formatDate = (date: Date) => {
  return format(date, 'MMM dd, yyyy')
}

onMounted(() => {
  // Initialize selected directory
  selectedDirectory.value = { 'root': true }
})
</script>

<style scoped>
.prompts-container {
  padding: 2rem;
  background-color: #000000;
  min-height: 100vh;
}

.prompts-header {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.prompts-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);
}

.directory-tree {
  background-color: #111111;
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.tree-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333333;
}

.tree-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.tree-node i {
  color: #007bff;
}

.node-actions {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.prompts-list {
  background-color: #111111;
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333333;
}

.list-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
}

.list-controls {
  display: flex;
  gap: 1rem;
}

.search-input {
  width: 250px;
}

.prompts-table {
  flex: 1;
}

.prompt-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.description-text {
  color: #cccccc;
  font-size: 0.9rem;
}

.usage-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.usage-count {
  font-weight: 600;
  color: #007bff;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.prompt-dialog .dialog-content {
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

.form-help {
  color: #888888;
  font-size: 0.8rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check label {
  margin: 0;
}

.prompt-content-editor {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.variables-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333333;
}

.variables-section h4 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variable-tag {
  background-color: #007bff;
  color: white;
}

.w-full {
  width: 100%;
}

/* Custom tree styling */
:deep(.custom-tree .p-tree-node-content) {
  background-color: transparent;
  color: #ffffff;
  border: none;
  padding: 0.5rem;
}

:deep(.custom-tree .p-tree-node-content:hover) {
  background-color: #1a1a1a;
}

:deep(.custom-tree .p-tree-node-content.p-tree-node-selectable.p-highlight) {
  background-color: #1a1a1a;
  color: #ffffff;
}

/* Responsive design */
@media (max-width: 1200px) {
  .prompts-content {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 768px) {
  .prompts-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .directory-tree {
    height: 200px;
  }
  
  .list-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>

