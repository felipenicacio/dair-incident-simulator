# Modelo do produto e navegação — v0.2

## Princípio

Usar o IRIS como modelo de organização e experiência para um produto próprio de simulação em português.
A organização fornece o processo; o facilitador prepara o cenário; a equipe executa e produz evidências;
o facilitador avalia execução, eficácia e lacunas. Nenhum caso de referência preenche o ambiente.

| Referência de organização IRIS | Tela própria | Comportamento nesta entrega |
|---|---|---|
| Lista de casos | Painel de exercícios | Criar vários exercícios, listar situação e progresso |
| Ambiente do caso | Ambiente do exercício | Cabeçalho, situação e navegação por abas |
| Tarefas | Atividades | Papel, critério, responsável, evidência e parecer |
| Evidências | Evidências | Registro textual simulado vinculado à atividade |
| Timeline | Cronologia | Eventos liberados e comandos com ator/horário |
| Notas | Notas | Análises da equipe com autoria e horário |
| Equipes | Equipe | Participantes e papéis operacionais; sem login nesta fase |
| Relatórios | Debrief / exportação | Lições, melhorias, pareceres e relatório JSON |
| Recursos específicos de treinamento | Facilitador | Preparar, liberar eventos, abrir ciclos e avaliar |

O layout usa navegação lateral, painel tabular e ambiente por abas. Não reproduz código, marca,
imagens ou componentes do IRIS. Inspiração funcional não significa equivalência de recursos.

## Fluxo navegável

```text
Exercícios → Novo exercício → Facilitador
  ├─ Contexto, objetivos e exigência de avaliação regulatória
  ├─ Processo de resposta (biblioteca independente, versão preservada)
  ├─ Equipe e papéis
  ├─ Eventos opcionais
  ├─ Atividades e critérios (desde início ou após evento)
  └─ Revisar e iniciar
        ├─ Atividades → atribuir → executar → evidenciar → submeter → parecer
        ├─ Facilitador → liberar evento / abrir novo ciclo com justificativa
        ├─ Evidências / Decisões / Cronologia / Notas / Equipe
        └─ Debrief → lições e melhorias → encerrar → exportar
```

## Papéis

- Facilitador: configura, atribui, libera eventos, abre ciclos, avalia e encerra.
- Segurança, Privacidade e Controlador: executam atividades atribuídas ao nome/papel; registram
  notas e decisões se cadastrados. Decisão regulatória exige papel Controlador.
- Observador: consulta; comandos de alteração são rejeitados pelo motor do exercício.

A seleção local de papéis não é autenticação. Navegador e código têm todos os dados. As restrições
são invariantes didáticas; não protegem material do facilitador contra inspeção ou adulteração.

## Critérios de aceite

1. A instalação nova mostra zero exercícios/processos; nenhum fato é sugerido como padrão.
2. Criar múltiplos exercícios com IDs distintos e registros isolados.
3. Reusar um processo em cenários diferentes e preservar a versão selecionada ao atualizar a biblioteca.
4. Configurar objetivos, contexto, equipe, atividades e qualquer quantidade de eventos, inclusive zero.
5. Liberar cada evento explicitamente e disponibilizar atividades condicionadas a ele.
6. Reavaliar em novo ciclo sem gatilho automático ou número obrigatório de ciclos.
7. Submeter com evidência, devolver e exigir nova evidência antes da ressubmissão.
8. Concluir exercícios diferentes sem alterar código e sem decisão regulatória obrigatória por padrão.
9. Se avaliação regulatória foi prevista, exigir seu registro fundamentado antes de encerrar.
10. Preservar dados antigos sem usá-los como modelo dos novos exercícios.

## Próximo marco após revisão

Validar a navegação com facilitadores e participantes. Depois introduzir identidade autenticada,
autorização no servidor, banco de dados, sigilo real das injeções e colaboração entre computadores.
Editor completo de eventos/atividades, papéis organizacionais customizáveis, importação e anexos
continuam no backlog. Não há publicação hospedada ou integração externa neste PR.
