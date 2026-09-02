# Chrismuladores

<img src="assets/chrismuladores-logo.svg" alt="Logo de Chrismuladores" width="72" />

Laboratorio educativo de informática basado en simuladores visuales, ejercicios interactivos y rutas de aprendizaje progresivas.

[Abrir Chrismuladores](https://chrismuladores.github.io/)

## Qué ofrece

Chrismuladores permite experimentar con conceptos que suelen estudiarse únicamente de forma teórica. Cada simulador combina interacción, resultados visuales, ejercicios guiados y material de consulta.

- Interfaz técnica consistente basada en el sistema visual **Tech Simulation Lab**.
- Modo claro y oscuro persistente.
- Diseño adaptable a computadoras, tabletas y celulares.
- Generadores de ejercicios y personalización en los módulos que lo requieren.
- Secciones de ayuda con conceptos, fórmulas y criterios de interpretación.
- Navegación continua mediante «Volver a…» y «Siguiente simulador».
- Rutas de aprendizaje organizadas por etapas.

## Áreas y etapas

### Introducción a sistemas operativos

1. Procesos, memoria y tipos de sistemas.
2. Persistencia y organización de archivos.
3. Consola y automatización en Windows.

Simuladores: Planificación de procesos, Gestión de memoria, Tipos de sistemas operativos, Sistema de archivos, Línea de comandos Windows y Batch Windows.

### Ingeniería de software

1. Descubrimiento y especificación.
2. Enfoque, decisión y planificación.
3. Gestión y estimación ágil.
4. Diseño, calidad y evolución.

Simuladores: Técnicas de relevamiento, Documento ESRE, Metodologías ágiles y tradicionales, Toma de decisiones, Diagrama de Gantt, Grafo PERT, Tablero Scrum/Kanban, Estimación ágil, Patrones de diseño, Pruebas de software y Control de versiones con Git.

El simulador de Diagramas UML forma parte del roadmap de esta área.

### Frontend

1. HTML semántico, contenido y accesibilidad.
2. Fundamentos de CSS.
3. Layouts e interfaces adaptables.
4. Programación con JavaScript.
5. Interfaces con React.

El primer simulador disponible es **Estructura HTML y semántica**. Los módulos restantes muestran el recorrido previsto desde HTML y CSS hasta JavaScript y React.

### Backend con PHP

1. Fundamentos de una aplicación web.
2. Primeros pasos con PHP.
3. Decisiones, colecciones e iteración.
4. Modularización y flujo web.
5. Programación orientada a objetos.
6. Arquitectura y persistencia.

El roadmap incluye formularios y peticiones, PHP, POO, MVC, PDO, CRUD, sentencias preparadas, mapeo de objetos y respuestas JSON.

## Tecnologías

El sitio está construido sin frameworks ni proceso de compilación:

- HTML semántico.
- CSS con variables, temas y diseño responsive.
- JavaScript modular por simulador.
- SVG para logotipo y visualizaciones.
- GitHub Pages para publicación.

El sistema visual se documenta en `estilos.json` y se aplica globalmente mediante `site-consistency.css` y `theme-init.js`.

## Ejecución local

Puede abrirse `index.html` directamente o servirse con cualquier servidor HTTP estático. Por ejemplo:

```bash
python3 -m http.server 8000
```

Después, abre `http://localhost:8000` en el navegador.

## Publicación

GitHub Pages se publica desde la rama `main`. El repositorio de despliegue debe estar limpio y actualizado antes de enviar cambios.

El proyecto incluye un script local de apoyo:

```bash
./deploy-github-pages.sh
```

La clave SSH de despliegue y los documentos PDF utilizados como referencia son recursos locales y no deben versionarse.

## Créditos

Concepto, contenidos y desarrollo: [Chrismuladores](https://github.com/chrismuladores).

Proyecto creado con fines educativos para facilitar la práctica y comprensión de contenidos de informática.
