# DAIR Incident Simulator

**Versão 0.2.1 — ambiente genérico inspirado na organização do IRIS, com exemplo preenchido opcional.**

Produto próprio, em português, para preparar e conduzir simulações corporativas. A instalação começa
com **zero exercícios e zero processos**. Não há cenário, eventos, atividades, rodadas, quantidades ou
deliberações predefinidas. O conteúdo é criado pelo facilitador para cada organização.

## Executar e verificar

Node.js 22 ou superior (validado em Node 24). Sem instalação de dependências.

```sh
npm start
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Explorar um exercício preenchido

No painel, com o papel **Facilitador**, clique em **Explorar exemplo preenchido**. O carregamento é
opcional e preserva seus registros. São adicionadas três cópias independentes de um cenário fictício
de compartilhamento indevido de documentos: **Preparação**, **Para continuar** e **Concluído para consulta**.

Comece pela cópia concluída para ler evidências, pareceres, decisões e debrief. Use a cópia em andamento
para corrigir uma atividade devolvida e praticar o restante. Na própria tela há roteiro e botões para
assumir os participantes fictícios. Reabrir o exemplo preserva o progresso, sem duplicar registros.

Veja o [roteiro detalhado do exemplo](docs/demo-walkthrough.md). Se o servidor já estava aberto antes
desta atualização, encerre com **Ctrl+C**, execute `npm start` novamente e recarregue o navegador.

```sh
npm run check
npm test
```

## Organização da plataforma

- **Exercícios:** painel com situação, organização e progresso; criação de exercícios em branco.
- **Processos de resposta:** procedimentos independentes dos cenários, reutilizáveis e versionados.
- **Ambiente do exercício:** Visão geral, Atividades, Evidências, Decisões, Cronologia, Notas, Equipe,
  Facilitador e Debrief.

A referência é a organização de trabalho do [IRIS](https://github.com/dfir-iris/iris-web): lista de casos,
ambiente do caso e registros separados por finalidade. O código, a interface e o motor são próprios.
Não é um fork, tradução ou distribuição do IRIS. [Mapeamento das telas](docs/product-model.md).

## Primeiro exercício

1. No papel **Facilitador**, cadastre um procedimento em **Processos de resposta**.
2. Em **Exercícios**, crie um exercício em branco e abra a aba **Facilitador**.
3. Defina organização fictícia, objetivos e contexto. Se aplicável, marque a exigência de avaliação
   regulatória para encerramento. Selecione uma versão do processo de resposta.
4. Cadastre facilitador e participantes nos papéis necessários. Adicione eventos opcionais e atividades
   com critérios de aceite, papel responsável e, opcionalmente, waypoint DAIR e evento de liberação.
5. Revise e inicie. Nas atividades disponíveis, atribua o responsável cadastrado no papel correspondente.
6. Alterne nome e papel para o participante: registre evidência simulada com origem, horário/fuso e
   natureza do registro e submeta. Volte ao facilitador para aprovar ou devolver com parecer fundamentado.
7. Libere eventos individualmente na área do facilitador. Abra novo ciclo com justificativa quando a
   resposta precisar ser reavaliada. Nenhuma liberação exige concluir todas as atividades anteriores.
8. Use Notas e Decisões para registrar análises e deliberações vinculadas às evidências. Decisões
   regulatórias são registradas pelo papel Controlador, com campos separados e revisão humana.
9. Após validar todas as atividades, consolide lições e melhorias na aba Debrief e encerre. A decisão
   regulatória só é exigida se prevista na preparação. Não há número obrigatório de eventos ou ciclos.
10. Exporte o relatório JSON. O facilitador exporta o planejamento completo, inclusive eventos reservados;
    os demais papéis exportam apenas eventos liberados e atividades disponíveis.

## Dados locais e compatibilidade

Cada navegador/origem mantém seu painel e exercícios em `dair-workspace-v2`. Os dados da versão anterior
em `dair-exercise-v1` são preservados separadamente, sem carregá-los como modelo; um aviso permite
exportá-los. Não há migração automática nem importação/restauração de relatórios nesta entrega.
A alteração de um processo na biblioteca não altera a versão preservada nos exercícios.

Limpar dados do navegador elimina os registros locais. Evite edição simultânea em várias abas;
o recarregamento por alteração externa não oferece transações nem controle de concorrência.

## Escopo desta etapa

Esta entrega é o **protótipo navegável funcional** do modelo genérico, com persistência local e motor
testado. Não é ainda a versão de acesso individual por computadores diferentes. A alternância de
papéis é uma convenção de demonstração: não há autenticação, autorização confiável no servidor,
sigilo real de eventos futuros, anexos, cadeia de custódia forense ou auditoria inviolável.
O papel Observador é somente leitura pelo motor do exercício. O facilitador pode avaliar o próprio
trabalho nesta demonstração; segregação de funções real exige evolução de identidade e permissões.

Preparação permite adicionar registros; edição de contexto e nova vinculação de processo são possíveis
antes do início. Edição/exclusão de atividades, eventos e membros não faz parte desta entrega.
Nenhuma comunicação real é enviada e não há cálculo automático de prazo ou conformidade.

- [Modelo do produto e critérios de aceite](docs/product-model.md)
- [Arquitetura, dados e evolução](docs/architecture.md)
- [Fontes e rastreabilidade metodológica](docs/references.md)
- [Testes e validação](docs/validation.md)

O PR anterior permanece preservado. Esta etapa segue na branch
`feature/iris-inspired-exercise-workspace`, para revisão sem merge automático.

DAIR: Joshua Wright / SANS. Referência metodológica:
[dair-privacy-incident-response-playbook](https://github.com/felipenicacio/dair-privacy-incident-response-playbook).
Produto independente, sem endosso institucional. Não presume decisão jurídica ou correção do processo interno.
