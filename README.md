# Jira Sorter

[![Deploy](https://img.shields.io/badge/vercel-deployed-blue?logo=vercel)](https://jira-sorter.vercel.app/)

Aplicação web para ordenação inteligente de backlog do Jira usando comparações pairwise (duelo entre tarefas).

## 🌐 Deploy

**Site publicado:** https://jira-sorter.vercel.app/

---

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com Personal API Token do Jira
- 📊 **Busca de issues** do backlog com filtros automáticos
- ⚡ **Comparação pairwise** (duelo entre 2 issues)
- 🧠 **Algoritmo inteligente** (Binary Insertion Sort) para calcular ordem ótima
- 🎯 **Aplicação automática** de rank no Jira
- 📱 **Responsivo** - funciona em desktop e mobile
- 💾 **Persistência** - salva progresso no localStorage

---

## 📋 Como Usar

### 1. Acesse o site
Vá para https://jira-sorter.vercel.app/

### 2. Configure suas credenciais
- Informe seu **email** do Jira
- Informe seu **Personal API Token** (obtenha em: Jira → Perfil → Segurança → Tokens de API)
- Informe seu **domínio** (ex: `suaempresa` para `suaempresa.atlassian.net`)
- Clique em "Testar Conexão"

### 3. Selecione issues
- Escolha o **projeto**
- Escolha o **épico** (opcional)
- Clique em "Buscar Issues"
- Selecione as issues do backlog que quer ordenar

### 4. Ordene
- Compare duas issues lado a lado
- Escolha a mais prioritária (ou empate)
- Continue até completar todas as comparações
- Veja o preview da ordem calculada

### 5. Aplique no Jira
- Clique em "Aplicar no Jira"
- Confirme a operação
- Veja o progresso em tempo real
- Pronto! Suas issues estão reordenadas no backlog!

---

## 🛠️ Tecnologias

- **Next.js 16.2.3** (App Router + Server Components)
- **TypeScript**
- **Tailwind CSS**
- **Jira Cloud REST API**
- **Jira Agile API** (para atualização de rank)

---

## ⚠️ Limitações

- Máximo de **100 issues** por ordenação (para performance)
- Apenas **Jira Cloud** (não suporta Jira Server/Data Center)
- Usuário precisa ter permissão de **rank** no projeto
- Issues precisam estar no status **To Do/Backlog/Open** e **fora de sprint**

---

## 🚀 Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/Dhinihan/jira-sorter.git
cd jira-sorter

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Abrir http://localhost:3000
```

---

## 📁 Documentação

- [PROJECT.md](./PROJECT.md) - Visão geral e arquitetura
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Requisitos funcionais
- [ROADMAP.md](./ROADMAP.md) - Roadmap de desenvolvimento

---

**Status:** ✅ Em produção
