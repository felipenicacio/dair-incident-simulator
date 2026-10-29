import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspace, createExercise, addExercise, saveProcess, transition, visibleActivities, visibleEvents, report } from '../src/domain.mjs';
const fac={name:'Ana',role:'Facilitador'}, tech={name:'Bia',role:'Segurança'}, controller={name:'Caio',role:'Controlador'};
const move=(s,a,actor=fac)=>transition(s,actor,a,'2026-10-29T15:00:00.000Z');
const close={type:'close',lessons:'Revisar decisões com evidências',improvements:'Equipe revisará os critérios em 30 dias'};
const review={type:'review',activityId:'ACA-001',verdict:'aprovar',execution:'Executado',effectiveness:'Resultado demonstrado',processGap:'Critério a aprimorar',feedback:'Atualizar procedimento com responsável e prazo'};
function prepared({events=0,privacy=false,title='Exercício A'}={}) {
  let s=createExercise('EXE-001');
  s=move(s,{type:'configure',title,organization:'Organização fictícia',objectives:'Verificar coordenação',scenario:'Contexto livre definido pelo facilitador',privacyRequired:privacy});
  s=move(s,{type:'useProcess',process:{id:'PRO-001',version:1,title:'Processo da equipe',content:'Acionar responsáveis e registrar resultados.'}});
  for(const m of [fac,tech,controller])s=move(s,{type:'addMember',...m});
  for(let i=0;i<events;i++)s=move(s,{type:'addEvent',title:`Evento ${i+1}`,content:`Informação sintética ${i+1}`});
  return move(s,{type:'addActivity',title:'Atividade configurada',criteria:'Demonstrar resultado',role:'Segurança',waypoint:'Sem classificação'});
}
function evidence(s) {return move(s,{type:'evidence',activityId:'ACA-001',content:'Resultado sintético com limitações',source:'Registro fictício / coletor Bia',observedAt:'Horário definido pela equipe, UTC-03',certainty:'confirmado'},tech);}
function submitted(s) {s=move(s,{type:'assign',activityId:'ACA-001',assignee:'Bia'});s=evidence(s);return move(s,{type:'submit',activityId:'ACA-001'},tech);}
const decision={type:'decision',kind:'regulatoria',evidenceIds:['EVD-001'],outcome:'Deliberação contextual simulada',rationale:'Fundamento humano registrado',unknowns:'Lacunas explicitadas',significantImpact:'Avaliação fundamentada',categories:'Categorias avaliadas no contexto',anpd:'Deliberação fundamentada',holders:'Deliberação fundamentada',awareness:'Marco de ciência com fuso e fundamento',validatedDeadline:'Prazo validado pelo responsável',deadlineBasis:'Calendário e regras aplicáveis revisados'};
test('workspace e exercício começam vazios, sem fatos ou estrutura do cenário anterior',()=>{
  const w=createWorkspace(),s=createExercise('EXE-001');assert.deepEqual(w.exercises,[]);assert.deepEqual(w.processes,[]);
  for(const key of ['activities','events','evidence','decisions','members','notes','audit'])assert.deepEqual(s[key],[]);
  assert.equal(s.scenario,'');assert.equal(s.processSnapshot,null);assert.equal(s.privacyRequired,false);
});
test('exercícios isolados e IDs estáveis no painel',()=>{
  const original=createWorkspace();let w=addExercise(original,'Exercício A');w=addExercise(w,'Exercício B');
  assert.equal(original.exercises.length,0);assert.deepEqual(w.exercises.map(s=>s.id),['EXE-001','EXE-002']);
  w.exercises[0]=move(w.exercises[0],{type:'addEvent',title:'Evento exclusivo',content:'Conteúdo A'});
  assert.equal(w.exercises[1].events.length,0);assert.throws(()=>addExercise(w,' '));
});
test('processo reutilizável preserva versão e conteúdo selecionados pelo exercício',()=>{
  let w=saveProcess(createWorkspace(),{title:'Processo comum',content:'Versão original'});
  let a=move(createExercise('EXE-001'),{type:'useProcess',process:w.processes[0]});
  w=saveProcess(w,{id:'PRO-001',title:'Processo comum',content:'Versão revisada'});
  const b=move(createExercise('EXE-002'),{type:'useProcess',process:w.processes[0]});
  assert.equal(a.processSnapshot.version,1);assert.equal(a.processSnapshot.content,'Versão original');assert.equal(b.processSnapshot.version,2);
  w.processes[0].content='Mutação externa';assert.equal(b.processSnapshot.content,'Versão revisada');
  assert.throws(()=>saveProcess(w,{id:'PRO-999',title:'Inválido',content:'Teste'}));
});
test('início exige contexto, processo, atividades e papéis cobertos pela equipe',()=>{
  assert.throws(()=>move(createExercise('EXE-001'),{type:'start'}));
  const s=prepared();const missing=structuredClone(s);missing.members=missing.members.filter(m=>m.role!=='Segurança');assert.throws(()=>move(missing,{type:'start'}));
  assert.equal(move(s,{type:'start'}).status,'em_andamento');
});
test('eventos sem limite fixo, liberação individual e ciclos explícitos independentes',()=>{
  let s=prepared({events:5});s=move(s,{type:'addActivity',title:'Atividade condicionada',criteria:'Evidência esperada',role:'Segurança',waypoint:'Scope',eventId:'EVT-005'});
  s=move(s,{type:'start'});assert.equal(visibleActivities(s).length,1);
  assert.throws(()=>move(s,{type:'assign',activityId:'ACA-002',assignee:'Bia'}));
  s=move(s,{type:'release',eventId:'EVT-005'});assert.equal(visibleActivities(s).length,2);assert.equal(s.cycle,1);
  assert.equal(visibleEvents(s).length,1);assert.throws(()=>move(s,{type:'release',eventId:'EVT-005'}));
  assert.throws(()=>move(s,{type:'newCycle',reason:''}));s=move(s,{type:'newCycle',reason:'Novos fatos alteram o escopo'});assert.equal(s.cycle,2);
  assert.equal(s.audit.at(-1).reason,'Novos fatos alteram o escopo');
});
test('dois cenários distintos executam até encerramento sem eventos ou ciclos obrigatórios',()=>{
  for(const title of ['Falha de disponibilidade','Perda de documento físico']){
    let s=move(prepared({title}),{type:'start'});s=submitted(s);s=move(s,review);s=move(s,close);
    assert.equal(s.title,title);assert.equal(s.status,'encerrado');assert.equal(s.cycle,1);assert.equal(s.decisions.length,0);assert.ok(s.debrief.improvements);
    assert.throws(()=>move(s,{type:'note',content:'Após encerramento'},tech));
  }
});
test('devolução exige evidência nova e preserva os pareceres e registros anteriores',()=>{
  let s=submitted(move(prepared(),{type:'start'}));s=move(s,{...review,verdict:'devolver'});
  assert.throws(()=>move(s,{type:'submit',activityId:'ACA-001'},tech));s=evidence(s);s=move(s,{type:'submit',activityId:'ACA-001'},tech);s=move(s,review);
  assert.equal(s.activities[0].reviews.length,2);assert.equal(s.evidence.length,2);assert.equal(report(s).metrics.rework,1);
});
test('papéis, responsável e ações inválidas não alteram o original',()=>{
  let s=move(prepared(),{type:'start'});const before=structuredClone(s);
  assert.throws(()=>move(s,{type:'release',eventId:'EVT-001'},tech));assert.throws(()=>move(s,{type:'note',content:'Teste'},{name:'Obs',role:'Observador'}));
  assert.throws(()=>move(s,{type:'assign',activityId:'ACA-001',assignee:'Não cadastrado'}));assert.throws(()=>move(s,{type:'unknown'}));assert.deepEqual(s,before);
  s=move(s,{type:'assign',activityId:'ACA-001',assignee:'Bia'});assert.throws(()=>move(s,{type:'submit',activityId:'ACA-001'},tech));assert.throws(()=>evidence({...s,activities:s.activities.map(a=>({...a,assignee:'Outro'}))}));
});
test('decisão regulatória opcional por exercício, humana e versionada sem resultado prévio',()=>{
  let s=move(prepared({privacy:true}),{type:'start'});s=submitted(s);s=move(s,review);assert.throws(()=>move(s,close));
  assert.throws(()=>move(s,decision,tech));assert.throws(()=>move(s,{...decision,evidenceIds:['EVD-999']},controller));assert.throws(()=>move(s,{...decision,deadlineBasis:''},controller));
  s=move(s,decision,controller);s=move(s,{type:'newCycle',reason:'Reavaliar fatos'});s=move(s,{...decision,supersedes:'DEC-001'},controller);
  assert.equal(s.decisions.length,2);assert.equal(s.decisions[0].cycle,1);assert.equal(s.decisions[1].cycle,2);
  assert.throws(()=>move(s,{...decision,supersedes:'DEC-001'},controller));s=move(s,close);assert.equal(s.status,'encerrado');
});
test('relatório omite eventos reservados e atividades condicionadas para participantes',()=>{
  let s=prepared({events:1});s=move(s,{type:'addActivity',title:'Reservada',criteria:'Validar',role:'Segurança',waypoint:'Scope',eventId:'EVT-001'});s=move(s,{type:'start'});
  const participant=report(s),facilitator=report(s,true);assert.equal(participant.events.length,0);assert.equal(participant.activities.length,1);assert.equal(facilitator.events.length,1);
  facilitator.events[0].content='Mutação externa';assert.notEqual(s.events[0].content,'Mutação externa');
});
test('configuração congela após início e notas exigem autoria cadastrada',()=>{
  const s=move(prepared(),{type:'start'});assert.throws(()=>move(s,{type:'addEvent',title:'Novo',content:'Fato'}));
  assert.throws(()=>move(s,{type:'note',content:'Texto'},{name:'Não cadastrado',role:'Segurança'}));
  const n=move(s,{type:'note',content:'Análise da equipe'},tech);assert.equal(n.notes[0].author,'Bia');
});
