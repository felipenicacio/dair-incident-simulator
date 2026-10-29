import { createWorkspace, addExercise, saveProcess, transition, visibleActivities, visibleEvents, report, roles, waypoints } from '/domain.mjs';
const key = 'dair-workspace-v2';
const $ = selector => document.querySelector(selector);
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let workspace, state;
try {
  const saved = localStorage.getItem(key);
  workspace = saved ? JSON.parse(saved) : createWorkspace();
  if (workspace.schemaVersion !== 2 || !Array.isArray(workspace.exercises) || !Array.isArray(workspace.processes)) throw Error('Formato incompatível.');
} catch {
  $('#message').className = 'error'; $('#message').textContent = 'Armazenamento incompatível. Os dados foram preservados. Exporte os dados do navegador antes de corrigir este armazenamento.';
  throw Error('Armazenamento inválido; não sobrescrito.');
}
const options = values => values.map(v => `<option>${esc(v)}</option>`).join('');
const selectPairs = (name,label,pairs,value='') => `<label>${label}<select name="${name}" ${name==='eventId'?'':'required'}>${pairs.map(([id,title])=>`<option value="${esc(id)}" ${id===value?'selected':''}>${esc(title)}</option>`).join('')}</select></label>`;
const actor = () => ({ name: $('#actor').value.trim(), role: $('#role').value });
const facilitator = () => actor().role === 'Facilitador';
const field = (name,label,value='',multiline=true) => `<label>${label}${multiline?`<textarea name="${name}" required maxlength="6000">${esc(value)}</textarea>`:`<input name="${name}" required value="${esc(value)}" maxlength="200">`}</label>`;
const select = (name,label,values) => selectPairs(name,label,values.map(v=>[v,v]));
const statusLabels = {preparacao:'Em preparação',em_andamento:'Em andamento',encerrado:'Encerrado',pendente:'Pendente',em_execucao:'Em execução',devolvida:'Correção solicitada',em_validacao:'Aguardando facilitador',aprovada:'Validada'};
const actionLabels = {configure:'Contexto atualizado',useProcess:'Processo vinculado',addMember:'Participante cadastrado',addEvent:'Evento preparado',addActivity:'Atividade preparada',start:'Exercício iniciado',release:'Evento liberado',newCycle:'Novo ciclo de resposta',assign:'Atividade atribuída',evidence:'Evidência registrada',submit:'Atividade submetida',review:'Parecer registrado',decision:'Decisão registrada',note:'Nota registrada',close:'Exercício encerrado'};
const empty = (title, text) => `<div class="empty-state"><span class="empty-icon">＋</span><h3>${title}</h3><p>${text}</p></div>`;
const heading = (eyebrow,title,description,actions='') => `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${description}</p></div><div class="actions">${actions}</div></div>`;
function commit(next) { localStorage.setItem(key,JSON.stringify(next)); workspace=next; }
function route() { return new URLSearchParams(location.hash.slice(1)); }
function navigate(values) { location.hash = new URLSearchParams(values).toString(); }
function notify(message,error=false) { $('#message').className=error?'error':'success'; $('#message').textContent=message; }
function run(action) {
  try {
    const next=transition(state,actor(),action); const w=structuredClone(workspace);
    w.exercises[w.exercises.findIndex(s=>s.id===state.id)]=next; commit(w); render(); notify('Registro salvo neste navegador.');
  } catch(e) { notify(e.message,true); }
}
function dashboard() {
  const active=workspace.exercises.filter(s=>s.status==='em_andamento').length;
  return heading('CENTRAL DE SIMULAÇÕES','Exercícios','Prepare cenários, organize a equipe e acompanhe a resposta.',facilitator()?'<button data-toggle="new-exercise">＋ Novo exercício</button>':'')+
  `<div class="stats"><div class="stat"><strong>${workspace.exercises.length}</strong>exercícios</div><div class="stat"><strong>${active}</strong>em andamento</div><div class="stat"><strong>${workspace.exercises.filter(s=>s.status==='preparacao').length}</strong>em preparação</div><div class="stat"><strong>${workspace.exercises.filter(s=>s.status==='encerrado').length}</strong>encerrados</div></div>
  ${facilitator()?`<section id="new-exercise" class="card" hidden><h2>Criar exercício em branco</h2><form data-action="createExercise">${field('title','Nome do exercício','',false)}<p class="meta">Nenhum cenário, atividade ou evento será preenchido automaticamente.</p><button>Criar exercício</button></form></section>`:''}
  <section class="card table-card"><div class="section-title"><h2>Todos os exercícios</h2><span class="count">${workspace.exercises.length}</span></div>
  ${workspace.exercises.length?`<div class="table-scroll"><table><thead><tr><th>Exercício</th><th>Organização</th><th>Situação</th><th>Atividades validadas</th><th></th></tr></thead><tbody>${workspace.exercises.map(s=>`<tr><td><span class="meta">${esc(s.id)}</span><strong>${esc(s.title)}</strong></td><td>${esc(s.organization||'A definir')}</td><td><span class="status ${s.status}">${statusLabels[s.status]}</span></td><td>${s.activities.filter(a=>a.status==='aprovada').length} / ${s.activities.length}</td><td><button class="secondary" data-open="${esc(s.id)}">Abrir exercício</button></td></tr>`).join('')}</tbody></table></div>`:empty('Seu primeiro exercício começa aqui','Crie um ambiente em branco e defina os objetivos, o processo e a equipe. Nenhum caso é predefinido.')}</section>`;
}
function processes() {
  return heading('BASE OPERACIONAL','Processos de resposta','Mantenha o procedimento separado dos cenários. Cada exercício preserva a versão selecionada.')+
  `<div class="grid"><section>${workspace.processes.map(p=>`<article class="card"><span class="meta">${esc(p.id)} · versão ${p.version}</span><h2>${esc(p.title)}</h2><p class="preserve">${esc(p.content)}</p>${facilitator()?`<details><summary>Publicar nova versão</summary><form data-action="saveProcess"><input type="hidden" name="id" value="${esc(p.id)}">${field('title','Nome do processo',p.title,false)}${field('content','Procedimento interno',p.content)}<button>Salvar nova versão</button></form></details>`:''}</article>`).join('')||empty('Nenhum processo cadastrado','Documente o fluxo da organização e depois use-o em diferentes cenários.')}</section>
  ${facilitator()?`<section class="card"><h2>Cadastrar processo</h2><form data-action="saveProcess">${field('title','Nome do processo','',false)}${field('content','Procedimento interno')}<p class="meta">Inclua responsabilidades, ações e critérios. As atividades executáveis serão definidas em cada exercício.</p><button>Salvar processo</button></form></section>`:''}</div>`;
}
function overview() {
  const s=state, m=report(s,facilitator()).metrics;
  return `<div class="stats"><div class="stat"><strong>${m.approved} / ${m.total}</strong>atividades validadas</div><div class="stat"><strong>${visibleEvents(s).length}</strong>eventos liberados</div><div class="stat"><strong>${s.evidence.length}</strong>evidências</div><div class="stat"><strong>${s.cycle}</strong>ciclo de resposta</div></div><div class="grid"><section class="card"><h2>Contexto do exercício</h2><h3>Objetivos</h3><p class="preserve">${esc(s.objectives||'Defina os objetivos na área do facilitador.')}</p><h3>Cenário</h3><p class="preserve">${esc(s.scenario||'Nenhum cenário definido.')}</p><h3>Avaliação de privacidade</h3><p>${s.privacyRequired?'Prevista: o encerramento exige decisão regulatória fundamentada.':'Não obrigatória para encerramento. Pode ser registrada durante o exercício.'}</p></section><section class="card"><h2>Processo de referência</h2>${s.processSnapshot?`<span class="meta">${esc(s.processSnapshot.id)} · versão ${s.processSnapshot.version} preservada</span><h3>${esc(s.processSnapshot.title)}</h3><p class="preserve">${esc(s.processSnapshot.content)}</p>`:'<p class="empty">Selecione um processo na área do facilitador. O processo fica independente do cenário.</p>'}</section></div>`;
}
function team() {
  return `<section class="card"><h2>Equipe do exercício</h2><p class="meta">Papéis operacionais deste protótipo local. A alternância não cria sessões autenticadas.</p>${state.members.map(m=>`<div class="member"><span class="avatar">${esc(m.name.slice(0,1).toUpperCase())}</span><div><strong>${esc(m.name)}</strong><span class="meta">${esc(m.role)}</span></div></div>`).join('')||empty('Equipe ainda não definida','O facilitador cadastra os participantes e seus papéis antes de iniciar.')}</section>`;
}
function facilitatorPanel() {
  if(!facilitator()) return empty('Área do facilitador','Selecione o papel Facilitador para preparar e conduzir o exercício local.');
  const s=state;
  if(s.status==='encerrado') return empty('Exercício encerrado','Consulte os pareceres e o debrief. Os registros permanecem disponíveis para exportação.');
  if(s.status==='preparacao') return `<p class="notice">Preparação: defina contexto, selecione um processo, cadastre a equipe e pelo menos uma atividade. Eventos são opcionais e não têm número fixo.</p><div class="grid"><section>
  <article class="card"><h2>1. Contexto e objetivos</h2><form data-action="configure">${field('title','Nome do exercício',s.title,false)}${field('organization','Organização fictícia',s.organization,false)}${field('objectives','Objetivos do exercício',s.objectives)}${field('scenario','Contexto do cenário',s.scenario)}<label class="checkbox"><input type="checkbox" name="privacyRequired" ${s.privacyRequired?'checked':''}> Exigir avaliação regulatória no encerramento</label><button>Salvar contexto</button></form></article>
  <article class="card"><h2>2. Processo de resposta</h2>${workspace.processes.length?`<form data-action="useProcess">${selectPairs('processId','Processo e versão',workspace.processes.map(p=>[p.id,`${p.title} · v${p.version}`]),s.processSnapshot?.id)}<button>Vincular versão ao exercício</button></form>`:'<p>Cadastre um procedimento em Processos de resposta.</p>'}<button class="text-button" data-view="processes">Ir para processos →</button></article>
  <article class="card"><h2>3. Equipe</h2><form data-action="addMember">${field('name','Nome do participante','',false)}${select('role','Papel do participante',roles)}<button>Adicionar participante</button></form>${s.members.map(m=>`<p class="meta">${esc(m.name)} · ${esc(m.role)}</p>`).join('')}</article></section><section>
  <article class="card"><h2>4. Eventos do cenário</h2><form data-action="addEvent">${field('title','Título do evento','',false)}${field('content','Informações a apresentar à equipe')}<button>Adicionar evento</button></form>${s.events.map(e=>`<details><summary>${esc(e.id)} · ${esc(e.title)}</summary><p class="preserve">${esc(e.content)}</p></details>`).join('')}</article>
  <article class="card"><h2>5. Atividades do processo</h2><form data-action="addActivity">${field('title','Nome da atividade','',false)}${field('criteria','Critério de aceite e evidência esperada')}${select('role','Papel responsável',roles.filter(r=>r!=='Observador'))}${select('waypoint','Referência DAIR (opcional)',waypoints)}${selectPairs('eventId','Disponibilizar atividade',[['','Desde o início'],...s.events.map(e=>[e.id,`Após ${e.id} · ${e.title}`])])}<button>Adicionar atividade</button></form><p class="meta">${s.activities.length} atividade(s) planejada(s). Consulte a aba Atividades para revisar.</p></article>
  <article class="card accent"><h2>6. Revisar e iniciar</h2><p>O processo selecionado ficará preservado. Eventos serão liberados individualmente e o facilitador decidirá quando reavaliar a resposta.</p><button data-command="start">Iniciar exercício</button></article></section></div>`;
  return `<div class="grid"><section class="card"><h2>Eventos reservados</h2><p class="meta">Libere quando fizer sentido para os objetivos do exercício, mesmo com atividades em execução.</p>${s.events.map(e=>`<article class="event"><span class="meta">${e.id}</span><h3>${esc(e.title)}</h3><p class="preserve">${esc(e.content)}</p>${e.releasedAt?`<span class="status">Liberado · ${esc(e.releasedAt)}</span>`:`<button data-command="release" data-event="${e.id}">Liberar evento</button>`}</article>`).join('')||'<p class="empty">Nenhum evento planejado.</p>'}</section><section><article class="card"><h2>Reavaliar a resposta</h2><p>Abra outro ciclo DAIR quando novos fatos exigirem. Não há ciclo ou reentrada automática predefinida.</p><form data-action="newCycle">${field('reason','Motivo da reavaliação')}<button>Abrir novo ciclo</button></form></article><article class="card"><h2>Validação das entregas</h2><p>${s.activities.filter(a=>a.status==='em_validacao').length} atividade(s) aguardando parecer.</p><button data-tab="activities">Revisar atividades →</button></article></section></div>`;
}
function evidenceView() { return `<section class="card"><h2>Registro de evidências</h2><p class="meta">Registre evidências na atividade correspondente. Todos os registros deste ambiente são simulados.</p>${state.evidence.map(e=>`<article class="event"><span class="meta">${e.id} · ${e.activityId} · ${esc(e.certainty)}</span><h3>${esc(e.author)}</h3><p class="preserve">${esc(e.content)}</p><p class="meta">${esc(e.source)} · observado: ${esc(e.observedAt)} · registrado: ${esc(e.at)}</p></article>`).join('')||empty('Nenhuma evidência registrada','Abra uma atividade atribuída a você, registre o resultado e submeta ao facilitador.')}</section>`; }
function timeline() {
  const items=[...visibleEvents(state).map(e=>({at:e.releasedAt,title:`${e.id} · ${e.title}`,text:e.content})),...state.audit.map(a=>({at:a.at,title:`${a.id} · ${actionLabels[a.action]||a.action}`,text:`${a.actor} / ${a.role}${a.activityId?' · '+a.activityId:''}${a.reason?' · '+a.reason:''}`}))].sort((a,b)=>a.at.localeCompare(b.at));
  return `<section class="card"><h2>Cronologia do exercício</h2>${items.map(e=>`<article class="event"><span class="meta">${esc(e.at)}</span><h3>${esc(e.title)}</h3><p class="preserve">${esc(e.text)}</p></article>`).join('')||empty('A cronologia está vazia','Configurações, liberações e ações da equipe aparecerão aqui.')}</section>`;
}
function notes() { return `<div class="grid"><section>${state.notes.map(n=>`<article class="card"><span class="meta">${n.id} · ${esc(n.author)} · ${esc(n.at)}</span><p class="preserve">${esc(n.content)}</p></article>`).join('')||empty('Nenhuma nota registrada','Use este espaço para análises e observações da equipe.')}</section>${state.status==='em_andamento'&&actor().role!=='Observador'?`<section class="card"><h2>Nova nota</h2><form data-action="note">${field('content','Análise ou observação')}<button>Salvar nota</button></form></section>`:''}</div>`; }
function debrief() { return state.debrief?`<section class="card"><h2>Lições aprendidas</h2><p class="preserve">${esc(state.debrief.lessons)}</p><h2>Plano de melhoria</h2><p class="preserve">${esc(state.debrief.improvements)}</p><p class="meta">${esc(state.debrief.author)} · ${esc(state.debrief.at)}</p></section>`:facilitator()&&state.status==='em_andamento'?`<section class="card"><h2>Consolidar debrief</h2><p>Valide as atividades e registre as lições aprendidas. A decisão regulatória é exigida apenas se prevista na preparação.</p><form data-action="close">${field('lessons','Lições aprendidas: execução, eficácia e lacunas')}${field('improvements','Melhorias, responsáveis e prazos')}<button>Encerrar exercício</button></form></section>`:empty('Debrief ainda não disponível','O facilitador consolida as lições e melhorias ao encerrar o exercício.'); }
const tabs=[['overview','Visão geral'],['activities','Atividades'],['evidence','Evidências'],['decisions','Decisões'],['timeline','Cronologia'],['notes','Notas'],['team','Equipe'],['facilitator','Facilitador'],['debrief','Debrief']];
function exerciseView(tab) {
  const content={overview,activities:()=>{const list=facilitator()?state.activities:state.status==='preparacao'?[]:visibleActivities(state);return list.map(activityCard).join('')||empty('Nenhuma atividade disponível','O facilitador configura as atividades e define quando serão disponibilizadas.');},evidence:evidenceView,decisions:()=>`${state.status==='em_andamento'&&actor().role!=='Observador'?decisionForm():''}<section class="card"><h2>Decisões e reavaliações</h2>${state.decisions.map(d=>`<details><summary>${d.id} · ${esc(d.kind)} · ciclo ${d.cycle}</summary><pre>${esc(JSON.stringify(d,null,2))}</pre></details>`).join('')||empty('Nenhuma decisão registrada','As deliberações serão fundamentadas nas evidências produzidas durante o exercício.')}</section>`,timeline,notes,team,facilitator:facilitatorPanel,debrief};
  return `<button class="text-button back" data-view="exercises">← Todos os exercícios</button>`+heading(`${esc(state.id)} / ${esc(state.organization||'ORGANIZAÇÃO A DEFINIR')}`,esc(state.title),'Ambiente do exercício',`<span class="status ${state.status}">${statusLabels[state.status]}</span><button class="secondary" data-export="exercise">Exportar relatório</button>`)+`<nav class="tabs" aria-label="Seções do exercício">${tabs.filter(([id])=>id!=='facilitator'||facilitator()).map(([id,label])=>`<button aria-current="${id===tab?'page':'false'}" class="${id===tab?'active':''}" data-tab="${id}">${label}</button>`).join('')}</nav>${(content[tab]||overview)()}`;
}
function render() {
  const r=route(),view=r.get('view')||'exercises'; state=workspace.exercises.find(s=>s.id===r.get('exercise'));
  $('#app').innerHTML=view==='processes'?processes():view==='exercise'&&state?exerciseView(r.get('tab')||'overview'):dashboard();
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('selected',b.dataset.nav===(view==='processes'?'processes':'exercises')));
}
$('#role').innerHTML=options(['Facilitador',...roles.filter(r=>r!=='Facilitador')]);
$('#role').addEventListener('change',render); $('#actor').addEventListener('change',render);
window.addEventListener('hashchange',()=>{render(); $('#message').textContent=''; $('#message').className='';});
document.addEventListener('click',event=>{
  const b=event.target.closest('button'); if(!b)return;
  if(b.dataset.view)navigate({view:b.dataset.view});
  if(b.dataset.open)navigate({view:'exercise',exercise:b.dataset.open,tab:'overview'});
  if(b.dataset.tab)navigate({view:'exercise',exercise:state.id,tab:b.dataset.tab});
  if(b.dataset.toggle){const el=document.getElementById(b.dataset.toggle);el.hidden=!el.hidden;if(!el.hidden)el.querySelector('input')?.focus();}
  if(b.dataset.command)run({type:b.dataset.command,activityId:b.dataset.id,eventId:b.dataset.event});
  if(b.dataset.export){const data=b.dataset.export==='legacy'?JSON.parse(localStorage.getItem('dair-exercise-v1')):report(state,facilitator()); const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${b.dataset.export==='legacy'?'arquivo-v1':state.id}-simulacao.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
$('#app').addEventListener('submit',event=>{
  event.preventDefault(); const form=event.target, data=Object.fromEntries(new FormData(form)),type=form.dataset.action;
  try {
    if(type==='createExercise'){if(!facilitator())throw Error('Ação exclusiva do facilitador.');commit(addExercise(workspace,data.title));navigate({view:'exercise',exercise:workspace.exercises.at(-1).id,tab:'facilitator'});return;}
    if(type==='saveProcess'){if(!facilitator())throw Error('Ação exclusiva do facilitador.');commit(saveProcess(workspace,data));render();notify('Processo versionado salvo. Exercícios existentes preservam sua cópia.');return;}
    if(type==='useProcess')data.process=workspace.processes.find(p=>p.id===data.processId);
    if(type==='configure')data.privacyRequired=data.privacyRequired==='on';
    if(type==='decision')data.evidenceIds=new FormData(form).getAll('evidenceIds');
    run({...data,type,activityId:form.dataset.id});
  }catch(e){notify(e.message,true);}
});
window.addEventListener('storage',event=>{if(event.key===key)location.reload();});
if(localStorage.getItem('dair-exercise-v1'))$('#legacy').hidden=false;
render();
function activityCard(a) {
  const me = actor(); const facilitator = me.role === 'Facilitador';
  const mine = a.assignee === me.name && a.role === me.role;
  const editable = ['em_execucao','devolvida'].includes(a.status) && state.status === 'em_andamento';
  return `<article class="card"><span class="meta">${esc(a.id)} / ${esc(a.waypoint)} / ${esc(a.role)}</span>${a.eventId?`<p class="meta">Disponibilização após ${esc(a.eventId)}${visibleActivities(state).some(v=>v.id===a.id)?' · liberada':' · aguardando evento'}</p>`:''}<h3>${esc(a.title)}</h3><span class="status">${statusLabels[a.status]}</span><p>${esc(a.criteria)}</p><p class="meta">Responsável: ${esc(a.assignee || 'A atribuir')} · ${a.evidence.length} evidência(s)</p>
    ${facilitator && visibleActivities(state).some(v=>v.id===a.id) && ['pendente','em_execucao','devolvida'].includes(a.status) && state.status === 'em_andamento' ? `<form data-action="assign" data-id="${a.id}">${selectPairs('assignee','Responsável',state.members.filter(m=>m.role===a.role).map(m=>[m.name,m.name]),a.assignee)}<button>Atribuir atividade</button></form>` : ''}
    ${mine && editable ? `<details><summary>Registrar evidência simulada</summary><form data-action="evidence" data-id="${a.id}">${field('content','O que foi executado e qual o resultado?')}${field('source','Origem / coletor / custódia simulada')}${field('observedAt','Horário observado e fuso','',false)}${select('certainty','Natureza do registro',['confirmado','hipotese','inferido','desconhecido','nao_aplicavel'])}<button>Salvar evidência</button></form></details><div class="actions"><button data-command="submit" data-id="${a.id}">Submeter para validação</button></div>` : ''}
    ${a.evidence.length ? `<details><summary>Consultar evidências</summary>${state.evidence.filter(e=>e.activityId === a.id).map(e=>`<pre>${esc(e.id)} · SIMULADA · ${esc(e.certainty)}\n${esc(e.author)} · ${esc(e.observedAt)}\n${esc(e.source)}\n${esc(e.content)}</pre>`).join('')}</details>` : ''}
    ${facilitator && a.status === 'em_validacao' && state.status === 'em_andamento' ? `<details open><summary>Avaliar atividade</summary><form data-action="review" data-id="${a.id}">${select('verdict','Parecer',['aprovar','devolver'])}${field('execution','Execução: critérios atendidos e falhas')}${field('effectiveness','Eficácia: resultado comprovado e limitações')}${field('processGap','Lacunas do processo interno (ou nenhuma identificada)')}${field('feedback','Justificativa e orientação / melhoria com responsável e prazo')}<button>Registrar parecer</button></form></details>` : ''}
    ${a.reviews.length ? `<details><summary>Histórico de pareceres (${a.reviews.length})</summary>${a.reviews.map(r=>`<pre>${esc(r.reviewer)} · ${esc(r.at)} · ${esc(r.verdict)}\nExecução: ${esc(r.execution)}\nEficácia: ${esc(r.effectiveness)}\nProcesso: ${esc(r.processGap)}\n${esc(r.feedback)}</pre>`).join('')}</details>` : ''}</article>`;
}
function decisionForm() {
  return `<details class="card"><summary>Registrar decisão fundamentada</summary><p class="meta">Deliberações regulatórias são registradas pelo papel Controlador. Privacidade subsidia com evidências. Cada revisão preserva a decisão anterior.</p><form data-action="decision">${selectPairs('kind','Tipo',[['tecnica','Técnica'],['regulatoria','Regulatória']])}${field('outcome','Deliberação')}${field('rationale','Fundamento técnico / jurídico')}${field('unknowns','Incertezas e próximos passos')}
    <label>Evidências relacionadas (selecione uma ou mais)<select name="evidenceIds" multiple required>${state.evidence.map(e=>`<option value="${e.id}">${esc(e.id)} · ${esc(e.activityId)}</option>`).join('')}</select></label>
    <label>Decisão anterior substituída (opcional)<select name="supersedes"><option value="">Nova decisão</option>${state.decisions.map(d=>`<option>${d.id}</option>`).join('')}</select></label>
    <details><summary>Campos obrigatórios para decisão regulatória</summary>
    ${['significantImpact|Afetação significativa de direitos / interesses','categories|Categorias art. 5º, I a VI — sensíveis; menores/idosos; financeiros; autenticação; sigilo; larga escala','anpd|Deliberação sobre comunicação à ANPD','holders|Deliberação sobre comunicação aos titulares','awareness|Marco fundamentado de conhecimento pelo controlador, com fuso','validatedDeadline|Prazo aplicável validado, com fuso','deadlineBasis|Fundamento do prazo, calendário, feriados e exceções'].map(item=>{const [name,label]=item.split('|');return `<label>${label}<textarea name="${name}" maxlength="6000"></textarea></label>`}).join('')}
    <p class="meta">Avalie os requisitos cumulativos do art. 5º do RCIS. Não há limiar automático de larga escala ou pontuação que decida comunicação. Prazo geral de 3 dias úteis: confirme marco de ciência, regras específicas e eventual regime aplicável. Nenhuma comunicação real é enviada.</p></details><button>Registrar decisão</button></form></details>`;
}
