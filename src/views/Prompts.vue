<template>
  <div class="prompts-container">
    <!-- Header -->
    <div class="prompts-header">
      <h1>Prompts</h1>
      <div class="prompts-actions">
        <Button 
          icon="pi pi-plus" 
          label="Novo Prompt" 
          @click="showCreateDialog = true"
        />
        <Button 
          icon="pi pi-folder-plus" 
          label="Nova Pasta" 
          class="p-button-outlined"
          @click="showCreateFolderDialog = true"
        />
      </div>
    </div>

    <div class="prompts-layout">
      <!-- Directory Tree -->
      <div class="prompts-sidebar">
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-folder"></i>
              Diretórios
            </div>
          </template>
          <template #content>
            <Tree 
              :value="directoryTree" 
              selectionMode="single"
              v-model:selectionKeys="selectedDirectory"
              @node-select="onDirectorySelect"
            />
          </template>
        </Card>
      </div>

      <!-- Prompts List -->
      <div class="prompts-main">
        <Card>
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>{{ currentDirectoryName }}</span>
              <div class="flex gap-2">
                <InputText 
                  v-model="searchTerm" 
                  placeholder="Buscar prompts..."
                  class="w-20rem"
                />
              </div>
            </div>
          </template>
          <template #content>
            <DataTable 
              :value="filteredPrompts" 
              :paginator="true" 
              :rows="10"
              responsiveLayout="scroll"
            >
              <Column field="name" header="Nome" sortable>
                <template #body="slotProps">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-file-edit"></i>
                    {{ slotProps.data.name }}
                  </div>
                </template>
              </Column>
              <Column field="description" header="Descrição" />
              <Column field="status" header="Status">
                <template #body="slotProps">
                  <Chip 
                    :label="slotProps.data.active ? 'Ativo' : 'Inativo'"
                    :class="slotProps.data.active ? 'p-chip-success' : 'p-chip-danger'"
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
                      @click="viewPrompt(slotProps.data)"
                    />
                    <Button 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text"
                      @click="editPrompt(slotProps.data)"
                    />
                    <Button 
                      icon="pi pi-copy" 
                      class="p-button-rounded p-button-text"
                      @click="duplicatePrompt(slotProps.data)"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text p-button-danger"
                      @click="deletePrompt(slotProps.data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>

    <!-- Create/Edit Prompt Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :header="editingPrompt ? 'Editar Prompt' : 'Novo Prompt'"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="promptName">Nome</label>
          <InputText 
            id="promptName"
            v-model="promptForm.name" 
            class="w-full"
          />
        </div>
        
        <div class="field">
          <label for="promptDescription">Descrição</label>
          <InputText 
            id="promptDescription"
            v-model="promptForm.description" 
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="promptDirectory">Diretório</label>
          <Dropdown 
            id="promptDirectory"
            v-model="promptForm.directory" 
            :options="flatDirectories"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecionar diretório"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="promptContent">Conteúdo do Prompt</label>
          <Textarea 
            id="promptContent"
            v-model="promptForm.content" 
            :autoResize="true"
            rows="10"
            class="w-full"
            placeholder="Digite o conteúdo do prompt aqui... Use ${variavel} para variáveis configuráveis."
          />
        </div>

        <div class="field">
          <div class="flex align-items-center gap-2">
            <ToggleButton 
              v-model="promptForm.active"
              onLabel="Ativo"
              offLabel="Inativo"
            />
            <label>Status</label>
          </div>
        </div>

        <div class="field">
          <label>Variáveis Detectadas</label>
          <div class="flex flex-wrap gap-2">
            <Chip 
              v-for="variable in detectedVariables"
              :key="variable"
              :label="variable"
              icon="pi pi-tag"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="closeDialog"
        />
        <Button 
          :label="editingPrompt ? 'Atualizar' : 'Criar'" 
          icon="pi pi-check"
          @click="savePrompt"
        />
      </template>
    </Dialog>

    <!-- Create Folder Dialog -->
    <Dialog 
      v-model:visible="showCreateFolderDialog" 
      header="Nova Pasta"
      :style="{ width: '30vw' }"
      :modal="true"
    >
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="folderName">Nome da Pasta</label>
          <InputText 
            id="folderName"
            v-model="folderForm.name" 
            class="w-full"
          />
        </div>
        
        <div class="field">
          <label for="parentFolder">Pasta Pai</label>
          <Dropdown 
            id="parentFolder"
            v-model="folderForm.parent" 
            :options="flatDirectories"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecionar pasta pai (opcional)"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="showCreateFolderDialog = false"
        />
        <Button 
          label="Criar" 
          icon="pi pi-check"
          @click="createFolder"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
export default {
  name: 'Prompts',
  data() {
    return {
      searchTerm: '',
      selectedDirectory: {},
      currentDirectoryPath: 'root',
      showCreateDialog: false,
      showCreateFolderDialog: false,
      editingPrompt: null,
      promptForm: {
        name: '',
        description: '',
        directory: 'root',
        content: '',
        active: true
      },
      folderForm: {
        name: '',
        parent: null
      },
      directoryTree: [
        {
          key: 'root',
          label: 'Root',
          icon: 'pi pi-folder',
          children: [
            {
              key: 'legal',
              label: 'Legal',
              icon: 'pi pi-folder',
              children: [
                {
                  key: 'legal-contracts',
                  label: 'Contratos',
                  icon: 'pi pi-folder'
                }
              ]
            },
            {
              key: 'hr',
              label: 'RH',
              icon: 'pi pi-folder'
            },
            {
              key: 'engineering',
              label: 'Engenharia',
              icon: 'pi pi-folder',
              children: [
                {
                  key: 'eng-backend',
                  label: 'Backend',
                  icon: 'pi pi-folder'
                },
                {
                  key: 'eng-frontend',
                  label: 'Frontend',
                  icon: 'pi pi-folder'
                }
              ]
            }
          ]
        }
      ],
      prompts: [
        {
          id: 1,
          name: 'Assistente Geral',
          description: 'Prompt para assistente geral de IA',
          directory: 'root',
          content: 'Você é um assistente útil e prestativo. Responda às perguntas do usuário de forma clara e concisa.',
          active: true,
          usage: 45,
          lastUsed: new Date('2024-01-15'),
          variables: []
        },
        {
          id: 2,
          name: 'Análise de Contrato',
          description: 'Prompt para análise de contratos legais',
          directory: 'legal-contracts',
          content: 'Analise o seguinte contrato: ${contract_content}. Identifique pontos importantes, riscos e recomendações.',
          active: true,
          usage: 23,
          lastUsed: new Date('2024-01-14'),
          variables: ['contract_content']
        },
        {
          id: 3,
          name: 'Code Review',
          description: 'Prompt para revisão de código',
          directory: 'eng-backend',
          content: 'Revise o seguinte código ${language}: ${code}. Identifique problemas, sugestões de melhoria e boas práticas.',
          active: true,
          usage: 67,
          lastUsed: new Date('2024-01-16'),
          variables: ['language', 'code']
        },
        {
          id: 4,
          name: 'Entrevista Técnica',
          description: 'Prompt para conduzir entrevistas técnicas',
          directory: 'hr',
          content: 'Conduza uma entrevista técnica para a posição de ${position}. Faça perguntas relevantes sobre ${skills}.',
          active: false,
          usage: 12,
          lastUsed: new Date('2024-01-10'),
          variables: ['position', 'skills']
        }
      ]
    }
  },
  computed: {
    currentDirectoryName() {
      if (this.currentDirectoryPath === 'root') return 'Todos os Prompts'
      const path = this.currentDirectoryPath.split('-')
      return path[path.length - 1].charAt(0).toUpperCase() + path[path.length - 1].slice(1)
    },
    filteredPrompts() {
      let filtered = this.prompts
      
      if (this.currentDirectoryPath !== 'root') {
        filtered = filtered.filter(p => p.directory === this.currentDirectoryPath)
      }
      
      if (this.searchTerm) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }
      
      return filtered
    },
    flatDirectories() {
      const flatten = (nodes, prefix = '') => {
        let result = []
        nodes.forEach(node => {
          result.push({
            label: prefix + node.label,
            value: node.key
          })
          if (node.children) {
            result = result.concat(flatten(node.children, prefix + node.label + ' / '))
          }
        })
        return result
      }
      return flatten(this.directoryTree)
    },
    detectedVariables() {
      const content = this.promptForm.content
      const matches = content.match(/\$\{([^}]+)\}/g)
      return matches ? matches.map(match => match.slice(2, -1)) : []
    }
  },
  methods: {
    onDirectorySelect(node) {
      this.currentDirectoryPath = node.key
    },
    viewPrompt(prompt) {
      this.editingPrompt = prompt
      this.promptForm = { ...prompt }
      this.showCreateDialog = true
    },
    editPrompt(prompt) {
      this.editingPrompt = prompt
      this.promptForm = { ...prompt }
      this.showCreateDialog = true
    },
    duplicatePrompt(prompt) {
      const newPrompt = {
        ...prompt,
        id: Math.max(...this.prompts.map(p => p.id)) + 1,
        name: prompt.name + ' (Cópia)',
        usage: 0,
        lastUsed: new Date()
      }
      this.prompts.push(newPrompt)
      this.$toast.add({
        severity: 'success',
        summary: 'Prompt Duplicado',
        detail: 'Prompt duplicado com sucesso',
        life: 3000
      })
    },
    deletePrompt(prompt) {
      if (confirm('Tem certeza que deseja deletar este prompt?')) {
        this.prompts = this.prompts.filter(p => p.id !== prompt.id)
        this.$toast.add({
          severity: 'success',
          summary: 'Prompt Deletado',
          detail: 'Prompt deletado com sucesso',
          life: 3000
        })
      }
    },
    savePrompt() {
      if (this.editingPrompt) {
        // Update existing prompt
        const index = this.prompts.findIndex(p => p.id === this.editingPrompt.id)
        this.prompts[index] = { ...this.promptForm, variables: this.detectedVariables }
      } else {
        // Create new prompt
        const newPrompt = {
          ...this.promptForm,
          id: Math.max(...this.prompts.map(p => p.id)) + 1,
          usage: 0,
          lastUsed: new Date(),
          variables: this.detectedVariables
        }
        this.prompts.push(newPrompt)
      }
      
      this.closeDialog()
      this.$toast.add({
        severity: 'success',
        summary: this.editingPrompt ? 'Prompt Atualizado' : 'Prompt Criado',
        detail: this.editingPrompt ? 'Prompt atualizado com sucesso' : 'Prompt criado com sucesso',
        life: 3000
      })
    },
    createFolder() {
      // Implementation for creating folders would go here
      this.showCreateFolderDialog = false
      this.$toast.add({
        severity: 'success',
        summary: 'Pasta Criada',
        detail: 'Pasta criada com sucesso',
        life: 3000
      })
    },
    closeDialog() {
      this.showCreateDialog = false
      this.editingPrompt = null
      this.promptForm = {
        name: '',
        description: '',
        directory: 'root',
        content: '',
        active: true
      }
    },
    formatDate(date) {
      return date.toLocaleDateString('pt-BR')
    }
  }
}
</script>

<style scoped>
.prompts-container {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.prompts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.prompts-header h1 {
  margin: 0;
  color: #495057;
}

.prompts-actions {
  display: flex;
  gap: 1rem;
}

.prompts-layout {
  display: flex;
  flex: 1;
  gap: 1rem;
  min-height: 0;
}

.prompts-sidebar {
  width: 300px;
}

.prompts-main {
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

.p-chip-success {
  background-color: #d4edda;
  color: #155724;
}

.p-chip-danger {
  background-color: #f8d7da;
  color: #721c24;
}
</style>

