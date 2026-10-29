# Fontes, atribuições e rastreabilidade

Consulta em **29/10/2026**. Material didático independente. Referências evoluem; o facilitador deve
revisar as regras aplicáveis à organização e ao contexto antes de preparar exercícios.

## Fontes primárias

- [Dynamic Incident Response — Joshua Wright / SANS](https://www.sans.org/engage/dynamic-incident-response)
  e [livro e modelo DAIR](https://dynamicincidentresponse.com/): resposta iterativa, verificação,
  triagem, delimitação e loop Scope/Contain/Eradicate/Recover. Autoria atribuída a Joshua Wright;
  esta implementação não reproduz o livro ou o pôster e não implica endosso.
- [Playbook de referência — Felipe Nicácio](https://github.com/felipenicacio/dair-privacy-incident-response-playbook),
  materiais autorais declarados CC BY 4.0 no README consultado. A adaptação transforma o procedimento
  em atividades, injeções e critérios; reduz e parafraseia o caso fictício, sem copiar instrumentos binários.
  [Procedimento](https://github.com/felipenicacio/dair-privacy-incident-response-playbook/blob/main/playbook/01-procedimento-operacional.md),
  blob consultado `605c8b2673899df9cc3fb4d364fd15e0fdc1170c`;
  README consultado: blob `61cc41c9cf31efaef7f45026fa1804a46ac6495f`.
- [LGPD — Lei nº 13.709/2018, texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm),
  especialmente art. 48: deliberação sobre comunicação à autoridade e aos titulares.
- [ANPD — Comunicação de Incidente de Segurança](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis),
  orientação oficial relativa ao RCIS, Resolução CD/ANPD nº 15/2024. A página consultada informa
  prazo geral de três dias úteis nos arts. 6º e 9º e procedimento atual no SEI!ANPD.
  A plataforma não implementa peticionamento nem replica canais de versões anteriores do playbook.

## Mapeamento de requisitos

| Referência / princípio | Comportamento implementado | Limite / revisão humana |
|---|---|---|
| DAIR: resposta dinâmica | Evento 2 incrementa ciclo; novas atividades com anteriores abertas | Cenário fixo de três rodadas; não cobre todos os padrões de incidente |
| DAIR: verificar resposta | Critérios pedem testes de contenção/recuperação; facilitador avalia eficácia | Texto fornecido pelo participante não comprova execução real |
| Prepare e processo interno | Configurar procedimento e acrescentar atividade/papel/critério | Não valida automaticamente qualidade do procedimento |
| Evidências e incertezas | Origem, coletor/custódia textual, fuso e classificação epistemológica | Sem upload, hash ou cadeia de custódia forense |
| LGPD art. 48 | Deliberação pelo papel Controlador; ANPD e titulares em campos separados | Papel é convenção local; não comprova representação legal |
| RCIS art. 5º | Campos separados para afetação significativa e categorias I a VI | Avaliar requisitos cumulativos; larga escala não tem limiar numérico automático |
| RCIS arts. 6º/9º | Marco de ciência, prazo validado, fundamento e responsável | Sem cálculo; feriados, exceções e eventual regime específico exigem validação |
| Reavaliação e governança | Novas decisões com supersedes, ciclo, evidências e histórico | Não se certifica conformidade por contagem de tarefas |
| Debrief | Atividade e avaliação separam execução, eficácia e lacunas; relatório JSON | Melhorias são textuais com responsável e prazo, sem tracker dedicado |

As categorias do art. 5º do RCIS abrangem dados sensíveis; crianças, adolescentes ou idosos;
financeiros; autenticação; sigilo legal, judicial ou profissional; e larga escala. A presença de
categoria isolada não substitui a análise contextual de risco ou dano relevante. A decisão deve
explicitar fatos, hipóteses, incertezas e fundamento; pode ser revista com novas evidências.

O prazo validado não deve ser reiniciado automaticamente por uma nova injeção ou reavaliação.
A orientação de retenção de incidentes reais não é implementada pelo armazenamento local do exercício.
Este MVP não é ferramenta de registro regulatório de incidentes reais e não oferece certificação jurídica.
