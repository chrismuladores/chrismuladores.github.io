(() => {
  const saved = localStorage.getItem('chrismuladores-theme');
  const theme = saved === 'dark' || saved === 'light' ? saved : 'dark';
  document.documentElement.dataset.theme = theme;

  const modules = {
    planificador: ['SYS-001', 'INTERMEDIATE'], memoria: ['SYS-002', 'INTERMEDIATE'], archivos: ['SYS-003', 'INTERMEDIATE'],
    'tipos-so': ['SYS-004', 'BASIC'], 'cmd-windows': ['SYS-005', 'INTERMEDIATE'], 'batch-windows': ['SYS-006', 'ADVANCED'],
    esre: ['SWE-001', 'ADVANCED'], gantt: ['SWE-002', 'INTERMEDIATE'], metodologias: ['SWE-003', 'BASIC'],
    pert: ['SWE-004', 'ADVANCED'], tablero: ['SWE-005', 'INTERMEDIATE'], estimacion: ['SWE-006', 'INTERMEDIATE'],
    pruebas: ['SWE-007', 'INTERMEDIATE'], git: ['SWE-008', 'INTERMEDIATE'], patrones: ['SWE-009', 'ADVANCED'],
    relevamiento: ['SWE-010', 'INTERMEDIATE'], decisiones: ['SWE-011', 'INTERMEDIATE'], 'frontend-html': ['FRT-001', 'BASIC']
  };
  const segments = location.pathname.split('/').filter(Boolean);
  const folder = segments.at(-1)?.includes('.') ? (segments.at(-2) || '') : (segments.at(-1) || '');
  const current = modules[folder];
  document.documentElement.dataset.area = current ? current[0].split('-')[0] : 'LAB';

  addEventListener('DOMContentLoaded', () => {
    if (current) {
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
    const areaMap = [['simulatorTitle', 'SYS'], ['engineeringTitle', 'SWE'], ['frontendTitle', 'FRT']];
    areaMap.forEach(([id, area]) => document.getElementById(id)?.closest('details')?.setAttribute('data-area', area));
    document.querySelectorAll('.simulator-card').forEach((card, index) => {
      const data = modules[(card.getAttribute('href') || '').split('/')[0]];
      if (card.querySelector('.module-identifier')) return;
      const area = data?.[0].split('-')[0] || card.closest('details')?.dataset.area || 'LAB';
      card.dataset.area = area;
      const identifier = document.createElement('span');
      identifier.className = 'module-identifier';
      identifier.textContent = data ? `${data[0]} / ${data[1]}` : `${area}-R${String(index + 1).padStart(2, '0')} / ROADMAP`;
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
