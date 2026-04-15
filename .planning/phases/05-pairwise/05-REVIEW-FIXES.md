# Phase 5 Review Fixes

Correções das sugestões do CodeRabbit - cada uma em commit separado.

---

## Fix 1: Extrair getStatusColor para util compartilhado

**Arquivos:** 
- Criar: `lib/utils.ts` (ou similar)
- Modificar: `app/sort/components/IssueCard.tsx`
- Modificar: `app/issues/components/IssuesTable.tsx`

**Mudanças:**
1. Criar função util `getStatusColor` em arquivo compartilhado
2. Remover implementação local de IssueCard.tsx
3. Remover implementação local de IssuesTable.tsx
4. Importar de lib/utils.ts em ambos

**Commit message:**
```
refactor: extract getStatusColor to shared utility

Avoids duplication between IssueCard and IssuesTable components.
```

---

## Fix 2: Corrigir português no 05-CONTEXT.md

**Arquivo:** `.planning/phases/05-pairwise/05-CONTEXT.md`

**Mudança:**
- "Porquê:" → "Por que:"

**Commit message:**
```
docs: fix Portuguese grammar in context file

"Porquê" → "Por que" (correct form).
```

---

## Fix 3: Adicionar language identifier no code block

**Arquivo:** `.planning/phases/05-pairwise/05-PLAN.md`

**Mudança:**
- Adicionar `text` no code block do diagrama ASCII

**Commit message:**
```
docs: add language identifier to markdown code block

Fixes markdownlint MD040 warning.
```

---

## Fix 4: Usar sessionStorage para passar issues

**Arquivo:** `app/issues/components/IssuesTable.tsx`

**Mudanças:**
1. Gerar payloadId único
2. Salvar issues no sessionStorage
3. Passar apenas domain e payloadId na URL

**Commit message:**
```
perf: use sessionStorage for issue payload

Avoids long URLs by storing issue keys in sessionStorage
and passing only a reference ID in the query string.
```

---

## Fix 5: Remover transições CSS

**Arquivo:** `app/sort/components/IssueCard.tsx`

**Mudanças:**
- Remover `transition-shadow` e outras classes de transição

**Commit message:**
```
style: remove CSS transitions from IssueCard

Phase 5 requirement: instant transitions, no animations.
```

---

## Fix 6: Corrigir discrepância de contagem

**Arquivo:** `app/sort/page.tsx`

**Mudanças:**
- `totalComparisons` deve usar `MOCK_PAIRS.length` (ou vice-versa)
- Garantir consistência entre progresso e condição de término

**Commit message:**
```
fix: align totalComparisons with actual mock data length

Fixes discrepancy between "Comparação X de 23" and actual
MOCK_PAIRS.length (3).
```

---

## Fix 7: Ler issues da URL/navigation state

**Arquivo:** `app/sort/page.tsx`

**Mudanças:**
1. Adicionar estado `issues` inicializado com MOCK_PAIRS
2. useEffect para ler issues do sessionStorage (via payloadId)
3. Atualizar currentPair para usar estado issues
4. Fallback para MOCK_PAIRS se não houver dados

**Commit message:**
```
feat: read issues from navigation state

Uses sessionStorage payload instead of hard-coded MOCK_PAIRS
when available. Falls back to mock data for development.
```

---

## Execution Order

1. Fix 2 (docs) - simples, sem dependências
2. Fix 3 (docs) - simples, sem dependências
3. Fix 1 (refactor) - cria util compartilhado
4. Fix 5 (style) - remove transições
5. Fix 6 (fix) - corrige contagem
6. Fix 7 (feat) - lê issues da URL
7. Fix 4 (perf) - otimiza IssuesTable

Ou em ordem de prioridade:
- Fix 5, 6, 7 (funcionalidades visíveis)
- Fix 1 (qualidade de código)
- Fix 4 (performance)
- Fix 2, 3 (docs)
