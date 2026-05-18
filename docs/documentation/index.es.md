# Equipo de Documentación

El **Equipo de Documentación** transforma el conocimiento extraído por el resto de Reversa en un mini-sitio HTML autocontenido, servido directamente desde el disco. Sin servidor de build, sin conexión a internet para visualizarlo: cada librería, cada dataset, cada asset visual está vendored localmente.

Activa con:

```
/reversa-docs
```

El orquestador detecta qué fuentes están disponibles (`_reversa_sdd/`, `.reversa/soul.md`, `.reversa/chronicle.md`, código fuente), realiza una breve entrevista de tres preguntas (perfil de lector, profundidad, estilo visual) y luego ejecuta cuatro agentes especialistas en orden fijo.

---

## Cuándo usar

Ya ejecutaste `/reversa` y quieres darle a alguien, un dev nuevo, un stakeholder no-técnico, un equipo externo auditando, una forma de navegar lo que se extrajo sin tener que leer Markdown crudo. El mini-sitio es opinativo sobre onboarding: Code City 3D para intuición espacial, dashboards para mordida cuantitativa, glosario más deck para narrativa.

En un proyecto greenfield puro (sin fuentes detectadas), el orquestador pregunta si quiere abortar o generar solo un index mínimo.

---

## Pipeline

```
/reversa-docs                   (orquestador)
       │
       ▼ Fase 0: vendor bundle
       │   descarga Three.js, D3, Highcharts, OrbitControls
       │   a assets/vendor/ para que funcione vía file:// offline
       │
       ▼ Fase 1
Mapper        → arquitetura.html (Code City 3D)
              → modulos.html (force-directed D3)
              → topologia.html (legado vs moderno side-by-side)
       │
       ▼ Fase 2
Analyst       → metricas.html (Highcharts treemap, sankey, histograma, columnas)
              → timeline.html (eventos de .reversa/chronicle.md)
       │
       ▼ Fase 3
Storyteller   → glossario.html (búsqueda cliente-side)
              → deck.html (6 a 10 slides navegables)
              → features/<spec>.html (una por spec SDD)
       │
       ▼ Fase 4
Publisher     → index.html con hero y sello generativo único
              → auto-discovery de HTMLs auxiliares
              → validación de enlaces y telemetría local
```

Hay un checkpoint `CONTINUAR` entre agentes. Usa `--auto` para saltar la entrevista y las pausas.

---

## Dónde quedan los artefactos

Todo se graba en `.reversa/documentation/`. El equipo **nunca** modifica artefactos del core (`_reversa_sdd/`, `.reversa/soul.md`, `.reversa/chronicle.md`), solo los lee.

```
.reversa/documentation/
├── index.html              (Publisher: hero, sello, nav)
├── arquitetura.html        (Mapper)
├── modulos.html            (Mapper)
├── topologia.html          (Mapper, si se detecta topología)
├── metricas.html           (Analyst)
├── timeline.html           (Analyst, si existe chronicle)
├── glossario.html          (Storyteller)
├── deck.html               (Storyteller)
├── features/
│   └── <spec>.html         (Storyteller, una por spec SDD)
├── viewer.html             (shell compartido)
├── assets/
│   ├── vendor/             (Three.js, D3, Highcharts, ...)
│   ├── js/data.js          (Publisher: inyecta window.RV_DATA)
│   └── data/*.json         (cachés intermedios entre agentes)
├── .config.json            (entrevista, seed, estilo visual)
└── .state.json             (telemetría del pipeline, hashes por página)
```

Si `.reversa/documentation/` ya existe, el orquestador ofrece seis opciones de regeneración (mantener, regenerar todo, regenerar un agente o página, rehacer la entrevista, ...) y siempre crea `.backup-<timestamp>/` antes de sobrescribir.

---

## Invariantes

Cada página producida por el equipo respeta cuatro invariantes. El Publisher es el guardián final, pero cualquier agente que las viole rompe el mini-sitio:

1. **Funciona vía `file://`**: doble clic en `index.html` basta. Ninguna página hace `fetch()` a archivos locales (CORS bloquea origin `null`); los datos vienen de `window.RV_DATA.<clave>`, inyectado por `assets/js/data.js`.
2. **Funciona offline**: ningún `<script src="https://...">` a CDN. Toda lib externa queda vendored en `assets/vendor/`.
3. **Nav refleja `pagesGenerated`**: el marcador `<!-- NAV_LINKS -->` en `viewer.html` lo llena el Publisher leyendo `.state.json.pagesGenerated`. Páginas omitidas no aparecen.
4. **Smoke test antes de declarar éxito**: el Publisher levanta un `http.server` local, busca cada página y revisa patrones de error. Las fallas aparecen destacadas en el resumen final.

---

## Próximos pasos

- [Los 4 agentes visuales](agentes.md): qué renderiza cada uno, entradas y salidas.
- [Code Forward Agents](../forward/index.md): el ciclo sobre el cual se construye el equipo.
