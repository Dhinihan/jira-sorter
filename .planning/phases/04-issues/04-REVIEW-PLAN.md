# Plano de Correções - CodeRabbit Review

**Fase:** 4 (Review Fixes)  
**Origem:** PR #2 - CodeRabbit Review  
**Tasks:** 9  
**Tempo Estimado:** 45 minutos

---

## 🚨 Tasks Críticas

### Task 1: Fix JQL Injection Vulnerability
**Tipo:** Security Fix  
**Arquivo:** `app/actions/jira.ts`  
**Tempo:** 10 min

**Implementação:**
- Criar função `escapeJqlValue(value: string): string`
- Aplicar em `getEpics()` (linha 268)
- Aplicar em `searchIssues()` (linhas 362-369)
- Atualizar customfield_10014 para usar env var (linha 374)

**Critérios:**
- [ ] JQL quotes valores corretamente
- [ ] Aspas internas escapadas
- [ ] Testado com valores especiais

---

### Task 2: Fix Process.env in Client Component
**Tipo:** Bug Fix  
**Arquivos:** `app/issues/components/IssuesTable.tsx`, `app/issues/page.tsx`  
**Tempo:** 8 min

**Implementação:**
- Adicionar prop `jiraDomain: string` em IssuesTableProps
- Passar domain do server component (page.tsx)
- Remover process.env do componente cliente

**Critérios:**
- [ ] Links para Jira funcionam corretamente
- [ ] Sem uso de process.env no cliente

---

### Task 3: Fix SearchParams Promise (Next.js 16+)
**Tipo:** Compatibility Fix  
**Arquivo:** `app/issues/page.tsx`  
**Tempo:** 5 min

**Implementação:**
- Atualizar interface IssuesPageProps
- Adicionar `await searchParams`
- Usar params desestruturado

**Critérios:**
- [ ] Compatível com Next.js 16+
- [ ] Sem warnings de tipo

---

## 🟡 Tasks Importantes

### Task 4: Create TypeScript Interfaces
**Tipo:** Type Safety  
**Arquivo:** `app/actions/jira.ts`  
**Tempo:** 8 min

**Implementação:**
- Criar `JiraProjectResponse` interface
- Criar `JiraSearchIssue` interface
- Substituir `any` por interfaces em 3 lugares

**Critérios:**
- [ ] Sem uso de `any` nos callbacks
- [ ] TypeScript compila sem erros

---

### Task 5: Use Next.js Link Component
**Tipo:** Best Practice  
**Arquivos:** `app/page.tsx`, `app/issues/page.tsx`  
**Tempo:** 5 min

**Implementação:**
- Importar `Link from "next/link"`
- Substituir `<a href="/issues">` por `<Link href="/issues">`
- Substituir `<a href="/">` por `<Link href="/">`

**Critérios:**
- [ ] Navegação client-side funciona
- [ ] Prefetch ativo

---

## 🟢 Tasks Nitpick

### Task 6: Move Pure Function Outside Component
**Tipo:** Performance  
**Arquivo:** `app/issues/components/IssuesTable.tsx`  
**Tempo:** 3 min

**Implementação:**
- Mover `getStatusColor` para fora do componente IssuesTable
- Manter mesma assinatura

**Critérios:**
- [ ] Função no module scope
- [ ] Componente continua funcionando

---

### Task 7: Add Error State for Epic Loading
**Tipo:** UX Improvement  
**Arquivo:** `app/issues/components/ProjectSelect.tsx`  
**Tempo:** 5 min

**Implementação:**
- Adicionar estado `epicsError`
- Setar erro no catch block
- Renderizar mensagem de erro no UI

**Critérios:**
- [ ] Erro visível ao usuário
- [ ] Mensagem clara

---

### Task 8: Add Language Specifiers to Markdown
**Tipo:** Lint  
**Arquivos:** `.planning/PROJECT.md`, `.planning/ROADMAP.md`  
**Tempo:** 3 min

**Implementação:**
- Adicionar `text` a code blocks ASCII
- 3 arquivos, 3 blocks total

**Critérios:**
- [ ] Markdown lint passa

---

## 🎯 Ordem de Execução

1. Task 1 (JQL Security) - CRÍTICO
2. Task 2 (Process.env) - CRÍTICO
3. Task 3 (SearchParams) - CRÍTICO
4. Task 4 (TypeScript) - Importante
5. Task 5 (Links) - Importante
6. Tasks 6-8 (Polish) - Nitpicks

---

## 📝 Commit Message Sugerido

```text
fix(phase-4): address CodeRabbit review comments

Security:
- Add JQL escaping to prevent injection attacks
- Remove process.env access from client component

Compatibility:
- Fix searchParams Promise handling for Next.js 16+

Code Quality:
- Replace 'any' with proper TypeScript interfaces
- Use Next.js Link component for navigation
- Move pure functions outside components
- Add error handling for epic loading
- Add markdown language specifiers
```
