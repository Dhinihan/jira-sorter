# Fase 4: Busca de Issues (SSR) - Resumo

**Fase:** 4  
**Nome:** Busca de Issues (SSR)  
**Status:** 🟢 Planejada - Pronta para Execução

---

## 📋 Decisões do Contexto

1. **Seleção de Projetos:** Dropdown simples
2. **Filtro de Épicos:** Dropdown dinâmico + opção "Sem épico"
3. **UI da Lista:** Tabela compacta estilo Jira
4. **Preview:** Contagem + lista automática
5. **Limite:** Paginação (100 por página)
6. **Loading:** Spinner simples

---

## 📦 Entregáveis

- Server Actions: `getProjects`, `getEpics`, `searchIssues`
- Página `/issues` com filtros
- Componente `IssuesTable` (tabela compacta)
- Componente `Pagination` (100 por página)
- Link no header principal

---

## 🔧 Tasks (7 total)

| # | Task | Tipo | Complexidade |
|---|------|------|--------------|
| 1 | Criar Server Action `getProjects` | Server Action | Média |
| 2 | Criar Server Action `getEpics` | Server Action | Média |
| 3 | Criar Server Action `searchIssues` | Server Action | Alta |
| 4 | Criar Página `/issues` com Filtros | Server Component | Alta |
| 5 | Criar Componente `IssuesTable` | Client Component | Média |
| 6 | Implementar Paginação | Client Component | Baixa |
| 7 | Adicionar ao Menu/Header | UI | Baixa |

---

## 🚀 Próximo Passo

Executar a fase usando: `/gsd:execute-phase 4`

Ou executar manualmente seguindo as tasks do PLAN.md.
