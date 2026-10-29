import test from 'node:test';
import assert from 'node:assert/strict';
import { addExercise, createWorkspace, report, saveProcess, transition, visibleActivities } from '../src/domain.mjs';
import { DEMO_ID, demoActors, loadDemo } from '../src/demo.mjs';
const sample = () => loadDemo(createWorkspace());
test('demo é opcional e adiciona checkpoints sem modificar dados existentes', () => {
  let original = addExercise(createWorkspace(), 'Exercício do usuário');
  original = saveProcess(original, { title: 'Processo do usuário', content: 'Conteúdo original' });
  const before = structuredClone(original), result = loadDemo(original);
  assert.deepEqual(original, before); assert.deepEqual(result.workspace.exercises[0], before.exercises[0]);
  assert.deepEqual(result.workspace.processes[0], before.processes[0]);
  assert.equal(result.workspace.exercises.length, 4); assert.equal(result.workspace.processes.length, 2);
  assert.equal(new Set(result.workspace.exercises.map(s => s.id)).size, 4);
  assert.ok(result.workspace.exercises.filter(s => s.demo).every(s => s.demo.id === DEMO_ID && s.demo.fictitious));
  assert.deepEqual(createWorkspace().exercises, []);
});
test('checkpoints mostram preparação, execução com pendências e encerramento fundamentado', () => {
  const { workspace, exerciseId } = sample(); const [prepared, ongoing, completed] = workspace.exercises;
  assert.equal(prepared.status, 'preparacao'); assert.equal(prepared.audit.at(-1).action, 'addActivity');
  assert.equal(ongoing.id, exerciseId); assert.equal(ongoing.status, 'em_andamento');
  assert.equal(ongoing.activities[1].status, 'devolvida'); assert.equal(ongoing.activities[2].status, 'em_validacao');
  assert.equal(visibleActivities(ongoing).length, 3); assert.equal(ongoing.decisions.length, 1);
  assert.equal(completed.status, 'encerrado'); assert.equal(completed.cycle, 2);
  assert.ok(completed.activities.every(a => a.status === 'aprovada'));
  assert.equal(completed.evidence.length, 7); assert.equal(completed.decisions.length, 2);
  assert.equal(completed.decisions[1].supersedes, 'DEC-001');
  assert.equal(completed.decisions[0].awareness, completed.decisions[1].awareness);
  assert.equal(completed.decisions[0].validatedDeadline, completed.decisions[1].validatedDeadline);
  assert.ok(completed.debrief.lessons && completed.debrief.improvements);
});
test('referências, autoria e cronologia de registros são consistentes', () => {
  for (const s of sample().workspace.exercises) {
    for (const a of s.activities) {
      assert.ok(!a.eventId || s.events.some(e => e.id === a.eventId));
      for (const id of a.evidence) assert.ok(s.evidence.some(e => e.id === id && e.activityId === a.id));
    }
    for (const d of s.decisions) for (const id of d.evidenceIds) assert.ok(s.evidence.some(e => e.id === id));
    assert.ok(s.audit.every((entry, i, list) => i === 0 || entry.at >= list[i - 1].at));
    for (const e of s.evidence) {
      assert.equal(e.simulated, true); assert.match(e.source, /Fonte sintética/);
      const [date, time, offset] = e.observedAt.split(' '), [day, month, year] = date.split('/');
      const observed = `${year}-${month}-${day}T${time}:00${offset}`;
      assert.ok(Date.parse(observed) <= Date.parse(e.at));
    }
  }
});
test('reabrir demo é idempotente e não apaga o progresso ou duplica processos', () => {
  const result = sample(); let w = result.workspace;
  const index = w.exercises.findIndex(s => s.id === result.exerciseId);
  w.exercises[index] = transition(w.exercises[index], demoActors.facilitator, { type: 'note', content: 'Minha observação durante o treino' });
  const reopened = loadDemo(w); assert.equal(reopened.created, false); assert.equal(reopened.exerciseId, result.exerciseId);
  assert.deepEqual(reopened.workspace, w); assert.equal(reopened.workspace.processes.length, 1);
});
test('cópia de preparação pode iniciar e checkpoints são independentes', () => {
  const { workspace } = sample(); const preparation = workspace.exercises[0];
  const started = transition(preparation, demoActors.facilitator, { type: 'start' });
  assert.equal(started.status, 'em_andamento'); assert.equal(preparation.status, 'preparacao');
  started.members[0].name = 'Alteração local'; assert.notEqual(workspace.exercises[1].members[0].name, 'Alteração local');
});
test('atividade devolvida pode ser corrigida e reenviada na cópia em andamento', () => {
  let s = sample().workspace.exercises[1];
  s = transition(s, demoActors.security, { type: 'evidence', activityId: 'ACA-002', content: 'Teste sintético com acesso externo negado e sessão invalidada', source: 'Ensaio local fictício', observedAt: 'Horário do treino / UTC-03', certainty: 'confirmado' });
  s = transition(s, demoActors.security, { type: 'submit', activityId: 'ACA-002' });
  assert.equal(s.activities[1].status, 'em_validacao'); assert.equal(s.activities[1].reviews[0].verdict, 'devolver');
  const exported = report(s); assert.equal(exported.events.length, 1); assert.equal(exported.activities.length, 3);
});
