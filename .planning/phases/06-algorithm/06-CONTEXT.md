# Phase 6: Algoritmo de Ordenação - Context

**Gathered:** 2026-04-16

## Decisions

### 1. Estrutura do Hook

**API escolhida:**
```typescript
{
  currentPair: [JiraIssue, JiraIssue] | null,  // Par atual ou null se completo
  progress: { current: number, total: number }, // Progresso
  handleChoice: (choice: 'left' | 'right') => void, // Escolher
  sortedResult: JiraIssue[] | null,             // Resultado final
  isComplete: boolean,                          // Se terminou
  canSave: boolean,                             // Se pode salvar
  canUndo: boolean,                             // Se pode voltar
  handleUndo: () => void,                       // Função voltar
}
```

**Porquê:** Interface simples que dá tudo que a página /sort precisa, sem expor complexidade interna do algoritmo.

### 2. Algoritmo: Binary Insertion Sort

**Implementação:**
- Mantém lista `sorted` interna (inicialmente vazia)
- Para cada nova issue:
  1. Binary search para encontrar posição de inserção
  2. Comparar via UI pairwise (humano decide)
  3. Inserir na posição correta
- Complexidade: O(n log n) comparações

**Exemplo:**
- Issues: [A, B, C, D]
- Passo 1: A (primeiro, vai direto para sorted)
- Passo 2: Binary search B em [A] → compara B vs A → insere → sorted: [A, B] ou [B, A]
- Passo 3: Binary search C em [A, B] → compara C vs meio (A ou B) → continua busca → insere
- E assim por diante...

### 3. Persistência Completa

**Salvar no localStorage:**
- Estado completo do algoritmo (sorted, currentIndex, binarySearchState)
- Histórico de estados anteriores (para "voltar")
- Lista de issues originais
- Timestamp da última sessão

**Ganho de UX:** Usuário pode fechar navegador e continuar horas/dias depois exatamente onde parou.

### 4. Funcionalidade "Voltar"

**Histórico:** Até 10 estados anteriores (Opção B)

**Comportamento:**
- Cada escolha do usuário salva estado anterior no histórico
- Botão "Voltar" restaura estado anterior
- Histórico é uma pilha (LIFO)
- Quando chega em 10, remove o mais antigo

**Estado salvo para cada passo:**
- Lista sorted atual
- Índice da issue sendo inserida
- Estado da busca binária (low, high, mid)
- Progresso atual

### 5. Cache de Comparações

**Implementação:** Mapa de chave "issueA:issueB" → resultado

**Evita:** Comparar o mesmo par duas vezes (mesmo em sessões diferentes se recarregar)

**Chave:** `${key1}:${key2}` (ordenado alfabeticamente para consistência)

### 6. Expiração de Sessão

**Tempo:** 7 dias

**Comportamento:** Se usuário voltar após 7 dias, mostrar alerta "Sessão expirada. Começar do zero?"

### 7. Reiniciar

**Botão "Recomeçar":** Limpa tudo e volta ao início com as mesmas issues

**Confirmação:** Modal "Tem certeza? Todo progresso será perdido."

## Claude's Discretion

- Nome do hook: `useBinaryInsertionSort`
- Chave no localStorage: `jira-sorter-session-{projectKey}-{issueCount}`
- Cores do botão "Voltar": cinza (secundário), posição: header próximo ao "Salvar"
- Animação de transição: Nenhuma (instantâneo, conforme Fase 5)

## Deferred Ideas

- Preview da lista ordenada parcial durante o processo (mostrar sorted atual)
- Estatísticas de comparações (tempo médio por comparação, etc.)
- Exportar resultado como CSV
- Comparar múltiplas issues ao mesmo tempo (não pairwise)

---
*Context gathered for phase planning*
