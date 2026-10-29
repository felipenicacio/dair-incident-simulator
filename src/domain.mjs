// Local training conventions, not authenticated identities or access controls.
export const roles = ['Segurança', 'Privacidade', 'Controlador', 'Facilitador', 'Observador'];
export const waypoints = ['Sem classificação', 'Prepare', 'Detect', 'Verify and Triage', 'Scope', 'Contain', 'Eradicate', 'Recover', 'Debrief'];
const assert = (condition, message) => { if (!condition) throw Error(message); };
const required = (value, name, max = 6000) => {
  assert(typeof value === 'string' && value.trim() && value.length <= max, `${name}: informe texto entre 1 e ${max} caracteres.`);
  return value.trim();
};
const nextId = (prefix, list) => `${prefix}-${String(list.length + 1).padStart(3, '0')}`;
export function createWorkspace() { return { schemaVersion: 2, exercises: [], processes: [] }; }
export function createExercise(id) {
  return { schemaVersion: 2, id: required(id, 'Identificador', 120), title: '', organization: '', objectives: '', scenario: '',
    privacyRequired: false, processSnapshot: null, status: 'preparacao', cycle: 1, members: [],
    activities: [], events: [], evidence: [], decisions: [], notes: [], audit: [], debrief: null };
}
export function addExercise(original, title) {
  const w = structuredClone(original);
  const s = createExercise(nextId('EXE', w.exercises)); s.title = required(title, 'Nome do exercício', 200);
  w.exercises.push(s); return w;
}
export function saveProcess(original, input) {
  const w = structuredClone(original);
  const previous = input.id ? w.processes.find(p => p.id === input.id) : null;
  if (input.id) assert(previous, 'Processo não encontrado.');
  const process = { id: previous?.id ?? nextId('PRO', w.processes), version: previous ? previous.version + 1 : 1,
    title: required(input.title, 'Processo', 200), content: required(input.content, 'Procedimento') };
  if (previous) w.processes[w.processes.indexOf(previous)] = process; else w.processes.push(process);
  return w;
}
export function visibleActivities(s) { return s.activities.filter(a => !a.eventId || s.events.some(e => e.id === a.eventId && e.releasedAt)); }
export function visibleEvents(s) { return s.events.filter(e => e.releasedAt); }
export function report(s, facilitator = false) {
  const copy = structuredClone(s);
  if (!facilitator) { copy.events = visibleEvents(copy); copy.activities = visibleActivities(copy); }
  return { ...copy, metrics: {
    approved: copy.activities.filter(a => a.status === 'aprovada').length, total: copy.activities.length,
    rework: copy.activities.filter(a => a.reviews.some(r => r.verdict === 'devolver')).length,
    decisions: copy.decisions.length,
    note: 'Indicadores de execução; não representam certificação de conformidade ou decisão de comunicação.'
  } };
}
export function transition(original, actor, action, now = new Date().toISOString()) {
  const s = structuredClone(original);
  assert(roles.includes(actor.role) && actor.role !== 'Observador', 'Papel sem permissão para alterar o exercício.');
  const name = required(actor.name, 'Participante', 120);
  const facilitator = () => assert(actor.role === 'Facilitador', 'Ação exclusiva do facilitador.');
  const preparation = () => { facilitator(); assert(s.status === 'preparacao', 'Configure antes de iniciar.'); };
  const active = () => assert(s.status === 'em_andamento', 'O exercício não está em andamento.');
  const findActivity = () => { const a = visibleActivities(s).find(a => a.id === action.activityId); assert(a, 'Atividade indisponível.'); return a; };
  const owner = a => assert(a.assignee === name && a.role === actor.role, 'A atividade deve estar atribuída a você e ao seu papel.');
  switch (action.type) {
    case 'configure':
      preparation(); s.title = required(action.title, 'Exercício', 200); s.organization = required(action.organization, 'Organização', 200);
      s.objectives = required(action.objectives, 'Objetivos'); s.scenario = required(action.scenario, 'Contexto do cenário');
      s.privacyRequired = action.privacyRequired === true; break;
    case 'useProcess':
      preparation(); assert(action.process && Number.isInteger(action.process.version) && action.process.version > 0, 'Selecione um processo versionado.');
      s.processSnapshot = { id: required(action.process.id, 'ID do processo', 120), version: action.process.version,
        title: required(action.process.title, 'Processo', 200), content: required(action.process.content, 'Procedimento') }; break;
    case 'addMember': {
      preparation(); const member = { name: required(action.name, 'Nome', 120), role: action.role };
      assert(roles.includes(member.role), 'Papel inválido.');
      assert(!s.members.some(m => m.name === member.name && m.role === member.role), 'Participante já cadastrado neste papel.');
      s.members.push(member); break;
    }
    case 'addEvent':
      preparation(); s.events.push({ id: nextId('EVT', s.events), title: required(action.title, 'Evento', 200),
        content: required(action.content, 'Informação do evento'), releasedAt: null }); break;
    case 'addActivity':
      preparation(); assert(roles.includes(action.role) && action.role !== 'Observador' && waypoints.includes(action.waypoint), 'Papel ou waypoint inválido.');
      assert(!action.eventId || s.events.some(e => e.id === action.eventId), 'Evento de liberação inválido.');
      s.activities.push({ id: nextId('ACA', s.activities), title: required(action.title, 'Atividade', 200),
        criteria: required(action.criteria, 'Critério'), role: action.role, waypoint: action.waypoint,
        eventId: action.eventId || null, assignee: '', status: 'pendente', evidence: [], reviews: [] }); break;
    case 'start':
      preparation(); assert(s.objectives && s.scenario && s.organization && s.processSnapshot && s.activities.length, 'Defina contexto, objetivos, organização, processo e ao menos uma atividade.');
      assert(s.members.some(m => m.role === 'Facilitador') && s.activities.every(a => s.members.some(m => m.role === a.role)), 'Cadastre facilitador e participantes para todos os papéis das atividades.');
      s.status = 'em_andamento'; break;
    case 'release': {
      facilitator(); active(); const e = s.events.find(e => e.id === action.eventId);
      assert(e && !e.releasedAt, 'Evento indisponível ou já liberado.'); e.releasedAt = now; break;
    }
    case 'newCycle': facilitator(); active(); s.cycle++; required(action.reason, 'Motivo da reavaliação'); break;
    case 'assign': {
      facilitator(); active(); const a = findActivity();
      assert(['pendente', 'em_execucao', 'devolvida'].includes(a.status), 'Não é possível reatribuir esta atividade.');
      const assignee = required(action.assignee, 'Responsável', 120);
      assert(s.members.some(m => m.name === assignee && m.role === a.role), 'Cadastre o responsável no papel da atividade.');
      a.assignee = assignee; a.status = 'em_execucao'; break;
    }
    case 'evidence': {
      active(); const a = findActivity(); owner(a);
      assert(['em_execucao', 'devolvida'].includes(a.status), 'Atividade não aceita evidências neste estado.');
      assert(['confirmado', 'hipotese', 'inferido', 'desconhecido', 'nao_aplicavel'].includes(action.certainty), 'Classificação inválida.');
      const e = { id: nextId('EVD', s.evidence), activityId: a.id, author: name, at: now, simulated: true,
        content: required(action.content, 'Evidência'), source: required(action.source, 'Origem'),
        observedAt: required(action.observedAt, 'Horário e fuso', 120), certainty: action.certainty };
      s.evidence.push(e); a.evidence.push(e.id); break;
    }
    case 'submit': {
      active(); const a = findActivity(); owner(a);
      assert(['em_execucao', 'devolvida'].includes(a.status), 'Atividade não pode ser submetida.');
      assert(a.evidence.length > (a.reviews.at(-1)?.evidenceCount ?? 0), 'Adicione nova evidência antes de submeter.');
      a.status = 'em_validacao'; break;
    }
    case 'review': {
      facilitator(); active(); const a = findActivity(); assert(a.status === 'em_validacao', 'Atividade não está em validação.');
      assert(['aprovar', 'devolver'].includes(action.verdict), 'Parecer inválido.');
      a.reviews.push({ reviewer: name, at: now, verdict: action.verdict, evidenceCount: a.evidence.length,
        execution: required(action.execution, 'Avaliação da execução'), effectiveness: required(action.effectiveness, 'Avaliação da eficácia'),
        processGap: required(action.processGap, 'Lacuna do processo'), feedback: required(action.feedback, 'Justificativa') });
      a.status = action.verdict === 'aprovar' ? 'aprovada' : 'devolvida'; break;
    }
    case 'decision': {
      active(); assert(s.members.some(m => m.name === name && m.role === actor.role), 'Cadastre o autor na equipe.');
      assert(['tecnica', 'regulatoria'].includes(action.kind), 'Tipo de decisão inválido.');
      assert(action.kind !== 'regulatoria' || actor.role === 'Controlador', 'Deliberação regulatória exige representante do controlador.');
      assert(Array.isArray(action.evidenceIds) && action.evidenceIds.length > 0 && action.evidenceIds.every(e => s.evidence.some(v => v.id === e)), 'Referencie evidências existentes.');
      if (action.supersedes) assert(s.decisions.some(d => d.id === action.supersedes && d.kind === action.kind) && !s.decisions.some(d => d.supersedes === action.supersedes), 'Decisão anterior inválida ou já substituída.');
      const d = { id: nextId('DEC', s.decisions), kind: action.kind, cycle: s.cycle, author: name, at: now,
        evidenceIds: [...new Set(action.evidenceIds)], supersedes: action.supersedes || null,
        outcome: required(action.outcome, 'Deliberação'), rationale: required(action.rationale, 'Fundamento'), unknowns: required(action.unknowns, 'Incertezas') };
      if (d.kind === 'regulatoria') {
        for (const key of ['significantImpact', 'categories', 'anpd', 'holders', 'awareness', 'validatedDeadline', 'deadlineBasis']) d[key] = required(action[key], key);
        d.responsible = name;
      }
      s.decisions.push(d); break;
    }
    case 'note':
      active(); assert(s.members.some(m => m.name === name && m.role === actor.role), 'Cadastre o autor na equipe.');
      s.notes.push({ id: nextId('NOT', s.notes), author: name, at: now, content: required(action.content, 'Nota') }); break;
    case 'close':
      facilitator(); active(); assert(s.activities.every(a => a.status === 'aprovada'), 'Valide todas as atividades antes de encerrar.');
      assert(!s.privacyRequired || s.decisions.some(d => d.kind === 'regulatoria'), 'Registre a avaliação regulatória prevista para este exercício.');
      s.debrief = { author: name, at: now, lessons: required(action.lessons, 'Lições aprendidas'), improvements: required(action.improvements, 'Melhorias, responsáveis e prazos') };
      s.status = 'encerrado'; break;
    default: throw Error('Ação desconhecida.');
  }
  s.audit.push({ id: nextId('LOG', s.audit), at: now, actor: name, role: actor.role, action: action.type,
    activityId: action.activityId ?? null, eventId: action.eventId ?? null, reason: action.type === 'newCycle' ? action.reason.trim() : null, cycle: s.cycle });
  return s;
}
