# Phase 5: Frontend - Interface Pairwise - Execution Plan

**Phase:** 05  
**Name:** Frontend - Interface Pairwise  
**Goal:** Criar interface visual de comparação pairwise (UI apenas, sem algoritmo)

---

## Plan Overview

This plan implements ONLY the visual interface for pairwise comparison. The algorithm (Binary Insertion Sort) will be implemented in Phase 6.

**Key Decisions from Context:**
- Cards show: Título + Key + Status + Épico (no description)
- Controls: Large buttons below each card (Left/Right choice only, no tie)
- Progress: Simple text "Comparação X de Y" (no progress bar)
- Animations: None (instant transitions for productivity)
- Save button: UI only (functionality in Phase 6)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  /sort/page.tsx (Client Component - UI ONLY)                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Header: "Ordenar Issues - Projeto X"                   ││
│  │  Progress: "Comparação 5 de 23" (mock/estático)         ││
│  │  [Botão Salvar] → UI only (Phase 6 implements)          ││
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

NOTE: Algorithm will be implemented in Phase 6
This phase is UI/Layout only
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

### Task 2: Create Sort Page Layout

Create `app/sort/page.tsx` (UI ONLY)

**Structure:**
```typescript
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IssueCard from './components/IssueCard';

export default function SortPage() {
  // Mock state for UI demonstration
  const [progress, setProgress] = useState({ current: 1, total: 20 });
  const [currentPair, setCurrentPair] = useState([issueA, issueB]);
  
  // Mock handlers - Phase 6 will implement real logic
  const handleChoice = (side: 'left' | 'right') => {
    // Just advance to next mock pair for UI demo
    console.log('Choice made:', side);
    // Update progress for visual feedback
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress and save button */}
      {/* Two IssueCards side by side */}
      {/* Mock completion screen */}
    </div>
  );
}
```

**Features:**
- Header with: Project name, Progress text (mock), Save button (UI only)
- Two IssueCard components side by side (or stacked on mobile)
- Mock handlers that just log/console (real logic in Phase 6)
- Mock completion screen when clicking through demo pairs

**Files Modified:**
- `app/sort/page.tsx` (new)
- `app/sort/components/` (directory)

**Verification:**
- [ ] Page loads with layout correct
- [ ] Shows progress text "Comparação X de Y"
- [ ] Cards display side by side on desktop
- [ ] Cards stack on mobile
- [ ] Buttons are clickable (mock behavior)

---

### Task 3: Add "Ordenar" Button to Issues Table

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

### Task 4: Mock Completion Screen

Create completion UI in `app/sort/page.tsx`

**Features:**
- Mock "Ordenação Completa" screen (triggered after N mock comparisons)
- Display: "Você comparou X issues em Y comparações" (static/mock)
- Preview: show mock ordered list (numbered 1, 2, 3...)
- Button "Ver no Jira" → opens Jira backlog in new tab (read-only)
- Button "Voltar para Issues" → returns to /issues
- Note: Real completion logic in Phase 6

**NO ALGORITHM IN THIS PHASE** - This is UI demonstration only.

**Files Modified:**
- `app/sort/page.tsx`

**Verification:**
- [ ] Completion screen UI shows
- [ ] Layout correct
- [ ] Buttons work (navigation only)

---

## Wave Structure

| Wave | Tasks | Dependencies |
|------|-------|--------------|
| 1 | Task 1 (IssueCard) | None |
| 2 | Task 2 (Sort Page Layout) | Wave 1 |
| 3 | Task 3 (IssuesTable button), Task 4 (Completion UI) | Wave 2 |

## must_haves (Verification Criteria)

- [ ] Two cards display side by side with issue info (title, key, status, epic)
- [ ] Buttons below each card exist and are clickable
- [ ] Progress shows "Comparação X de Y" (mock values OK)
- [ ] No animations (instant transitions)
- [ ] Save button exists (UI only)
- [ ] Completion screen shows ordered list (mock)
- [ ] Responsive layout (side-by-side desktop, stacked mobile)
- [ ] Link from IssuesTable to Sort page works

## What's NOT in This Phase

- ❌ Binary Insertion Sort algorithm (Phase 6)
- ❌ Real comparison logic (Phase 6)
- ❌ State persistence (Phase 6)
- ❌ Jira write operations (Phase 7)

## Phase Boundaries

| Phase | Responsibility |
|-------|----------------|
| **Phase 5 (This)** | UI Components, Layout, Visual Design |
| **Phase 6** | Binary Insertion Sort Algorithm, State Management |
| **Phase 7** | Jira API Write Operations |

## Notes

- This phase builds the visual interface only
- Use mock data and simple state for UI demonstration
- Phase 6 will replace mock logic with real Binary Insertion Sort
- Focus on: responsive design, clean layout, instant transitions
- Algorithm complexity discussion reserved for Phase 6 planning
