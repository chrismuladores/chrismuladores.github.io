(() => {
  const saved = localStorage.getItem('chrismuladores-theme');
  const theme = saved === 'dark' || saved === 'light' ? saved : 'dark';
  document.documentElement.dataset.theme = theme;

  const modules = {
    planificador: ['SYS-001', 'INTERMEDIATE', 'Planificación de procesos'], memoria: ['SYS-002', 'INTERMEDIATE', 'Gestión de memoria'],
    'tipos-so': ['SYS-004', 'BASIC', 'Tipos de sistemas operativos'], archivos: ['SYS-003', 'INTERMEDIATE', 'Sistema de archivos'],
    'cmd-windows': ['SYS-005', 'INTERMEDIATE', 'Línea de comandos Windows'], 'batch-windows': ['SYS-006', 'ADVANCED', 'Batch Windows'],
    relevamiento: ['SWE-010', 'INTERMEDIATE', 'Técnicas de relevamiento'], esre: ['SWE-001', 'ADVANCED', 'Documento ESRE'],
    metodologias: ['SWE-003', 'BASIC', 'Metodologías ágiles y tradicionales'], decisiones: ['SWE-011', 'INTERMEDIATE', 'Toma de decisiones'],
    gantt: ['SWE-002', 'INTERMEDIATE', 'Diagrama de Gantt'], pert: ['SWE-004', 'ADVANCED', 'Grafo PERT'],
    tablero: ['SWE-005', 'INTERMEDIATE', 'Tablero Scrum / Kanban'], estimacion: ['SWE-006', 'INTERMEDIATE', 'Estimación ágil'],
    patrones: ['SWE-009', 'ADVANCED', 'Patrones de diseño'], pruebas: ['SWE-007', 'INTERMEDIATE', 'Pruebas de software'],
    git: ['SWE-008', 'INTERMEDIATE', 'Control de versiones con Git'], 'frontend-html': ['FRT-001', 'BASIC', 'Estructura HTML y semántica']
  };
  const segments = location.pathname.split('/').filter(Boolean);
  const folder = segments.at(-1)?.includes('.') ? (segments.at(-2) || '') : (segments.at(-1) || '');
  const current = modules[folder];
  const currentArea = current ? current[0].split('-')[0] : 'LAB';
  document.documentElement.dataset.area = currentArea;

  addEventListener('DOMContentLoaded', () => {
    if (current) {
      document.querySelectorAll('a[href="../index.html"]').forEach(link => {
        link.href = `../index.html#area=${currentArea}`;
      });
      const moduleFolders = Object.keys(modules);
      const currentIndex = moduleFolders.indexOf(folder);
      const nextFolder = moduleFolders[(currentIndex + 1) % moduleFolders.length];
      const navigation = document.querySelector('nav, .page-navigation');
      if (navigation && !navigation.querySelector('.next-simulator-link')) {
        const nextLink = document.createElement('a');
        nextLink.className = 'next-simulator-link';
        nextLink.href = `../${nextFolder}/index.html`;
        nextLink.textContent = 'Siguiente simulador →';
        nextLink.title = `Siguiente simulador: ${modules[nextFolder][2]}`;
        nextLink.setAttribute('aria-label', nextLink.title);
        navigation.append(nextLink);
      }
      const header = document.querySelector('.hero') || document.querySelector('main > header');
      const titleBlock = header?.querySelector('h1')?.closest('div') || header;
      if (header && titleBlock && !header.querySelector('.technical-metadata')) {
        header.classList.add('simulator-header');
        const metadata = document.createElement('p');
        metadata.className = 'technical-metadata';
        metadata.textContent = `${current[0]} / ${current[1]} / STABLE`;
        titleBlock.prepend(metadata);
      }
    }
    const areaMap = [['simulatorTitle', 'SYS'], ['engineeringTitle', 'SWE'], ['frontendTitle', 'FRT'], ['backendTitle', 'BCK']];
    areaMap.forEach(([id, area]) => document.getElementById(id)?.closest('details')?.setAttribute('data-area', area));
    const areaMenus = areaMap
      .map(([, area]) => document.querySelector(`details[data-area="${area}"]`))
      .filter(Boolean);
    let savedOpenAreas = [];
    try {
      const storedAreas = JSON.parse(sessionStorage.getItem('chrismuladores-open-areas') || '[]');
      savedOpenAreas = Array.isArray(storedAreas) ? storedAreas : [];
    } catch {
      sessionStorage.removeItem('chrismuladores-open-areas');
    }
    areaMenus.forEach(menu => {
      if (savedOpenAreas.includes(menu.dataset.area)) menu.open = true;
    });
    const rememberOpenMenus = () => {
      const openAreas = areaMenus.filter(menu => menu.open).map(menu => menu.dataset.area);
      sessionStorage.setItem('chrismuladores-open-areas', JSON.stringify(openAreas));
    };
    areaMenus.forEach(menu => menu.addEventListener('toggle', rememberOpenMenus));
    const requestedArea = new URLSearchParams(location.hash.slice(1)).get('area')?.toUpperCase();
    if (requestedArea && areaMap.some(([, area]) => area === requestedArea)) {
      const requestedMenu = document.querySelector(`details[data-area="${requestedArea}"]`);
      if (requestedMenu) {
        requestedMenu.open = true;
        rememberOpenMenus();
        requestAnimationFrame(() => requestedMenu.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    }
    const roadmapCounters = {};
    document.querySelectorAll('.simulator-card').forEach(card => {
      const data = modules[(card.getAttribute('href') || '').split('/')[0]];
      if (card.querySelector('.module-identifier')) return;
      const area = data?.[0].split('-')[0] || card.closest('details')?.dataset.area || 'LAB';
      roadmapCounters[area] = (roadmapCounters[area] || 0) + (data ? 0 : 1);
      card.dataset.area = area;
      const identifier = document.createElement('span');
      identifier.className = 'module-identifier';
      identifier.textContent = data ? `${data[0]} / ${data[1]}` : `${area}-R${String(roadmapCounters[area]).padStart(2, '0')} / ROADMAP`;
      card.prepend(identifier);
      const status = card.querySelector('.card-status');
      if (status) status.textContent = card.classList.contains('available') ? 'ONLINE' : 'ROADMAP';
    });
    document.querySelectorAll('body > main > footer, .site-shell > footer, .shell > footer, .app-shell > footer').forEach(footer => {
      if (footer.querySelector('.system-status')) return;
      const status = document.createElement('span');
      status.className = 'system-status';
      status.textContent = 'SIMULATION NODE / STATUS: ONLINE / BUILD: 1.5.0';
      footer.append(status);
    });
  });
})();
