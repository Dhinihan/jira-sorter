# CodeRabbit Review Fixes - Fase 4

**PR:** #2 - Busca de Issues (SSR)  
**Review Date:** 2026-04-15  
**Total Comments:** 11 (6 actionable, 5 nitpicks)

---

## 🚨 Critical Issues (MUST FIX)

### Issue 1: JQL Injection Vulnerability
**Arquivo:** `app/actions/jira.ts`  
**Linhas:** 268, 362-369, 374  
**Severidade:** 🔴 Alta

**Problema:** Valores de `projectKey` e `epicKey` são interpolados diretamente no JQL sem escaping, permitindo injection attacks.

**Solução:**
- Criar função helper `escapeJqlValue()`
- Quote todos os valores string no JQL
- Escapar aspas internas

**Implementação:**
```typescript
function escapeJqlValue(value: string): string {
  // Remove caracteres perigosos e quote o valor
  const escaped = value.replace(/["\\]/g, '\\$&');
  return `"${escaped}"`;
}
```

---

### Issue 2: Process.env no Cliente
**Arquivo:** `app/issues/components/IssuesTable.tsx`  
**Linhas:** 139-146  
**Severidade:** 🔴 Alta

**Problema:** Componente cliente tentando acessar `process.env.NEXT_PUBLIC_JIRA_DOMAIN`, mas o domínio está em cookie httpOnly.

**Solução:**
- Passar `jiraDomain` como prop do server component
- Ou construir URL no server action

**Implementação:**
```typescript
// IssuesTable.tsx - adicionar prop
interface IssuesTableProps {
  projectKey: string;
  epicKey: string;
  page: number;
  jiraDomain: string; // Nova prop
}
```

---

### Issue 3: SearchParams Promise (Next.js 16+)
**Arquivo:** `app/issues/page.tsx`  
**Linhas:** 8-30  
**Severidade:** 🟡 Média

**Problema:** Em Next.js 16+, `searchParams` é uma Promise e deve ser awaited.

**Solução:**
- Adicionar `await` em searchParams
- Atualizar tipagem da interface

**Implementação:**
```typescript
export default async function IssuesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ project?: string; epic?: string; page?: string }> 
}) {
  const params = await searchParams;
  // usar params.project, params.epic, etc.
}
```

---

## 🟡 Important Issues (SHOULD FIX)

### Issue 4: Hardcoded Custom Field ID
**Arquivo:** `app/actions/jira.ts`  
**Linha:** 374  
**Severidade:** 🟡 Média

**Problema:** `customfield_10014` hardcoded pode variar entre instâncias Jira.

**Solução:**
- Adicionar configuração via env var
- Ou descobrir dinamicamente via API `/rest/api/3/field`

**Implementação:**
```typescript
const EPIC_LINK_FIELD = process.env.JIRA_EPIC_FIELD_ID || "customfield_10014";
```

---

### Issue 5: TypeScript `any` Usages
**Arquivos:** `app/actions/jira.ts` (múltiplas linhas)  
**Severidade:** 🟡 Média

**Problema:** Uso de `any` em callbacks de map quebra type safety.

**Locais:**
- Linha 221-225: `projectsData.map((project: any)`
- Linha 299-303: `searchData.issues?.map((issue: any)`
- Linha 408-416: `searchData.issues?.map((issue: any)`

**Solução:**
- Criar interfaces `JiraProjectResponse`, `JiraSearchIssue`
- Substituir `any` pelas interfaces corretas

---

### Issue 6: Next.js Link Component
**Arquivos:** `app/page.tsx`, `app/issues/page.tsx`  
**Severidade:** 🟢 Baixa

**Problema:** Usando `<a>` para navegação interna ao invés de `<Link>` do Next.js.

**Solução:**
- Importar `Link` de `next/link`
- Substituir `<a href="/issues">` por `<Link href="/issues">`
- Substituir `<a href="/">` por `<Link href="/">`

---

## 🟢 Nitpicks (NICE TO HAVE)

### Issue 7: Função Puras Dentro de Componentes
**Arquivo:** `app/issues/components/IssuesTable.tsx`  
**Linhas:** 87-97  
**Severidade:** 🟢 Baixa

**Problema:** `getStatusColor` é recriada a cada render.

**Solução:**
- Mover para fora do componente (module scope)

---

### Issue 8: Erro de Loading Não Mostrado ao Usuário
**Arquivo:** `app/issues/components/ProjectSelect.tsx`  
**Linhas:** 37-38  
**Severidade:** 🟢 Baixa

**Problema:** Erro ao carregar épicos é logado no console mas não mostrado ao usuário.

**Solução:**
- Adicionar estado `epicsError`
- Mostrar mensagem de erro no UI

---

### Issue 9-11: Markdown Language Specifiers
**Arquivos:** `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/phases/04-issues/04-CONTEXT.md`  
**Severidade:** 🟢 Baixa

**Problema:** Code blocks sem language specifier.

**Solução:**
- Adicionar `text` ou `markdown` aos code blocks

---

## 📋 Plano de Execução

### Tasks

1. **Segurança JQL** - Criar escapeJqlValue e aplicar em todas as queries
2. **Process.env Cliente** - Passar jiraDomain como prop
3. **SearchParams Promise** - Adicionar await e atualizar tipos
4. **Custom Field Config** - Usar env var para customfield_10014
5. **Interfaces TypeScript** - Criar e aplicar interfaces no lugar de any
6. **Links Next.js** - Substituir <a> por <Link>
7. **Refactor Performance** - Mover getStatusColor para fora do componente
8. **Error Handling UX** - Adicionar epicsError state
9. **Markdown Lint** - Adicionar language specifiers

---

## ⚖️ Justificativas para NÃO Atender

### Nenhuma - Todas as issues devem ser atendidas

Todas as 11 issues são válidas e melhoram o código:
- **3 críticas** (segurança + funcionalidade)
- **3 importantes** (manutenibilidade + compatibilidade)
- **5 nitpicks** (performance + UX + lint)

Custo-benefício: Alto - são mudanças pequenas com impacto significativo.

---

## 🎯 Prioridade de Execução

1. Issues 1-3 (Críticas) - Segurança e funcionalidade
2. Issues 4-6 (Importantes) - Manutenibilidade
3. Issues 7-11 (Nitpicks) - Polish

**Tempo Estimado:** 30-45 minutos
