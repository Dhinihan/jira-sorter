# Phase 5: Frontend - Interface Pairwise - Context

**Gathered:** 2026-04-15

## Decisions

### 1. Conteúdo dos Cards
- **Nível:** Básico
- **Campos exibidos:** Título + Key + Status + Épico
- **Descrição:** Não mostrar descrição da issue
- **Racional:** Manter cards limpos e focados na decisão de prioridade

### 2. Controles de Comparação
- **Layout:** Botões grandes embaixo de cada card
- **Opções:** Esquerda ou Direita (apenas 2 opções)
- **Empate:** Não incluir opção de empate
- **Texto sugerido:** "← Esta é mais importante" / "Esta é mais importante →"

### 3. Atalhos de Teclado
- **Status:** Não implementar inicialmente
- **Nota:** Pode ser adicionado como funcionalidade futura

### 4. Visualização de Progresso
- **Estilo:** Simplão (apenas texto)
- **Formato:** "Comparação X de Y"
- **Extras:** Sem barra de progresso, sem estimativa de tempo

### 5. Animações & Transições
- **Tipo:** Instantâneo (sem animações)
- **Racional:** Foco em produtividade e velocidade

### 6. Controles Adicionais
- **Botão "Salvar":** Sim — permite pausar e continuar depois
- **Botão "Voltar":** Não
- **Preview ordenação parcial:** Não

## Claude's Discretion

- Cores dos botões (sugerir: verde para ação principal, cinza para secundária)
- Tamanho exato dos cards (sugerir: ocupar ~40% da tela cada, com espaço entre eles)
- Posicionamento do botão "Salvar" (sugerir: topo direito, discreto)
- Tipografia e espaçamentos (seguir padrão do Tailwind)
- Responsividade mobile (cards empilhados verticalmente em telas pequenas)

## 7. Algoritmo de Ordenação

**Algoritmo escolhido:** Binary Insertion Sort (adaptado para interação humana)

**Porquê:**
- Incremental — a cada comparação a lista fica mais ordenada
- Eficiente — O(n log n) comparações no total
- Parada segura — se parar no meio, elementos processados estão ordenados entre si
- Humano-friendly — só precisa comparar para encontrar posição de inserção

**Funcionamento:**
1. Mantém uma lista interna ordenada (inicialmente vazia)
2. Para cada nova issue (em ordem original do backlog):
   - Faz busca binária para encontrar posição correta na lista ordenada
   - Comparações são feitas via UI pairwise (humano decide)
3. Ao final (ou ao clicar "Salvar"), aplica ranks no Jira na ordem resultante

**Seleção de issues:** Ordem original do backlog (do Jira)

**Persistência:** Algoritmo mantém estado localmente; ao salvar, aplica todos os ranks no Jira de uma vez

## Deferred Ideas

- Atalhos de teclado (← → ou 1 2) — sugerido para funcionalidade futura
- Animações suaves (fade/slide) — pode ser adicionado depois
- Opção de empate entre issues
- Preview da lista ordenada parcial (antes de salvar)
- Botão "voltar" na comparação anterior
- Aplicação parcial no Jira a cada comparação (vs. só ao salvar)

---
*Context gathered for phase planning*
