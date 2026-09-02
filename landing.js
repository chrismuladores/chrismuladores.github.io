const toggle=document.querySelector('#themeToggle');
function setTheme(theme){const dark=theme==='dark';document.documentElement.dataset.theme=theme;toggle.setAttribute('aria-checked',String(dark));toggle.querySelector('.theme-label').textContent=dark?'Modo claro':'Modo oscuro';toggle.querySelector('.theme-knob').textContent=dark?'☾':'☼';localStorage.setItem('chrismuladores-theme',theme);}
toggle.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
setTheme(localStorage.getItem('chrismuladores-theme')||'dark');
