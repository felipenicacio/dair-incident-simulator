# Arquitetura — ambiente genérico v0.2

A aplicação mantém Node.js e módulos JavaScript nativos, sem dependências externas. Esta etapa evolui
a experiência e o motor local. Não provisiona infraestrutura ou migra para outra stack.

```text
Navegador
  public/app.mjs: painel, biblioteca de processos, ambiente com abas e rotas por hash
    → src/domain.mjs: transições puras e relatórios
    → localStorage: workspace versionado com múltiplos exercícios
    → download: relatório JSON por exercício
Node server.mjs: cinco rotas estáticas explícitas, em 127.0.0.1
```

## Modelo de dados

| Entidade | Campos e relações |
|---|---|
| Workspace v2 | schemaVersion, exercises[], processes[] |
| Processo | PRO-, título, conteúdo, versão crescente na biblioteca |
| Exercício | EXE-, organização, objetivos, cenário, estado, ciclo, privacyRequired, processSnapshot |
| Equipe | Nome e papel no exercício; um nome pode ter mais de um papel |
| Atividade | ACA-, título, papel, responsável, critérios, waypoint opcional, eventId opcional, estado |
| Evento | EVT-, título, conteúdo e releasedAt; sem rodada fixa |
| Evidência | EVD-, atividade, autor, origem/custódia textual, horário observado/fuso, registro, natureza |
| Decisão | DEC-, tipo, fundamento, resultado, incertezas, evidências, ciclo, supersedes |
| Nota | NOT-, texto, autoria e horário |
| Parecer | Revisor, parecer, execução, eficácia, lacuna, justificativa e evidenceCount |
| Debrief | Lições, melhorias/responsáveis/prazos em texto, autor e horário |
| Trilha | LOG-, ação, ator/papel, hora, atividade/evento, ciclo e motivo de novo ciclo |

IDs são estáveis dentro do workspace para exercícios/processos e dentro do exercício para os demais
registros. Não são IDs globais de produção. A biblioteca guarda a versão mais recente do processo;
cada exercício preserva uma cópia independente da versão selecionada. Alterações posteriores na
biblioteca não propagam para essas cópias. Antes de iniciar, o facilitador pode selecionar nova versão.
As atividades são configuradas por exercício; esta versão não contém biblioteca de templates de tarefas.

## Invariantes

- Estados do exercício: preparação, em andamento, encerrado. Preparação congela ao iniciar.
- Início exige organização, objetivos, cenário, processo, atividade e equipe cobrindo seus papéis,
  incluindo facilitador. Eventos e exigência regulatória são opcionais.
- Eventos são liberados individualmente, em qualquer ordem. Não incrementam ciclos automaticamente.
- Atividades ficam disponíveis desde início ou após seu evento. O facilitador vê todas para planejar.
- Novo ciclo exige justificativa e preserva registros anteriores. Não há limite predefinido.
- Atribuição exige integrante com nome/papel correspondente. Submissão exige evidência nova desde o
  último parecer. Somente facilitador registra parecer de aprovação/devolução.
- Decisão exige autoria cadastrada, evidências existentes e fundamento. Regulatório exige Controlador
  e campos específicos. Uma decisão substituída não recebe duas substituições concorrentes.
- Encerramento exige todas as atividades validadas e debrief preenchido; exige decisão regulatória
  somente quando prevista. Eventos sem atividades associadas podem permanecer sem liberação ao encerrar.
- Observador não altera o exercício. As convenções de papel não constituem segurança de acesso.

## Persistência e compatibilidade

A chave `dair-workspace-v2` inicia vazia e não lê o exercício antigo como semente. A chave anterior
`dair-exercise-v1` fica intacta; a interface oferece download independente. Relatórios não têm importação.
O formato básico do workspace é checado ao carregar; isso não constitui validação de entrada não confiável.

As transições clonam o original. A interface salva antes de anunciar sucesso. Falha de armazenamento
não substitui o estado em memória. Atualizações em outra aba recarregam a página, mas não garantem
controle de concorrência. Papéis/nome da demonstração reiniciam ao recarregar; os exercícios persistem.

Textos são escapados antes da renderização. CSP restringe recursos à origem; servidor não expõe arquivos
fora da lista nem aceita operações de persistência. A trilha local é didática e adulterável. Datas de
registro vêm do computador em UTC; horários observados e prazos são textos sujeitos à validação humana.

## Fronteira de evolução

O módulo opcional `src/demo.mjs` cria três checkpoints fictícios por meio das mesmas transições do motor:
preparação, execução com pendências e encerramento. `loadDemo` clona o workspace, adiciona processo e
exercícios sem substituir registros e identifica o conjunto por `demo.id`. Novo carregamento abre o
conjunto existente, preservando progresso. Nenhum dado demonstrativo é carregado pela fábrica genérica.
As cópias são independentes. O roteiro e a apresentação de decisões em português ficam na interface;
não há lógica específica do cenário em `src/domain.mjs`.

Para colaboração real: autenticação, autorização por organização/exercício no servidor, segregação de
funções, eventos reservados mantidos no servidor, transações e versionamento de concorrência no banco,
backup/restauração e trilha resistente a adulteração. Somente depois introduzir anexos privados,
verificação de integridade sobre bytes reais e requisitos de retenção. Reaplicar invariantes no servidor.

React/TypeScript e serviços de hospedagem podem ser avaliados nessa evolução; não são entregues aqui.
O motor mantém contratos testáveis independentemente da futura interface ou persistência.
