# Jira Sorter

## Visão Geral

Uma aplicação web que permite ordenar o backlog do Jira de forma interativa usando comparações pairwise (duelo entre tarefas). O sistema apresenta duas issues lado a lado, o usuário escolhe a mais prioritária, e o algoritmo aprende a ordem ideal. Ao final, aplica automaticamente o rank no Jira.

## Objetivo Principal

Resolver o problema de priorização de backlog do Jira de forma intuitiva e visual, permitindo que o usuário tome decisões simples ("esta ou aquela") que resultem em uma ordenação completa e otimizada do backlog.

## Stack Tecnológica

### Frontend
- **Framework:** React 18
- **Estilização:** CSS Modules ou Styled Components
- **Bundler:** Vite
- **Hospedagem:** Surge.sh

### Backend (Serverless)
- **Plataforma:** Vercel Edge Functions
- **Runtime:** Edge Runtime (V8 isolates)
- **Linguagem:** TypeScript

### Integrações
- **Jira Cloud:** REST API v3
- **Autenticação:** OAuth 2.0 (3LO) com scopes granulares
- **Escopos necessários:**
  - `read:jira-work` (ler issues)
  - `write:jira-work` (alterar rank)
  - `offline_access` (refresh token)

## Arquitetura

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Surge.sh      │         │  Vercel Edge     │         │   Jira Cloud │
│   (Frontend)    │◄───────►│  Functions       │◄───────►│   API        │
│                 │         │  (OAuth Proxy)   │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  localStorage   │         │  OAuth 2.0 Flow  │
│  (Token/Cache)  │         │  - Authorization │
│                 │         │  - Token Exchange│
└─────────────────┘         └──────────────────┘
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

- [ ] Usuário consegue autenticar com Jira via OAuth
- [ ] Issues são buscadas com filtros corretos aplicados
- [ ] Interface mostra 2 cards lado a lado para comparação
- [ ] Usuário pode escolher qual issue é mais prioritária
- [ ] Sistema calcula a ordem completa do backlog
- [ ] Ordem é aplicada no Jira (alteração de rank)
- [ ] Contador de progresso mostra avanço (ex: "15 de 30 comparações")
- [ ] Design responsivo funciona em mobile e desktop
- [ ] Deploy funcional no Surge + Vercel

## Restrições

- Jira Cloud apenas (não suporta Jira Server/Data Center)
- Necessita permissão de "rank" no projeto Jira
- Máximo de ~100 issues por ordenação (performance)
- Tokens armazenados apenas no localStorage (sessão do usuário)

## Riscos

1. **API Rate Limits** do Jira (10 req/s) - implementar throttling
2. **Permissões no Jira** - usuário precisa ter direito de alterar rank
3. **Complexidade O(n log n)** - ordenar muitas issues pode demorar
4. **OAuth complexidade** - fluxo de autenticação pode ser confuso

## Sucesso

O projeto será considerado sucesso quando:
- Usuário consegue ordenar backlog de 20+ issues em menos de 5 minutos
- Ordem aplicada no Jira persiste e é visualmente confirmada
- Interface é intuitiva (teste com usuário sem explicação prévia)
