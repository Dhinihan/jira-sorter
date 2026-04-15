# Phase 5: Frontend - Interface Pairwise - Execution Plan

**Phase:** 05  
**Name:** Frontend - Interface Pairwise  
**Goal:** Criar interface de comparação pairwise (duelo entre 2 issues) com algoritmo Binary Insertion Sort incremental

---

## Plan Overview

This plan implements a pairwise comparison interface where users compare two Jira issues at a time to establish priority order using Binary Insertion Sort algorithm.

**Key Decisions from Context:**
- Cards show: Título + Key + Status + Épico (no description)
- Controls: Large buttons below each card (Left/Right choice only, no tie)
- Progress: Simple text "Comparação X de Y" (no progress bar)
- Animations: None (instant transitions for productivity)
- Algorithm: Binary Insertion Sort with incremental ordering
- Save button: Saves state and applies ranks to Jira when clicked

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  /sort/page.tsx (Client Component)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Header: "Ordenar Issues - Projeto X"                   ││
│  │  Progress: "Comparação 5 de 23"                         ││
│  │  [Botão Salvar] → topo direito                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  IssueCard A    │         │  IssueCard B    │           │
│  │  ┌───────────┐  │         │  ┌───────────┐  │           │
│  │  │ Título    │  │         │  │ Título    │  │           │
│  │  │ Key       │  │         │  │ Key       │  │           │
│  │  │ Status    │  │         │  │ Status    │  │           │
│  │  │ Épico     │  │         │  │ Épico     │  │           │
│  │  └───────────┘  │         │  └───────────┘  │           │
│  │                 │         │                 │           │
│  │ [Esta é mais    │         │ [Esta é mais    │           │
│  │  importante →]  │         │  importante →]  │           │
│  └─────────────────┘         └─────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

State Management: useState + localStorage (for persistence)
Algorithm: Binary Insertion Sort (client-side)
```

---

## Tasks

### Task 1: Create IssueCard Component

Create `app/sort/components/IssueCard.tsx`

**Requirements:**
- Props: `issue: JiraIssue`, `onSelect: () => void`, `side: 'left' | 'right'`
- Display: Título, Key (com link para Jira), Status (badge colorido), Épico
- Button: "← Esta é mais importante" (left) / "Esta é mais importante →" (right)
- Styling: Card with border, shadow, hover states
- Responsive: Full width on mobile, ~45% width on desktop

**Files Modified:**
- `app/sort/components/IssueCard.tsx` (new)

**Verification:**
- [ ] Component renders with all props
- [ ] Link to Jira opens in new tab
- [ ] Button text correct for each side
- [ ] Responsive layout works

---

### Task 2: Create Binary Insertion Sort Hook

Create `app/sort/hooks/useBinaryInsertionSort.ts`

**Algorithm Implementation:**
```typescript
// State
const [sortedIssues, setSortedIssues] = useState<JiraIssue[]>([]);
const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
const [comparingWithIndex, setComparingWithIndex] = useState<number | null>(null);
const [comparisons, setComparisons] = useState<Array<{left: string, right: string, choice: 'left' | 'right'}>>([]);

// Binary search for insertion position
function findInsertionPosition(newIssue: JiraIssue, start: number, end: number): number {
  if (start >= end) return start;
  
  const mid = Math.floor((start + end) / 2);
  setComparingWithIndex(mid);
  // Wait for user choice via UI
  return -1; // Will be resolved after user choice
}

// Handle user choice
function handleChoice(choice: 'left' | 'right') {
  // If choice is 'left', new issue goes before compared issue
  // If choice is 'right', new issue goes after
  // Continue binary search or insert
}
```

**Requirements:**
- Initialize with empty sorted list
- For each new issue, perform binary search to find position
- Store comparisons for potential "resume" feature
- Export: currentPair (two issues to compare), handleChoice, progress stats

**Files Modified:**
- `app/sort/hooks/useBinaryInsertionSort.ts` (new)

**Verification:**
- [ ] Hook initializes correctly
- [ ] Binary search logic works
- [ ] State updates correctly after each choice
- [ ] Progress tracking accurate

---

### Task 3: Create Sort Page

Create `app/sort/page.tsx`

**Structure:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import IssueCard from './components/IssueCard';
import useBinaryInsertionSort from './hooks/useBinaryInsertionSort';

export default function SortPage() {
  // Get issues from URL params (passed from /issues page)
  // Or fetch if not provided
  
  // Use the sorting hook
  const { 
    currentPair, 
    handleChoice, 
    progress, 
    isComplete,
    sortedIssues 
  } = useBinaryInsertionSort(issues);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress and save button */}
      {/* Two IssueCards side by side */}
      {/* Completion screen when done */}
    </div>
  );
}
```

**Features:**
- Header with: Project name, Progress text, Save button (localStorage only)
- Two IssueCard components side by side (or stacked on mobile)
- Handle save: store state to localStorage + show confirmation
- Completion screen when all comparisons done
- NO Jira write operations in this phase

**Files Modified:**
- `app/sort/page.tsx` (new)
- `app/sort/components/` (directory)

**Verification:**
- [ ] Page loads with issues from params
- [ ] Shows correct progress "Comparação X de Y"
- [ ] Cards display side by side on desktop
- [ ] Cards stack on mobile
- [ ] Save button works and stores state

---

### Task 4: Add "Ordenar" Button to Issues Table

Modify `app/issues/components/IssuesTable.tsx`

**Changes:**
- Add button "Iniciar Ordenação" when issues are loaded
- On click: redirect to `/sort?issues=` with encoded issue list
- Pass issue IDs/keys via URL params

**Files Modified:**
- `app/issues/components/IssuesTable.tsx`

**Verification:**
- [ ] Button appears when issues are loaded
- [ ] Click redirects to /sort with correct params
- [ ] Issues are passed correctly

---

### Task 5: Handle Sort Completion and Local Save

Create completion flow in `app/sort/page.tsx`

**Features:**
- When isComplete: show "Ordenação Completa" screen
- Display: "Você comparou X issues em Y comparações"
- Preview: show ordered list (numbered 1, 2, 3...)
- Button "Ver no Jira" → opens Jira backlog in new tab (no write)
- Button "Voltar para Issues" → returns to /issues

**NO JIRA WRITE IN THIS PHASE** - Writing to Jira will be implemented in Phase 7.

**Local Persistence:**
- During sorting: auto-save state to localStorage every comparison
- "Salvar" button: manually trigger localStorage save + show confirmation
- On return: check localStorage for saved session, offer to resume

**Files Modified:**
- `app/sort/page.tsx`

**Verification:**
- [ ] Completion screen shows when done
- [ ] Correct stats displayed
- [ ] Preview list shows in correct order
- [ ] NO Server Action calls to Jira write API

---

## Wave Structure

| Wave | Tasks | Dependencies |
|------|-------|--------------|
| 1 | Task 1 (IssueCard), Task 2 (Hook) | None |
| 2 | Task 3 (Sort Page) | Wave 1 |
| 3 | Task 4 (IssuesTable button), Task 5 (Completion) | Wave 2 |

## must_haves (Verification Criteria)

- [ ] Two cards display side by side with issue info (title, key, status, epic)
- [ ] Buttons below each card allow choosing which is more important
- [ ] Progress shows "Comparação X de Y" correctly
- [ ] Binary Insertion Sort algorithm runs correctly
- [ ] No animations (instant transitions)
- [ ] Save button stores current state
- [ ] Completion screen shows ordered list
- [ ] Responsive layout (side-by-side desktop, stacked mobile)
- [ ] Link from IssuesTable to Sort page works

## Dependencies

- Requires issues to be loaded from Phase 4
- Uses JiraIssue type from `app/actions/jira.ts`
- Will integrate with Phase 6/7 for full rank application

## Notes

- Algorithm complexity: O(n log n) comparisons maximum
- For 20 issues: max ~87 comparisons
- For 50 issues: max ~283 comparisons
- State persisted in localStorage for resume capability
- Focus on simplicity and speed (no animations, instant transitions)
- **NO JIRA WRITE OPERATIONS** - This phase is UI/algorithm only
- Jira write will be implemented in Phase 7 (Aplicação de Rank no Jira)
