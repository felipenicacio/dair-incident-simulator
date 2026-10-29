# DAIR Incident Simulator

Plataforma de treinamento corporativo de resposta a incidentes envolvendo dados pessoais.

MVP 0.1: um facilitador conduz um exercício em uma estação compartilhada. A equipe executa atividades,
produz evidências simuladas, registra decisões e recebe avaliação humana de execução, eficácia e lacunas
do processo interno. Não há envio de comunicações reais.

## Executar

Requer Node.js 22 ou superior (validado em Node 24). Sem dependências externas ou etapa de instalação.

```sh
npm start
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000). O servidor aceita apenas conexões locais.
Para outra porta, configure a variável de ambiente `PORT` antes de iniciar.

```sh
npm run check
npm test
```

## Primeiro exercício

1. Como **Facilitador**, informe seu nome. Antes de iniciar, adapte o título, o fluxo interno e acrescente
   atividades com papel, rodada, waypoint DAIR e critérios de aceite.
2. Inicie o exercício e atribua cada atividade pelo nome exato do participante.
3. Alterne nome e papel para o participante atribuído. Registre evidências com origem, coletor/custódia
   simulada, horário com fuso e natureza do registro. Submeta a atividade ao facilitador.
4. Retorne ao papel **Facilitador**. Avalie execução, eficácia e lacunas do procedimento separadamente.
   Aprove ou devolva com justificativa. Uma devolução exige nova evidência antes da ressubmissão.
5. Libere o próximo evento quando adequado ao exercício, inclusive com tarefas pendentes. A exportação
   via token persistente provoca a segunda iteração, preservando as decisões e os registros anteriores.
6. No papel **Controlador**, registre a decisão regulatória com evidências, afetação significativa,
   categorias do RCIS, deliberações sobre ANPD e titulares, ciência e prazo validado. Para reavaliar,
   selecione a decisão anterior; ambas permanecem no histórico.
7. Libere a última rodada, conclua recuperação e debrief, valide todas as atividades e encerre.
   O motor também exige decisão regulatória no segundo ciclo. Exporte o relatório JSON a qualquer momento.

**Persistência:** o exercício fica no armazenamento local deste navegador e desta origem (host/porta).
Limpar dados do navegador elimina o exercício; exporte o relatório antes. Não há importação/restauração
de relatório nesta versão. Para novo exercício, use outro perfil de navegador ou, após exportar,
limpe os dados locais desta origem. Não abra várias abas para editar simultaneamente.

## Cenário e referências

O caso fictício **INC-2026-001** adapta o
[dair-privacy-incident-response-playbook](https://github.com/felipenicacio/dair-privacy-incident-response-playbook):
200 registros inicialmente identificados, bloqueio de conta insuficiente, exportação posterior de
30.000 titulares por token persistente e reentrada no loop de resposta. Novos eventos são liberados
pelo facilitador; decisões são abertas e avaliadas por humanos, sem árvore automática de consequências.

- DAIR: Joshua Wright / SANS Institute, com **Scope, Contain, Eradicate, Recover** revisitáveis.
- LGPD, art. 48 e Resolução CD/ANPD nº 15/2024: avaliação humana contextual e rastreável.
- [Arquitetura e modelo](docs/architecture.md)
- [Rastreabilidade metodológica e regulatória](docs/references.md)
- [Validação, roteiro de aceite e limitações](docs/validation.md)

## Alcance e limites

Esta é a base jogável do produto, para treinamento com dados fictícios. A escolha de papel é uma
convenção do exercício: qualquer pessoa com acesso ao navegador pode alternar os papéis ou modificar
os dados locais. Eventos futuros estão no código entregue ao navegador; ocultá-los na interface não
oferece sigilo contra inspeção. O facilitador pode validar o próprio debrief nesta demonstração.

Não há contas, sessões autenticadas, colaboração entre computadores, isolamento entre organizações,
upload de arquivos, preservação forense, assinatura de evidências, proteção contra adulteração,
cálculo automático de prazo regulatório ou atestado de conformidade. Não publique esta versão como
serviço corporativo compartilhado. A arquitetura documenta a evolução necessária.

O repositório estava vazio na inspeção de 29/10/2026. A `main` recebeu somente este README em sua
forma mínima inicial para permitir um pull request; todo o MVP e a documentação expandida seguem
na branch `feature/mvp-incident-simulation`, sem merge automático.

Adaptação independente, sem endosso da SANS ou ANPD. Créditos dos materiais de referência em
[fontes e atribuições](docs/references.md). Nenhuma licença de terceiros foi presumida para o código novo.
