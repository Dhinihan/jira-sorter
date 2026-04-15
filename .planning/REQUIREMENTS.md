# Requisitos - Jira Sorter

## Requisitos Funcionais

### RF01 - Autenticação OAuth 2.0
**Como** usuário  
**Quero** conectar minha conta do Jira de forma segura  
**Para** que a aplicação possa acessar meus projetos

**Critérios de Aceitação:**
- Botão "Conectar com Jira" na tela inicial
- Redirecionamento para tela de consentimento do Jira
- Scopes solicitados: `read:jira-work`, `write:jira-work`, `offline_access`
- Após autorização, retorna para aplicação com token
- Token é armazenado no localStorage
- Botão "Desconectar" limpa tokens e cache

### RF02 - Busca de Issues
**Como** usuário  
**Quero** buscar issues do backlog para ordenar  
**Para** selecionar quais tarefas priorizar

**Critérios de Aceitação:**
- Campo para selecionar projeto (dropdown)
- Filtro obrigatório automático: status = pending/backlog/to do
- Filtro obrigatório automático: sprint = null (não está em sprint)
- Filtro opcional: selecionar épico específico
- Preview mostra quantidade de issues encontradas
- Limite máximo: 100 issues (alerta se ultrapassar)
- Botão "Carregar Issues" inicia busca

### RF03 - Exibição de Cards
**Como** usuário  
**Quero** ver informações relevantes de cada issue  
**Para** tomar decisão de priorização

**Critérios de Aceitação:**
- Card mostra: título, número (BRA-123), épico, status, due date
- Link clicável para abrir issue no Jira (nova aba)
- Layout limpo com hierarquia visual
- Cores indicativas: vermelho (atrasada), amarelo (próxima), verde (normal)
- Responsivo: cards lado a lado em desktop, empilhados em mobile

### RF04 - Comparação Pairwise
**Como** usuário  
**Quero** comparar duas issues e escolher a mais prioritária  
**Para** ensinar o sistema minha prioridade

**Critérios de Aceitação:**
- Tela mostra 2 cards lado a lado
- Botão "Esta é mais prioritária" em cada card
- Atalho de teclado: seta esquerda/direita ou 1/2
- Animação suave ao trocar para próximo par
- Opção "São iguais" (empate) quando não conseguir decidir
- Contador de progresso: "Comparação X de Y"
- Barra de progresso visual

### RF05 - Algoritmo de Ordenação
**Como** sistema  
**Quero** calcular a ordem ótima baseada nas comparações  
**Para** determinar a priorização final

**Critérios de Aceitação:**
- Usar algoritmo eficiente (merge sort ou similar)
- Complexidade máxima: O(n log n) comparações
- Número máximo de comparações: n × log2(n)
- Para 20 issues: máximo 87 comparações
- Para 50 issues: máximo 283 comparações
- Resultado é uma lista ordenada do mais ao menos prioritário

### RF06 - Preview da Ordem
**Como** usuário  
**Quero** ver a ordem calculada antes de aplicar  
**Para** validar se faz sentido

**Critérios de Aceitação:**
- Lista numerada mostrando ordem final
- Possibilidade de "voltar" e refazer comparações específicas
- Indicador visual de confiança (quanto mais comparações, melhor)
- Botão "Aplicar no Jira" só aparece após validação
- Botão "Recomeçar" permite refazer do zero

### RF07 - Aplicação de Rank
**Como** usuário  
**Quero** aplicar a ordem no Jira automaticamente  
**Para** não ter que mover manualmente cada issue

**Critérios de Aceitação:**
- Botão "Aplicar Ordenação no Jira"
- Confirmação modal: "Isso vai reordenar X issues no backlog. Continuar?"
- Chama API do Jira para alterar rank de cada issue
- Mostra progresso em tempo real ("Movendo issue 5 de 20...")
- Ao final, mostra resumo do que foi feito
- Link para ver backlog no Jira já reordenado
- Possibilidade de "desfazer" (restaurar ordem anterior)

### RF08 - Cache e Sessão
**Como** usuário  
**Quero** que minhas comparações sejam salvas  
**Para** não perder progresso se fechar o navegador

**Critérios de Aceitação:**
- Cache no localStorage das comparações feitas
- Recupera sessão ao voltar (se ainda válida)
- Expiração: 24 horas
- Botão "Limpar tudo" reseta completamente

## Requisitos Não-Funcionais

### RNF01 - Performance
- First Contentful Paint < 2s
- Time to Interactive < 3s
- Comparações devem ser instantâneas (< 100ms)
- API calls otimizadas com batching quando possível
- Limite de 100 issues para manter performance

### RNF02 - Segurança
- Tokens NUNCA logados no console
- Tokens NUNCA enviados para servidor próprio (só Jira)
- localStorage criptografado (ou pelo menos ofuscado)
- Refresh token automático quando expirar
- Logout limpa TODOS os dados da sessão

### RNF03 - Usabilidade
- Interface intuitiva (teste com usuário sem explicação)
- Feedback visual imediato para todas as ações
- Tooltips explicativos em elementos complexos
- Design responsivo (mobile-first)
- Acessibilidade: suporte a navegação por teclado

### RNF04 - Escalabilidade
- Suportar até 100 issues por ordenação
- Cache de metadados das issues (24h)
- Rate limiting respeitando Jira API (10 req/s)

### RNF05 - Compatibilidade
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Regras de Negócio

### RN01 - Filtros Obrigatórios
Sistema SEMPRE aplica automaticamente:
- Status: To Do, Backlog, Open, Pending (não Done/Closed)
- Sprint: NULL (não está em sprint ativa)

### RN02 - Ordenação Final
- Issue mais prioritária = topo do backlog (rank maior)
- Issue menos prioritária = base do backlog (rank menor)
- Ordenação é relativa ao contexto (mesmo projeto/filtro)

### RN03 - Consentimento OAuth
- Usuário deve ver tela de permissões do Jira explicitamente
- Deve aceitar escopos read e write
- Sem consentimento, não prossegue

### RN04 - Limite de Issues
- Máximo 100 issues por ordenação
- Se backlog tem mais, pedir para filtrar mais
- Motivo: performance e usabilidade
