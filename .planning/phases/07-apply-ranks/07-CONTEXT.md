# Phase 7: Aplicação de Rank no Jira - Context

**Phase:** 7  
**Name:** Aplicação de Rank no Jira  
**Status:** 🟡 Planning  
**Approach:** Simple (standard Jira rank behavior)

---

## Decisões do Discuss-Phase

### UX Decisions
1. **Confirmação:** Modal simples (sem preview detalhado)
2. **Progresso:** Barra de progresso simples
3. **Tela final:** Resumo estatístico + lista de issues que falharam

### Technical Decisions
4. **Rate Limiting:** Delay exponencial (começa rápido, aumenta se 429)
5. **Retry:** 3 tentativas, se falhar todas continua com restantes
6. **Error handling:** Lista de falhas mostrada no final
7. **Mecanismo:** Campo Rank nativo (customfield_10019)
8. **Ordenação:** Abordagem simples - atualiza ranks sequencialmente no topo

---

## Jira API Information

### Campo de Rank
- **Field ID:** `customfield_10019`
- **Field Name:** Rank
- **Type:** Greenhopper LexoRank
- **Operations:** set (via PUT /rest/api/3/issue/{key})

### Rate Limits (from documentation)
- **PUT requests:** 50/second steady-state
- **Burst buffer:** Temporary spikes allowed
- **Cost:** 1 point per operation
- **Per-issue write:** 20 per 2s, 100 per 30s

### Endpoint para Escrita
```http
POST /rest/agile/1.0/issue/rank
Content-Type: application/json

{
  "issues": ["PROJ-123"],
  "rankAfterIssue": "PROJ-122",
  "rankCustomFieldId": 10019
}
```

**Nota:** Usamos a API oficial de rank do Jira Agile, não PUT direto no campo. O parâmetro `rankAfterIssue` recebe a **chave da issue** de referência (não um valor LexoRank).

---

## Comportamento Esperado (Abordagem Simples)

### Cenário
```text
Ordem inicial:  A1 → B1 → A2 → B2 → A3 → B3
Ordem objetivo: A2 → A1 → A3 (do Épico A)

Ordem final:    A2 → A1 → B1 → B2 → A3 → B3
```

### O que acontece
- Issues do Épico A são movidas para o topo na ordem desejada
- Issues de outros épicos (B1, B2, B3) são "empurradas" para baixo
- Implementação mais simples, menos API calls

---

## Chamadas de Escrita (para validação de risco)

### Chamada 1: Atualizar rank de cada issue
```http
POST https://{domain}.atlassian.net/rest/agile/1.0/issue/rank
Authorization: Basic {auth}
Content-Type: application/json

{
  "issues": ["PROJ-123"],
  "rankAfterIssue": "PROJ-122",
  "rankCustomFieldId": 10019
}
```

**Exemplo:** Para ordenar [A, B, C]:
- A: `rankAfterIssue` omitido (vai para o topo)
- B: `rankAfterIssue: "A"` (vai após A)
- C: `rankAfterIssue: "B"` (vai após B)

**Risco:** Médio - altera dados produtivos no Jira  
**Mitigação:** Retry com backoff, tratamento de erro, lista de falhas

---

## Constraints

- Não há batch API - uma chamada por issue
- API de rank (`/rest/agile/1.0/issue/rank`) requer chave da issue de referência (`rankAfterIssue`)
- Ordenação afeta backlog global (issues de outros épicos movem)

---

## Success Criteria

- [ ] Modal confirmação funciona
- [ ] Progresso mostrado durante aplicação
- [ ] Cada issue atualizada via API
- [ ] Rate limits respeitados
- [ ] Retry implementado (3x)
- [ ] Lista de falhas exibida
- [ ] Resumo estatístico no final
- [ ] Link para backlog funciona
