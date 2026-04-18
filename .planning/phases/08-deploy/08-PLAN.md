---
wave: 1
depends_on: []
files_modified: []
autonomous: false
---

# Plan: Deploy e Testes

## Goal
Realizar deploy de produção na Vercel e executar testes finais para validar a aplicação.

## Contexto da Discussão

Decisões tomadas na discussão:
- Testes manuais com 5-10 issues no projeto VINI
- Testar responsividade mobile (smartphone)
- Deploy direto na Vercel (produção)
- URL padrão: jira-sorter.vercel.app

## Tasks

<task id="1" name="Build do Next.js">
Executar build de produção localmente para verificar erros.

Comando: npm run build

Verificar:
- Nenhum erro de TypeScript
- Nenhum erro de build
- Bundle size aceitável

<verify>
Build completa sem erros. Arquivos gerados em .next/
</verify>
</task>

<task id="2" name="Configurar variáveis de ambiente na Vercel">
Adicionar variáveis de ambiente no dashboard da Vercel.

Variáveis necessárias:
- JIRA_DOMAIN (ex: mandua)
- JIRA_EMAIL
- JIRA_TOKEN

<verify>
Variáveis configuradas no dashboard da Vercel. Deploy pode acessar credenciais.
</verify>
</task>

<task id="3" name="Deploy na Vercel">
Fazer deploy do projeto na Vercel.

Passos:
1. Conectar GitHub repo na Vercel
2. Selecionar branch main (ou gsd/phase-8-deploy)
3. Configurar build settings (Next.js)
4. Trigger deploy

<verify>
URL do deploy funciona (ex: jira-sorter.vercel.app). Página inicial carrega.
</verify>
</task>

<task id="4" name="Teste end-to-end: fluxo completo">
Testar todo o fluxo da aplicação com 5-10 issues.

Cenário de teste:
1. Acessar URL do deploy
2. Configurar credenciais do Jira
3. Selecionar projeto VINI
4. Selecionar 5-10 issues do backlog
5. Completar ordenação (fazer todas as comparações)
6. Aplicar ordenação no Jira
7. Verificar no Jira se issues foram reordenadas

<verify>
Fluxo completo executa sem erros. Issues aparecem reordenadas no backlog do Jira.
</verify>
</task>

<task id="5" name="Teste de responsividade mobile">
Testar interface em dispositivo móvel.

Verificações:
- Cards de issues cabem na tela
- Botões são clicáveis
- Layout não quebra
- Scroll funciona corretamente

<verify>
Interface funciona em smartphone (iPhone/Android). Cards lado a lado ou empilhados corretamente.
</verify>
</task>

<task id="6" name="Atualizar README">
Atualizar README.md com informações do deploy.

Adicionar:
- URL do deploy
- Screenshot da interface
- Instruções de uso (3 passos)
- Limitações conhecidas (máximo 100 issues)

<verify>
README.md atualizado. URL do deploy visível. Screenshots adicionadas.
</verify>
</task>

<task id="7" name="Documentar fase">
Criar arquivo 08-SUMMARY.md com resumo da fase.

Incluir:
- Entregáveis completados
- Decisões tomadas
- Resultados dos testes
- Próximos passos (se houver)

<verify>
08-SUMMARY.md criado com resumo completo da fase.
</verify>
</task>

## must_haves

Goal: Deploy de produção na Vercel e testes finais validados

- [ ] Build do Next.js passa sem erros
- [ ] Deploy na Vercel funciona (URL acessível)
- [ ] Fluxo completo testado com 5-10 issues
- [ ] Issues são reordenadas no Jira ao aplicar
- [ ] Interface funciona em mobile (smartphone)
- [ ] README atualizado com URL e instruções
- [ ] Documentação da fase completa
