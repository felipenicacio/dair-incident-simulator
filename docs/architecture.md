# Arquitetura do MVP

## Decisão de implementação

O repositório estava vazio. Esta primeira entrega usa módulos JavaScript nativos, HTML/CSS e Node.js,
sem dependências, para tornar o fluxo jogável e testável imediatamente. A sugestão anterior de
React/TypeScript/Cloudflare permanece uma opção de evolução, não uma infraestrutura já implantada.
Não há hospedagem ou banco remoto provisionados neste PR.

```text
Navegador (estação compartilhada)
  public/app.mjs ── comandos ──> src/domain.mjs (transições puras)
       │                              │
       ├── localStorage <── estado validado + histórico
       └── exportação JSON (sem eventos futuros)

Node server.mjs ── lista explícita de 4 rotas estáticas, escuta em 127.0.0.1
```

O motor clona o estado de entrada, verifica invariantes e devolve novo estado. Comandos inválidos
não alteram o original. A interface persiste antes de apresentar sucesso; erros de armazenamento
são exibidos e o estado anterior permanece. Dados lidos com formato incompatível não são sobrescritos.
A validação de leitura é mínima, não é uma fronteira de segurança. Textos do usuário são escapados
na renderização. O servidor usa CSP, bloqueia arquivos fora da lista e não recebe dados de exercício.

## Modelo

| Entidade | Identificador / campos principais | Relações |
|---|---|---|
| Exercício | INC-2026-001; título, procedimento, estado, rodada, ciclo, schemaVersion | Agrega todos os registros |
| Atividade | ACA-; título, papel, responsável, waypoint, rodada, critério, estado | IDs de evidência e pareceres |
| Evento/injeção | EVT-; rodada, título, narrativa fictícia | Liberação progressiva pelo facilitador |
| Evidência | EVD-; autor, origem, horário observado/fuso, horário de registro, natureza, texto, simulated | Uma atividade |
| Decisão | DEC-; autor, ciclo, fundamento, deliberação, incertezas, evidências, supersedes | Evidências existentes; decisão anterior do mesmo tipo |
| Parecer | Revisor, horário, aprovar/devolver, execução, eficácia, lacuna, justificativa | Versão da atividade/evidenceCount |
| Trilha | LOG-; ator, papel, comando, horário, atividade, ciclo, rodada | Cronologia das transições |

IDs são sequenciais e estáveis dentro de um exercício. Não são identificadores globais entre sessões.
Evidências e decisões são acrescentadas; o motor não oferece edição ou exclusão de registros.
A trilha local é rastreabilidade didática, não log de auditoria resistente a adulteração.
Horário de registro usa relógio do computador em ISO UTC. Horário observado/fuso e prazo validado
são textos fundamentados pelo participante, sem validação de calendário ou ordenação cronológica.

## Estados e invariantes

Exercício: `preparacao → em_andamento → encerrado`. Configuração só antes do início. Encerramento
exige todos os eventos liberados, todas as atividades aprovadas e decisão regulatória no ciclo 2.
Não há reabertura após encerramento nesta versão.

Atividade: `pendente → em_execucao → em_validacao → aprovada` ou
`em_validacao → devolvida → em_validacao`. Atribuição é feita pelo facilitador; execução e submissão
exigem nome e papel atribuídos. Submissão exige evidência; ressubmissão exige evidência nova após
o último parecer. Parecer exige avaliações de execução, eficácia e processo e justificativa textual.

Rodadas não são fases obrigatórias do DAIR: liberar nova evidência não depende da conclusão das
atividades anteriores. A segunda injeção inicia ciclo 2; atividades e decisões anteriores permanecem.
Waypoints são metadados das atividades, não bloqueios sequenciais.

Decisões regulatórias exigem papel Controlador e campos separados para afetação significativa,
categorias, ANPD, titulares, ciência, prazo validado e fundamento do prazo. Não se inferem resultados
de pontuação ou volume. O preenchimento não prova correção jurídica; o facilitador avalia o fundamento.
Não há escolha automática de comunicar/não comunicar nem conexão com canais externos.

## Evolução para ambiente corporativo

1. Extrair o motor para serviço com TypeScript e contratos versionados; manter testes de invariantes.
2. Autenticar participantes (SSO), autorização no servidor e segregação de organizações, exercícios
   e funções, incluindo independência da revisão e sigilo real dos eventos ainda não liberados.
3. Persistir exercícios, versões e trilha no banco com transações, controle de concorrência e backup.
4. Armazenar anexos em repositório privado, com limites, análise de conteúdo, hashes calculados sobre
   bytes reais e cadeia de custódia adequada. Nunca criar hashes ou protocolos fictícios como prova real.
5. Publicar interface React em Cloudflare Pages e API em Workers/D1 ou serviço equivalente após
   avaliação de requisitos, retenção, privacidade, controle de acesso e adequação da arquitetura.
6. Editor completo de cenários, eventos condicionais, tempos simulados, múltiplos exercícios,
   restauração/importação validada e testes de colaboração/acessibilidade.

A futura API deve reaplicar todas as invariantes no servidor: as verificações do navegador não
são mecanismo de autorização confiável.
