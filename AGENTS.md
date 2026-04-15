<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🌐 Deploy do Projeto

**URL de produção:** https://jira-sorter.vercel.app/

**Plataforma:** Vercel

Sempre verifique o deploy após fazer push para a branch main.

---

## 🔐 Decisões de Segurança

### Armazenamento do Personal API Token

**Decisão:** Criptografia no cookie (HttpOnly + Secure + SameSite)

**Contexto:** 
- App de uso pessoal/small team
- Token não é exposto ao client (Server Actions only)
- HttpOnly já protege contra XSS
- Criptografia adicional protege se cookie for comprometido

**Alternativas consideradas:**
- ❌ **Token em texto no cookie** - Risco se cookie vazar
- ✅ **Criptografia no cookie** - Balance segurança/simplicidade (escolhido)
- ❌ **Turso/DB externo** - Overkill para uso pessoal, adiciona latência

**Implementação:**
- Token criptografado antes de salvar no cookie
- Chave de criptografia em variável de ambiente
- Descriptografia apenas em Server Actions
- Session ID opaco não necessário (single user)
