// Pure, shared exercise engine. Role selection is a local training convention, not authentication.
const roles = ['Segurança', 'Privacidade', 'Controlador', 'Facilitador'];
const waypoints = ['Prepare', 'Detect', 'Verify and Triage', 'Scope', 'Contain', 'Eradicate', 'Recover', 'Debrief'];
export { roles, waypoints };
const required = (value, name, max = 6000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw Error(`${name}: informe texto entre 1 e ${max} caracteres.`);
  return value.trim();
};
const assert = (condition, message) => { if (!condition) throw Error(message); };
const activity = (id, title, waypoint, role, round, criteria) => ({ id, title, waypoint, role, round, criteria, assignee: '', status: 'pendente', evidence: [], reviews: [] });
export function createExercise() {
  return {
    schemaVersion: 1, id: 'INC-2026-001', title: 'Acesso indevido ao CRM',
    procedure: 'Mobilizar resposta; preservar registros; delimitar escopo; conter e testar; reavaliar risco aos titulares; recuperar e registrar melhorias.',
    status: 'preparacao', round: -1, cycle: 1,
    activities: [
      activity('ACA-001', 'Preservar alerta e confirmar incidente', 'Verify and Triage', 'Segurança', 0, 'Registrar origem, horário com fuso, fatos confirmados e lacunas; indicar marco de conhecimento do controlador.'),
      activity('ACA-002', 'Delimitar acesso e validar contenção', 'Contain', 'Segurança', 0, 'Documentar escopo conhecido, conta, sessões, tokens, ação e teste da contenção. Identificar controles ainda não verificados.'),
      activity('ACA-003', 'Avaliar risco aos titulares — versão inicial', 'Scope', 'Privacidade', 0, 'Fundamentar afetação significativa e categorias do art. 5º, I a VI do RCIS; registrar incertezas e prazo validado.'),
      activity('ACA-004', 'Reabrir escopo e revogar persistência', 'Scope', 'Segurança', 1, 'Reavaliar 30.000 titulares; revogar token, investigar outros acessos e comprovar teste de contenção.'),
      activity('ACA-005', 'Reavaliar risco e deliberar comunicação', 'Contain', 'Controlador', 1, 'Registrar nova decisão regulatória fundamentada, ANPD e titulares, marco de ciência, prazo aplicável validado e responsável.'),
      activity('ACA-006', 'Validar erradicação e recuperação', 'Recover', 'Segurança', 2, 'Comprovar remoção do mecanismo conhecido, teste do serviço e monitoração; registrar lacunas e risco residual.'),
      activity('ACA-007', 'Consolidar debrief e melhorias', 'Debrief', 'Facilitador', 2, 'Avaliar execução, eficácia e lacunas do processo interno separadamente; definir melhoria, responsável e prazo.')
    ],
    events: [
      { id: 'EVT-001', round: 0, title: '09:25 · Acesso confirmado', content: 'SIMULAÇÃO · 19/10/2026, America/Sao_Paulo. Alerta às 09:10 e confirmação às 09:25: acesso indevido a 200 registros do CRM. Conta administrativa bloqueada. Cobertura de sessões e integrações ainda desconhecida.' },
      { id: 'EVT-002', round: 1, title: '10:42 · Nova exportação', content: 'SIMULAÇÃO · Exportação via token persistente após bloqueio da conta. A análise aponta 30.000 titulares. Reabra o escopo e reavalie contenção e risco. Não há comprovação de eliminação da cópia externa.' },
      { id: 'EVT-003', round: 2, title: '12:00 · Recuperação sob observação', content: 'SIMULAÇÃO · Logs posteriores não mostram exportações pelo token revogado, mas há lacuna de telemetria. Validem erradicação, recuperação, risco residual e plano de melhoria. Ausência de alerta não comprova ausência de acesso.' }
    ], evidence: [], decisions: [], audit: []
  };
}
export function visibleActivities(s) { return s.activities.filter(a => a.round <= s.round); }
export function visibleEvents(s) { return s.events.filter(e => e.round <= s.round); }
export function report(s) {
  return { ...structuredClone(s), metrics: {
    approved: s.activities.filter(a => a.status === 'aprovada').length,
    total: s.activities.length,
    rework: s.activities.filter(a => a.reviews.some(r => r.verdict === 'devolver')).length,
    decisions: s.decisions.length,
    note: 'Indicadores de execução; não representam certificação de conformidade ou decisão de comunicação.'
  } };
}
export function transition(original, actor, action, now = new Date().toISOString()) {
  const s = structuredClone(original);
  assert(roles.includes(actor.role), 'Papel inválido.');
  const name = required(actor.name, 'Participante', 120);
  const facilitator = () => assert(actor.role === 'Facilitador', 'Ação exclusiva do facilitador.');
  const active = () => assert(s.status === 'em_andamento', 'O exercício não está em andamento.');
  const findActivity = () => {
    const a = s.activities.find(a => a.id === action.activityId && a.round <= s.round);
    assert(a, 'Atividade indisponível.'); return a;
  };
  const owner = a => assert(a.assignee === name && a.role === actor.role, 'A atividade deve estar atribuída a você e ao seu papel.');
  const id = (prefix, list) => `${prefix}-${String(list.length + 1).padStart(3, '0')}`;
  switch (action.type) {
    case 'configure':
      facilitator(); assert(s.status === 'preparacao', 'Configure antes de iniciar.');
      s.title = required(action.title, 'Cenário', 200); s.procedure = required(action.procedure, 'Procedimento'); break;
    case 'addActivity': {
      facilitator(); assert(s.status === 'preparacao', 'Configure antes de iniciar.');
      assert(roles.includes(action.role) && waypoints.includes(action.waypoint), 'Papel ou waypoint inválido.');
      assert(Number.isInteger(action.round) && action.round >= 0 && action.round <= 2, 'Rodada inválida.');
      s.activities.push(activity(id('ACA', s.activities), required(action.title, 'Atividade', 200), action.waypoint, action.role, action.round, required(action.criteria, 'Critério'))); break;
    }
    case 'start': facilitator(); assert(s.status === 'preparacao', 'Exercício já iniciado.'); s.status = 'em_andamento'; s.round = 0; break;
    case 'release':
      facilitator(); active(); assert(s.round < 2, 'Todos os eventos já foram liberados.');
      s.round++; if (s.round === 1) s.cycle++; break;
    case 'assign': {
      facilitator(); active(); const a = findActivity();
      assert(['pendente', 'em_execucao', 'devolvida'].includes(a.status), 'Não é possível reatribuir esta atividade.');
      a.assignee = required(action.assignee, 'Responsável', 120); a.status = 'em_execucao'; break;
    }
    case 'evidence': {
      active(); const a = findActivity(); owner(a);
      assert(['em_execucao', 'devolvida'].includes(a.status), 'Atividade não aceita evidências neste estado.');
      assert(['confirmado', 'hipotese', 'inferido', 'desconhecido', 'nao_aplicavel'].includes(action.certainty), 'Classificação inválida.');
      const e = { id: id('EVD', s.evidence), activityId: a.id, author: name, at: now, simulated: true,
        content: required(action.content, 'Evidência'), source: required(action.source, 'Origem'),
        observedAt: required(action.observedAt, 'Horário e fuso', 120), certainty: action.certainty };
      s.evidence.push(e); a.evidence.push(e.id); break;
    }
    case 'submit': {
      active(); const a = findActivity(); owner(a);
      assert(['em_execucao', 'devolvida'].includes(a.status), 'Atividade não pode ser submetida.');
      const last = a.reviews.at(-1);
      assert(a.evidence.length > (last?.evidenceCount ?? 0), 'Adicione nova evidência antes de submeter.');
      a.status = 'em_validacao'; break;
    }
    case 'review': {
      facilitator(); active(); const a = findActivity(); assert(a.status === 'em_validacao', 'Atividade não está em validação.');
      assert(['aprovar', 'devolver'].includes(action.verdict), 'Parecer inválido.');
      const review = { reviewer: name, at: now, verdict: action.verdict, evidenceCount: a.evidence.length,
        execution: required(action.execution, 'Avaliação da execução'), effectiveness: required(action.effectiveness, 'Avaliação da eficácia'),
        processGap: required(action.processGap, 'Lacuna do processo'), feedback: required(action.feedback, 'Justificativa') };
      a.reviews.push(review); a.status = action.verdict === 'aprovar' ? 'aprovada' : 'devolvida'; break;
    }
    case 'decision': {
      active(); assert(['tecnica', 'regulatoria'].includes(action.kind), 'Tipo de decisão inválido.');
      assert(action.kind !== 'regulatoria' || actor.role === 'Controlador', 'Deliberação regulatória exige representante do controlador.');
      assert(Array.isArray(action.evidenceIds) && action.evidenceIds.length > 0 && action.evidenceIds.every(e => s.evidence.some(v => v.id === e)), 'Referencie evidências existentes.');
      if (action.supersedes) assert(s.decisions.some(d => d.id === action.supersedes && d.kind === action.kind), 'Decisão anterior inválida.');
      const d = { id: id('DEC', s.decisions), kind: action.kind, cycle: s.cycle, author: name, at: now,
        evidenceIds: [...new Set(action.evidenceIds)], supersedes: action.supersedes || null,
        outcome: required(action.outcome, 'Deliberação'), rationale: required(action.rationale, 'Fundamento'),
        unknowns: required(action.unknowns, 'Incertezas') };
      if (d.kind === 'regulatoria') {
        for (const key of ['significantImpact', 'categories', 'anpd', 'holders', 'awareness', 'validatedDeadline', 'deadlineBasis']) d[key] = required(action[key], key);
        d.responsible = name;
      }
      s.decisions.push(d); break;
    }
    case 'close':
      facilitator(); active(); assert(s.round === 2 && s.activities.every(a => a.status === 'aprovada'), 'Libere todos os eventos e valide todas as atividades.');
      assert(s.decisions.some(d => d.kind === 'regulatoria' && d.cycle === 2), 'Registre a reavaliação regulatória no segundo ciclo.');
      s.status = 'encerrado'; break;
    default: throw Error('Ação desconhecida.');
  }
  s.audit.push({ id: id('LOG', s.audit), at: now, actor: name, role: actor.role, action: action.type, activityId: action.activityId ?? null, round: s.round, cycle: s.cycle });
  return s;
}
