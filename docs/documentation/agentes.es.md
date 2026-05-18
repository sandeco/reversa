# Los 4 agentes visuales

Cuatro agentes forman el Equipo de Documentación, más el orquestador. Cada uno corre en orden fijo, puede invocarse de forma independiente con `/reversa-docs-<rol>` y escribe solo dentro de `.reversa/documentation/`.

---

## Pipeline

```
Reversa Docs (orquestador)
        │
        ▼  vendor bundle (Fase 0)
        │
        ▼
Mapper → Analyst → Storyteller → Publisher
```

Hay una pausa de revisión humana entre agentes. El modo por defecto es interactivo. Usa `--auto` para saltar pausas.

---

## 1. Reversa Docs (orquestador)

**Comando:** `/reversa-docs`

Detecta qué fuentes están disponibles, conduce la entrevista de tres preguntas (perfil de lector, profundidad, estilo visual), calcula un seed determinístico a partir de `soul.md` (o del nombre del proyecto), persiste todo en `.config.json` y conduce los cuatro especialistas. Guarda telemetría en `.state.json` y ofrece seis opciones de regeneración en ejecuciones posteriores.

**Produce:** `.config.json`, `.state.json` y la coreografía de los demás agentes.

---

## 2. Mapper

**Comando:** `/reversa-docs-mapper`

Estructura espacial del proyecto. Renderiza Code City en 3D (Three.js, vía skill `reversa-arquitetura-3d`) donde cada edificio es un módulo, la altura codifica LOC y el color codifica complejidad. También genera un mapa de módulos 2D force-directed (D3) y, cuando se detecta topología, una vista side-by-side legado versus moderno.

**Produce:** `arquitetura.html`, `modulos.html`, `topologia.html` (cuando aplica). Los JSONs intermedios quedan en `assets/data/` para reuso por el Analyst.

---

## 3. Analyst

**Comando:** `/reversa-docs-analyst`

Dashboard cuantitativo. Highcharts treemap (LOC por módulo), columnas (complejidad por módulo), sankey (dependencias entre módulos), histograma (distribución de LOC). Cuando existe `.reversa/chronicle.md`, también renderiza una timeline interactiva de eventos del proyecto.

Reusa los JSONs del Mapper. En invocación independiente, corre extracción mínima cuando esos JSONs faltan.

**Produce:** `metricas.html`, `timeline.html` (cuando existe chronicle).

---

## 4. Storyteller

**Comando:** `/reversa-docs-storyteller`

Narrativa y onboarding. Tres artefactos: glosario interactivo (Concept Explainer con búsqueda cliente-side), slide deck navegable (6 a 10 slides) y una página detallada por feature en layout *How a Feature Works*.

No requiere Analyst ni Mapper como prerrequisito hard: el deck se adapta a las páginas existentes. En proyecto greenfield con solo `soul.md`, aún produce glosario más deck mínimo de 4 slides.

**Produce:** `glossario.html`, `deck.html`, `features/<spec>.html` (una por spec SDD).

---

## 5. Publisher

**Comando:** `/reversa-docs-publisher`

Última pieza del pipeline. Integra el trabajo de los tres especialistas en un mini-sitio coherente con sello generativo único (vía skill `reversa-selo-generativo`), inyecta mini-sello retroactivamente en cada página, hace auto-discovery de HTMLs auxiliares dejados por otros agentes del core Reversa (vía meta tag `reversa-category`), valida enlaces y corre un smoke test real (levanta `http.server`, busca cada página, revisa patrones de error) antes de declarar éxito.

Es dueño del **vendor bundle**: descarga Three.js, D3, Highcharts y módulos a `assets/vendor/` según `references/vendor-pins.yaml`, con retry de CDN. Eso es lo que hace que el mini-sitio funcione vía `file://` y offline.

**Produce:** `index.html` (hero más sello más nav), `assets/js/data.js` (inyecta `window.RV_DATA`), `assets/vendor/*` y telemetría final en `.state.json`.

---

## Skills compartidas

El equipo trae cinco skills compartidas que viajan con él. No son agentes independientes, son bloques de capacidad consumidos por los cuatro especialistas.

| Skill | Usada por | Propósito |
|-------|-----------|-----------|
| `reversa-arquitetura-3d` | Mapper | Renderización Code City 3D sobre Three.js |
| `reversa-especialista-d3` | Mapper | Mapa de módulos force-directed en D3 |
| `reversa-highcharts-visualizer` | Analyst | Treemap, sankey, histograma y columnas Highcharts |
| `reversa-image-prompt-json` | Storyteller | Portadas premium opcionales para los slides del deck |
| `reversa-selo-generativo` | Publisher | Sello generativo único por proyecto, derivado del seed determinístico |

---

## Ejecución manual

Casi nunca necesitas llamar a un agente aislado. `/reversa-docs` orquesta todo. Pero si una página específica se rompió o quieres regenerar una sección:

```
/reversa-docs                    # pipeline completo (con entrevista y CONTINUAR)
/reversa-docs --auto             # pipeline completo, sin pausas, perfil por defecto
/reversa-docs-mapper             # regenera arquitetura / modulos / topologia
/reversa-docs-analyst            # regenera metricas / timeline
/reversa-docs-storyteller        # regenera glossario / deck / features
/reversa-docs-publisher          # regenera index más sello más nav, re-ejecuta smoke test
```

Cada agente independiente corre la Fase 0 del Publisher (vendor bundle) como preámbulo cuando `assets/vendor/` está vacío, por lo que una llamada single-agent aún produce página funcional.
