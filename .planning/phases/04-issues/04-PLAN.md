# Fase 4: Busca de Issues (SSR) - Plano de Execução

**Fase:** 4  
**Nome:** Busca de Issues (SSR)  
**Duração Estimada:** 60 minutos  
**Status:** 🟡 Em Planejamento

---

## 📋 Tarefas

### Task 1: Criar Server Action `getProjects`
**Tipo:** Server Action  
**Complexidade:** Média  
**Dependências:** Nenhuma

**Descrição:**
Criar Server Action para buscar todos os projetos acessíveis ao usuário na API do Jira.

**Implementação:**
- Endpoint Jira: `GET /rest/api/3/project`
- Retornar: array de projetos com `key`, `name`, `avatarUrls`
- Tratar erros de autenticação
- Cache por 5 minutos (React `cache`)

**Arquivos:**
- `app/actions/jira.ts` (adicionar função)

**Critérios de Aceitação:**
- [ ] Retorna lista de projetos acessíveis
- [ ] Trata erro 401 (token inválido)
- [ ] Cache funciona corretamente

---

### Task 2: Criar Server Action `getEpics`
**Tipo:** Server Action  
**Complexidade:** Média  
**Dependências:** Task 1

**Descrição:**
Criar Server Action para buscar épicos de um projeto específico.

**Implementação:**
- Endpoint Jira: `POST /rest/api/3/search` com JQL
- JQL: `project = {projectKey} AND issuetype = Epic ORDER BY created DESC`
- Retornar: array de épicos com `key`, `summary`, `id`
- Limite: 50 épicos

**Arquivos:**
- `app/actions/jira.ts` (adicionar função)

**Critérios de Aceitação:**
- [ ] Busca épicos do projeto informado
- [ ] Retorna array vazio se projeto não tiver épicos
- [ ] Inclui campo id para filtro

---

### Task 3: Criar Server Action `searchIssues`
**Tipo:** Server Action  
**Complexidade:** Alta  
**Dependências:** Task 1, Task 2

**Descrição:**
Criar Server Action para buscar issues do backlog com filtros e paginação.

**Implementação:**
- Endpoint Jira: `POST /rest/api/3/search`
- JQL base: `status in ("To Do", "Backlog", "Open") AND sprint is EMPTY`
- Filtros opcionais:
  - `project = {projectKey}` (obrigatório)
  - `"Epic Link" = {epicKey}` ou `"Epic Link" is EMPTY` (opcional)
- Paginação: `maxResults=100`, `startAt={page * 100}`
- Retornar: issues + total + página atual

**Arquivos:**
- `app/actions/jira.ts` (adicionar função)

**Critérios de Aceitação:**
- [ ] Aplica filtros obrigatórios (status, sem sprint)
- [ ] Aplica filtro de projeto
- [ ] Aplica filtro de épico (quando informado)
- [ ] Retorna paginação correta (total, página atual)
- [ ] Limita a 100 issues por página

---

### Task 4: Criar Página `/issues` com Filtros
**Tipo:** Server Component  
**Complexidade:** Alta  
**Dependências:** Task 1, Task 2, Task 3

**Descrição:**
Criar página principal de busca com formulário de filtros.

**Implementação:**
- Server Component que carrega projetos no SSR
- Formulário com:
  - Dropdown de projetos (required)
  - Dropdown de épicos (optional, dinâmico)
  - Checkbox "Sem épico" (opcional)
  - Botão "Buscar Issues"
- Estados:
  - Sem projeto: mensagem "Selecione um projeto"
  - Loading: spinner central
  - Com dados: mostrar contagem + tabela

**Arquivos:**
- `app/issues/page.tsx` (novo)
- `app/issues/components/ProjectSelect.tsx` (novo - Client Component)
- `app/issues/components/EpicSelect.tsx` (novo - Client Component)

**Critérios de Aceitação:**
- [ ] Dropdown de projetos carrega no SSR
- [ ] Dropdown de épicos atualiza ao trocar projeto
- [ ] Checkbox "Sem épico" funciona
- [ ] Botão "Buscar" dispara a busca
- [ ] Estados de loading funcionam

---

### Task 5: Criar Componente `IssuesTable`
**Tipo:** Client Component  
**Complexidade:** Média  
**Dependências:** Task 4

**Descrição:**
Criar componente de tabela para exibir as issues.

**Implementação:**
- Tabela HTML com Tailwind
- Colunas: Key, Título, Status, Assignee, Épico
- Estilo compacto (padding pequeno, fonte 14px)
- Cores de status (verde, amarelo, cinza)
- Link para issue no Jira (abre em nova aba)

**Arquivos:**
- `app/issues/components/IssuesTable.tsx` (novo)

**Critérios de Aceitação:**
- [ ] Tabela exibe todas as colunas
- [ ] Status tem cores diferentes
- [ ] Key é link clicável para Jira
- [ ] Assignee mostra nome ou "Unassigned"
- [ ] Épico mostra nome ou "-"

---

### Task 6: Implementar Paginação
**Tipo:** Client Component  
**Complexidade:** Baixa  
**Dependências:** Task 5

**Descrição:**
Adicionar controles de paginação na tabela.

**Implementação:**
- Botões "Anterior" / "Próximo"
- Texto "Página X de Y"
- Desabilitar "Anterior" na primeira página
- Desabilitar "Próximo" na última página
- Manter filtros ao trocar página

**Arquivos:**
- `app/issues/components/Pagination.tsx` (novo)
- `app/issues/page.tsx` (atualizar)

**Critérios de Aceitação:**
- [ ] Paginação mostra página atual e total
- [ ] Botões funcionam corretamente
- [ ] Estados de borda funcionam (primeira/última página)
- [ ] Filtros se mantêm ao mudar página

---

### Task 7: Adicionar ao Menu/Header
**Tipo:** UI  
**Complexidade:** Baixa  
**Dependências:** Task 4

**Descrição:**
Adicionar link para página de issues no header/menu.

**Implementação:**
- Adicionar link "Issues" no header da página principal
- Mostrar só quando usuário estiver conectado
- Link ativo quando na página /issues

**Arquivos:**
- `app/page.tsx` (atualizar header)

**Critérios de Aceitação:**
- [ ] Link aparece quando conectado
- [ ] Link funciona corretamente
- [ ] Indicação visual de página ativa

---

## 📊 Resumo

| Task | Tipo | Complexidade | Tempo Est. |
|------|------|--------------|------------|
| 1 | Server Action | Média | 15 min |
| 2 | Server Action | Média | 15 min |
| 3 | Server Action | Alta | 20 min |
| 4 | Page + Components | Alta | 25 min |
| 5 | Component | Média | 15 min |
| 6 | Component | Baixa | 10 min |
| 7 | UI | Baixa | 5 min |

**Total Estimado:** ~105 minutos

---

## 🎯 Entregáveis da Fase

- [ ] Server Actions para buscar projetos, épicos e issues
- [ ] Página `/issues` com filtros funcionais
- [ ] Tabela de issues estilo Jira
- [ ] Paginação de 100 em 100
- [ ] Estados de loading e empty
- [ ] Link no header principal

---

## 📝 Notas

- Usar React Server Components para carregar dados iniciais
- Usar Client Components para interatividade (dropdowns, paginação)
- Implementar cache nas Server Actions
- Tratar erros de API do Jira (rate limit, auth)
