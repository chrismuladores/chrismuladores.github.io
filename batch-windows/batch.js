const $=selector=>document.querySelector(selector);
const examples={welcome:`@echo off
rem Mi primer archivo por lotes
set USUARIO=Estudiante
echo Hola, %USUARIO%!
mkdir trabajos
echo Carpeta creada.
dir
pause`,folders:`@echo off
echo Preparando entrega...
mkdir entrega
copy readme.txt entrega\\instrucciones.txt
cd entrega
dir
pause`,navigate:`@echo off
echo Explorando el sistema de archivos
dir
cd documentos
dir
type notas.txt
cd ..
pause`};
function createEnvironment(){return{cwd:'C:\\',folders:{'C:\\':['readme.txt','datos.csv','documentos'],'C:\\documentos':['notas.txt']},contents:{'C:\\readme.txt':'Archivo de bienvenida del entorno virtual.','C:\\datos.csv':'nombre,puntaje\nAna,95\nLuis,88','C:\\documentos\\notas.txt':'Recordatorio: practicar comandos Batch.'},variables:{},echo:true};}
function normalizedPath(path,env){if(!path)return env.cwd;if(path==='..'){const parts=env.cwd.replace(/\\$/,'').split('\\');return parts.length<=1?'C:\\':`${parts.slice(0,-1).join('\\')}\\`;}if(/^[A-Za-z]:\\/.test(path))return path.endsWith('\\')?path:`${path}\\`;return `${env.cwd}${path.replace(/\\$/,'')}\\`;}
function replaceVariables(text,env){return text.replace(/%([^%]+)%/g,(_,name)=>env.variables[name]??`%${name}%`);}
function runScript(){const env=createEnvironment(),output=[];const print=line=>output.push(line);const lines=$('#scriptEditor').value.replace(/\r/g,'').split('\n');for(const rawLine of lines){let line=rawLine.trim();if(!line)continue;if(line.startsWith('@')){line=line.slice(1);if(line.toLowerCase()==='echo off'){env.echo=false;continue;}}if(env.echo)print(`${env.cwd}>${line}`);const [command,...rest]=line.split(/\s+/);const argument=replaceVariables(rest.join(' '),env);switch(command.toLowerCase()){case'rem':break;case'echo':if(argument.toLowerCase()==='off'){env.echo=false;}else if(argument.toLowerCase()==='on'){env.echo=true;}else print(argument);break;case'set':{const match=argument.match(/^([^=]+)=(.*)$/);if(match)env.variables[match[1].trim()]=match[2];else print('Sintaxis: set NOMBRE=valor');break;}case'mkdir':case'md':{const target=normalizedPath(argument,env);if(!argument){print('Sintaxis: mkdir carpeta');break;}if(env.folders[target])print('Ya existe la carpeta especificada.');else{env.folders[target]=[];env.folders[env.cwd].push(argument);print(`Directorio creado: ${target}`);}break;}case'cd':{const target=normalizedPath(argument,env);if(!argument)print(env.cwd);else if(env.folders[target])env.cwd=target;else print('El sistema no puede encontrar la ruta especificada.');break;}case'dir':{const target=argument?normalizedPath(argument,env):env.cwd;if(!env.folders[target]){print('El sistema no puede encontrar la ruta especificada.');break;}print(` Directorio de ${target}`);print('');env.folders[target].forEach(item=>{const isFolder=env.folders[`${target}${item}\\`];print(`  ${isFolder?'[DIR] ': '      '}${item}`);});break;}case'type':{const target=`${env.cwd}${argument}`;if(env.contents[target])print(env.contents[target]);else print('El sistema no puede encontrar el archivo especificado.');break;}case'copy':{const [source,destination]=argument.split(/\s+/);const sourcePath=`${env.cwd}${source}`;const destinationPath=`${env.cwd}${destination}`;if(!source||!destination||!env.contents[sourcePath]){print('No se encuentra el archivo de origen.');break;}env.contents[destinationPath]=env.contents[sourcePath];if(!env.folders[env.cwd].includes(destination))env.folders[env.cwd].push(destination);print('        1 archivo(s) copiado(s).');break;}case'del':case'erase':{const target=`${env.cwd}${argument}`;if(env.contents[target]){delete env.contents[target];env.folders[env.cwd]=env.folders[env.cwd].filter(item=>item!==argument);print(`Eliminado: ${argument}`);}else print('No se encuentra el archivo especificado.');break;}case'pause':print('Presione una tecla para continuar . . .');break;case'cls':output.length=0;break;case'help':print('Comandos: echo, set, mkdir, cd, dir, type, copy, del, pause, rem');break;default:print(`'${command}' no se reconoce como un comando interno o externo.`);}}$('#terminal').textContent=output.join('\n');}
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{$('#scriptEditor').value=examples[button.dataset.example];runScript();}));$('#runBtn').addEventListener('click',runScript);$('#clearConsole').addEventListener('click',()=>{$('#terminal').textContent='';});function setTheme(theme){const dark=theme==='dark';document.documentElement.dataset.theme=theme;$('#themeToggle').setAttribute('aria-checked',String(dark));$('.theme-label').textContent=dark?'Modo claro':'Modo oscuro';$('.theme-knob').textContent=dark?'☾':'☼';localStorage.setItem('batch-theme',theme);}$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));setTheme(localStorage.getItem('batch-theme')||'light');runScript();
