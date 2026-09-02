const $=selector=>document.querySelector(selector);
const examples={
  welcome:`@echo off
rem Mi primer archivo por lotes
set USUARIO=Estudiante
echo Hola, %USUARIO%!
mkdir trabajos
echo Carpeta creada.
dir
pause`,
  folders:`@echo off
echo Preparando entrega...
mkdir entrega
copy readme.txt instrucciones.txt
move instrucciones.txt entrega
cd entrega
dir
pause`,
  navigate:`@echo off
echo Explorando el sistema de archivos
dir
cd documentos
dir
type notas.txt
cd ..
pause`,
  question:`@echo off
echo Pregunta de practica
set /p RESPUESTA=Cuanto es 2 + 2?
if "%RESPUESTA%"=="4" goto correcto
echo La respuesta no es correcta.
goto fin

:correcto
echo Muy bien, 2 + 2 es 4.

:fin
pause`,
  counter:`@echo off
set CONTADOR=1
:repetir
echo Vuelta numero %CONTADOR%
set /a CONTADOR+=1
if %CONTADOR%==6 goto fin
goto repetir

:fin
echo El contador termino.
pause`,
  menu:`@echo off
:menu
cls
echo =====================
echo     MENU PRINCIPAL
echo =====================
echo 1. Saludar
echo 2. Sumar dos numeros
echo 3. Salir
set /p OPCION=Elige una opcion:
if "%OPCION%"=="1" goto saludo
if "%OPCION%"=="2" goto suma
if "%OPCION%"=="3" goto fin
echo Opcion no valida.
pause
goto menu

:saludo
set /p NOMBRE=Escribe tu nombre:
echo Hola, %NOMBRE%!
pause
goto menu

:suma
set /p A=Primer numero:
set /p B=Segundo numero:
set /a RESULTADO=A+B
echo El resultado es %RESULTADO%
pause
goto menu

:fin
echo Gracias por practicar Batch.
pause`};
let state=null;
function createEnvironment(){return{cwd:'C:\\',folders:{'C:\\':['readme.txt','datos.csv','documentos'],'C:\\documentos':['notas.txt']},contents:{'C:\\readme.txt':'Archivo de bienvenida del entorno virtual.','C:\\datos.csv':'nombre,puntaje\nAna,95\nLuis,88','C:\\documentos\\notas.txt':'Recordatorio: practicar comandos Batch.'},variables:{},echo:true};}
function normalizedPath(path,env){const value=(path||'').trim().replace(/^"|"$/g,'');if(!value)return env.cwd;if(value==='..'){const parts=env.cwd.replace(/\\$/,'').split('\\');return parts.length<=1?'C:\\':`${parts.slice(0,-1).join('\\')}\\`;}if(/^[A-Za-z]:\\/.test(value))return value.endsWith('\\')?value:`${value}\\`;return `${env.cwd}${value.replace(/\\$/,'')}\\`;}
function expand(text,env){return text.replace(/%([^%]+)%/g,(_,key)=>env.variables[key.toUpperCase()]??`%${key}%`);}
function show(){ $('#terminal').textContent=state.output.join('\n'); $('#terminal').scrollTop=$('#terminal').scrollHeight; }
function write(text=''){state.output.push(String(text));}
function setWaiting(kind,label,variable=''){state.waiting={kind,variable};$('#interactiveLabel').textContent=label;$('#interactiveInput').value='';$('#interactiveForm').hidden=false;setTimeout(()=>$('#interactiveInput').focus(),0);show();}
function hideWaiting(){$('#interactiveForm').hidden=true;}
function buildLabels(lines){return Object.fromEntries(lines.reduce((list,line,index)=>{const label=line.trim().match(/^:([^\s:]+)$/);if(label)list.push([label[1].toLowerCase(),index+1]);return list;},[]));}
function arithmetic(expression,env){const replaced=expression.replace(/[A-Za-z_][A-Za-z0-9_]*/g,name=>String(Number(env.variables[name.toUpperCase()]||0)));if(!/^[0-9+\-*/%().\s]+$/.test(replaced))return null;try{const result=Function(`"use strict";return (${replaced})`)();return Number.isFinite(result)?Math.trunc(result):null;}catch{return null;}}
function runSet(argument){const env=state.env;if(/^\/p\b/i.test(argument)){const content=argument.replace(/^\/p\s*/i,'');const match=content.match(/^([^=\s]+)=(.*)$/);if(!match){write('Sintaxis: set /p VARIABLE=mensaje');return false;}setWaiting('input',expand(match[2],env),match[1].toUpperCase());return true;}if(/^\/a\b/i.test(argument)){const content=argument.replace(/^\/a\s*/i,'');const assignment=content.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+)$/);if(assignment){const [,name,operator,expression]=assignment;const value=arithmetic(expression,env);if(value===null){write('Expresión aritmética no válida.');return false;}const current=Number(env.variables[name.toUpperCase()]||0);const computed=operator==='='?value:operator==='+='?current+value:operator==='-='?current-value:operator==='*='?current*value:operator==='/='?(value?Math.trunc(current/value):0):(value?current%value:0);env.variables[name.toUpperCase()]=String(computed);write(String(computed));return false;}const value=arithmetic(content,env);if(value===null)write('Sintaxis: set /a VARIABLE=expresión');else write(String(value));return false;}const match=argument.match(/^([^=\s]+)=(.*)$/);if(match)env.variables[match[1].toUpperCase()]=expand(match[2],env);else write('Sintaxis: set NOMBRE=valor');return false;}
function executeIf(argument){const expanded=expand(argument,state.env);const exist=expanded.match(/^not\s+exist\s+(.+?)\s+(.+)$/i)||expanded.match(/^exist\s+(.+?)\s+(.+)$/i);if(exist){const negative=/^not\s+/i.test(expanded),file=exist[1].replace(/^not\s+exist\s+/i,'').replace(/^exist\s+/i,'').trim(),action=exist[2];const exists=state.env.contents[`${state.env.cwd}${file}`]!==undefined;return negative?!exists?runInstruction(action):null:exists?runInstruction(action):null;}const comparison=expanded.match(/^(not\s+)?"?([^"=]+)"?\s*==\s*"?([^"=]+)"?\s+(.+)$/i);if(!comparison){write('Sintaxis: if [not] "valor"=="valor" comando');return null;}const truth=comparison[2]===comparison[3];if(truth===!comparison[1])return runInstruction(comparison[4]);return null;}
function runInstruction(source){let line=source.trim();if(!line||/^rem\b/i.test(line)||/^::/.test(line)||/^:/.test(line))return null;let silent=false;if(line.startsWith('@')){silent=true;line=line.slice(1).trim();}const [command,...rest]=line.split(/\s+/),argument=rest.join(' '),lower=command.toLowerCase();if(state.env.echo&&!silent)write(`${state.env.cwd}>${line}`);if(lower==='echo'){if(/^off$/i.test(argument))state.env.echo=false;else if(/^on$/i.test(argument))state.env.echo=true;else write(expand(argument,state.env));return null;}if(lower==='rem')return null;if(lower==='set')return runSet(argument)?{pause:true}:null;if(lower==='if')return executeIf(argument);if(lower==='goto'){const target=argument.replace(/^:/,'').toLowerCase();if(target==='eof'){state.index=state.lines.length;return{jump:true};}if(state.labels[target]===undefined){write(`Etiqueta no encontrada: ${argument}`);return null;}state.index=state.labels[target];return{jump:true};}if(lower==='pause'){write('Presione Enter para continuar . . .');setWaiting('pause','Presiona Enter para continuar');return{pause:true};}if(lower==='cls'){state.output=[];return null;}if(lower==='mkdir'||lower==='md'){const target=normalizedPath(argument,state.env);if(!argument)write('Sintaxis: mkdir carpeta');else if(state.env.folders[target])write('Ya existe la carpeta especificada.');else{state.env.folders[target]=[];state.env.folders[state.env.cwd].push(argument);write(`Directorio creado: ${target}`);}return null;}if(lower==='cd'){const target=normalizedPath(argument,state.env);if(!argument)write(state.env.cwd);else if(state.env.folders[target])state.env.cwd=target;else write('El sistema no puede encontrar la ruta especificada.');return null;}if(lower==='dir'){const target=argument?normalizedPath(argument,state.env):state.env.cwd;if(!state.env.folders[target]){write('El sistema no puede encontrar la ruta especificada.');return null;}write(` Directorio de ${target}`);state.env.folders[target].forEach(item=>write(`  ${state.env.folders[`${target}${item}\\`]?'[DIR] ': '      '}${item}`));return null;}if(lower==='type'){const target=`${state.env.cwd}${argument}`;if(state.env.contents[target])state.env.contents[target].split('\n').forEach(write);else write('El sistema no puede encontrar el archivo especificado.');return null;}if(lower==='copy'||lower==='move'){const [source,destination]=argument.split(/\s+/),sourcePath=`${state.env.cwd}${source}`;let folder=state.env.cwd,name=destination||'';if(destination&&destination.includes('\\')){const pieces=destination.split('\\');name=pieces.pop();folder=normalizedPath(pieces.join('\\'),state.env);}if(!source||!destination||!state.env.contents[sourcePath])write('No se encuentra el archivo de origen.');else if(!state.env.folders[folder])write('El sistema no puede encontrar la ruta de destino.');else{state.env.contents[`${folder}${name}`]=state.env.contents[sourcePath];if(!state.env.folders[folder].includes(name))state.env.folders[folder].push(name);if(lower==='move'){delete state.env.contents[sourcePath];state.env.folders[state.env.cwd]=state.env.folders[state.env.cwd].filter(item=>item!==source);}write(`        1 archivo(s) ${lower==='move'?'movido(s)':'copiado(s)'}.`);}return null;}if(lower==='del'||lower==='erase'){const target=`${state.env.cwd}${argument}`;if(state.env.contents[target]){delete state.env.contents[target];state.env.folders[state.env.cwd]=state.env.folders[state.env.cwd].filter(item=>item!==argument);write(`Eliminado: ${argument}`);}else write('No se encuentra el archivo especificado.');return null;}if(lower==='help'){write('Comandos: echo, set, if, goto, mkdir, cd, dir, type, copy, move, del, pause, rem, cls.');return null;}write(`'${command}' no se reconoce como un comando interno o externo.`);return null;}
function continueRun(){while(state&&state.index<state.lines.length&&!state.waiting){const result=runInstruction(state.lines[state.index++]);if(result?.pause)break;if(result?.jump)continue;}show();if(state&&state.index>=state.lines.length&&!state.waiting)state=null;}
function runScript(){state={lines:$('#scriptEditor').value.replace(/\r/g,'').split('\n'),labels:{},index:0,env:createEnvironment(),output:[],waiting:null};state.labels=buildLabels(state.lines);hideWaiting();continueRun();}
$('#interactiveForm').addEventListener('submit',event=>{event.preventDefault();if(!state?.waiting)return;const value=$('#interactiveInput').value;if(state.waiting.kind==='input'){state.env.variables[state.waiting.variable]=value;write(`${$('#interactiveLabel').textContent}${value}`);}state.waiting=null;hideWaiting();continueRun();});
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{$('#scriptEditor').value=examples[button.dataset.example];runScript();}));$('#runBtn').addEventListener('click',runScript);$('#clearConsole').addEventListener('click',()=>{$('#terminal').textContent='';if(state)state.output=[];});function setTheme(theme){const dark=theme==='dark';document.documentElement.dataset.theme=theme;$('#themeToggle').setAttribute('aria-checked',String(dark));$('.theme-label').textContent=dark?'Modo claro':'Modo oscuro';$('.theme-knob').textContent=dark?'☾':'☼';localStorage.setItem('chrismuladores-theme',theme);}$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));setTheme(localStorage.getItem('chrismuladores-theme')||'dark');runScript();
