# Fontes e rastreabilidade — v0.2

## IRIS como modelo de organização

- [Repositório IRIS](https://github.com/dfir-iris/iris-web)
- [Documentação oficial](https://docs.dfir-iris.org/latest/)

A organização por casos, tarefas, evidências, notas, equipe, cronologia e relatórios orienta a navegação
do produto próprio. A adaptação conceitual para exercícios está descrita em [product-model.md](product-model.md).
Não há importação de código, componentes, marca ou imagens do IRIS, nem dependência de sua instalação.
O repositório IRIS declara LGPL-3.0; eventual reutilização futura de código exige avaliação específica.

## Referências metodológicas, sem cenário predefinido

- [DAIR — Joshua Wright / SANS](https://www.sans.org/engage/dynamic-incident-response)
  e [livro/modelo](https://dynamicincidentresponse.com/): verificação, triagem e loop
  Scope/Contain/Eradicate/Recover revisitáveis. O facilitador pode classificar atividades por waypoint
  e abrir ciclos fundamentados; a plataforma não impõe uma sequência de fases.
- [dair-privacy-incident-response-playbook — Felipe Nicácio](https://github.com/felipenicacio/dair-privacy-incident-response-playbook):
  referência metodológica de processo e governança. Conteúdos autorais declarados CC BY 4.0 pelo projeto.
  O cenário demonstrativo desse repositório não é importado, preenchido nem sugerido como padrão.
- [LGPD — texto compilado, especialmente art. 48](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).
- [ANPD — Comunicação de Incidente de Segurança / RCIS](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis).

## Aplicação no produto

| Princípio | Implementação | Limite |
|---|---|---|
| Processo e cenário independentes | Biblioteca de procedimentos e cópia versionada no exercício | Atividades são definidas por exercício |
| Resposta iterativa DAIR | Liberação livre de eventos e novo ciclo com motivo | Sem inferência automática de necessidade de reentrada |
| Evidência e incerteza | Texto, origem, horário/fuso e natureza | Sem comprovação forense ou hash de arquivo |
| Avaliação humana | Parecer separa execução, eficácia e lacunas | Preenchimento não demonstra correção ou conformidade |
| LGPD/ANPD quando aplicáveis | Exigência regulatória configurável; decisão pelo Controlador | Não determina automaticamente aplicabilidade |
| Rastreabilidade regulatória | Afetação significativa, categorias, ANPD/titulares, ciência, prazo e fundamento | Sem cálculo automático, envio ou validação jurídica |
| Aprendizagem | Debrief com lições e melhorias | Sem gestão dedicada do plano de ação |

A decisão regulatória exige fundamento contextual e não deriva de quantidade, pontuação ou categoria
isolada. Os campos permitem registrar requisitos cumulativos do art. 5º do RCIS e deliberações separadas
sobre ANPD e titulares. Prazo aplicável, calendário, feriados, marco de ciência e eventuais exceções
exigem avaliação humana. Novo ciclo não reinicia prazo automaticamente.

As referências regulatórias orientam o desenho dos campos, não atestam conformidade do exercício.
Regras vigentes e contexto devem ser revisados ao preparar o treinamento. Produto independente,
sem endosso da SANS, do IRIS ou da ANPD; não destinado a operar incidentes reais nesta versão.
