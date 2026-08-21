const $ = selector => document.querySelector(selector);

const patterns = {
  Strategy: { category: 'Comportamiento', summary: 'Encapsula algoritmos intercambiables detrás de una misma interfaz.', use: 'Reglas de descuento, rutas, ordenamientos o políticas de validación.', pros: 'Reduce condicionales y permite sumar variantes sin modificar el contexto.', cons: 'Introduce más clases u objetos para casos muy simples.' },
  'Abstract Factory': { category: 'Creación', summary: 'Crea familias de objetos relacionados sin depender de sus clases concretas.', use: 'Interfaces multiplataforma, temas visuales o proveedores intercambiables.', pros: 'Mantiene coherencia entre productos y desacopla al cliente.', cons: 'Agregar un tipo nuevo de producto puede requerir cambios en todas las fábricas.' },
  Observer: { category: 'Comportamiento', summary: 'Un sujeto comunica sus cambios a múltiples observadores suscriptos.', use: 'Eventos de interfaz, notificaciones, paneles que reflejan un mismo estado.', pros: 'Desacopla al emisor de sus receptores y permite suscripciones dinámicas.', cons: 'Puede volver difícil seguir el flujo y exige gestionar bajas de observadores.' },
  Adapter: { category: 'Estructural', summary: 'Traduce una interfaz existente a la que el cliente espera usar.', use: 'Integrar APIs de terceros, sistemas heredados o formatos incompatibles.', pros: 'Reutiliza código sin modificarlo y aísla la conversión.', cons: 'Agrega una capa adicional y no resuelve incompatibilidades semánticas profundas.' },
  Command: { category: 'Comportamiento', summary: 'Convierte una solicitud en un objeto que puede almacenarse, ejecutarse o deshacerse.', use: 'Botones, historial de acciones, macros, colas y reintentos.', pros: 'Desacopla quien solicita de quien ejecuta y facilita undo/redo.', cons: 'Puede generar muchas clases pequeñas para acciones triviales.' },
  MVC: { category: 'Arquitectónico', summary: 'Separa el modelo de datos, la vista y el controlador de la interacción.', use: 'Aplicaciones con interfaz y reglas de presentación que evolucionan por separado.', pros: 'Mejora la organización, prueba de lógica y mantenimiento de interfaces.', cons: 'Puede ser excesivo para pantallas pequeñas y requiere límites claros entre capas.' }
};

function scores(data) {
  const values = Object.fromEntries(Object.keys(patterns).map(name => [name, 0]));
  const main = { algorithm: 'Strategy', creation: 'Abstract Factory', notifications: 'Observer', interface: 'Adapter', actions: 'Command', architecture: 'MVC' };
  values[main[data.problem]] += 8;
  if (data.participants === 'many') { values.Observer += 2; values.MVC += 1; }
  if (data.legacy === 'yes') values.Adapter += 5;
  if (data.evolution === 'yes') { values.Strategy += 1; values['Abstract Factory'] += 1; values.MVC += 1; }
  return values;
}

function render(data) {
  const ranking = Object.entries(scores(data)).sort((a, b) => b[1] - a[1]).slice(0, 3);
  $('#recommendation').innerHTML = ranking.map(([name, score], index) => {
    const p = patterns[name];
    const lead = index === 0 ? '<span class="best">Mejor ajuste</span>' : '<span class="alternative">Alternativa</span>';
    return `<article class="pattern-result"><div><p>${lead} <span class="category">${p.category}</span></p><h3>${name}</h3><p>${p.summary}</p></div><div class="fit"><strong>${score}</strong><span>señales de ajuste</span></div><p><b>Útil cuando:</b> ${p.use}</p><p><b>Ventaja:</b> ${p.pros}</p><p><b>Atención:</b> ${p.cons}</p></article>`;
  }).join('');
}

function catalog() {
  $('#catalog').innerHTML = Object.entries(patterns).map(([name, p]) => `<article class="catalog-card"><p class="category">${p.category}</p><h3>${name}</h3><p>${p.summary}</p><details><summary>Características, ventajas y límites</summary><p><b>Cuándo usarlo:</b> ${p.use}</p><p><b>Ventaja:</b> ${p.pros}</p><p><b>Desventaja:</b> ${p.cons}</p></details></article>`).join('');
}

$('#advisor-form').addEventListener('submit', event => { event.preventDefault(); render({ problem: $('#problem').value, participants: $('#participants').value, legacy: $('#legacy').value, evolution: $('#evolution').value }); });
$('#example').addEventListener('click', () => { $('#problem').value = 'interface'; $('#participants').value = 'many'; $('#legacy').value = 'yes'; $('#evolution').value = 'yes'; $('#advisor-form').requestSubmit(); });

const toggle = $('#theme-toggle');
toggle.checked = localStorage.getItem('patterns-theme') === 'dark';
document.body.classList.toggle('dark', toggle.checked);
toggle.addEventListener('change', () => { document.body.classList.toggle('dark', toggle.checked); localStorage.setItem('patterns-theme', toggle.checked ? 'dark' : 'light'); });
catalog();
