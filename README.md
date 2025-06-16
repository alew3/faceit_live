# AI Studio - Mock Website

Este é um mock website para o AI Studio/AI Suite da Azion, desenvolvido com Vue.js e PrimeVue.

## Funcionalidades Implementadas

### 🤖 Chat
- Interface de chat com seleção de modelos (OpenAI, Anthropic, Azion Edge AI)
- Seleção rápida de prompts e RAGs
- Histórico de conversas com organização por data
- Funcionalidades de renomear, deletar e arquivar chats
- Compartilhamento de chats
- Sidebar com navegação entre conversas

### 📝 Prompts
- CRUD completo de prompts
- Organização por diretórios e sub-diretórios (até 5 níveis)
- Sistema de variáveis configuráveis (${variavel})
- Status ativo/inativo para cada prompt
- Estatísticas de uso
- Busca e filtros
- Interface similar ao Edge Functions

### 🗄️ AutoRAG
- Gestão de documentos e recursos RAG
- Upload de múltiplos arquivos (PDF, DOCX, TXT)
- Adição de textos manuais
- Sistema de snapshots para rollback
- Integração com Edge SQL
- Estatísticas de uso e armazenamento
- Atualização automática com versionamento

### ⚙️ Agent Builder
- Criação de 3 tipos de agentes:
  - **Interactive Agent**: Para chat direto
  - **API Agent**: Para uso via API (stateless)
  - **Workflow Agent**: Para automações
- Configuração de modelos e parâmetros (temperature, max tokens)
- Seleção de system prompts
- Integração com AutoRAG
- Seleção de ferramentas (tools)
- Configurações avançadas por tipo de agente

## Tecnologias Utilizadas

- **Vue 3** - Framework JavaScript
- **PrimeVue** - Biblioteca de componentes UI
- **Vue Router** - Roteamento
- **PrimeIcons** - Ícones
- **PrimeFlex** - Utilitários CSS
- **Vite** - Build tool

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse http://localhost:5173

## Estrutura do Projeto

```
src/
├── main.js          # Configuração principal e registro de componentes
├── App.vue          # Layout principal com sidebar e navegação
└── views/
    ├── Chat.vue         # Interface de chat
    ├── Prompts.vue      # Gestão de prompts
    ├── AutoRAG.vue      # Gestão de AutoRAG
    └── AgentBuilder.vue # Criação de agentes
```

## Funcionalidades Detalhadas

### Chat
- Seleção de modelos AI (Azion Edge AI, OpenAI, Anthropic)
- Integração com prompts salvos
- Uso de RAGs para contexto adicional
- Histórico persistente de conversas
- Interface responsiva com sidebar

### Prompts
- Organização hierárquica em pastas
- Variáveis dinâmicas com sintaxe ${variavel}
- Controle de status (ativo/inativo)
- Estatísticas de uso detalhadas
- Sistema de busca e filtros

### AutoRAG
- Upload de documentos múltiplos
- Editor de texto integrado
- Sistema de versionamento com snapshots
- Métricas de uso e armazenamento
- Integração direta com Edge SQL

### Agent Builder
- Templates para diferentes tipos de agentes
- Configuração avançada de parâmetros de IA
- Integração com prompts e RAGs existentes
- Seleção de ferramentas especializadas
- Configurações específicas por tipo de agente

## Próximos Passos

- Implementação de autenticação
- Integração com APIs reais da Azion
- Testes automatizados
- Deploy em produção
- Funcionalidades de colaboração em equipe

