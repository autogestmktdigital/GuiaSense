# PROMPT MESTRE — DESENVOLVIMENTO DO GUIASENSE

## 1. VISÃO GERAL DO PRODUTO

Desenvolver uma aplicação chamada **GuiaSense**, voltada para **gestão financeira pessoal**, com uma experiência extremamente simples, visual e intuitiva.

O principal objetivo do GuiaSense é permitir que uma pessoa comum consiga organizar sua vida financeira sem precisar entender de finanças, contabilidade ou ferramentas complexas.

O sistema deve permitir que o usuário acompanhe suas **entradas e saídas financeiras**, entenda sua situação atual e receba **alertas, orientações e sugestões inteligentes** sobre seu orçamento.

Exemplos de orientação que o sistema poderá apresentar:

- “Seu orçamento deste mês está ficando acima do planejado.”
- “Seus gastos com energia aumentaram em relação aos meses anteriores.”
- “Você está gastando mais nesta categoria este mês.”
- “Seu orçamento ainda possui margem disponível.”
- “Se continuar neste ritmo de gastos, poderá ultrapassar seu orçamento até o final do mês.”

O GuiaSense não deve apenas armazenar informações financeiras.

Ele deve **transformar os dados cadastrados pelo usuário em informações fáceis de entender e úteis para tomada de decisão.**

---

# 2. PRINCÍPIO CENTRAL DA EXPERIÊNCIA

A principal filosofia do sistema deve ser:

**Simplicidade + Clareza + Orientação.**

O usuário não deve precisar interpretar planilhas, relatórios financeiros complexos ou telas carregadas de informações.

A aplicação deve sempre priorizar:

- facilidade de utilização;
- poucas ações por tela;
- informações importantes em destaque;
- linguagem simples;
- navegação intuitiva;
- elementos visuais;
- indicadores fáceis de interpretar;
- gráficos simples;
- cards informativos;
- alertas objetivos;
- orientação sobre o que está acontecendo com as finanças.

Evitar telas excessivamente técnicas ou poluídas.

---

# 3. IDENTIDADE VISUAL

O GuiaSense deve possuir uma identidade própria, moderna e facilmente reconhecível.

O design deve ser:

- moderno;
- tecnológico;
- amigável;
- visualmente leve;
- colorido;
- com cores vivas;
- lúdico;
- intuitivo.

O aspecto lúdico deve ajudar o usuário a **entender rapidamente sua situação financeira**, mas sem deixar a aplicação com aparência infantil.

Utilizar recursos como:

- cards;
- ícones;
- gráficos;
- indicadores visuais;
- barras de progresso;
- status;
- destaques;
- pequenas mensagens explicativas;
- cores indicando situações positivas, neutras ou que precisam de atenção.

A interface deve transmitir a sensação de que o GuiaSense está **guiando o usuário**, e não simplesmente mostrando números.

Manter consistência visual entre todas as telas.

---

# 4. RESPONSIVIDADE

Todo o sistema deve ser desenvolvido desde o início utilizando conceito **responsive design**.

A aplicação precisa funcionar corretamente em:

- computadores;
- notebooks;
- tablets;
- celulares.

Não desenvolver primeiro uma versão desktop para depois adaptar.

Cada componente deve ser criado considerando desde o início diferentes resoluções e tamanhos de tela.

Em celulares, priorizar:

- facilidade de toque;
- botões maiores;
- menus simplificados;
- redução de informações secundárias;
- cards reorganizados verticalmente;
- navegação rápida.

Em desktop, aproveitar melhor o espaço disponível sem simplesmente aumentar os componentes.

---

# 5. PREPARAÇÃO PARA APLICATIVO / APK

A arquitetura deve ser preparada desde o início para permitir que futuramente o GuiaSense também seja disponibilizado como aplicativo para dispositivos móveis.

O desenvolvimento atual não deve criar dependências desnecessárias que impeçam ou dificultem sua evolução para:

- PWA;
- aplicação Android;
- APK;
- eventualmente outras plataformas móveis.

A lógica de negócio deve ficar desacoplada da interface sempre que possível.

Backend e frontend devem possuir responsabilidades bem definidas.

As funcionalidades principais devem ser acessíveis através de APIs, facilitando posteriormente a utilização do mesmo backend pelo sistema web e pelo aplicativo.

---

# 6. ARQUITETURA INICIAL

A arquitetura atualmente considerada para o projeto é:

### Frontend
**Vercel**

Aplicação web responsiva.

### Backend
**Railway**

Responsável pela lógica da aplicação, APIs, autenticação, processamento das informações e integrações.

### Banco de dados
Hospedado/integrado à infraestrutura do backend.

### Inteligência Artificial
**OpenAI API**

A utilização de IA deve ser controlada e aplicada principalmente quando realmente agregar inteligência à experiência do usuário.

Evitar utilizar IA para tarefas que possam ser resolvidas de maneira determinística pelo próprio sistema.

---

# 7. ESTRUTURA DA APLICAÇÃO

O GuiaSense deve inicialmente possuir uma estrutura voltada para:

### Cadastro e autenticação do usuário

Permitir criação de conta e acesso seguro à plataforma.

Cada usuário deve visualizar exclusivamente suas próprias informações financeiras.

---

### Dashboard / Home

A Home deve apresentar rapidamente a situação financeira atual do usuário.

O usuário deve conseguir abrir o GuiaSense e entender sua situação sem precisar navegar por várias telas.

Priorizar informações como:

- visão geral financeira;
- total de entradas;
- total de saídas;
- saldo;
- evolução do orçamento;
- principais gastos;
- alertas;
- sugestões;
- informações que precisam da atenção do usuário.

O dashboard deve utilizar principalmente **cards, gráficos simples e indicadores visuais**.

---

### Entradas financeiras

Permitir o cadastro e acompanhamento das receitas/entradas do usuário.

O fluxo de cadastro deve ser rápido e simples.

---

### Saídas financeiras

Permitir cadastrar e acompanhar despesas.

As informações devem posteriormente alimentar:

- dashboard;
- gráficos;
- comparações;
- orçamento;
- alertas;
- análises inteligentes.

---

### Organização financeira

As movimentações devem possuir uma estrutura organizada que permita ao sistema identificar onde o usuário está gastando seu dinheiro.

A estrutura deverá permitir posteriormente análises por períodos e tipos de gastos.

---

# 8. ALERTAS FINANCEIROS

Um dos diferenciais importantes do GuiaSense será a capacidade de transformar movimentações financeiras em **alertas simples e úteis**.

O sistema deve possuir uma camada de regras capaz de identificar situações relevantes.

Exemplos:

- aumento relevante de determinada despesa;
- aproximação do limite definido para determinado orçamento;
- orçamento ultrapassado;
- mudança significativa no padrão de gastos;
- redução ou aumento relevante das despesas;
- comportamento financeiro que mereça atenção.

Sempre que uma situação puder ser identificada matematicamente, priorizar regras do próprio sistema em vez de enviar dados desnecessariamente para IA.

---

# 9. INTELIGÊNCIA ARTIFICIAL

A IA deverá atuar como uma camada complementar de inteligência do GuiaSense.

Sua função é transformar dados financeiros em explicações fáceis de compreender.

A IA poderá auxiliar principalmente com:

- interpretação dos dados;
- identificação de tendências;
- explicações;
- recomendações;
- sugestões;
- criação de mensagens personalizadas.

As respostas devem utilizar uma linguagem:

- simples;
- objetiva;
- amigável;
- educativa;
- não técnica.

Evitar respostas longas.

O GuiaSense deve parecer um **guia financeiro**, não um chatbot genérico.

---

# 10. CONTROLE DE ACESSO POR PAGAMENTO

O sistema deverá possuir obrigatoriamente uma funcionalidade de **validação da situação de pagamento do usuário**.

Essa validação será responsável por determinar se o usuário está autorizado a utilizar a plataforma.

O fluxo conceitual deverá ser:

**Cadastro/Login → Validação do usuário → Validação do pagamento → Liberação ou bloqueio da plataforma**

A aplicação não deve confiar apenas em informações armazenadas no frontend.

A situação da assinatura/pagamento deve ser validada pelo backend.

O sistema deverá possuir uma informação clara do status de acesso de cada usuário.

Exemplos conceituais:

- acesso liberado;
- pagamento pendente;
- acesso bloqueado/inativo.

Somente usuários com condição válida devem acessar as funcionalidades protegidas do GuiaSense.

A estrutura deve prever integração com o **Mercado Pago** para processamento e validação dos pagamentos.

A integração deverá ser preparada para receber atualizações automáticas de pagamento através de mecanismos seguros, como webhooks.

Nunca confiar somente no retorno da tela de pagamento para liberar uma conta.

O backend deverá validar a informação recebida antes de alterar o acesso do usuário.

---

# 11. SEGURANÇA

Como o sistema trabalhará com informações financeiras pessoais, segurança deve fazer parte da arquitetura desde o início.

Implementar:

- autenticação segura;
- autorização por usuário;
- isolamento dos dados;
- proteção das APIs;
- validação de dados recebidos;
- proteção de rotas privadas;
- tratamento seguro de tokens e sessões;
- variáveis sensíveis exclusivamente no backend;
- logs adequados de erros;
- proteção das integrações externas.

Chaves de API, credenciais, tokens e secrets nunca devem ficar expostos no frontend.

---

# 12. BANCO DE DADOS

A estrutura de dados deve ser preparada pensando na evolução do produto.

As entidades devem ser organizadas de maneira que permitam relacionar corretamente:

**Usuário → informações financeiras → movimentações → análises → alertas → situação de acesso**

Evitar estruturas rígidas que dificultem futuras funcionalidades.

Toda informação deverá possuir identificação clara do usuário proprietário daquele dado.

---

# 13. EXPERIÊNCIA MOBILE

Como o GuiaSense possui potencial de uso frequente pelo celular, a experiência mobile deve receber a mesma prioridade da versão desktop.

Ações frequentes, principalmente cadastro e consulta de movimentações, devem exigir poucos passos.

Considerar elementos apropriados para dispositivos touch.

Evitar tabelas extensas como elemento principal em telas pequenas.

Quando necessário, transformar informações em:

- cards;
- listas;
- accordions;
- gráficos;
- resumos.

---

# 14. COMPONENTIZAÇÃO

Criar componentes reutilizáveis sempre que possível.

Exemplos:

- cards financeiros;
- cards de indicadores;
- alertas;
- gráficos;
- inputs;
- selects;
- botões;
- modais;
- cabeçalhos;
- navegação;
- mensagens;
- estados vazios;
- loading;
- feedback de sucesso e erro.

Manter um Design System consistente durante todo o desenvolvimento.

---

# 15. EXPERIÊNCIA DE USO

Toda ação realizada pelo usuário deve apresentar feedback visual adequado.

Exemplos:

- carregando;
- cadastro realizado;
- alteração salva;
- erro;
- informação excluída;
- nenhuma informação disponível;
- pagamento pendente;
- acesso bloqueado.

Nunca deixar o usuário sem saber se uma ação foi executada.

---

# 16. PRINCÍPIOS PARA DESENVOLVIMENTO

Durante todo o desenvolvimento seguir estas regras:

1. **Simplicidade acima de complexidade.**
2. Não adicionar funcionalidades apenas porque tecnicamente são possíveis.
3. Não criar telas poluídas.
4. Não transformar o GuiaSense em uma planilha financeira sofisticada.
5. Cada informação exibida precisa possuir uma finalidade clara.
6. Priorizar facilidade de aprendizado.
7. Manter responsividade em qualquer nova tela.
8. Pensar sempre na futura utilização via aplicativo.
9. Separar frontend, regras de negócio e integrações.
10. Utilizar IA somente quando ela agregar valor.
11. Não alterar funcionalidades ou conceitos já aprovados sem sinalizar previamente.
12. Novas funcionalidades relevantes devem ser propostas antes de serem implementadas.

---

# 17. DIREÇÃO DO PRODUTO

Ao tomar decisões de UX ou desenvolvimento, utilizar sempre esta pergunta:

**“Uma pessoa sem conhecimento financeiro conseguiria entender essa tela em poucos segundos?”**

Se a resposta for não, simplificar.

O GuiaSense deve fazer com que organizar as finanças pareça algo fácil.

A experiência final deve transmitir:

**“Eu abro o GuiaSense e rapidamente sei como está minha vida financeira e onde preciso prestar atenção.”**

---

# 18. DESENVOLVIMENTO EVOLUTIVO

Não construir funcionalidades futuras apenas por antecipação.

Desenvolver o sistema de maneira incremental.

Para cada nova funcionalidade:

1. definir objetivo;
2. definir fluxo;
3. definir layout;
4. validar experiência;
5. implementar;
6. testar desktop;
7. testar tablet;
8. testar mobile;
9. validar integração com backend;
10. somente então avançar.

Sempre preservar as funcionalidades anteriormente aprovadas.

Este documento deve funcionar como **contexto mestre do projeto GuiaSense** durante todo o desenvolvimento.