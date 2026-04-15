# Jira Sorter

## Visão Geral

Uma aplicação web que permite ordenar o backlog do Jira de forma interativa usando comparações pairwise (duelo entre tarefas). O sistema apresenta duas issues lado a lado, o usuário escolhe a mais prioritária, e o algoritmo aprende a ordem ideal. Ao final, aplica automaticamente o rank no Jira.

## Objetivo Principal

Resolver o problema de priorização de backlog do Jira de forma intuitiva e visual, permitindo que o usuário tome decisões simples ("esta ou aquela") que resultem em uma ordenação completa e otimizada do backlog.

## Stack Tecnológica

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Renderização:** SSR (Server-Side Rendering) + Server Components
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Hospedagem:** Vercel (frontend + API Routes)

### Nota sobre Arquitetura
Com Next.js na Vercel usando SSR:
- Server Components buscam dados do Jira diretamente no servidor
- Personal API Token configurado em variável de ambiente (seguro)
- Client Components cuidam da interatividade (pairwise comparison)
- Não é necessário OAuth (simplifica muito o fluxo)

### Backend (Serverless)
- **Plataforma:** Next.js API Routes (serverless functions)
- **Runtime:** Node.js (API Routes)
- **Linguagem:** TypeScript

### Integrações
- **Jira Cloud:** REST API v3
- **Autenticação:** Personal API Token (Basic Auth)
  - Email + Token no formato `email:token` (Base64)
  - Token salvo de forma segura (variável de ambiente no servidor)
  - Sem granularidade de escopos (usuário precisa ter permissões no Jira)

## Arquitetura

```
┌─────────────────────────────────────┐         ┌──────────────┐
│   Vercel                            │         │   Jira Cloud │
│   ┌──────────────┐ ┌──────────────┐ │         │   API        │
│   │  Next.js App │ │  API Routes  │◄├────────►│              │
│   │  (Frontend)  │ │  (Jira API)  │ │         │              │
│   └──────────────┘ └──────────────┘ │         │              │
└─────────────────────────────────────┘         └──────────────┘
        │
        │
        ▼
┌─────────────────┐
│   Variáveis     │
│   de Ambiente   │
└─────────────────┘
```

## Funcionalidades Principais

### Core
1. **Autenticação OAuth** com Jira (granular, com tela de permissões)
2. **Busca de issues** do backlog com filtros automáticos
3. **Comparação pairwise** (duelo entre 2 issues)
4. **Algoritmo de ordenação** (merge sort com comparações humanas)
5. **Aplicação de rank** no Jira (reordenar backlog automaticamente)
6. **Contador de progresso** visual

### Filtros
- **Obrigatórios:**
  - Status = pendentes (To Do, Backlog, etc.)
  - Não estão em sprint ativa
- **Opcionais:**
  - Filtro por épico
  - Filtro por projeto

### Campos exibidos nos cards
- Título da issue
- Número (ex: BRA-123)
- Épico (se houver)
- Status atual
- Due date (se houver)
- Link direto para o Jira

## Definição de Pronto (Definition of Done)

- [ ] Usuário configura Personal API Token do Jira
- [ ] Issues são buscadas com filtros corretos aplicados
- [ ] Interface mostra 2 cards lado a lado para comparação
- [ ] Usuário pode escolher qual issue é mais prioritária
- [ ] Sistema calcula a ordem completa do backlog
- [ ] Ordem é aplicada no Jira (alteração de rank)
- [ ] Contador de progresso mostra avanço (ex: "15 de 30 comparações")
- [ ] Design responsivo funciona em mobile e desktop
- [ ] Deploy funcional na Vercel (frontend + API)

## Restrições

- Jira Cloud apenas (não suporta Jira Server/Data Center)
- Necessita permissão de "rank" no projeto Jira
- Máximo de ~100 issues por ordenação (performance)
- Tokens armazenados apenas no localStorage (sessão do usuário)

## Riscos

1. **API Rate Limits** do Jira (10 req/s) - implementar throttling
2. **Permissões no Jira** - usuário precisa ter direito de alterar rank
3. **Complexidade O(n log n)** - ordenar muitas issues pode demorar
4. **Token sem granularidade** - usuário precisa ter todas as permissões necessárias no Jira

## Sucesso

O projeto será considerado sucesso quando:
- Usuário consegue ordenar backlog de 20+ issues em menos de 5 minutos
- Ordem aplicada no Jira persiste e é visualmente confirmada
- Interface é intuitiva (teste com usuário sem explicação prévia)
