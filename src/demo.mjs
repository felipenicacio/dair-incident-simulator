import { addExercise, saveProcess, transition } from './domain.mjs';

export const DEMO_ID = 'compartilhamento-documentos-v1';
export const demoActors = {
  facilitator: { name: 'Marina — demonstração', role: 'Facilitador' },
  security: { name: 'Rafael — demonstração', role: 'Segurança' },
  privacy: { name: 'Lia — demonstração', role: 'Privacidade' },
  controller: { name: 'Bruno — demonstração', role: 'Controlador' },
  observer: { name: 'Alex — demonstração', role: 'Observador' }
};
const title = 'Compartilhamento indevido de documentos';
const procedure = `PROCEDIMENTO FICTÍCIO · Uso exclusivo em treinamento.
1. Registrar o relato, preservar a trilha de acesso e acionar Segurança, Privacidade e representante do controlador.
2. Delimitar os documentos e titulares afetados. Separar confirmação de hipótese e registrar o marco de ciência.
3. Restringir permissões, preservar registros e testar o acesso externo antes de declarar contenção.
4. Privacidade avalia riscos aos titulares. O controlador delibera, com fundamento, sobre ANPD e titulares, prazo e responsáveis.
5. Reavaliar escopo e decisões quando novos documentos ou acessos forem identificados.
6. Validar o serviço e os controles, preparar comunicações simuladas e registrar limitações.
7. O facilitador avalia execução, eficácia e lacunas; consolida melhorias com responsável e prazo.`;
const activityPlan = [
  ['Confirmar o incidente e preservar registros', 'Segurança', 'Verify and Triage', '', 'Registrar origem, ciência do controlador, dados conhecidos, lacunas e preservação dos registros sintéticos.'],
  ['Restringir compartilhamento e comprovar contenção', 'Segurança', 'Contain', '', 'Remover o convite externo e testar acesso com identidade externa e sessão existente. Preservar a evidência de teste.'],
  ['Avaliar inicialmente o risco aos titulares', 'Privacidade', 'Scope', 'EVT-001', 'Identificar categorias, possíveis danos e incertezas. Subsidiar a decisão do controlador sem presumir comunicação por volume.'],
  ['Reavaliar risco após nova informação', 'Privacidade', 'Scope', 'EVT-002', 'Atualizar a análise com os documentos de saúde identificados e registrar o que continua desconhecido.'],
  ['Preparar e simular as comunicações', 'Controlador', 'Contain', 'EVT-002', 'Documentar conteúdo, destinatários, canal, responsável, prazo e tratamento de lacunas. Não enviar ou inventar protocolo real.'],
  ['Validar recuperação e controles', 'Segurança', 'Recover', 'EVT-003', 'Testar acesso legítimo e bloqueio externo, revisar permissões e registrar monitoração e risco residual.']
];

// Build every checkpoint through the same engine as real local exercises: no fabricated statuses.
function buildCheckpoints(id, process) {
  let s, minute = 0;
  const base = Date.parse('2026-10-26T11:00:00Z');
  const act = (action, actor = demoActors.facilitator) => {
    const at = new Date(base + minute * 60000).toISOString(); minute += 2;
    s = transition(s, actor, action, at);
  };
  const evidence = (activityId, actor, content, source, observedAt) => {
    act({ type: 'evidence', activityId, content: `SIMULAÇÃO · ${content}`, source: `Fonte sintética: ${source}; coletor/custódia: ${actor.name}. Sem arquivo ou hash real.`, observedAt, certainty: 'confirmado' }, actor);
    return s.evidence.at(-1).id;
  };
  const assign = (activityId, actor) => act({ type: 'assign', activityId, assignee: actor.name });
  const submit = (activityId, actor) => act({ type: 'submit', activityId }, actor);
  const review = (activityId, verdict, execution, effectiveness, processGap, feedback) => act({ type: 'review', activityId, verdict, execution, effectiveness, processGap, feedback });
  const approve = (activityId, feedback, gap = 'Nenhuma lacuna adicional identificada nesta entrega.') => review(activityId, 'aprovar', 'Os critérios desta atividade foram atendidos nos registros simulados.', 'O resultado e suas limitações estão descritos; o parecer não atesta execução real.', gap, feedback);
  const decisionFields = {
    type: 'decision', kind: 'regulatoria',
    anpd: 'Comunicar em caráter preliminar no exercício, com lacunas explicitadas e acompanhamento da complementação. Nenhum envio real.',
    holders: 'Comunicar individualmente aos 12 colaboradores fictícios, em linguagem acessível, com medidas de proteção e canal de contato. Nenhum envio real.',
    awareness: '26/10/2026 09:15 -03:00: o representante do controlador recebe a confirmação de acesso externo a documentos pessoais. Marco mantido na reavaliação.',
    validatedDeadline: '29/10/2026, até 18:00 -03:00, como prazo validado SOMENTE para o calendário fictício deste exercício. Meta interna de preparo/envio simulado: 26/10/2026.',
    deadlineBasis: 'Premissa didática: prazo geral de 3 dias úteis; dias 27, 28 e 29/10 úteis no calendário fictício aprovado; sem feriado local, regra setorial ou regime específico aplicável nesta simulação. Bruno valida a premissa. Em uso real, confirmar calendário, marco e regras aplicáveis; não usar este exemplo como cálculo jurídico.'
  };
  // The generic factory remains empty; only this opt-in fixture supplies the content.
  s = addExercise({ schemaVersion: 2, exercises: [], processes: [] }, title).exercises[0]; s.id = id;
  act({ type: 'configure', title, organization: 'Lume Serviços — organização fictícia',
    objectives: 'Exercitar coordenação, delimitação do escopo, contenção comprovada, avaliação de riscos aos titulares, revisão de decisões e aprendizado. Todos os nomes, fatos, horários e registros são fictícios.',
    scenario: 'Uma pasta de documentos de colaboradores foi compartilhada por engano com uma identidade externa. O exercício começa com um relato e evolui conforme registros sintéticos são apresentados. Não há arquivos pessoais reais, credenciais ou serviços externos conectados.', privacyRequired: true });
  act({ type: 'useProcess', process });
  for (const actor of Object.values(demoActors)) act({ type: 'addMember', ...actor });
  for (const [eventTitle, content] of [
    ['Relato confirmado pelo controlador', 'SIMULAÇÃO · Às 09:15 de 26/10/2026 (-03:00), registros sintéticos confirmam que uma identidade externa consultou e baixou documentos de folha e dados bancários de 12 colaboradores adultos. O controlador toma ciência. Não se conhece eventual redistribuição.'],
    ['Novo documento amplia a avaliação de risco', 'SIMULAÇÃO · Às 10:00, a revisão da mesma pasta identifica atestados com informações de saúde dos mesmos 12 colaboradores. Registros sintéticos vinculam a leitura dos atestados à mesma identidade externa; não há confirmação de download específico desses arquivos. Esse novo fato exige reavaliar os danos potenciais e as medidas aos titulares. Não há novos titulares confirmados nem prova de eliminação de cópias externas.'],
    ['Validação do serviço e dos controles', 'SIMULAÇÃO · Às 10:40, o administrador apresenta relatório sintético de permissões revisadas e solicita validação independente de acesso legítimo, bloqueio externo e monitoração. A ausência de novos alertas não comprova eliminação de cópias já baixadas.']
  ]) act({ type: 'addEvent', title: eventTitle, content });
  for (const [activityTitle, role, waypoint, eventId, criteria] of activityPlan) act({ type: 'addActivity', title: activityTitle, role, waypoint, eventId, criteria });
  const preparation = structuredClone(s);

  minute = 75; // 09:15 -03:00. Audit records are time-ordered, not implied to be real events.
  act({ type: 'start' }); act({ type: 'release', eventId: 'EVT-001' });
  assign('ACA-001', demoActors.security);
  const confirmation = evidence('ACA-001', demoActors.security, 'Trilha sintética preservada: convite externo indevido, consulta e download confirmados. Escopo inicial: folha e dados bancários de 12 colaboradores. Controlador informado às 09:15. Não se conhece redistribuição.', 'registro de acesso DEMO-LOG-01', '26/10/2026 09:15 -03:00');
  submit('ACA-001', demoActors.security);
  approve('ACA-001', 'Triagem aceita. Manter rastreáveis as incertezas sobre cópia e redistribuição.');
  assign('ACA-002', demoActors.security);
  evidence('ACA-002', demoActors.security, 'Convite externo removido. O registro inicial não inclui teste de acesso nem verificação da sessão já aberta.', 'registro administrativo DEMO-ADM-01', '26/10/2026 09:28 -03:00');
  submit('ACA-002', demoActors.security);
  review('ACA-002', 'devolver', 'Remoção de permissão registrada; falta atender o critério de teste.', 'A eficácia da contenção ainda não está demonstrada.', 'O procedimento interno não apresentava roteiro mínimo para teste de sessão externa.', 'Rafael deve registrar nova evidência de teste com identidade externa e sessão existente; depois submeter novamente.');
  assign('ACA-003', demoActors.privacy);
  const risk1 = evidence('ACA-003', demoActors.privacy, 'Dados financeiros e identificação podem facilitar fraude e engenharia social. Há potencial de afetação significativa; a categoria financeira é relevante, mas o número de titulares não decide sozinho a comunicação. Não há, neste momento, saúde confirmada ou conclusão sobre redistribuição.', 'avaliação didática de risco v1', '26/10/2026 09:35 -03:00');
  submit('ACA-003', demoActors.privacy);
  act({ ...decisionFields, evidenceIds: [confirmation, risk1], outcome: 'Preparar comunicação preliminar à ANPD e comunicação aos titulares na simulação.',
    rationale: 'Deliberação humana de Bruno, apoiada pela avaliação de Lia: acesso não autorizado confirmado, dados pessoais financeiros e possibilidade contextual de fraude com afetação significativa dos direitos. A conclusão decorre da combinação de fatos e riscos, não de uma pontuação ou do total de 12 titulares.',
    significantImpact: 'Possibilidade fundamentada de fraude financeira e dano material por uso de dados de folha/bancários junto à identificação.',
    categories: 'Dados financeiros confirmados, categoria do art. 5º do RCIS. Saúde ainda não identificada nesta versão. Não se presume larga escala.',
    unknowns: 'Redistribuição e retenção pelo destinatário externo desconhecidas. Lista documental ainda sob revisão. Complementar a comunicação simulada conforme novos fatos.' }, demoActors.controller);
  act({ type: 'note', content: 'SIMULAÇÃO · Reunião de coordenação: o parecer devolvido em ACA-002 não encerra a resposta. Segurança comprovará a contenção; Privacidade revisará o conjunto documental; o controlador acompanha as comunicações. A decisão é do controlador e não substitui o parecer da atividade.' }, demoActors.facilitator);
  const ongoing = structuredClone(s);

  minute = 120; // 10:00 -03:00.
  evidence('ACA-002', demoActors.security, 'Novo teste sintético: identidade externa recebe acesso negado; sessão existente invalidada e tentativa com o mesmo vínculo negada. Acesso legítimo preservado. A revogação não elimina cópias eventualmente já obtidas.', 'roteiro e resultado DEMO-TESTE-02', '26/10/2026 10:00 -03:00');
  submit('ACA-002', demoActors.security);
  approve('ACA-002', 'Correção aceita: evidência anterior e parecer de devolução foram mantidos; o novo teste demonstra a contenção do caminho conhecido.', 'Incluir o roteiro de teste de sessão no procedimento; responsável Rafael; prazo fictício 09/11/2026.');
  act({ type: 'release', eventId: 'EVT-002' });
  act({ type: 'newCycle', reason: 'A identificação de documentos de saúde exige reavaliar danos, medidas e conteúdo da comunicação. O marco de ciência permanece o inicial.' });
  approve('ACA-003', 'A avaliação inicial é aceita como registro dos fatos conhecidos naquele momento. Nova informação será tratada em ACA-004, sem reescrever o histórico.');
  assign('ACA-004', demoActors.privacy);
  const risk2 = evidence('ACA-004', demoActors.privacy, 'Atestados com informação de saúde foram identificados no conjunto; registros sintéticos confirmam sua leitura pela identidade externa, mas não download específico desses documentos. Mantêm-se 12 titulares; acrescenta-se possibilidade de discriminação, constrangimento e dano moral. Não há confirmação de redistribuição. A recuperação técnica não extingue esse risco residual.', 'avaliação didática de risco v2 / inventário documental sintético', '26/10/2026 10:00 -03:00');
  submit('ACA-004', demoActors.privacy);
  approve('ACA-004', 'Reavaliação aceita. Distingue novos fatos, danos potenciais e incertezas; encaminhar ao controlador.');
  act({ ...decisionFields, supersedes: 'DEC-001', evidenceIds: [confirmation, risk1, risk2],
    outcome: 'Manter comunicação à ANPD e aos titulares e atualizar o conteúdo simulado para incluir os documentos de saúde.',
    rationale: 'A nova evidência amplia a natureza dos dados e os danos potenciais, justificando revisão de conteúdo e medidas. O fundamento é contextual e cumulativo: acesso confirmado a dados pessoais, categorias financeira e sensível e potencial de afetação significativa. O segundo ciclo não reinicia a ciência ou o prazo.',
    significantImpact: 'Além de fraude financeira, possibilidade contextual de discriminação e dano moral por informação de saúde vinculada à identificação.',
    categories: 'Dados financeiros e dados pessoais sensíveis de saúde confirmados na simulação. Sem conclusão automática de larga escala.',
    unknowns: 'Destino e eventual redistribuição de cópias continuam desconhecidos; registrar atualização fundamentada se houver novos fatos. Execução real e protocolos não existem neste exercício.' }, demoActors.controller);
  assign('ACA-005', demoActors.controller);
  evidence('ACA-005', demoActors.controller, 'Minutas fictícias revisadas: natureza do incidente, categorias de dados, riscos, medidas adotadas, desconhecidos e contato do encarregado. ANPD: peticionamento simulado pelo representante autorizado. Titulares: mensagem individual simulada aos 12 colaboradores, com orientações contra fraude e canal de apoio. Registro de ensaio de envio concluído, sem transmissão, endereço real ou número de protocolo. Bruno acompanha eventual complementação.', 'checklist e minutas DEMO-COM-01 / registro de ensaio', '26/10/2026 10:24 -03:00');
  act({ type: 'note', content: 'MINUTA FICTÍCIA AOS TITULARES — NÃO ENVIADA. Prezada pessoa colaboradora: identificamos compartilhamento indevido de uma pasta com documentos de folha, dados bancários e informações de saúde. Revogamos o acesso externo e testamos o bloqueio. Não sabemos se houve redistribuição das cópias obtidas. Como precaução, verifique solicitações de alteração de dados bancários por outro canal e desconfie de mensagens que usem informações pessoais. O encarregado prestará esclarecimentos pelo canal interno de apoio fictício da organização. Novos fatos relevantes serão informados. Esta mensagem é material de treinamento, sem destinatário ou canal real.' }, demoActors.controller);
  submit('ACA-005', demoActors.controller);
  approve('ACA-005', 'Conteúdo e ensaio aceitos para fins didáticos. Não equivalem a comunicação efetiva ou cumprimento legal em incidente real.');
  // The final inject occurs only after its stated observation time.
  minute = Math.max(minute, 160);
  act({ type: 'release', eventId: 'EVT-003' });
  assign('ACA-006', demoActors.security);
  evidence('ACA-006', demoActors.security, 'Testes sintéticos confirmam acesso legítimo, bloqueio da identidade externa e remoção do mecanismo de compartilhamento indevido. Permissões de pastas semelhantes revisadas, alerta de convite externo ativado e monitoração definida por 7 dias. Não é possível comprovar eliminação de cópias baixadas.', 'validação sintética DEMO-REC-01', '26/10/2026 10:40 -03:00');
  submit('ACA-006', demoActors.security);
  approve('ACA-006', 'Recuperação do caminho conhecido validada com risco residual explícito. Manter monitoração e acompanhamento das ações.');
  act({ type: 'note', content: 'SIMULAÇÃO · A resposta técnica foi validada, mas permanecem acompanhamento de comunicações, eventual complementação, monitoração e plano de melhorias. Encerrar o exercício não encerra obrigações reais.' }, demoActors.privacy);
  act({ type: 'close',
    lessons: 'Execução: a equipe preservou registros e separou confirmação de hipótese. Eficácia: remover convite sem teste não foi suficiente para obter aceite; houve devolução, nova evidência e aprovação. Processo: faltava roteiro de validação da sessão externa. A nova categoria de dados motivou novo ciclo e decisão versionada, sem apagar a avaliação inicial ou reiniciar o prazo.',
    improvements: '1. Rafael / Segurança: incluir teste de identidade e sessão externa no procedimento até 09/11/2026.\n2. Lia / Privacidade: revisar classificação e segregação de documentos de saúde até 12/11/2026.\n3. Bruno / Controlador: revisar fluxo de aprovação e ensaio de comunicação até 16/11/2026.\n4. Marina / Facilitadora: repetir o exercício com outro contexto em 30 dias.\nAcompanhar risco residual, monitoração de 7 dias e eventual complementação. Prazos e responsáveis são fictícios.' });
  return { preparation, ongoing, completed: s };
}

/** Add optional checkpoints without replacing user records or resetting a previously loaded demo. */
export function loadDemo(original) {
  const existing = original.exercises.find(s => s.demo?.id === DEMO_ID && s.demo.stage === 'ongoing');
  if (existing) return { workspace: structuredClone(original), exerciseId: existing.id, created: false };
  let w = saveProcess(original, { title: 'Demonstração · Procedimento de compartilhamento documental', content: procedure });
  const process = w.processes.at(-1);
  const stages = [['preparation', 'Preparação'], ['ongoing', 'Para continuar'], ['completed', 'Concluído para consulta']];
  let activeId;
  for (const [stage, label] of stages) {
    w = addExercise(w, `Demonstração · ${label}`);
    const id = w.exercises.at(-1).id;
    const checkpoint = buildCheckpoints(id, process)[stage];
    checkpoint.title = `Demonstração · ${label} · ${title}`;
    checkpoint.demo = { id: DEMO_ID, stage, label, fictitious: true };
    w.exercises[w.exercises.length - 1] = checkpoint;
    if (stage === 'ongoing') activeId = id;
  }
  return { workspace: w, exerciseId: activeId, created: true };
}
