# Fase 4: Busca de Issues (SSR) - Contexto

## Decisões de Implementação

### 1. Seleção de Projetos
**Decisão:** Dropdown simples com todos os projetos acessíveis
- Lista todos os projetos em um menu dropdown
- Sem busca/filtro (assumindo poucos projetos)

### 2. Filtro de Épicos
**Decisão:** Dropdown dinâmico + opção "Sem épico"
- Dropdown que atualiza quando muda o projeto selecionado
- Inclui opção "Sem épico" no final da lista para filtrar issues órfãs
- Dropdown desabilitado até selecionar um projeto

### 3. UI da Lista de Issues
**Decisão:** Tabela compacta estilo Jira
- Colunas: Key, Título, Status, Assignee, Épico
- Design compacto e profissional
- Fácil escanear visualmente

### 4. Preview de Quantidade
**Decisão:** Contagem + lista automática
- Mostra mensagem: "X issues encontradas"
- Carrega a tabela automaticamente em seguida
- Sem necessidade de clique adicional

### 5. Limite de Issues
**Decisão:** Paginação
- 100 issues por página (limite da Jira API)
- Botões "Anterior" / "Próximo" na parte inferior
- Mostra página atual (ex: "Página 1 de 3")

### 6. Estado de Loading
**Decisão:** Spinner simples
- Loading spinner no centro da área de resultados
- Sem texto adicional
- Desaparece quando os dados carregam

## Especificações Técnicas

### Server Actions Necessárias:
1. `getProjects()` - busca projetos acessíveis
2. `getEpics(projectKey)` - busca épicos de um projeto
3. `searchIssues(projectKey, epicKey?, page?)` - busca issues com JQL

### JQL Base:
```
status in ("To Do", "Backlog", "Open") AND sprint is EMPTY
```

### Campos da Tabela:
- **Key:** Código da issue (ex: BRA-123)
- **Título:** Summary da issue
- **Status:** Status atual (To Do, In Progress, etc.)
- **Assignee:** Nome do responsável (ou "Unassigned")
- **Épico:** Nome do épico vinculado (ou "-")

### Estados da Página:
1. **Sem projeto selecionado:** Mostra mensagem "Selecione um projeto"
2. **Loading:** Spinner central
3. **Vazio:** "Nenhuma issue encontrada com os filtros selecionados"
4. **Com dados:** Tabela com issues + paginação

## Colunas da Tabela

| Coluna | Campo Jira | Largura |
|--------|-----------|---------|
| Key | `key` | ~100px |
| Título | `fields.summary` | flex (maior) |
| Status | `fields.status.name` | ~120px |
| Assignee | `fields.assignee.displayName` | ~150px |
| Épico | `fields.parent?.fields.summary` | ~150px |

## Próximos Passos
- Criar Server Actions para buscar dados do Jira
- Implementar página `/issues` com filtros
- Criar componente de tabela reutilizável
- Adicionar paginação
