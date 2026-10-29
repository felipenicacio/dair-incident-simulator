# Validação — v0.2

## Base e preservação

Em 29/10/2026, o PR #1 permanecia aberto e sem merge. A nova branch
`feature/iris-inspired-exercise-workspace` parte do MVP preservado, e entrega a estrutura genérica
completa em PR próprio contra main. Não foi realizado merge nem alterado o repositório do playbook.
Os registros locais da v1 são preservados em sua chave original, exportáveis e não usados como modelo.

## Testes automatizados

Node.js 24.21.0 / Windows: checagem de sintaxe e **12 testes aprovados**.

1. Workspace e exercício vazios, sem fatos predefinidos.
2. Exercícios isolados e IDs distintos.
3. Processo reutilizável, versões e cópias preservadas.
4. Pré-requisitos de início e cobertura de papéis pela equipe.
5. Cinco eventos configuráveis, liberação individual e novo ciclo explícito.
6. Dois cenários distintos encerrados sem eventos, ciclos ou decisão regulatória obrigatórios.
7. Devolução com evidência nova e histórico preservado.
8. Papéis, responsável e comandos inválidos sem mutação do original.
9. Exigência regulatória configurável e decisões fundamentadas/versionadas.
10. Relatório de participante sem eventos reservados ou atividades condicionadas não liberadas.
11. Congelamento da preparação e autoria de notas.
12. Servidor: rotas, cabeçalhos e bloqueio de arquivos fora da lista.

O teste HTTP exige acesso à rede local; a suíte completa foi executada com essa permissão. GitHub Actions
mantém as mesmas verificações em Node 24 / Ubuntu para push e pull request.

## Verificação no navegador

- Painel iniciou com zero exercícios/processos, apesar de haver dados da versão anterior no navegador.
- Criado exercício em branco, configurados contexto/objetivos e procedimento da biblioteca.
- Cadastrados facilitador e participante, evento próprio e atividade sem waypoint obrigatório.
- Iniciado, liberado evento, atribuída atividade ao integrante cadastrado.
- Registrada evidência fictícia, submetida e aprovada com avaliação nos quatro campos.
- Encerrado com debrief sem exigir decisão regulatória ou segundo ciclo.
- Recarregamento preservou situação encerrada, parecer, evidência e debrief.
- Relatório JSON exportado para conferência.
- Inspeção visual do painel: navegação lateral, indicadores, lista e estado vazio sem caso de demonstração.

Os exemplos inseridos durante QA são registros locais de teste, não conteúdo embarcado no aplicativo.
Testes completos de acessibilidade e compatibilidade entre navegadores não foram realizados.

## Limites e aceite complementar

Sem autenticação, colaboração remota, sigilo real dos eventos, anexos, auditoria inviolável, restauração
ou hospedagem. Não se declara pronta para operação corporativa compartilhada. Ainda não há edição/exclusão
de membros, atividades ou eventos; contexto e processo podem ser ajustados na preparação.

Antes da próxima fase, validar com usuários: linguagem das abas, ordem da preparação, critérios de
atividade, qualidade dos pareceres, navegação por teclado e uso em telas pequenas. A futura implementação
no servidor deve repetir as invariantes com identidade confiável e controle de concorrência.
