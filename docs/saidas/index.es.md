# Salidas generadas

Todo lo que Reversa produce va a la carpeta `_reversa_sdd/`. El proyecto heredado nunca es tocado.

El conjunto de artefactos generados depende del **nivel de documentación** elegido al inicio del análisis:

| Leyenda | Nivel |
|---------|-------|
| *(todos)* | Generado en los 3 niveles |
| *(completo+)* | Solo en los niveles `completo` y `detalhado` |
| *(detalhado)* | Solo en el nivel `detalhado` |

---

## Estructura completa

```
_reversa_sdd/
├── README.md                 # Índice + tabla Sincronização doc ↔ código — todos
├── inventory.md              # Inventario del proyecto — todos
├── dependencies.md           # Dependencias con versiones — todos
├── code-analysis.md          # Análisis técnico por módulo — todos
├── data-dictionary.md        # Diccionario completo de datos — completo+
├── domain.md                 # Glosario y reglas de negocio — todos
├── state-machines.md         # Máquinas de estado en Mermaid — completo+
├── permissions.md            # Matriz de permisos — completo+
├── architecture.md           # Visión arquitectónica general — todos
├── c4-context.md             # Diagrama C4: Contexto — todos
├── c4-containers.md          # Diagrama C4: Containers — completo+
├── c4-components.md          # Diagrama C4: Componentes — completo+
├── erd-complete.md           # ERD completo en Mermaid — completo+
├── deployment.md             # Diagrama de infraestructura — detalhado
├── confidence-report.md      # Reporte de confianza 🟢🟡🔴 — todos
├── gaps.md                   # Brechas sin resolver — completo+
├── questions.md              # Preguntas para validación humana — todos
├── sdd/                      # Specs por componente — todos
├── openapi/                  # Specs de API — completo+
├── user-stories/             # User stories — completo+
├── adrs/                     # Decisiones arquitectónicas retroactivas — completo+
├── flowcharts/               # Diagramas de flujo en Mermaid — completo+
├── ui/                       # Specs de interfaz (Visor)
├── database/                 # Specs de base de datos (Data Master)
├── design-system/            # Tokens de diseño (Design System)
├── addenda/                  # Adendas post-entrega (reversa-sync)
│   └── [NNN]-[feature].md    # Una por feature entregada por /reversa-coding
│
└── traceability/
    ├── spec-impact-matrix.md # Qué spec impacta a cuál — completo+
    ├── code-spec-matrix.md   # Archivo de código a spec correspondiente — completo+
    └── bugs.md               # Matriz BUG ↔ SPEC (reversa-debugger-graph)
```

---

## Adendas: mantener la extracción al día

Una extracción es una fotografía del sistema en un momento dado. En cuanto se entrega una feature del forward, el código sigue adelante y `architecture.md` y `domain.md` pasan a describir un sistema que ya no existe.

`/reversa-sync` cierra ese intervalo sin tocar los artefactos originales. Destila la feature entregada en una adenda dentro de `addenda/`, un archivo por feature, que contiene:

- una sección de **vigencia**, indicando que la adenda vale hasta la siguiente re-extracción completa
- el delta introducido por la feature, tomado de `legacy-impact.md` y `regression-watch.md`
- punteros a las secciones de la extracción que quedaron desfasadas, para que quien las lea sepa que también debe leer la adenda

La siguiente ejecución completa de `/reversa` absorbe el cambio y marca la adenda como superada. Nada de la extracción se reescribe en su lugar.

---

## Trazabilidad

**`traceability/code-spec-matrix.md`:** mapea cada archivo de código a su spec correspondiente, con el nivel de cobertura.

**`traceability/spec-impact-matrix.md`:** mapea qué componente impacta a cuál. Antes de cambiar algo, sabes el radio de impacto del cambio.

---

## Siguiente paso

Specs en mano? Consulta [Desarrollando desde los specs](../desenvolvendo-com-specs.md) para el orden recomendado de construcción del sistema.
