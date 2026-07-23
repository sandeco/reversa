# Code Quality Agents

El Team **Code Quality Agents** mejora la estructura interna de un sistema legado **sin cambiar su comportamiento observable**, y prueba esa preservación antes de tocar el código. Es mantenimiento perfectivo y preventivo sobre código que ya funciona: refactorización, modularización, desacoplamiento, optimización, simplificación algorítmica, estandarización y eliminación de código muerto.

Es un eje distinto de los otros Teams: Code Forward crea código nuevo, Bug Agents corrige defectos, Migration cambia de plataforma. Este Team mejora lo que ya funciona, manteniendo funcionando lo que funciona.

Regla fundadora: **proponer una transformación y aplicarla son actos separados, y nada toca el legado sin prueba de preservación del comportamiento.**

Team opcional, marcado por defecto en el instalador.

---

## Cuándo usarlo

El sistema funciona, pero un fragmento es difícil de leer, lento, demasiado acoplado, inconsistente o lleno de código que nadie llama, y quieres mejorarlo con seguridad en vez de reescribirlo. Cada cambio queda anclado al alma (`soul.md`) y a las reglas confirmadas que extrajo el Discovery Team, y el código del legado solo cambia mediante un diff aprobado con una red de seguridad comprobada.

El Team funciona mejor sobre una extracción (`_reversa_sdd/`): el alma y las specs confirmadas son la barrera que distingue un comportamiento real de uno accidental.

---

## Los 8 comandos

```
/reversa-refactor ──inventaría──► _reversa_refactor/<contexto>/opportunities/
      │ prioriza por ROI real (hotpath, no estética), enruta
      ▼
  estructura   /reversa-restructure   /reversa-modularize   /reversa-decouple
  rendimiento  /reversa-optimize      /reversa-simplify
  higiene      /reversa-standardize   /reversa-prune
      │ cada uno: red de seguridad ──► gate (diff aprobado) ──► prueba de preservación
      ▼
transformations/OPP-.../  (plan.html, diffs, evidencia)  ── siempre reversible
```

| Agente | Función |
|--------|---------|
| **Refactor** | Orquestador: lee el alma y el mapa del legado, inventaría oportunidades de mejora, prioriza por ROI real (hotpath, no estética), enruta al especialista correcto y conduce los gates. Nunca aplica una transformación. `/reversa-refactor` |
| **Restructure** | Estructura interna a nivel de método y clase con el catálogo Fowler (extraer método, renombrar, simplificar condicionales, eliminar duplicación), en pasos pequeños y reversibles. `/reversa-restructure` |
| **Modularize** | Divide un fragmento grande en módulos más pequeños, cohesivos y con responsabilidad bien definida, respetando las fronteras de dominio del alma. `/reversa-modularize` |
| **Decouple** | Reduce dependencias directas (inversión de dependencia, costuras/seams de Feathers, rotura de ciclos), midiendo el acoplamiento antes y después. `/reversa-decouple` |
| **Optimize** | Reduce tiempo de ejecución, memoria y consumo de recursos, siempre con una medición antes/después y salida preservada. `/reversa-optimize` |
| **Simplify** | Cambia lógica compleja por una solución más simple y clara, con prueba de equivalencia de salida. El objetivo es reducir la complejidad cognitiva, no el costo de recurso. `/reversa-simplify` |
| **Standardize** | Aplica convenciones consistentes de nomenclatura, formato y organización del patrón dominante del proyecto. Puramente cosmético y estructural, nunca cambia la semántica. `/reversa-standardize` |
| **Prune** | Elimina código muerto, y solo lo que pueda probar que está muerto (sin referencia estática y sin entrada dinámica conocida), distinguiendo muerto de huérfano sospechoso. `/reversa-prune` |

---

## El invariante: preservación del comportamiento

Refactorizar cambia la estructura, nunca el comportamiento observable. Este Team convierte eso en un invariante probado, con tres mecanismos:

- **Red de seguridad primero**: antes de cualquier cambio de estructura o lógica, el especialista verifica si hay pruebas que fijan el comportamiento actual. Sin cobertura, ofrece generar **pruebas de caracterización** (Feathers) que fijan el comportamiento tal como está, probadas en verde antes de que empiece la transformación. Si se rechaza la red, la transformación baja a rojo y el informe registra que se aplicó sin prueba mecánica.
- **Anclado al alma**: cada cambio se coteja contra `soul.md` y las specs confirmadas. Ninguna regla de negocio confirmada puede volverse una regla herida, y el código que implementa una regla confirmada nunca se trata como muerto.
- **Probado, luego reversible**: tras aplicar, el especialista prueba que la red de seguridad sigue en verde (comportamiento intacto), y el cambio siempre es reversible mediante el diff registrado. `optimize`, `decouple` y `simplify` además llevan medición antes/después o prueba de equivalencia, no solo una afirmación.

---

## Anatomía de las salidas

Todo vive en `_reversa_refactor/`, separado de la extracción (`_reversa_sdd/`), la evolución (`_reversa_forward/`) y los bugs (`_reversa_bugs/`). El trabajo se agrupa por **contexto**: la feature, módulo o caso de uso en mejora.

```
_reversa_refactor/
├── README.md                     el contrato del registro (modo de control, política de red)
└── <contexto>/                   p. ej. calculo-de-envio/
    ├── opportunities/            oportunidades detectadas, una por archivo (verbo, objetivo, ROI, confianza)
    ├── transformations/
    │   └── OPP-20260723-K4T9-extraer-reglas-de-envio/
    │       ├── plan.html         plan visual, aprobado ANTES de tocar cualquier archivo
    │       ├── safety-net/       pruebas de caracterización + resultado verde/rojo
    │       ├── before-after/     medición, prueba de equivalencia o prueba de muerte
    │       ├── CHG-NNN.diff       diffs aplicados, la fuente de reversión
    │       └── transformation.md  registro (red de seguridad, método de preservación, aprobación)
    └── generated/                índice de las oportunidades y su estado (nunca editado a mano)
```

Cada oportunidad hereda la escala de confianza de Reversa (🟢 cubierta y entendida, 🟡 parcial, 🔴 sin prueba de comportamiento) y una estimación de ROI. El orquestador prioriza un hot path de alta frecuencia por encima de un módulo grande pero raramente ejecutado. Cuando un objetivo pide más de un verbo, el orquestador encadena los especialistas uno a uno, cada uno con su gate.

---

## Non-destructive

Los Code Quality Agents escriben solo dentro de `_reversa_refactor/`. El código del proyecto cambia exclusivamente mediante un gate con diff aprobado, siempre reversible. Refactorizar no es una excepción a la directiva, es el caso que más depende de ella. Cualquier especialista que no pueda probar la preservación se detiene en el gate y nunca aplica en silencio. Eliminar código, alterar la spec efectiva y las operaciones destructivas tienen un gate obligatorio en todo modo de control.
