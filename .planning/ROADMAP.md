# Roadmap - Jira Sorter

## Fase 1: Setup e Estrutura
**Status:** 🟡 Em Planejamento  
**Duração Estimada:** 30 minutos

### Tarefas:
- [ ] Inicializar projeto Next.js com create-next-app
- [ ] Configurar TypeScript
- [ ] Instalar Tailwind CSS
- [ ] Instalar dependências adicionais (shadcn/ui, etc.)
- [ ] Criar projeto no Vercel
- [ ] Configurar variáveis de ambiente

### Entregáveis:
- ✅ Estrutura de projeto organizada
- ✅ React rodando localmente
- ✅ Vercel CLI configurado

---

## Fase 2: Configuração de Personal API Token
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 30 minutos

### Tarefas:
- [ ] Criar formulário de configuração (email + token)
- [ ] Criar Server Action para validar token (testar chamada à Jira API)
- [ ] Salvar credenciais em variáveis de ambiente (ou cookie seguro)
- [ ] Criar função utilitária para Base64 encode (email:token)
- [ ] Testar autenticação com chamada real à API do Jira

### Entregáveis:
- ✅ Formulário de configuração funcional
- ✅ Validação do token na API do Jira
- ✅ Credenciais armazenadas com segurança
- ✅ Teste de autenticação bem-sucedido

---

## Fase 3: Frontend - Configuração e Validação
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 30 minutos

### Tarefas:
- [ ] Criar página de configuração `/config`
- [ ] Formulário: Email do Jira + Personal API Token
- [ ] Botão "Testar Conexão" (valida na API do Jira)
- [ ] Mostrar status da conexão (verde/vermelho)
- [ ] Criar Server Component protegido (redireciona se não configurado)
- [ ] Botão "Desconectar" (limpa configuração)

### Entregáveis:
- ✅ Página de configuração funcional
- ✅ Validação em tempo real do token
- ✅ Redirecionamento automático se não configurado
- ✅ Feedback visual do status da conexão

---

## Fase 4: Busca de Issues (SSR)
**Status:** 🔴 Não Iniciada  
**Duração Estimada:** 60 minutos

### Tarefas:
- [ ] Criar Server Component de filtros
- [ ] Criar Server Action para buscar projetos (SSR)
- [ ] Criar Server Action para buscar épicos (SSR)
- [ ] Criar Server Action para buscar issues com JQL:
  - `status in ("To Do", "Backlog", "Open") AND sprint is EMPTY`
- [ ] Server Component mostra lista de issues já carregadas
- [ ] Adicionar filtros opcionais (épico) via query params
- [ ] Mostrar preview da quantidade de issues
- [ ] Limitar a 100 issues (validação)
- [ ] Cache no servidor (React cache)

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
- [ ] Build do Next.js (next build)
- [ ] Deploy na Vercel (frontend + API integrados)
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Configurar domínio customizado (opcional)
- [ ] Testar fluxo completo end-to-end
- [ ] Testar responsividade (mobile)
- [ ] Testar rate limits
- [ ] Documentar URL do deploy

### Entregáveis:
- ✅ Site no ar na Vercel
- ✅ API Routes funcionando
- ✅ Testes passam
- ✅ Documentação atualizada

---

## Workflow GSD - Git Strategy

### **Branching Strategy: Feature Branches + Pull Requests**

Cada fase será desenvolvida em uma branch separada e mergeada via Pull Request.

#### **Padrão de Nomenclatura:**
- `main` - Branch principal (produção)
- `gsd/phase-{numero}-{nome}` - Branches de cada fase
- Ex: `gsd/phase-2-oauth-api`, `gsd/phase-3-auth-ssr`

#### **Fluxo de Trabalho:**

1. **Criar branch para a fase:**
   ```bash
   git checkout -b gsd/phase-2-oauth-api
   ```

2. **Desenvolver a fase completa**

3. **Commit com mensagem descritiva:**
   ```bash
   git commit -m "feat(phase-2): implement OAuth API routes
   
   - Add /api/auth/url endpoint
   - Add /api/auth/callback endpoint  
   - Add /api/auth/refresh endpoint
   - Implement PKCE security
   
   Closes phase-2"
   ```

4. **Push da branch:**
   ```bash
   git push origin gsd/phase-2-oauth-api
   ```

5. **Criar Pull Request no GitHub:**
   - Título: `[GSD Phase 2] OAuth API Routes`
   - Descrição: Checklist de entregáveis da fase
   - Review: Você revisa antes de mergear
   - Merge: Squash and merge para manter histórico limpo

6. **Voltar para main e atualizar:**
   ```bash
   git checkout main
   git pull origin main
   ```

#### **Vantagens:**
- ✅ Código revisado antes de entrar na main
- ✅ Histórico organizado por fases
- ✅ Facilidade de rollback se necessário
- ✅ Documentação automática via PRs

---

## Timeline Estimada

```
Fase 1 (Setup)          [====] 45min  ✅ CONCLUÍDO (main)
Fase 2 (OAuth API)      [====] 60min  🔄 PR: gsd/phase-2-oauth-api
Fase 3 (Auth UI)        [====] 45min  ⏳ Branch: gsd/phase-3-auth-ssr
Fase 4 (Busca Issues)   [====] 60min  ⏳ Branch: gsd/phase-4-issues
Fase 5 (Pairwise UI)    [====] 75min  ⏳ Branch: gsd/phase-5-pairwise
Fase 6 (Algoritmo)      [====] 45min  ⏳ Branch: gsd/phase-6-algorithm
Fase 7 (Aplica Rank)    [====] 60min  ⏳ Branch: gsd/phase-7-rank
Fase 8 (Deploy)         [====] 30min  ⏳ Branch: gsd/phase-8-deploy

Total Estimado: ~6 horas
```

## Notas GSD

- Cada fase em branch separada
- Pull Request obrigatório para merge
- Revisão de código antes de prosseguir
- Squash commits para histórico limpo
- Priorizar funcionalidades core (RF01-RF07)
- Testar cada fase antes de fazer PR
- Se encontrar bloqueio, documentar no PR
- Manter código limpo e documentado
