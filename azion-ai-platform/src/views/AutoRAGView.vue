<template>
  <div class="autorag-container">
    <div class="autorag-header">
      <div class="header-content">
        <h1>AutoRAG Management</h1>
        <p>Organize your documents and resources with automatic Edge SQL integration</p>
      </div>
      <div class="header-actions">
        <Button 
          icon="pi pi-plus" 
          label="New AutoRAG" 
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <div class="autorag-content">
      <div class="filters-section">
        <div class="filter-controls">
          <InputText 
            v-model="searchQuery" 
            placeholder="Search AutoRAG configurations..."
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

      <div class="autorag-grid">
        <Card 
          v-for="rag in filteredRAGs" 
          :key="rag.id"
          class="autorag-card"
        >
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <h3>{{ rag.name }}</h3>
                <Tag 
                  :value="rag.status" 
                  :severity="rag.status === 'active' ? 'success' : 'secondary'"
                />
              </div>
              <div class="card-actions">
                <Button 
                  icon="pi pi-eye" 
                  class="p-button-text p-button-sm"
                  @click="viewRAG(rag)"
                  v-tooltip="'View details'"
                />
                <Button 
                  icon="pi pi-pencil" 
                  class="p-button-text p-button-sm"
                  @click="editRAG(rag)"
                  v-tooltip="'Edit configuration'"
                />
                <Button 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  @click="deleteRAG(rag)"
                  v-tooltip="'Delete AutoRAG'"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div class="card-content">
              <p class="description">{{ rag.description }}</p>
              
              <div class="rag-stats">
                <div class="stat-item">
                  <i class="pi pi-file"></i>
                  <span>{{ rag.fileCount }} Files</span>
                </div>
                <div class="stat-item">
                  <i class="pi pi-align-left"></i>
                  <span>{{ rag.textCount }} Text Entries</span>
                </div>
                <div class="stat-item">
                  <i class="pi pi-database"></i>
                  <span>{{ formatBytes(rag.storageUsed) }}</span>
                </div>
                <div class="stat-item">
                  <i class="pi pi-chart-line"></i>
                  <span>{{ rag.usageCount }} Uses</span>
                </div>
              </div>

              <div class="edge-sql-info">
                <div class="sql-status">
                  <i class="pi pi-database"></i>
                  <span>Edge SQL: {{ rag.edgeSqlId }}</span>
                  <Button 
                    icon="pi pi-external-link" 
                    class="p-button-text p-button-sm"
                    @click="openEdgeSQL(rag.edgeSqlId)"
                    v-tooltip="'Open in Edge SQL'"
                  />
                </div>
                <div class="last-sync">
                  <small>Last sync: {{ formatDate(rag.lastSync) }}</small>
                </div>
              </div>

              <div class="version-info" v-if="rag.versions.length > 1">
                <div class="current-version">
                  <span>Version {{ rag.currentVersion }}</span>
                  <Button 
                    icon="pi pi-history" 
                    label="Rollback" 
                    class="p-button-text p-button-sm"
                    @click="showVersionHistory(rag)"
                  />
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="card-footer">
              <small class="last-updated">
                Updated {{ formatDate(rag.updatedAt) }}
              </small>
              <div class="footer-actions">
                <Button 
                  icon="pi pi-refresh" 
                  label="Sync" 
                  class="p-button-outlined p-button-sm"
                  @click="syncRAG(rag)"
                  :loading="rag.syncing"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Create/Edit AutoRAG Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :header="editingRAG ? 'Edit AutoRAG' : 'Create New AutoRAG'"
      :modal="true"
      :style="{ width: '900px' }"
      class="autorag-dialog"
    >
      <div class="dialog-content">
        <div class="form-section">
          <h4>Basic Information</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="ragName">Name *</label>
              <InputText 
                id="ragName"
                v-model="ragForm.name" 
                placeholder="Enter AutoRAG name"
                class="w-full"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="ragDescription">Description</label>
            <Textarea 
              id="ragDescription"
              v-model="ragForm.description" 
              placeholder="Enter description"
              rows="3"
              class="w-full"
            />
          </div>
        </div>

        <div class="form-section">
          <h4>File Upload</h4>
          <FileUpload 
            name="files"
            :multiple="true"
            accept=".pdf,.docx,.txt,.md"
            :maxFileSize="10000000"
            @upload="onFileUpload"
            @remove="onFileRemove"
            class="file-uploader"
          >
            <template #empty>
              <div class="upload-area">
                <i class="pi pi-cloud-upload"></i>
                <p>Drag and drop files here or click to browse</p>
                <small>Supported formats: PDF, DOCX, TXT, MD (Max 10MB each)</small>
              </div>
            </template>
          </FileUpload>

          <div class="uploaded-files" v-if="ragForm.files.length > 0">
            <h5>Uploaded Files</h5>
            <div class="file-list">
              <div 
                v-for="file in ragForm.files" 
                :key="file.id"
                class="file-item"
              >
                <div class="file-info">
                  <i class="pi pi-file"></i>
                  <span>{{ file.name }}</span>
                  <small>({{ formatBytes(file.size) }})</small>
                </div>
                <div class="file-actions">
                  <Button 
                    icon="pi pi-eye" 
                    class="p-button-text p-button-sm"
                    @click="previewFile(file)"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-text p-button-sm p-button-danger"
                    @click="removeFile(file.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>Text Entries</h4>
          <div class="text-entries">
            <div 
              v-for="(entry, index) in ragForm.textEntries" 
              :key="index"
              class="text-entry"
            >
              <div class="entry-header">
                <InputText 
                  v-model="entry.title" 
                  placeholder="Entry title"
                  class="entry-title"
                />
                <Button 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  @click="removeTextEntry(index)"
                />
              </div>
              <Textarea 
                v-model="entry.content" 
                placeholder="Enter text content"
                rows="4"
                class="w-full"
              />
            </div>
            
            <Button 
              icon="pi pi-plus" 
              label="Add Text Entry" 
              class="p-button-outlined"
              @click="addTextEntry"
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
          :label="editingRAG ? 'Update' : 'Create'" 
          @click="saveRAG"
          :disabled="!ragForm.name"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Version History Dialog -->
    <Dialog 
      v-model:visible="showVersionDialog" 
      header="Version History"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="version-history">
        <div 
          v-for="version in selectedRAGVersions" 
          :key="version.id"
          class="version-item"
          :class="{ current: version.current }"
        >
          <div class="version-info">
            <div class="version-header">
              <span class="version-number">Version {{ version.version }}</span>
              <Tag 
                v-if="version.current" 
                value="Current" 
                severity="success"
              />
            </div>
            <div class="version-details">
              <p>{{ version.description }}</p>
              <small>Created {{ formatDate(version.createdAt) }}</small>
            </div>
          </div>
          <div class="version-actions" v-if="!version.current">
            <Button 
              label="Rollback" 
              class="p-button-outlined p-button-sm"
              @click="rollbackToVersion(version)"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import FileUpload from 'primevue/fileupload'
import { format } from 'date-fns'

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)
const showVersionDialog = ref(false)
const editingRAG = ref(false)
const saving = ref(false)
const selectedRAGVersions = ref([])

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Syncing', value: 'syncing' }
]

// Form data
const ragForm = ref({
  name: '',
  description: '',
  files: [],
  textEntries: []
})

// Mock data
const rags = ref([
  {
    id: '1',
    name: 'Company Documentation',
    description: 'All company policies, procedures, and documentation',
    status: 'active',
    fileCount: 25,
    textCount: 12,
    storageUsed: 15728640, // bytes
    usageCount: 234,
    edgeSqlId: 'edge-sql-001',
    lastSync: new Date('2024-06-17T10:30:00'),
    updatedAt: new Date('2024-06-17T14:22:00'),
    currentVersion: 3,
    versions: [
      { id: 'v1', version: 1, description: 'Initial version', createdAt: new Date('2024-06-10'), current: false },
      { id: 'v2', version: 2, description: 'Added HR policies', createdAt: new Date('2024-06-15'), current: false },
      { id: 'v3', version: 3, description: 'Updated technical docs', createdAt: new Date('2024-06-17'), current: true }
    ],
    syncing: false
  },
  {
    id: '2',
    name: 'Product Knowledge Base',
    description: 'Product specifications, features, and user guides',
    status: 'active',
    fileCount: 18,
    textCount: 8,
    storageUsed: 8388608,
    usageCount: 156,
    edgeSqlId: 'edge-sql-002',
    lastSync: new Date('2024-06-16T16:45:00'),
    updatedAt: new Date('2024-06-16T16:45:00'),
    currentVersion: 2,
    versions: [
      { id: 'v1', version: 1, description: 'Initial product docs', createdAt: new Date('2024-06-12'), current: false },
      { id: 'v2', version: 2, description: 'Added new features', createdAt: new Date('2024-06-16'), current: true }
    ],
    syncing: false
  },
  {
    id: '3',
    name: 'Legal Documents',
    description: 'Contracts, terms of service, and legal templates',
    status: 'inactive',
    fileCount: 8,
    textCount: 3,
    storageUsed: 4194304,
    usageCount: 45,
    edgeSqlId: 'edge-sql-003',
    lastSync: new Date('2024-06-10T09:15:00'),
    updatedAt: new Date('2024-06-10T09:15:00'),
    currentVersion: 1,
    versions: [
      { id: 'v1', version: 1, description: 'Initial legal docs', createdAt: new Date('2024-06-10'), current: true }
    ],
    syncing: false
  }
])

// Computed properties
const filteredRAGs = computed(() => {
  let filtered = rags.value

  if (searchQuery.value) {
    filtered = filtered.filter(rag => 
      rag.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      rag.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(rag => rag.status === statusFilter.value)
  }

  return filtered
})

// Methods
const viewRAG = (rag: any) => {
  console.log('View RAG:', rag)
}

const editRAG = (rag: any) => {
  editingRAG.value = true
  ragForm.value = {
    name: rag.name,
    description: rag.description,
    files: [...rag.files] || [],
    textEntries: [...rag.textEntries] || []
  }
  showCreateDialog.value = true
}

const deleteRAG = (rag: any) => {
  if (confirm(`Are you sure you want to delete "${rag.name}"? This will also remove the associated Edge SQL database.`)) {
    const index = rags.value.findIndex(r => r.id === rag.id)
    if (index > -1) {
      rags.value.splice(index, 1)
    }
  }
}

const syncRAG = (rag: any) => {
  rag.syncing = true
  rag.status = 'syncing'
  
  // Simulate sync process
  setTimeout(() => {
    rag.syncing = false
    rag.status = 'active'
    rag.lastSync = new Date()
  }, 3000)
}

const openEdgeSQL = (edgeSqlId: string) => {
  // Open Edge SQL in new tab
  console.log('Open Edge SQL:', edgeSqlId)
}

const showVersionHistory = (rag: any) => {
  selectedRAGVersions.value = rag.versions
  showVersionDialog.value = true
}

const rollbackToVersion = (version: any) => {
  if (confirm(`Are you sure you want to rollback to version ${version.version}?`)) {
    console.log('Rollback to version:', version)
    showVersionDialog.value = false
  }
}

const onFileUpload = (event: any) => {
  const files = event.files
  files.forEach((file: File) => {
    ragForm.value.files.push({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    })
  })
}

const onFileRemove = (event: any) => {
  const file = event.file
  ragForm.value.files = ragForm.value.files.filter(f => f.file !== file)
}

const removeFile = (fileId: string) => {
  ragForm.value.files = ragForm.value.files.filter(f => f.id !== fileId)
}

const previewFile = (file: any) => {
  console.log('Preview file:', file)
}

const addTextEntry = () => {
  ragForm.value.textEntries.push({
    title: '',
    content: ''
  })
}

const removeTextEntry = (index: number) => {
  ragForm.value.textEntries.splice(index, 1)
}

const saveRAG = async () => {
  saving.value = true
  
  try {
    if (editingRAG.value) {
      // Update existing RAG
      console.log('Update RAG:', ragForm.value)
    } else {
      // Create new RAG
      const newRAG = {
        id: Date.now().toString(),
        name: ragForm.value.name,
        description: ragForm.value.description,
        status: 'active',
        fileCount: ragForm.value.files.length,
        textCount: ragForm.value.textEntries.length,
        storageUsed: ragForm.value.files.reduce((total, file) => total + file.size, 0),
        usageCount: 0,
        edgeSqlId: `edge-sql-${Date.now()}`,
        lastSync: new Date(),
        updatedAt: new Date(),
        currentVersion: 1,
        versions: [
          { id: 'v1', version: 1, description: 'Initial version', createdAt: new Date(), current: true }
        ],
        syncing: false
      }
      rags.value.push(newRAG)
    }
    
    closeDialog()
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingRAG.value = false
  ragForm.value = {
    name: '',
    description: '',
    files: [],
    textEntries: []
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  return format(date, 'MMM dd, yyyy HH:mm')
}
</script>

<style scoped>
.autorag-container {
  padding: 2rem;
  background-color: #000000;
  min-height: 100vh;
}

.autorag-header {
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

.filters-section {
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  width: 300px;
}

.autorag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.autorag-card {
  background-color: #111111;
  border: 1px solid #333333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #333333;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.2rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.card-content {
  padding: 1rem;
}

.description {
  color: #cccccc;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.rag-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.9rem;
}

.stat-item i {
  color: #007bff;
  width: 1rem;
}

.edge-sql-info {
  background-color: #1a1a1a;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.sql-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.sql-status i {
  color: #007bff;
}

.last-sync {
  color: #888888;
}

.version-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-version {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #333333;
}

.last-updated {
  color: #888888;
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
}

.autorag-dialog .dialog-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section h4 {
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.file-uploader {
  border: 2px dashed #333333;
  border-radius: 8px;
}

.upload-area {
  text-align: center;
  padding: 2rem;
  color: #888888;
}

.upload-area i {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 1rem;
}

.upload-area p {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.uploaded-files {
  margin-top: 1rem;
}

.uploaded-files h5 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #1a1a1a;
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
}

.file-info i {
  color: #007bff;
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

.text-entries {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-entry {
  border: 1px solid #333333;
  border-radius: 6px;
  padding: 1rem;
  background-color: #1a1a1a;
}

.entry-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.entry-title {
  flex: 1;
}

.version-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #333333;
  border-radius: 6px;
  background-color: #1a1a1a;
}

.version-item.current {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.version-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.version-number {
  color: #ffffff;
  font-weight: 600;
}

.version-details p {
  color: #cccccc;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.version-details small {
  color: #888888;
}

.w-full {
  width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .autorag-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

