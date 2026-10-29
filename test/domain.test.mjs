import test from 'node:test';
import assert from 'node:assert/strict';
import { createExercise, transition, visibleEvents, report } from '../src/domain.mjs';
const fac = { name:'Ana',role:'Facilitador' };
const now = '2026-10-29T14:00:00.000Z';
const move = (s,a,actor=fac) => transition(s,actor,a,now);
const start = () => move(createExercise(),{type:'start'});
const person = role => ({name:role === 'Facilitador'?'Ana':'Equipe',role});
function evidence(s,a,extra={}) {return move(s,{type:'evidence',activityId:a.id,content:'Ação simulada executada; teste e limitação registrados.',source:'Log sintético / coletor da equipe',observedAt:'19/10/2026 09:25 -03:00',certainty:'confirmado',...extra},person(a.role));}
function complete(s,a) {
  s=move(s,{type:'assign',activityId:a.id,assignee:person(a.role).name});
  s=evidence(s,a); s=move(s,{type:'submit',activityId:a.id},person(a.role));
  return move(s,{type:'review',activityId:a.id,verdict:'aprovar',execution:'Critérios atendidos',effectiveness:'Teste documentado, limitações explícitas',processGap:'Revisar revogação integrada',feedback:'IAM deve revisar o processo em 30 dias'});
}
const decision = {type:'decision',kind:'regulatoria',evidenceIds:['EVD-001'],outcome:'Comunicar ANPD e titulares (simulado)',rationale:'Avaliação contextual dos requisitos cumulativos',unknowns:'Destino da cópia desconhecido',significantImpact:'Risco de fraude e afetação significativa fundamentados',categories:'Art. 5º VI, escala avaliada no contexto',anpd:'Comunicar',holders:'Comunicar',awareness:'19/10/2026 09:25 -03:00, confirmado pelo controlador',validatedDeadline:'22/10/2026 09:25 -03:00 (didático)',deadlineBasis:'Calendário e exceções revisados pelo responsável, exemplo fictício'};
test('eventos progressivos e reentrada DAIR não exigem conclusão linear',()=>{
  let s=start(); assert.equal(visibleEvents(s).length,1); s=move(s,{type:'release'}); assert.equal(s.cycle,2); assert.equal(visibleEvents(s).length,2);
  assert.throws(()=>move(s,{type:'start'})); s=move(s,{type:'release'}); assert.throws(()=>move(s,{type:'release'}));
});
test('atribuição, papéis, evidências obrigatórias e ações inválidas não alteram original',()=>{
  const s=start(); const before=structuredClone(s);
  assert.throws(()=>move(s,{type:'release'},person('Segurança')));
  assert.throws(()=>move(s,{type:'assign',activityId:'ACA-004',assignee:'Equipe'}));
  assert.throws(()=>move(s,{type:'unknown'})); assert.deepEqual(s,before);
  const assigned=move(s,{type:'assign',activityId:'ACA-001',assignee:'Equipe'});
  assert.throws(()=>move(assigned,{type:'submit',activityId:'ACA-001'},person('Segurança')));
  assert.throws(()=>evidence(assigned,assigned.activities[0],{certainty:'fato inventado'}));
  assert.throws(()=>transition(assigned,{name:'Outra pessoa',role:'Segurança'},{type:'evidence',activityId:'ACA-001'},now));
});
test('facilitador devolve, exige nova evidência e preserva pareceres',()=>{
  let s=start(); const a=s.activities[0]; s=move(s,{type:'assign',activityId:a.id,assignee:'Equipe'}); s=evidence(s,a);
  s=move(s,{type:'submit',activityId:a.id},person('Segurança'));
  const review={type:'review',activityId:a.id,verdict:'devolver',execution:'Parcial',effectiveness:'Sem teste',processGap:'Ausência de critério',feedback:'Adicionar teste de contenção'};
  assert.throws(()=>move(s,review,person('Segurança')));
  s=move(s,review); assert.equal(s.activities[0].status,'devolvida');
  assert.throws(()=>move(s,{type:'submit',activityId:a.id},person('Segurança')));
  s=evidence(s,a); s=move(s,{type:'submit',activityId:a.id},person('Segurança'));
  s=move(s,{...review,verdict:'aprovar'}); assert.equal(s.activities[0].reviews.length,2); assert.equal(s.evidence.length,2);
  assert.throws(()=>evidence(s,a));
});
test('decisão regulatória exige controlador, evidências e todos os fundamentos',()=>{
  let s=start(); s=complete(s,s.activities[0]);
  assert.throws(()=>move(s,decision,person('Privacidade')));
  assert.throws(()=>move(s,{...decision,evidenceIds:['EVD-999']},person('Controlador')));
  assert.throws(()=>move(s,{...decision,validatedDeadline:''},person('Controlador')));
  s=move(s,decision,person('Controlador')); s=move(s,{type:'release'});
  s=move(s,{...decision,supersedes:'DEC-001'},person('Controlador'));
  assert.equal(s.decisions[0].cycle,1); assert.equal(s.decisions[1].cycle,2); assert.equal(s.decisions[1].supersedes,'DEC-001');
});
test('fluxo integral: configurar, adicionar atividade, executar, deliberar e encerrar',()=>{
  let s=move(createExercise(),{type:'configure',title:'CRM da organização fictícia',procedure:'Procedimento interno validado para treinamento'});
  s=move(s,{type:'addActivity',title:'Preparação',criteria:'Confirmar contatos e autoridades',role:'Facilitador',waypoint:'Prepare',round:0});
  s=move(s,{type:'start'}); assert.throws(()=>move(s,{type:'close'}));
  assert.throws(()=>move(s,{type:'configure',title:'Mudança',procedure:'Mudança'}));
  for(let round=0;round<3;round++) {
    for(const a of s.activities.filter(a=>a.round===round)) s=complete(s,a);
    if(round===1) s=move(s,decision,person('Controlador'));
    if(round<2) s=move(s,{type:'release'});
  }
  s=move(s,{type:'close'}); assert.equal(s.status,'encerrado');
  assert.equal(report(s).metrics.approved,8); assert.equal(s.audit.at(-1).action,'close');
  assert.throws(()=>move(s,decision,person('Controlador')));
  const r=report(s); r.activities[0].title='changed'; assert.notEqual(s.activities[0].title,'changed');
});
