const colors = ['#ffb387','#ffe084','#94cdf5','#94dfc6','#bbb0f6','#f4a8bb'];
let processes = [
  { id: 1, name: 'P1', arrival: 0, burst: 5 },
  { id: 2, name: 'P2', arrival: 1, burst: 3 },
  { id: 3, name: 'P3', arrival: 2, burst: 6 },
  { id: 4, name: 'P4', arrival: 4, burst: 2 },
];
let algorithm = 'fcfs';
const $ = (s) => document.querySelector(s);
const algorithmNames = { fcfs:'FCFS · First Come, First Served', 'sjf-np':'SJF no expropiativo · Shortest Job First', 'sjf-p':'SJF expropiativo · Shortest Remaining Time', rr:'Round Robin · Turnos por quantum' };
function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  $('#themeToggle').setAttribute('aria-checked', String(isDark));
  $('#themeToggle').setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  $('#themeToggle').querySelector('.theme-label').textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  $('#themeToggle').querySelector('.theme-knob').textContent = isDark ? '☾' : '☼';
  localStorage.setItem('chrismuladores-theme', theme);
}

function renderList() {
  $('#processList').innerHTML = processes.length ? processes.map((p, i) => `<div class="process-item"><span class="process-pill" style="--color:${colors[i % colors.length]}">${escapeHtml(p.name)}</span><span>${p.arrival}</span><span>${p.burst}</span><button class="remove" data-id="${p.id}" title="Eliminar ${escapeHtml(p.name)}">×</button></div>`).join('') : '<p style="font-size:11px;color:#9aa3b1;margin:16px 0">Aún no hay procesos.</p>';
}
function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function chooseReady(ready, byRemaining=false) { return ready.sort((a,b) => (byRemaining ? a.remaining-b.remaining : a.burst-b.burst) || a.arrival-b.arrival || a.id-b.id)[0]; }
function simulate() {
  if (!processes.length) return;
  const jobs = processes.map(p => ({...p, remaining:p.burst, finish:0, firstStart:null}));
  let time = 0, completed = 0, slices = [];
  const add = (job, start, end) => { if (job.firstStart === null) job.firstStart = start; const prev=slices.at(-1); if(prev && prev.id===job.id && prev.end===start) prev.end=end; else slices.push({id:job.id,name:job.name,start,end}); };
  const idle = (start,end) => { if(end>start) slices.push({id:'idle',name:'CPU libre',start,end}); };
  if (algorithm === 'fcfs' || algorithm === 'sjf-np') {
    const ordered = [...jobs];
    while (completed < jobs.length) { const ready=ordered.filter(j=>j.remaining && j.arrival<=time); if(!ready.length){const next=Math.min(...ordered.filter(j=>j.remaining).map(j=>j.arrival));idle(time,next);time=next;continue;} const job=algorithm==='fcfs' ? ready.sort((a,b)=>a.arrival-b.arrival||a.id-b.id)[0] : chooseReady(ready); const start=time;time+=job.remaining;job.remaining=0;job.finish=time;completed++;add(job,start,time); }
  } else if (algorithm === 'sjf-p') {
    while(completed < jobs.length) { const ready=jobs.filter(j=>j.remaining && j.arrival<=time); if(!ready.length){const next=Math.min(...jobs.filter(j=>j.remaining).map(j=>j.arrival));idle(time,next);time=next;continue;} const job=chooseReady(ready,true);add(job,time,time+1);job.remaining--;time++;if(!job.remaining){job.finish=time;completed++;} }
  } else {
    const quantum = Math.max(1, Number($('#quantumInput').value) || 1); let queue=[], index=0; const incoming=[...jobs].sort((a,b)=>a.arrival-b.arrival||a.id-b.id);
    while(completed < jobs.length) { while(index<incoming.length && incoming[index].arrival<=time) queue.push(incoming[index++]); if(!queue.length){const next=incoming[index].arrival;idle(time,next);time=next;continue;} const job=queue.shift(), start=time, run=Math.min(quantum,job.remaining); time+=run;job.remaining-=run;add(job,start,time); while(index<incoming.length && incoming[index].arrival<=time) queue.push(incoming[index++]); if(job.remaining)queue.push(job);else{job.finish=time;completed++;} }
  }
  renderResults(jobs,slices,time);
}
function renderResults(jobs,slices,total) {
  const busy = jobs.reduce((n,j)=>n+j.burst,0); const waiting=jobs.reduce((n,j)=>n+(j.finish-j.arrival-j.burst),0)/jobs.length; const turnaround=jobs.reduce((n,j)=>n+(j.finish-j.arrival),0)/jobs.length; const response=jobs.reduce((n,j)=>n+(j.firstStart-j.arrival),0)/jobs.length;
  $('#emptyState').hidden=true;$('#results').hidden=false;$('#timeSummary').textContent=`${total} unidades de tiempo`;$('#avgWaiting').textContent=waiting.toFixed(2);$('#avgTurnaround').textContent=turnaround.toFixed(2);$('#avgResponse').textContent=response.toFixed(2);$('#cpuUse').textContent=`${(busy/total*100).toFixed(0)}%`;
  const colorMap = Object.fromEntries(processes.map((p,i)=>[p.id,colors[i%colors.length]]));
  const timeLabels = Array.from({length: total + 1}, (_, time) => `<span class="time-label ${time === total ? 'last-time-label' : ''}" style="grid-column:${Math.min(time + 1, total)}">${time}</span>`).join('');
  const lanes = jobs.sort((a,b)=>a.id-b.id).map(job => {
    const runs = slices.filter(slice => slice.id === job.id).map(slice =>
      `<span class="gantt-run" title="${escapeHtml(job.name)}: ${slice.start}–${slice.end}" style="grid-column:${slice.start + 1} / ${slice.end + 1}; background:${colorMap[job.id]}">${slice.end - slice.start > 1 ? escapeHtml(job.name) : ''}</span>`
    ).join('');
    const arrival = `<span class="gantt-arrival" aria-label="${escapeHtml(job.name)} llega en el tiempo ${job.arrival}" title="Llegada de ${escapeHtml(job.name)}: t = ${job.arrival}" style="grid-column:${job.arrival + 1}; --arrival-color:${colorMap[job.id]}"></span>`;
    return `<div class="gantt-row"><span class="gantt-process-label"><i style="background:${colorMap[job.id]}"></i>${escapeHtml(job.name)} <b class="arrival-chip" style="--arrival-color:${colorMap[job.id]}">L:${job.arrival}</b></span><div class="gantt-lane" style="--units:${total}">${arrival}${runs}</div></div>`;
  }).join('');
  const mobileTimeline = slices.map(slice => { const color = slice.id === 'idle' ? '#d7dee8' : colorMap[slice.id]; return `<article class="mobile-slice"><span class="mobile-time">${slice.start}<i></i>${slice.end}</span><div style="--slice-color:${color}"><b>${escapeHtml(slice.name)}</b><small>${slice.end - slice.start} unidad${slice.end - slice.start === 1 ? '' : 'es'} de CPU</small></div></article>`; }).join('');
  $('#gantt').innerHTML = `<div class="gantt-chart desktop-schedule" style="--units:${total}"><div class="gantt-axis"><span class="axis-title">TIEMPO</span><div class="time-scale">${timeLabels}</div></div>${lanes}</div><div class="mobile-schedule" aria-label="Cronograma vertical de ejecución">${mobileTimeline}</div>`;
  $('#metricsBody').innerHTML=jobs.sort((a,b)=>a.id-b.id).map(j=>`<tr><td>${escapeHtml(j.name)}</td><td>${j.arrival}</td><td>${j.burst}</td><td>${j.finish}</td><td>${j.firstStart-j.arrival}</td><td>${j.finish-j.arrival-j.burst}</td><td>${j.finish-j.arrival}</td></tr>`).join('');
}
$('#processForm').addEventListener('submit', e=>{e.preventDefault();const name=$('#nameInput').value.trim()||`P${processes.length+1}`,arrival=Number($('#arrivalInput').value),burst=Number($('#burstInput').value);if(arrival<0||burst<1||!Number.isFinite(arrival)||!Number.isFinite(burst))return;processes.push({id:Date.now(),name,arrival,burst});$('#nameInput').value=`P${processes.length+1}`;$('#arrivalInput').value=0;$('#burstInput').value=1;renderList();});
$('#processList').addEventListener('click',e=>{if(e.target.matches('.remove')){processes=processes.filter(p=>p.id!==Number(e.target.dataset.id));renderList();}});
$('#clearBtn').addEventListener('click',()=>{processes=[];renderList();$('#results').hidden=true;$('#emptyState').hidden=false;});
$('#sampleBtn').addEventListener('click',()=>{processes=[{id:1,name:'P1',arrival:0,burst:5},{id:2,name:'P2',arrival:1,burst:3},{id:3,name:'P3',arrival:2,burst:6},{id:4,name:'P4',arrival:4,burst:2}];renderList();});
function randomInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateExercise({ count, maxArrival, maxBurst, maxQuantum }) {
  processes = Array.from({length: count}, (_, index) => ({ id:index + 1, name:`P${index + 1}`, arrival:index === 0 ? 0 : randomInteger(0, maxArrival), burst:randomInteger(1, maxBurst) }));
  $('#quantumInput').value = randomInteger(1, maxQuantum);
  $('#nameInput').value = `P${count + 1}`;
  renderList();
  $('#results').hidden=true;
  $('#emptyState').hidden=false;
}
const difficulties = {
  easy: { count:3, maxArrival:3, maxBurst:4, maxQuantum:2 },
  medium: { count:5, maxArrival:7, maxBurst:8, maxQuantum:4 },
  hard: { count:8, maxArrival:14, maxBurst:14, maxQuantum:6 },
};
document.querySelectorAll('.difficulty-button').forEach(button => button.addEventListener('click', () => generateExercise(difficulties[button.dataset.difficulty])));
$('#customExerciseForm').addEventListener('submit', event => {
  event.preventDefault();
  const count = Math.max(1, Math.min(12, Number($('#exerciseCount').value) || 1));
  const maxArrival = Math.max(0, Math.min(40, Number($('#maxArrival').value) || 0));
  const maxBurst = Math.max(1, Math.min(30, Number($('#maxBurst').value) || 1));
  const maxQuantum = Math.max(1, Math.min(15, Number($('#maxQuantum').value) || 1));
  generateExercise({ count, maxArrival, maxBurst, maxQuantum });
});
$('#themeToggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
document.querySelectorAll('.algorithm-tab').forEach(btn=>btn.addEventListener('click',()=>{algorithm=btn.dataset.algorithm;document.querySelectorAll('.algorithm-tab').forEach(b=>b.classList.toggle('active',b===btn));$('#algorithmBadge').textContent=algorithmNames[algorithm];$('#quantumControl').style.display=algorithm==='rr'?'grid':'none';}));
setTheme(localStorage.getItem('chrismuladores-theme') || 'light');
$('#simulateBtn').addEventListener('click',simulate);renderList();
