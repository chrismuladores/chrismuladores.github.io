const colors = ['#ffb387','#ffe084','#94cdf5','#94dfc6','#bbb0f6','#f4a8bb'];
let partitions = [{id:1,size:100},{id:2,size:500},{id:3,size:200},{id:4,size:300},{id:5,size:600}];
let processes = [{id:1,name:'P1',size:212},{id:2,name:'P2',size:417},{id:3,name:'P3',size:112},{id:4,name:'P4',size:426}];
let algorithm = 'first';
const $ = selector => document.querySelector(selector);
const names = {first:'FIRST FIT · Primera partición suficiente',best:'BEST FIT · Menor partición suficiente',worst:'WORST FIT · Mayor partición disponible'};
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function renderLists(){
  $('#partitionList').innerHTML=partitions.length?partitions.map((part,index)=>`<div class="list-item partitions-item"><span class="partition-chip">M${index+1}</span><span>${part.size} MB</span><button class="remove" data-partition="${part.id}" aria-label="Eliminar partición">×</button></div>`).join(''):'<p class="empty-list">Sin particiones.</p>';
  $('#processList').innerHTML=processes.length?processes.map((process,index)=>`<div class="list-item process-item"><span class="process-chip" style="--color:${colors[index%colors.length]}">${escapeHtml(process.name)}</span><span>${process.size} MB</span><button class="remove" data-process="${process.id}" aria-label="Eliminar proceso">×</button></div>`).join(''):'<p class="empty-list">Sin procesos.</p>';
}
function simulate(){
  if(!partitions.length||!processes.length)return;
  const slots=partitions.map((part,index)=>({...part,index,process:null}));
  const results=processes.map(process=>{
    const available=slots.filter(slot=>!slot.process&&slot.size>=process.size);
    let selected;
    if(available.length){selected=algorithm==='first'?available[0]:available.sort((a,b)=>algorithm==='best'?a.size-b.size:b.size-a.size)[0];selected.process=process;}
    return {...process,slot:selected||null};
  });
  renderResults(slots,results);
}
function renderResults(slots,results){
  const assigned=results.filter(result=>result.slot);const used=assigned.reduce((sum,result)=>sum+result.size,0);const fragmentation=assigned.reduce((sum,result)=>sum+result.slot.size-result.size,0);const free=slots.filter(slot=>!slot.process).length;const total=slots.reduce((sum,slot)=>sum+slot.size,0);
  $('#emptyState').hidden=true;$('#results').hidden=false;$('#memorySummary').textContent=`${total} MB en ${slots.length} particiones`;$('#memoryUsed').textContent=`${used} MB`;$('#fragmentation').textContent=`${fragmentation} MB`;$('#assignedCount').textContent=`${assigned.length}/${results.length}`;$('#freeCount').textContent=free;
  $('#memoryMap').innerHTML=slots.map(slot=>{const process=slot.process;const color=process?colors[processes.findIndex(item=>item.id===process.id)%colors.length]:'';const percent=process?(process.size/slot.size*100):0;return `<article class="memory-block ${process?'occupied':'available'}" style="flex:${slot.size}"><div class="block-label"><span>M${slot.index+1}</span><b>${slot.size} MB</b></div>${process?`<div class="process-allocation" style="height:${percent}% ;background:${color}"><strong>${escapeHtml(process.name)}</strong><span>${process.size} MB</span></div><div class="fragment-space">${slot.size-process.size?`${slot.size-process.size} MB libre`:''}</div>`:'<div class="free-space">Libre</div>'}</article>`;}).join('');
  $('#resultsBody').innerHTML=results.map(result=>result.slot?`<tr><td>${escapeHtml(result.name)}</td><td>${result.size} MB</td><td>M${result.slot.index+1}</td><td>${result.slot.size} MB</td><td>${result.slot.size-result.size} MB</td><td><span class="status success">Asignado</span></td></tr>`:`<tr><td>${escapeHtml(result.name)}</td><td>${result.size} MB</td><td>—</td><td>—</td><td>—</td><td><span class="status failed">Sin espacio</span></td></tr>`).join('');
}
function resetResults(){ $('#results').hidden=true;$('#emptyState').hidden=false; }
$('#partitionForm').addEventListener('submit',event=>{event.preventDefault();const size=Number($('#partitionSize').value);if(size<1||!Number.isFinite(size))return;partitions.push({id:Date.now(),size});$('#partitionSize').value=100;renderLists();resetResults();});
$('#processForm').addEventListener('submit',event=>{event.preventDefault();const size=Number($('#processSize').value),name=$('#nameInput').value.trim()||`P${processes.length+1}`;if(size<1||!Number.isFinite(size))return;processes.push({id:Date.now(),name,size});$('#nameInput').value=`P${processes.length+1}`;$('#processSize').value=100;renderLists();resetResults();});
$('.control-panel').addEventListener('click',event=>{const button=event.target.closest('.remove');if(!button)return;if(button.dataset.partition)partitions=partitions.filter(item=>item.id!==Number(button.dataset.partition));if(button.dataset.process)processes=processes.filter(item=>item.id!==Number(button.dataset.process));renderLists();resetResults();});
$('#partitionExample').addEventListener('click',()=>{partitions=[{id:1,size:100},{id:2,size:500},{id:3,size:200},{id:4,size:300},{id:5,size:600}];renderLists();resetResults();});
$('#processExample').addEventListener('click',()=>{processes=[{id:1,name:'P1',size:212},{id:2,name:'P2',size:417},{id:3,name:'P3',size:112},{id:4,name:'P4',size:426}];renderLists();resetResults();});
$('#clearBtn').addEventListener('click',()=>{partitions=[];processes=[];renderLists();resetResults();});
function randomInteger(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function generateExercise({partitionCount,processCount,maxPartitionSize,maxProcessSize}){
  const partitionMin=Math.max(10,Math.round(maxPartitionSize*.25));
  const processMin=Math.max(5,Math.round(maxProcessSize*.2));
  partitions=Array.from({length:partitionCount},(_,index)=>({id:index+1,size:randomInteger(partitionMin,maxPartitionSize)}));
  processes=Array.from({length:processCount},(_,index)=>({id:index+1,name:`P${index+1}`,size:randomInteger(processMin,maxProcessSize)}));
  $('#nameInput').value=`P${processCount+1}`;renderLists();resetResults();
}
const difficulties={easy:{partitionCount:3,processCount:3,maxPartitionSize:300,maxProcessSize:180},medium:{partitionCount:5,processCount:5,maxPartitionSize:650,maxProcessSize:480},hard:{partitionCount:8,processCount:9,maxPartitionSize:1200,maxProcessSize:1050}};
document.querySelectorAll('.difficulty-button').forEach(button=>button.addEventListener('click',()=>generateExercise(difficulties[button.dataset.difficulty])));
$('#customExerciseForm').addEventListener('submit',event=>{event.preventDefault();const number=(selector,min,max)=>Math.max(min,Math.min(max,Number($(selector).value)||min));generateExercise({partitionCount:number('#partitionCount',1,12),processCount:number('#processCount',1,12),maxPartitionSize:number('#maxPartitionSize',10,2000),maxProcessSize:number('#maxProcessSize',5,2000)});});
document.querySelectorAll('.algorithm-tab').forEach(button=>button.addEventListener('click',()=>{algorithm=button.dataset.algorithm;document.querySelectorAll('.algorithm-tab').forEach(item=>item.classList.toggle('active',item===button));$('#algorithmBadge').textContent=names[algorithm];}));
function setTheme(theme){const dark=theme==='dark';document.documentElement.dataset.theme=theme;$('#themeToggle').setAttribute('aria-checked',String(dark));$('.theme-label').textContent=dark?'Modo claro':'Modo oscuro';$('.theme-knob').textContent=dark?'☾':'☼';localStorage.setItem('chrismuladores-theme',theme);}
$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));setTheme(localStorage.getItem('chrismuladores-theme')||'light');$('#simulateBtn').addEventListener('click',simulate);renderLists();
