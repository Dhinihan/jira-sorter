# Bugfix 001 - Problemas Identificados em Teste Local

**Data:** 2026-04-15  
**Branch:** gsd/phase-2-oauth-api  
**Origem:** Teste localhost:3000

---

## 🐛 Bugs Identificados

### Bug 1: Não redireciona após salvar credenciais
**Severidade:** Alta  
**Arquivo:** `app/config/page.tsx`

**Comportamento atual:**
- Usuário preenche formulário e clica "Salvar e Testar Conexão"
- Sistema testa conexão e mostra mensagem de sucesso
- Permanece na mesma página `/config`

**Comportamento esperado:**
- Após sucesso no teste e salvamento, redirecionar para `/` (home)

**Causa provável:**
- A Server Action `saveAndTestCredentials` salva as credenciais mas não faz redirect
- O componente cliente atualiza estado local mas não navega

---

### Bug 2: Busca de issues não aparece na tela inicial
**Severidade:** Média  
**Arquivo:** `app/page.tsx`

**Comportamento atual:**
- Home page mostra apenas status de conexão e dados do usuário
- Lista de próximos passos mostra "em desenvolvimento"
- Link para "/issues" só aparece se conectado, mas é fácil de não notar

**Comportamento esperado:**
- Dashboard com acesso direto à funcionalidade principal (busca de issues)
- Ou redirecionar direto para `/issues` quando conectado

**Nota:** Este é mais uma melhoria de UX do que um bug técnico

---

### Bug 3: Texto branco dentro dos inputs
**Severidade:** Média  
**Arquivo:** `app/config/page.tsx` (e possivelmente outros)

**Comportamento atual:**
- Inputs mostram texto branco/cinza claro difícil de ler no fundo branco
- Classes Tailwind aplicam `text-gray-900` mas parecem não estar funcionando

**Comportamento esperado:**
- Texto escuro/preto visível dentro dos inputs

**Causa provável:**
- Possível conflito de CSS (estilos do browser vs Tailwind)
- Ou classe não sendo aplicada corretamente
- Ou estilo do Next.js/Geist UI interferindo

---

### Bug 4: API /search descontinuada
**Severidade:** Crítica  
**Arquivo:** `app/actions/jira.ts`

**Comportamento atual:**
- Usa endpoint `/rest/api/3/search` (GET com query params)
- Retorna erro 410: "A API solicitada foi removida"

**Comportamento esperado:**
- Usar novo endpoint `/rest/api/3/search/jql`
- Ou usar POST para `/rest/api/3/search` com body

**Teste realizado:**
```
❌ /rest/api/3/search?jql=... → 410 Gone
✅ /rest/api/3/search/jql?jql=... → 200 OK
```

---

## ✅ Checklist de Correção

- [x] Bug 1: Adicionar redirect após sucesso em `saveAndTestCredentials` ✅
- [ ] Bug 2: Melhorar UX da home (link mais visível ou redirect) - NÃO IMPLEMENTADO
- [x] Bug 3: Corrigir cor do texto nos inputs ✅
- [x] Bug 4: Migrar para novo endpoint `/rest/api/3/search/jql` ✅

---

## 📝 Status

**Commit:** `9bcf313`  
**Data:** 2026-04-15  
**Validação:** lint ✓ build ✓

### Correções Implementadas:

1. **Redirect após salvar:** Adicionado `useRouter` com redirect para `/` após sucesso
2. **Cor dos inputs:** Alterado `text-gray-900` para `text-black` + `bg-white` explícito
3. **API Jira:** Migrado de `/search` para `/search/jql` (endpoint descontinuado retornava 410)

### Não Implementado:
- Bug 2 (UX home): Aguardando definição se quer dashboard ou redirect automático

### Prioridade Atual:
Bug 4 (API - CRÍTICO) > Bug 1 (Redirect - Alta) > Bug 3 (Cores - Média)
- Testar em localhost após cada correção
