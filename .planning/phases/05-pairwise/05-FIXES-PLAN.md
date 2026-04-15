# Phase 5 Review Fixes - Execution Plan

**Phase:** 05-FIXES  
**Name:** CodeRabbit Review Fixes  
**Goal:** Aplicar todas as correções sugeridas pelo CodeRabbit em commits separados

---

## Plan Overview

7 correções do CodeRabbit, cada uma em commit separado para histórico limpo.

---

## Tasks

### Task 1: Remover transições CSS (Fix 5)

**Arquivo:** `app/sort/components/IssueCard.tsx`

**Mudança:** Remover `transition-shadow` do card

**Commit:** `style: remove CSS transitions from IssueCard`

---

### Task 2: Corrigir discrepância de contagem (Fix 6)

**Arquivo:** `app/sort/page.tsx`

**Mudança:** `totalComparisons` = `MOCK_PAIRS.length`

**Commit:** `fix: align totalComparisons with mock data length`

---

### Task 3: Extrair getStatusColor para util (Fix 1)

**Arquivos:**
- Criar: `lib/utils.ts`
- Modificar: `IssueCard.tsx`, `IssuesTable.tsx`

**Commit:** `refactor: extract getStatusColor to shared utility`

---

### Task 4: Usar sessionStorage para issues (Fix 4 + 7)

**Arquivos:**
- `app/issues/components/IssuesTable.tsx` - salvar no sessionStorage
- `app/sort/page.tsx` - ler do sessionStorage

**Commit:** `feat: use sessionStorage for issue payload`

---

### Task 5: Corrigir gramática portuguesa (Fix 2)

**Arquivo:** `.planning/phases/05-pairwise/05-CONTEXT.md`

**Commit:** `docs: fix Portuguese grammar`

---

### Task 6: Adicionar language identifier (Fix 3)

**Arquivo:** `.planning/phases/05-pairwise/05-PLAN.md`

**Commit:** `docs: add language identifier to code block`

---

## Wave Structure

| Wave | Tasks | Rationale |
|------|-------|-----------|
| 1 | 1, 2 | Correções visuais/funcionais simples |
| 2 | 3 | Refactor util compartilhado |
| 3 | 4 | Feature sessionStorage |
| 4 | 5, 6 | Docs fixes |

## must_haves

- [ ] Todas as 6 correções aplicadas
- [ ] Cada correção em commit separado
- [ ] Lint passa em cada commit
- [ ] Build passa no final

## Notes

- Rodar `npm run lint` antes de cada commit
- Verificar build após wave 2 e 4
- Commits atômicos para facilitar rollback se necessário
