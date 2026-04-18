# Phase 7: Aplicação de Rank no Jira - Execution Plan

**Phase:** 7  
**Name:** Aplicação de Rank no Jira  
**Status:** 🟡 Ready for Review  
**Estimated Duration:** 60 minutos

---

## 🚨 API Calls de Escrita no Jira (Risco Assessment)

### **CALL 1: Atualização de Rank (MAIOR RISCO)**
```http
POST /rest/agile/1.0/issue/rank
```
**Headers:**
```text
Authorization: Basic {base64(email:token)}
Content-Type: application/json
Accept: application/json
```
**Body:**
```json
{
  "issues": ["PROJ-123"],
  "rankAfterIssue": "PROJ-122",
  "rankCustomFieldId": 10019
}
```
**Risco:** 🔴 **ALTO** - Altera dados produtivos no Jira  
**Impacto:** Move issues no backlog global  
**Mitigações implementadas:**
- ✅ Retry automático (3 tentativas)
- ✅ Exponential backoff (respeita 429)
- ✅ Lista de falhas ao final (para correção manual)
- ✅ Não para em erro - continua com restantes

**Quantidade:** 1 call por issue ordenada (ex: 50 issues = 50 calls)

---

## 🎯 Tasks do Plano

### Task 1: Criar Server Action para aplicar ranks
**Arquivo:** `app/actions/jira.ts`  
**Descrição:** Implementar `applyRanks()` Server Action

**Implementação:**
```typescript
export async function applyRanks(
  issues: Array<{ key: string; newRank: string }>,
  projectKey: string
): Promise<{
  success: boolean;
  applied: string[];
  failed: Array<{ key: string; error: string }>;
  message?: string;
}>
```

**Chamadas API utilizadas:**
1. `POST /rest/agile/1.0/issue/rank` - Atualiza posição relativa (1x por issue)

**Rate limiting implementado:**
- Delay entre chamadas (exponential backoff)
- Respeita header `Retry-After` se receber 429
- Máximo 3 retries por issue

---

### Task 2: Implementar geração de parâmetros de rank
**Arquivo:** `lib/lexorank.ts` (novo)  
**Descrição:** Gera parâmetros para API de rank do Jira Agile

**Função principal:**
```typescript
// Gerar inputs de rank para lista ordenada
export function generateRanksForSortedIssues(issueKeys: string[]): RankInput[]
```

**Lógica:** Para uma lista ordenada [A, B, C], retorna:
- A: `{ key: "A", rankAfterKey: null }` (vai para o topo)
- B: `{ key: "B", rankAfterKey: "A" }` (vai após A)
- C: `{ key: "C", rankAfterKey: "B" }` (vai após B)

**Observação:** Não gera LexoRank - usa chaves de issue para posicionamento relativo via API. **Sem chamadas API**.

---

### Task 3: Criar modal de confirmação
**Arquivo:** `app/sort/components/ConfirmApplyModal.tsx` (novo)  
**Descrição:** Modal simples de confirmação antes de aplicar

**UX:**
- Título: "Aplicar ordenação no Jira?"
- Texto: "Isso vai reordenar {N} issues no backlog. Essa ação não pode ser desfeita automaticamente."
- Botões: "Cancelar" / "Aplicar"

**Sem chamadas API** - apenas UI

---

### Task 4: Implementar tela de progresso
**Arquivo:** `app/sort/components/ApplyProgress.tsx` (novo)  
**Descrição:** Barra de progresso durante aplicação

**UX:**
- Barra de progresso simples (0-100%)
- Texto: "Aplicando {current} de {total}..."
- Spinner enquanto processa

**Chamadas API:**
- Executa `applyRanks()` Server Action
- Recebe resultado final `ApplyRanksResult` (progresso é estimado pelo cliente)

---

### Task 5: Criar tela de resultado
**Arquivo:** `app/sort/components/ApplyResult.tsx` (novo)  
**Descrição:** Resumo estatístico + lista de falhas

**UX:**
- Resumo: "✅ {applied} issues ordenados | ❌ {failed} falhas"
- Lista de falhas: Key + mensagem de erro
- Botão: "Ver no backlog do Jira" (link externo)
- Botão: "Fechar" (volta para issues)

**Sem chamadas API adicionais**

---

### Task 6: Integrar na página /sort
**Arquivo:** `app/sort/page.tsx`  
**Descrição:** Adicionar fluxo completo de aplicação

**Fluxo:**
1. Completa ordenação → mostra "Aplicar no Jira" button
2. Clica → abre ConfirmApplyModal
3. Confirma → mostra ApplyProgress (chama applyRanks)
4. Completa → mostra ApplyResult
5. Fecha → volta para /issues

---

## 📋 Wave Structure

### Wave 1: Backend Core (Tasks 1-2)
- Task 1: Server Action applyRanks
- Task 2: LexoRank generation utils

### Wave 2: UI Components (Tasks 3-5)
- Task 3: ConfirmApplyModal
- Task 4: ApplyProgress
- Task 5: ApplyResult

### Wave 3: Integration (Task 6)
- Task 6: Integrate in /sort page

---

## ✅ Verification Checklist

### Must Haves
- [ ] Server Action atualiza rank via POST /rest/agile/1.0/issue/rank
- [ ] Rate limiting respeitado (delay entre calls)
- [ ] Retry implementado (3x com exponential backoff)
- [ ] Lista de falhas exibida ao final
- [ ] Progresso mostrado em tempo real
- [ ] Link para backlog funciona

### API Safety
- [ ] Retry respeita header Retry-After
- [ ] Continua em caso de erro (não para tudo)
- [ ] Timeout nas chamadas fetch
- [ ] Tratamento de erro detalhado por issue

---

## 🔴 RISCO TOTAL

| Aspecto | Nível | Mitigação |
|---------|-------|-----------|
| Chamadas de escrita | 🔴 ALTO | Retry, backoff, lista falhas |
| Quantidade de calls | 🟡 MÉDIO | Uma por issue (50 issues = 50 calls) |
| Rate limit | 🟡 MÉDIO | Exponential backoff implementado |
| Erro parcial | 🟢 BAIXO | Continua com restantes |

**Recomendação:** Testar em projeto de teste primeiro, ou com 1-2 issues em produção.

---

**Aguardando validação antes de executar.**
