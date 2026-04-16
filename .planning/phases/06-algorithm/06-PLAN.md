# Phase 6: Algoritmo de Ordenação - Execution Plan

**Phase:** 06  
**Name:** Algoritmo de Ordenação  
**Goal:** Implementar Binary Insertion Sort com persistência, cache e funcionalidade de voltar

---

## Plan Overview

This plan implements the core sorting algorithm (Binary Insertion Sort) with:
- Full state persistence (localStorage)
- Comparison cache (avoid repeating)
- Undo history (10 steps)
- Session expiration (7 days)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  useBinaryInsertionSort Hook                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  State:                                                 ││
│  │  - issues: JiraIssue[] (input)                         ││
│  │  - sorted: JiraIssue[] (result parcial)                ││
│  │  - currentIndex: number (issue sendo inserida)         ││
│  │  - binarySearch: { low, high, mid }                    ││
│  │  - comparisonCache: Map<string, 'left'|'right'>        ││
│  │  - history: State[] (últimos 10 estados)               ││
│  │  - sessionId: string                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  API:                                                   ││
│  │  - currentPair: [issueA, issueB] | null                ││
│  │  - progress: { current, total }                        ││
│  │  - handleChoice(choice)                                ││
│  │  - sortedResult: JiraIssue[] | null                    ││
│  │  - isComplete: boolean                                 ││
│  │  - canSave: boolean                                    ││
│  │  - canUndo: boolean                                    ││
│  │  - handleUndo()                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Persistence:                                           ││
│  │  - loadFromStorage(sessionId)                          ││
│  │  - saveToStorage()                                     ││
│  │  - clearStorage()                                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Tasks

### Task 1: Create Binary Insertion Sort Hook Core

Create `app/sort/hooks/useBinaryInsertionSort.ts`

**Core Algorithm:**
```typescript
// State
const [sorted, setSorted] = useState<JiraIssue[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [binarySearch, setBinarySearch] = useState<{ low: number; high: number; mid: number } | null>(null);
const [comparisonCache] = useState(() => new Map<string, 'left' | 'right'>());

// Binary Insertion Sort logic
function startBinarySearch(newIssue: JiraIssue) {
  if (sorted.length === 0) {
    // First issue goes directly
    setSorted([newIssue]);
    setCurrentIndex(prev => prev + 1);
    return;
  }
  
  // Start binary search
  setBinarySearch({ low: 0, high: sorted.length - 1, mid: Math.floor(sorted.length / 2) });
}

function handleChoice(choice: 'left' | 'right') {
  if (!binarySearch) return;
  
  const { low, high, mid } = binarySearch;
  const comparedIssue = sorted[mid];
  
  // Cache this comparison
  const cacheKey = [currentIssue.key, comparedIssue.key].sort().join(':');
  comparisonCache.set(cacheKey, choice);
  
  if (choice === 'left') {
    // Current issue is MORE important (comes before)
    if (low >= mid) {
      // Found position: insert at low
      insertAt(newIssue, low);
    } else {
      // Continue search in left half
      setBinarySearch({ low, high: mid - 1, mid: Math.floor((low + mid - 1) / 2) });
    }
  } else {
    // Current issue is LESS important (comes after)
    if (high <= mid) {
      // Found position: insert at high + 1
      insertAt(newIssue, high + 1);
    } else {
      // Continue search in right half
      setBinarySearch({ low: mid + 1, high, mid: Math.floor((mid + 1 + high) / 2) });
    }
  }
}
```

**Requirements:**
- Initialize with issues array
- Binary Insertion Sort logic
- Cache comparisons
- Export: currentPair, progress, handleChoice, sortedResult, isComplete

**Files Modified:**
- `app/sort/hooks/useBinaryInsertionSort.ts` (new)

**Verification:**
- [ ] Hook initializes with correct state
- [ ] Binary search logic works correctly
- [ ] Issues are inserted in correct order
- [ ] Progress updates correctly

---

### Task 2: Add Persistence (localStorage)

Extend `useBinaryInsertionSort` with persistence.

**Storage Structure:**
```typescript
interface StoredSession {
  projectKey: string;
  issues: JiraIssue[];
  sorted: JiraIssue[];
  currentIndex: number;
  binarySearch: { low: number; high: number; mid: number } | null;
  comparisonCache: Array<[string, 'left' | 'right']>;
  history: Array<{
    sorted: JiraIssue[];
    currentIndex: number;
    binarySearch: { low: number; high: number; mid: number } | null;
  }>;
  timestamp: number;
}
```

**Functions:**
- `generateSessionId(projectKey: string, issueCount: number): string`
- `saveToStorage()` — salva estado atual
- `loadFromStorage(sessionId: string): StoredSession | null`
- `clearStorage()` — limpa sessão

**Auto-save:** A cada escolha do usuário

**Expiration:** 7 dias (verificar timestamp ao carregar)

**Files Modified:**
- `app/sort/hooks/useBinaryInsertionSort.ts`

**Verification:**
- [ ] Estado salvo após cada escolha
- [ ] Estado carregado corretamente ao retornar
- [ ] Sessão expirada após 7 dias
- [ ] Cache de comparações persistido

---

### Task 3: Add Undo History

Extend `useBinaryInsertionSort` com histórico.

**History State:**
```typescript
const [history, setHistory] = useState<Array<{
  sorted: JiraIssue[];
  currentIndex: number;
  binarySearch: { low: number; high: number; mid: number } | null;
}>>([]);
```

**Logic:**
- Antes de cada `handleChoice`, salvar estado atual no history
- History limit: 10 estados (usar `slice(-10)`)
- `handleUndo()` — restaura último estado do history
- `canUndo` — true se history.length > 0

**Files Modified:**
- `app/sort/hooks/useBinaryInsertionSort.ts`

**Verification:**
- [ ] Estado salvo no history antes de cada escolha
- [ ] Undo restaura estado anterior
- [ ] Limit de 10 estados respeitado
- [ ] canUndo atualizado corretamente

---

### Task 4: Update Sort Page to Use Real Algorithm

Modify `app/sort/page.tsx` to use the real hook.

**Changes:**
1. Replace mock data/state with `useBinaryInsertionSort`
2. Add "Voltar" button (condicional, só aparece se canUndo)
3. Add "Recomeçar" button no completion screen
4. Handle session expiration (show modal if expired)
5. Read issues from sessionStorage (payloadId)

**Integration:**
```typescript
const {
  currentPair,
  progress,
  handleChoice,
  sortedResult,
  isComplete,
  canSave,
  canUndo,
  handleUndo,
} = useBinaryInsertionSort(issues);
```

**Files Modified:**
- `app/sort/page.tsx`

**Verification:**
- [ ] Página usa hook real (não mock)
- [ ] Botão "Voltar" funciona
- [ ] Botão "Recomeçar" limpa e reinicia
- [ ] Sessão expirada mostra modal

---

### Task 5: Add Recomeçar Confirmation Modal

Create modal component para confirmação.

**Features:**
- Título: "Recomeçar ordenação?"
- Mensagem: "Todo o progresso será perdido. Tem certeza?"
- Botões: "Cancelar" / "Recomeçar"
- Aparece quando clica em "Recomeçar" no completion screen

**Files Modified:**
- `app/sort/components/ConfirmModal.tsx` (new)
- `app/sort/page.tsx`

**Verification:**
- [ ] Modal aparece ao clicar "Recomeçar"
- [ ] "Cancelar" fecha modal sem ação
- [ ] "Recomeçar" limpa estado e volta ao início

---

### Task 6: Add Session Expiration Check

Create session expiration handling.

**Features:**
- Ao carregar página, verificar se sessão existe e não expirou
- Se expirada (> 7 dias), mostrar modal: "Sessão expirada. Começar do zero?"
- Opções: "Sim" (limpa e começa) / "Não" (volta para issues)

**Files Modified:**
- `app/sort/page.tsx`
- `app/sort/components/ExpiredModal.tsx` (new)

**Verification:**
- [ ] Verifica expiração ao carregar
- [ ] Modal aparece se expirada
- [ ] "Sim" limpa e começa do zero
- [ ] "Não" redireciona para /issues

---

## Wave Structure

| Wave | Tasks | Dependencies |
|------|-------|--------------|
| 1 | 1 (Hook core) | None |
| 2 | 2 (Persistence), 3 (Undo) | Wave 1 |
| 3 | 4 (Sort page integration) | Wave 2 |
| 4 | 5 (Confirm modal), 6 (Expiration) | Wave 3 |

## must_haves (Verification Criteria)

- [ ] Binary Insertion Sort funciona corretamente
- [ ] Issues são ordenadas conforme comparações do usuário
- [ ] Estado persistido no localStorage
- [ ] Sessão recuperável após fechar navegador
- [ ] Botão "Voltar" funciona (até 10 vezes)
- [ ] Cache de comparações evita repetir
- [ ] Sessão expira após 7 dias
- [ ] "Recomeçar" limpa tudo e reinicia
- [ ] Página /sort usa algoritmo real (não mock)

## Phase Boundaries

| Phase | Responsibility |
|-------|----------------|
| **Phase 5** | UI Components, Layout |
| **Phase 6 (This)** | Algorithm, Persistence, Undo |
| **Phase 7** | Jira API Write (apply ranks) |

## Notes

- Focus on correctness of algorithm first
- Persistence adds complexity — test thoroughly
- Undo history is a "nice to have" but important for UX
- 7 days expiration balances UX vs. storage
- No animations (instant transitions — Phase 5 requirement)
