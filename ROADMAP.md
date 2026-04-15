# Roadmap - Jira Sorter

## Fase 1: Setup e Estrutura
**Status:** 🟡 Em Planejamento  
**Duração Estimada:** 45 minutos

### Tarefas:
- [ ] Criar estrutura de pastas (frontend/, api/)
- [ ] Inicializar projeto React com Vite
- [ ] Configurar TypeScript
- [ ] Instalar dependências (React Router, Axios, etc.)
- [ ] Criar conta/projetos no Vercel
- [ ] Configurar variáveis de ambiente

### Entregáveis:
- ✅ Estrutura de projeto organizada
- ✅ React rodando localmente
- ✅ Vercel CLI configurado

---

## Fase 2: Vercel Edge Function - OAuth
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 60 minutos

### Tarefas:
- [ ] Criar Edge Function `/api/auth/url` (gerar URL de autorização)
- [ ] Criar Edge Function `/api/auth/callback` (receber código, trocar por token)
- [ ] Criar Edge Function `/api/auth/refresh` (renovar token)
- [ ] Implementar PKCE para segurança
- [ ] Configurar CORS (Surge pode chamar Vercel)
- [ ] Testar fluxo completo de autenticação

### Entregáveis:
- ✅ Edge Function de OAuth funcionando
- ✅ Retorna access_token e refresh_token
- ✅ Tokens válidos para Jira API

---

## Fase 3: Frontend - Autenticação
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 45 minutos

### Tarefas:
- [ ] Criar tela de login/conectar Jira
- [ ] Implementar chamada para `/api/auth/url`
- [ ] Receber token do callback e salvar no localStorage
- [ ] Criar context de autenticação (React Context API)
- [ ] Criar hook `useAuth()`
- [ ] Implementar logout
- [ ] Mostrar usuário logado no header

### Entregáveis:
- ✅ Botão "Conectar com Jira" funcional
- ✅ Tela de consentimento do Jira abre
- ✅ Retorna com token salvo
- ✅ Logout funciona

---

## Fase 4: Frontend - Busca de Issues
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 60 minutos

### Tarefas:
- [ ] Criar formulário de filtros (projeto, épico)
- [ ] Implementar chamada à Jira API para listar projetos
- [ ] Implementar chamada para buscar épicos
- [ ] Implementar busca de issues com JQL:
  - `status in ("To Do", "Backlog", "Open") AND sprint is EMPTY`
- [ ] Adicionar filtros opcionais (épico)
- [ ] Mostrar preview da quantidade de issues
- [ ] Limitar a 100 issues (validação)
- [ ] Cache no localStorage das issues

### Entregáveis:
- ✅ Formulário de filtros funcional
- ✅ Busca retorna issues corretamente
- ✅ Filtros obrigatórios aplicados automaticamente
- ✅ Preview mostra contagem

---

## Fase 5: Frontend - Interface Pairwise
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 75 minutos

### Tarefas:
- [ ] Criar componente `IssueCard`
- [ ] Criar layout da tela de comparação (2 cards lado a lado)
- [ ] Implementar contador de progresso
- [ ] Criar barra de progresso visual
- [ ] Implementar botões de seleção (esquerda/direita/empate)
- [ ] Adicionar atalhos de teclado (← → 1 2 space)
- [ ] Criar animações de transição suaves
- [ ] Mostrar contador: "Comparação X de Y"
- [ ] Implementar lógica de merge sort com comparações

### Entregáveis:
- ✅ Tela mostra 2 cards lado a lado
- ✅ Usuário pode escolher entre elas
- ✅ Contador de progresso atualiza
- ✅ Animações suaves funcionam

---

## Fase 6: Algoritmo de Ordenação
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 45 minutos

### Tarefas:
- [ ] Implementar algoritmo merge sort adaptado
- [ ] Função de comparação chama UI e aguarda input humano
- [ ] Cache das comparações já feitas (evitar repetir)
- [ ] Calcular número máximo de comparações (n × log2(n))
- [ ] Retornar array ordenado final
- [ ] Mostrar preview da lista ordenada
- [ ] Permitir "voltar" em comparações específicas
- [ ] Permitir recomeçar do zero

### Entregáveis:
- ✅ Algoritmo funciona corretamente
- ✅ Ordem calculada é consistente
- ✅ Número de comparações é otimizado
- ✅ Preview mostra resultado

---

## Fase 7: Aplicação de Rank no Jira
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 60 minutos

### Tarefas:
- [ ] Criar modal de confirmação
- [ ] Implementar chamada à Jira API para alterar rank
- [ ] Endpoint Jira: `PUT /rest/api/3/issue/{issueId}/rank`
- [ ] Processar issues em sequência (respeitar rate limit)
- [ ] Mostrar progresso em tempo real
- [ ] Implementar tratamento de erros (rollback se falhar)
- [ ] Mostrar resumo ao final
- [ ] Criar link direto para backlog no Jira
- [ ] (Opcional) Implementar "desfazer"

### Entregáveis:
- ✅ Rank é aplicado no Jira
- ✅ Progresso mostrado em tempo real
- ✅ Resumo ao final
- ✅ Link para backlog funciona

---

## Fase 8: Deploy e Testes
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 30 minutos

### Tarefas:
- [ ] Build do React (vite build)
- [ ] Deploy frontend no Surge
- [ ] Deploy Edge Functions no Vercel
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Testar fluxo completo end-to-end
- [ ] Testar responsividade (mobile)
- [ ] Testar rate limits
- [ ] Documentar URL do deploy

### Entregáveis:
- ✅ Site no ar no Surge
- ✅ API funcionando no Vercel
- ✅ Testes passam
- ✅ Documentação atualizada

---

## Timeline Estimada

```
Fase 1 (Setup)          [====] 45min
Fase 2 (OAuth API)      [====] 60min
Fase 3 (Auth UI)        [====] 45min
Fase 4 (Busca Issues)   [====] 60min
Fase 5 (Pairwise UI)    [====] 75min
Fase 6 (Algoritmo)      [====] 45min
Fase 7 (Aplica Rank)    [====] 60min
Fase 8 (Deploy)         [====] 30min

Total Estimado: ~6 horas
```

## Notas GSD

- Priorizar funcionalidades core (RF01-RF07)
- Testar cada fase antes de prosseguir
- Se encontrar bloqueio, documentar e ajustar roadmap
- Manter código limpo e documentado
