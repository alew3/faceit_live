<template>
  <div class="autorag-container">
    <!-- Header -->
    <div class="autorag-header">
      <h1>AutoRAG</h1>
      <div class="autorag-actions">
        <Button 
          icon="pi pi-plus" 
          label="Novo AutoRAG" 
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- AutoRAG List -->
    <div class="autorag-main">
      <Card>
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span>Seus AutoRAGs</span>
            <InputText 
              v-model="searchTerm" 
              placeholder="Buscar AutoRAGs..."
              class="w-20rem"
            />
          </div>
        </template>
        <template #content>
          <DataTable 
            :value="filteredAutoRAGs" 
            :paginator="true" 
            :rows="10"
            responsiveLayout="scroll"
          >
            <Column field="name" header="Nome" sortable>
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-database"></i>
                  {{ slotProps.data.name }}
                </div>
              </template>
            </Column>
            <Column field="description" header="Descrição" />
            <Column field="documentsCount" header="Documentos">
              <template #body="slotProps">
                <Badge :value="slotProps.data.documentsCount" />
              </template>
            </Column>
            <Column field="textsCount" header="Textos">
              <template #body="slotProps">
                <Badge :value="slotProps.data.textsCount" />
              </template>
            </Column>
            <Column field="storage" header="Armazenamento">
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <ProgressBar 
                    :value="slotProps.data.storageUsed" 
                    :showValue="false"
                    style="width: 100px"
                  />
                  <span class="text-sm">{{ slotProps.data.storageUsed }}%</span>
                </div>
              </template>
            </Column>
            <Column field="requests" header="Requisições">
              <template #body="slotProps">
                <Badge :value="slotProps.data.requests" severity="info" />
              </template>
            </Column>
            <Column field="lastUpdated" header="Última Atualização" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.lastUpdated) }}
              </template>
            </Column>
            <Column header="Ações">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-eye" 
                    class="p-button-rounded p-button-text"
                    @click="viewAutoRAG(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-rounded p-button-text"
                    @click="editAutoRAG(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-external-link" 
                    class="p-button-rounded p-button-text"
                    @click="goToEdgeSQL(slotProps.data)"
                    title="Ir para Edge SQL"
                  />
                  <Button 
                    icon="pi pi-history" 
                    class="p-button-rounded p-button-text"
                    @click="viewSnapshots(slotProps.data)"
                    title="Ver Snapshots"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-rounded p-button-text p-button-danger"
                    @click="deleteAutoRAG(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Create/Edit AutoRAG Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :header="editingAutoRAG ? 'Editar AutoRAG' : 'Novo AutoRAG'"
      :style="{ width: '70vw' }"
      :modal="true"
    >
      <TabView>
        <TabPanel header="Informações Básicas">
          <div class="flex flex-column gap-3">
            <div class="field">
              <label for="autoragName">Nome</label>
              <InputText 
                id="autoragName"
                v-model="autoragForm.name" 
                class="w-full"
              />
            </div>
            
            <div class="field">
              <label for="autoragDescription">Descrição</label>
              <Textarea 
                id="autoragDescription"
                v-model="autoragForm.description" 
                :autoResize="true"
                rows="3"
                class="w-full"
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Upload de Arquivos">
          <div class="flex flex-column gap-3">
            <FileUpload 
              name="documents"
              :multiple="true"
              accept=".pdf,.docx,.txt"
              :maxFileSize="10000000"
              @upload="onUpload"
              @select="onFileSelect"
            >
              <template #empty>
                <p>Arraste e solte arquivos aqui para fazer upload.</p>
                <p>Formatos suportados: PDF, DOCX, TXT</p>
              </template>
            </FileUpload>

            <div v-if="autoragForm.documents.length > 0">
              <h4>Documentos Carregados</h4>
              <div class="flex flex-column gap-2">
                <div 
                  v-for="(doc, index) in autoragForm.documents" 
                  :key="index"
                  class="flex align-items-center justify-content-between p-2 border-1 border-300 border-round"
                >
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-file"></i>
                    <span>{{ doc.name }}</span>
                    <Badge :value="formatFileSize(doc.size)" />
                  </div>
                  <div class="flex gap-2">
                    <Button 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-text p-button-sm"
                      @click="previewDocument(doc)"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text p-button-sm p-button-danger"
                      @click="removeDocument(index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Textos">
          <div class="flex flex-column gap-3">
            <div class="flex justify-content-between align-items-center">
              <h4>Textos Adicionados</h4>
              <Button 
                icon="pi pi-plus" 
                label="Adicionar Texto"
                @click="addNewText"
              />
            </div>

            <div 
              v-for="(text, index) in autoragForm.texts" 
              :key="index"
              class="text-item"
            >
              <Card>
                <template #title>
                  <div class="flex justify-content-between align-items-center">
                    <InputText 
                      v-model="text.title" 
                      placeholder="Título do texto"
                      class="w-20rem"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text p-button-danger"
                      @click="removeText(index)"
                    />
                  </div>
                </template>
                <template #content>
                  <Textarea 
                    v-model="text.content" 
                    :autoResize="true"
                    rows="5"
                    class="w-full"
                    placeholder="Conteúdo do texto..."
                  />
                </template>
              </Card>
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
          :label="editingAutoRAG ? 'Atualizar' : 'Criar'" 
          icon="pi pi-check"
          @click="saveAutoRAG"
        />
      </template>
    </Dialog>

    <!-- Snapshots Dialog -->
    <Dialog 
      v-model:visible="showSnapshotsDialog" 
      header="Snapshots"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <DataTable :value="snapshots">
        <Column field="version" header="Versão" />
        <Column field="date" header="Data">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.date) }}
          </template>
        </Column>
        <Column field="changes" header="Alterações" />
        <Column header="Ações">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button 
                icon="pi pi-history" 
                label="Rollback"
                class="p-button-sm"
                @click="rollbackToSnapshot(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>

<script>
export default {
  name: 'AutoRAG',
  data() {
    return {
      searchTerm: '',
      showCreateDialog: false,
      showSnapshotsDialog: false,
      editingAutoRAG: null,
      autoragForm: {
        name: '',
        description: '',
        documents: [],
        texts: []
      },
      autoRAGs: [
        {
          id: 1,
          name: 'Documentação Técnica',
          description: 'Base de conhecimento com documentação técnica da Azion',
          documentsCount: 15,
          textsCount: 8,
          storageUsed: 65,
          requests: 234,
          lastUpdated: new Date('2024-01-15'),
          edgeSQLId: 'sql-123'
        },
        {
          id: 2,
          name: 'Base de Conhecimento',
          description: 'Conhecimento geral sobre produtos e serviços',
          documentsCount: 23,
          textsCount: 12,
          storageUsed: 45,
          requests: 156,
          lastUpdated: new Date('2024-01-14'),
          edgeSQLId: 'sql-456'
        },
        {
          id: 3,
          name: 'Políticas da Empresa',
          description: 'Políticas internas e procedimentos',
          documentsCount: 8,
          textsCount: 5,
          storageUsed: 25,
          requests: 89,
          lastUpdated: new Date('2024-01-13'),
          edgeSQLId: 'sql-789'
        }
      ],
      snapshots: [
        {
          id: 1,
          version: 'v1.2.3',
          date: new Date('2024-01-15'),
          changes: 'Adicionados 3 novos documentos'
        },
        {
          id: 2,
          version: 'v1.2.2',
          date: new Date('2024-01-14'),
          changes: 'Atualizado texto sobre políticas'
        },
        {
          id: 3,
          version: 'v1.2.1',
          date: new Date('2024-01-13'),
          changes: 'Removido documento obsoleto'
        }
      ]
    }
  },
  computed: {
    filteredAutoRAGs() {
      if (!this.searchTerm) return this.autoRAGs
      
      return this.autoRAGs.filter(autorag => 
        autorag.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        autorag.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  methods: {
    viewAutoRAG(autorag) {
      this.editingAutoRAG = autorag
      this.autoragForm = {
        name: autorag.name,
        description: autorag.description,
        documents: [], // Would load actual documents
        texts: [] // Would load actual texts
      }
      this.showCreateDialog = true
    },
    editAutoRAG(autorag) {
      this.viewAutoRAG(autorag)
    },
    deleteAutoRAG(autorag) {
      if (confirm('Tem certeza que deseja deletar este AutoRAG? Esta ação não pode ser desfeita.')) {
        this.autoRAGs = this.autoRAGs.filter(a => a.id !== autorag.id)
        this.$toast.add({
          severity: 'success',
          summary: 'AutoRAG Deletado',
          detail: 'AutoRAG deletado com sucesso',
          life: 3000
        })
      }
    },
    goToEdgeSQL(autorag) {
      // Simulate navigation to Edge SQL
      this.$toast.add({
        severity: 'info',
        summary: 'Redirecionando',
        detail: `Redirecionando para Edge SQL: ${autorag.edgeSQLId}`,
        life: 3000
      })
    },
    viewSnapshots(autorag) {
      this.showSnapshotsDialog = true
    },
    rollbackToSnapshot(snapshot) {
      if (confirm(`Tem certeza que deseja fazer rollback para a versão ${snapshot.version}?`)) {
        this.$toast.add({
          severity: 'success',
          summary: 'Rollback Realizado',
          detail: `Rollback para versão ${snapshot.version} realizado com sucesso`,
          life: 3000
        })
        this.showSnapshotsDialog = false
      }
    },
    onFileSelect(event) {
      this.autoragForm.documents = [...this.autoragForm.documents, ...event.files]
    },
    onUpload(event) {
      this.$toast.add({
        severity: 'success',
        summary: 'Upload Concluído',
        detail: 'Arquivos enviados com sucesso',
        life: 3000
      })
    },
    removeDocument(index) {
      this.autoragForm.documents.splice(index, 1)
    },
    previewDocument(doc) {
      this.$toast.add({
        severity: 'info',
        summary: 'Visualizar Documento',
        detail: `Abrindo preview de: ${doc.name}`,
        life: 3000
      })
    },
    addNewText() {
      this.autoragForm.texts.push({
        title: '',
        content: ''
      })
    },
    removeText(index) {
      this.autoragForm.texts.splice(index, 1)
    },
    saveAutoRAG() {
      if (this.editingAutoRAG) {
        // Update existing AutoRAG
        const index = this.autoRAGs.findIndex(a => a.id === this.editingAutoRAG.id)
        this.autoRAGs[index] = {
          ...this.autoRAGs[index],
          name: this.autoragForm.name,
          description: this.autoragForm.description,
          documentsCount: this.autoragForm.documents.length,
          textsCount: this.autoragForm.texts.length,
          lastUpdated: new Date()
        }
      } else {
        // Create new AutoRAG
        const newAutoRAG = {
          id: Math.max(...this.autoRAGs.map(a => a.id)) + 1,
          name: this.autoragForm.name,
          description: this.autoragForm.description,
          documentsCount: this.autoragForm.documents.length,
          textsCount: this.autoragForm.texts.length,
          storageUsed: 0,
          requests: 0,
          lastUpdated: new Date(),
          edgeSQLId: `sql-${Date.now()}`
        }
        this.autoRAGs.push(newAutoRAG)
      }
      
      this.closeDialog()
      this.$toast.add({
        severity: 'success',
        summary: this.editingAutoRAG ? 'AutoRAG Atualizado' : 'AutoRAG Criado',
        detail: this.editingAutoRAG ? 'AutoRAG atualizado com sucesso' : 'AutoRAG criado com sucesso',
        life: 3000
      })
    },
    closeDialog() {
      this.showCreateDialog = false
      this.editingAutoRAG = null
      this.autoragForm = {
        name: '',
        description: '',
        documents: [],
        texts: []
      }
    },
    formatDate(date) {
      return date.toLocaleDateString('pt-BR')
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.autorag-container {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.autorag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.autorag-header h1 {
  margin: 0;
  color: #495057;
}

.autorag-actions {
  display: flex;
  gap: 1rem;
}

.autorag-main {
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

.text-item {
  margin-bottom: 1rem;
}
</style>

