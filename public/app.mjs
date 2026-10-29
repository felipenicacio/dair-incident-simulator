import { createExercise, transition, visibleActivities, visibleEvents, report, roles, waypoints } from '/domain.mjs';
const key = 'dair-exercise-v1';
let state;
try {
  const saved = localStorage.getItem(key);
  state = saved ? JSON.parse(saved) : createExercise();
  if (state.schemaVersion !== 1 || !Array.isArray(state.activities)) throw Error('Formato incompatível.');
} catch {
  document.querySelector('#message').textContent = 'Não foi possível ler o exercício salvo. Exporte os dados do navegador antes de limpar o armazenamento e recarregar.';
  throw Error('Armazenamento inválido; não sobrescrito.');
}
const $ = selector => document.querySelector(selector);
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options = values => values.map(v => `<option>${esc(v)}</option>`).join('');
$('#role').innerHTML = options(['Facilitador', ...roles.filter(r => r !== 'Facilitador')]);
const actor = () => ({ name: $('#actor').value.trim(), role: $('#role').value });
const field = (name, label, value = '', multiline = true) => `<label>${label}${multiline ? `<textarea name="${name}" required maxlength="6000">${esc(value)}</textarea>` : `<input name="${name}" required value="${esc(value)}" maxlength="200">`}</label>`;
const select = (name, label, values) => `<label>${label}<select name="${name}">${options(values)}</select></label>`;
const statusLabels = {pendente:'Pendente',em_execucao:'Em execução',devolvida:'Correção solicitada',em_validacao:'Aguardando facilitador',aprovada:'Validada'};
function run(action) {
  try {
    const next = transition(state, actor(), action);
    // Persist before updating the view: a quota failure must not appear as success.
    localStorage.setItem(key, JSON.stringify(next)); state = next; render();
    $('#message').className = 'success'; $('#message').textContent = 'Registro salvo neste navegador.';
  } catch (e) { $('#message').className = 'error'; $('#message').textContent = e.message; }
}
function activityCard(a) {
  const me = actor(); const facilitator = me.role === 'Facilitador';
  const mine = a.assignee === me.name && a.role === me.role;
  const editable = ['em_execucao','devolvida'].includes(a.status) && state.status === 'em_andamento';
  return `<article class="card"><span class="meta">${esc(a.id)} / ${esc(a.waypoint)} / ${esc(a.role)}</span><h3>${esc(a.title)}</h3><span class="status">${statusLabels[a.status]}</span><p>${esc(a.criteria)}</p><p class="meta">Responsável: ${esc(a.assignee || 'A atribuir')} · ${a.evidence.length} evidência(s)</p>
    ${facilitator && ['pendente','em_execucao','devolvida'].includes(a.status) && state.status === 'em_andamento' ? `<form data-action="assign" data-id="${a.id}">${field('assignee','Nome do responsável',a.assignee,false)}<button>Atribuir atividade</button></form>` : ''}
    ${mine && editable ? `<details><summary>Registrar evidência simulada</summary><form data-action="evidence" data-id="${a.id}">${field('content','O que foi executado e qual o resultado?')}${field('source','Origem / coletor / custódia simulada')}${field('observedAt','Horário observado e fuso (ex.: 19/10/2026 09:25 -03:00)','',false)}${select('certainty','Natureza do registro',['confirmado','hipotese','inferido','desconhecido','nao_aplicavel'])}<button>Salvar evidência</button></form></details><div class="actions"><button data-command="submit" data-id="${a.id}">Submeter para validação</button></div>` : ''}
    ${a.evidence.length ? `<details><summary>Consultar evidências</summary>${state.evidence.filter(e=>e.activityId === a.id).map(e=>`<pre>${esc(e.id)} · SIMULADA · ${esc(e.certainty)}\n${esc(e.author)} · ${esc(e.observedAt)}\n${esc(e.source)}\n${esc(e.content)}</pre>`).join('')}</details>` : ''}
    ${facilitator && a.status === 'em_validacao' && state.status === 'em_andamento' ? `<details open><summary>Avaliar atividade</summary><form data-action="review" data-id="${a.id}">${select('verdict','Parecer',['aprovar','devolver'])}${field('execution','Execução: critérios atendidos e falhas')}${field('effectiveness','Eficácia: resultado comprovado e limitações')}${field('processGap','Lacunas do processo interno (ou nenhuma identificada)')}${field('feedback','Justificativa e orientação / melhoria com responsável e prazo')}<button>Registrar parecer</button></form></details>` : ''}
    ${a.reviews.length ? `<details><summary>Histórico de pareceres (${a.reviews.length})</summary>${a.reviews.map(r=>`<pre>${esc(r.reviewer)} · ${esc(r.at)} · ${esc(r.verdict)}\nExecução: ${esc(r.execution)}\nEficácia: ${esc(r.effectiveness)}\nProcesso: ${esc(r.processGap)}\n${esc(r.feedback)}</pre>`).join('')}</details>` : ''}</article>`;
}
function decisionForm() {
  return `<details class="card"><summary>Registrar decisão fundamentada</summary><p class="meta">Deliberações regulatórias são registradas pelo papel Controlador. Privacidade subsidia com evidências. Cada revisão preserva a decisão anterior.</p><form data-action="decision">${select('kind','Tipo',['tecnica','regulatoria'])}${field('outcome','Deliberação')}${field('rationale','Fundamento técnico / jurídico')}${field('unknowns','Incertezas e próximos passos')}
    <label>Evidências relacionadas (selecione uma ou mais)<select name="evidenceIds" multiple required>${state.evidence.map(e=>`<option value="${e.id}">${esc(e.id)} · ${esc(e.activityId)}</option>`).join('')}</select></label>
    <label>Decisão anterior substituída (opcional)<select name="supersedes"><option value="">Nova decisão</option>${state.decisions.map(d=>`<option>${d.id}</option>`).join('')}</select></label>
    <details><summary>Campos obrigatórios para decisão regulatória</summary>
    ${['significantImpact|Afetação significativa de direitos / interesses','categories|Categorias art. 5º, I a VI — sensíveis; menores/idosos; financeiros; autenticação; sigilo; larga escala','anpd|Deliberação sobre comunicação à ANPD','holders|Deliberação sobre comunicação aos titulares','awareness|Marco fundamentado de conhecimento pelo controlador, com fuso','validatedDeadline|Prazo aplicável validado, com fuso','deadlineBasis|Fundamento do prazo, calendário, feriados e exceções'].map(item=>{const [name,label]=item.split('|');return `<label>${label}<textarea name="${name}" maxlength="6000"></textarea></label>`}).join('')}
    <p class="meta">Avalie os requisitos cumulativos do art. 5º do RCIS. Não há limiar automático de larga escala ou pontuação que decida comunicação. Prazo geral de 3 dias úteis: confirme marco de ciência, regras específicas e eventual regime aplicável. Nenhuma comunicação real é enviada.</p></details><button>Registrar decisão</button></form></details>`;
}
function render() {
  const facilitator = actor().role === 'Facilitador'; const m = report(state).metrics;
  $('#app').innerHTML = `<section class="card"><p class="eyebrow">${state.id} / ${esc(state.status.replaceAll('_',' '))}</p><h2>${esc(state.title)}</h2><p>${esc(state.procedure)}</p><div class="stats"><div class="stat"><strong>${Math.max(0,state.round+1)} / 3</strong>rodadas liberadas</div><div class="stat"><strong>${m.approved} / ${m.total}</strong>atividades validadas</div><div class="stat"><strong>${state.cycle}</strong>ciclo DAIR</div><div class="stat"><strong>${m.rework}</strong>atividades com correção</div></div>
  ${facilitator ? `<div class="actions">${state.status === 'preparacao' ? '<button data-command="start">Iniciar exercício</button>' : state.status === 'em_andamento' ? `${state.round<2 ? '<button data-command="release">Liberar próximo evento</button>':''}<button class="secondary" data-command="close">Encerrar e consolidar debrief</button>` : ''}</div>` : ''}</section>
  ${facilitator && state.status === 'preparacao' ? `<details class="card"><summary>Adaptar cenário e processo interno</summary><form data-action="configure">${field('title','Nome do cenário',state.title,false)}${field('procedure','Fluxo interno da organização',state.procedure)}<button>Salvar configuração</button></form><h3>Adicionar atividade ao fluxo</h3><form data-action="addActivity">${field('title','Atividade','',false)}${field('criteria','Critério de aceite e evidência esperada')}${select('role','Papel responsável',roles)}${select('waypoint','Waypoint DAIR',waypoints)}${select('round','Rodada (0, 1 ou 2)',['0','1','2'])}<button>Adicionar atividade</button></form></details>` : ''}
  <div class="grid"><section><h2>Plano de resposta</h2>${visibleActivities(state).map(activityCard).join('') || '<p class="empty">O facilitador deve iniciar o exercício para liberar as atividades.</p>'}</section><aside><h2>Linha do tempo</h2><section class="card">${visibleEvents(state).map(e=>`<article class="event"><span class="meta">${e.id}</span><h3>${esc(e.title)}</h3><p>${esc(e.content)}</p></article>`).join('') || '<p class="empty">Aguardando início.</p>'}</section>
  ${state.status === 'em_andamento' ? decisionForm() : ''}
  <section class="card"><h3>Decisões e reavaliações</h3>${state.decisions.map(d=>`<details><summary>${d.id} · ${esc(d.kind)} · ciclo ${d.cycle}</summary><pre>${esc(JSON.stringify(d,null,2))}</pre></details>`).join('') || '<p class="empty">Nenhuma decisão registrada.</p>'}</section>
  <details class="card"><summary>Trilha do exercício (${state.audit.length})</summary>${state.audit.map(e=>`<p class="meta">${esc(e.at)} · ${esc(e.actor)} / ${esc(e.role)} · ${esc(e.action)} ${esc(e.activityId)}</p>`).join('')}</details></aside></div>`;
}
$('#app').addEventListener('submit', event => {
  event.preventDefault(); const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  if (data.round !== undefined) data.round = Number(data.round);
  if (form.dataset.action === 'decision') data.evidenceIds = new FormData(form).getAll('evidenceIds');
  run({ ...data, type: form.dataset.action, activityId: form.dataset.id });
});
$('#app').addEventListener('click', event => {
  const button = event.target.closest('[data-command]'); if (button) run({ type: button.dataset.command, activityId: button.dataset.id });
});
$('#role').addEventListener('change', render); $('#actor').addEventListener('change', render);
$('#export').addEventListener('click', () => {
  // Export only released injects during play; future facilitator material is not disclosed in the report.
  const data = report(state); data.events = visibleEvents(state); data.activities = visibleActivities(state);
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a = document.createElement('a'); a.href=url; a.download=`${state.id}-simulacao.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
});
// Avoid silent lost updates if another tab is used. A full collaborative session is outside this MVP.
window.addEventListener('storage', event => { if(event.key === key) location.reload(); });
render();
