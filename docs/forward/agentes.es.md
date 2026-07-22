# Los agentes del Forward

Once agentes forman el equipo **Code Forward Agents**. El orquestador (`/reversa-forward`) detecta el estado físico de la feature activa y sugiere el siguiente skill. Los otros diez cubren el ciclo de vida desde una idea en texto libre hasta el código en ejecución, y de ahí de vuelta a la extracción.

El orquestador corre en **dos escenarios**: evolución de legado con `_reversa_sdd/` poblado, o greenfield, sin extracción todavía. En ambos casos prepara las carpetas y nunca bloquea el pipeline.

---

## Pipeline

```
Reversa Forward (orquestador, punto de entrada opcional)
        │
        ▼
Requirements → Clarify → Quality → Plan → To-Do → Audit → Coding → Sync
                (opcional)  (opcional)             (opcional)          (opcional)

Principles y Resume corren fuera de este flujo lineal.
```

Hay un checkpoint `CONTINUAR` entre agentes. Cada skill verifica sus propias precondiciones y se niega a correr si falta un predecesor obligatorio. `reversa-coding` es el más estricto: aborta a menos que `_reversa_sdd/` tenga un ancla de contexto, ya sea el par de legado `architecture.md` + `domain.md` (de `/reversa`) o el par greenfield `prd.md` + al menos una spec en `sdd/` (de `/reversa-new`), para mantener sólido el puente specs-código.

---

## 1. Reversa Forward (orquestador)

**Comando:** `/reversa-forward`

Mira `.reversa/state.json` y `_reversa_forward/<feature>/` para detectar la etapa física inspeccionando los artefactos en disco (no metadata). Sugiere el siguiente skill, nunca lo ejecuta automáticamente: toda transición termina con pedido de `CONTINUAR`.

Detecta greenfield (sin `_reversa_sdd/`), crea las carpetas que `/reversa` habría creado y deja que el pipeline corra sin bloqueo.

**Produce:** nada por sí solo. Solo enrutamiento.

---

## 2. Requirements

**Comando:** `/reversa-requirements`

Transforma una idea en texto libre ("quiero que el usuario exporte facturas en PDF") en un `requirements.md` completo, anclado a `_reversa_sdd/architecture.md`, `domain.md`, `state-machines.md` y al glosario. Marca puntos abiertos con `[DOUBT]`, lista gaps y registra la feature en `.reversa/active-requirements.json`.

Detecta features en curso: si otra está activa, pregunta al usuario si quiere continuar, correr en paralelo (pausando la anterior) o abandonar. Nunca decide por sí solo.

**Produce:** `requirements.md` y entrada en `active-requirements.json`.

---

## 3. Clarify

**Comando:** `/reversa-clarify`

Genera hasta cinco preguntas dirigidas para resolver marcadores `[DOUBT]`, frases vagas ("probablemente", "tal vez") y gaps obvios. Las preguntas son de opción múltiple o respuesta corta, nunca abiertas. Las respuestas se integran de vuelta en `requirements.md` bajo una sección `## Clarifications` con fecha.

**Produce:** ediciones in-place en `requirements.md`.

---

## 4. Quality

**Comando:** `/reversa-quality`

Auditor read-only de claridad textual. Pregunta: *este texto está lo suficientemente bueno como para planificar sobre él sin retrabajo?*. Categorías: claridad, completitud, terminología, cobertura de escenarios, edge cases, jerga, soluciones implícitas, alineación con `principles.md`. Veredicto: Aprobado, Aprobado con reservas o Reprobado. No verifica tests de implementación.

**Produce:** `audit/requirements-audit.md`.

---

## 5. Plan

**Comando:** `/reversa-plan`

El arquitecto de la evolución. Traduce los requirements en una propuesta técnica concreta expresada como **delta sobre el legado**, nunca una re-arquitectura completa. Cada decisión lleva un marcador de confianza (🟢 evidencia fuerte, 🟡 parcial o basada en premisas aceptadas, 🔴 débil). Los conflictos con `principles.md` se señalan, pero nunca se sobrescriben silenciosamente.

**Produce:** `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/*` (un archivo por contrato externo afectado).

---

## 6. To-Do

**Comando:** `/reversa-to-do`

Descompone el roadmap en acciones atómicas distribuidas en cinco fases fijas: Preparación, Tests, Core, Integración, Pulido. Cada acción recibe un ID estable (`T001`, `T002`, ..., nunca reciclados), dependencias explícitas, archivo objetivo, marcador de confianza heredado y flag `[//]` cuando puede correr en paralelo con hermanas.

**Produce:** `actions.md`.

---

## 7. Audit

**Comando:** `/reversa-audit`

Cross-check read-only entre requirements, roadmap y actions. Los hallazgos se reportan con severidad (CRITICAL, HIGH, MEDIUM, LOW), agrupados en cuatro ejes: cobertura, consistencia, coherencia con el legado (`_reversa_sdd/domain.md`, `architecture.md`) y sanidad del grafo de actions (sin ciclos, tareas paralelas no comparten archivos). El skill nunca edita los documentos analizados, ni siquiera si el usuario lo pide.

**Produce:** `audit/cross-check.md`.

---

## 8. Coding

**Comando:** `/reversa-coding`

El ejecutor. Recorre `actions.md` fase por fase, respeta el paralelismo `[//]` y las dependencias, gira checkboxes de `[ ]` a `[X]` solo en éxito y agrega una línea por action en `progress.jsonl`. Al concluir (total o parcial), escribe dos trazas para la próxima ejecución del Discovery:

- `legacy-impact.md`: qué archivos del legado fueron tocados.
- `regression-watch.md`: invariantes que deben permanecer verdaderos en la próxima extracción reversa.

**Produce:** código fuente, checkboxes actualizados en `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`.

---

## 9. Sync

**Comando:** `/reversa-sync`

El paso de convergencia. Entre una entrega del ciclo forward y la siguiente re-extracción completa de `/reversa`, `_reversa_sdd/` queda desfasado: el código ya cambió, pero `architecture.md` y `domain.md` siguen describiendo el sistema anterior. Sync cierra ese intervalo destilando la feature entregada en un **adenda**, para que quien lea la extracción después — humano o agente — vea el sistema tal como está hoy.

Lee `legacy-impact.md` (obligatorio, fuente principal del delta), `regression-watch.md`, `requirements.md` y `progress.jsonl`, y detecta el escenario automáticamente: legado (`architecture.md` + `domain.md` presentes) o greenfield (`prd.md` + specs en `sdd/`). Si `actions.md` todavía tiene acciones `[ ]` abiertas, no decide solo: presenta un menú (sincronizar parcial ahora, o esperar a que `/reversa-coding` cierre todo).

La adenda lleva una sección `## Vigência` (vigencia) y apunta a las secciones de la extracción que quedaron desfasadas, sin editarlas nunca. La siguiente re-extracción completa la marca como superada.

**Produce:** `_reversa_sdd/addenda/<feature-id>-<short-name>.md`. Los artefactos originales de la extracción quedan intactos.

**Requiere:** una feature activa en `.reversa/active-requirements.json` y un `legacy-impact.md` generado por `/reversa-coding`.

---

## 10. Principles

**Comando:** `/reversa-principles`

Gestiona reglas duraderas del proyecto en `.reversa/principles.md`, separadas de los requirements de feature. Los principios son raros (típicamente menos de una vez al mes), usan números romanos (I, II, III, ...) que nunca se reciclan y los cambios se rastrean en una sección de historial. Cuando un principio cambia, el skill emite un reporte de impacto (`principles-impact-YYYYMMDD.md`) sugiriendo ajustes en templates. El humano los aplica, el skill nunca reescribe templates automáticamente.

**Produce:** `.reversa/principles.md` y `principles-impact-YYYYMMDD.md` en cada cambio.

---

## 11. Resume

**Comando:** `/reversa-resume`

Intercambia la feature activa con una de `paused-features`. Detecta la etapa física de cada feature pausada, muestra entradas huérfanas (carpeta borrada manualmente) y nunca crea features nuevas.

**Produce:** swap in-place de `active-requirements.json`. Ningún artefacto de feature es tocado.

---

## Ejecución manual

`/reversa-forward` es el punto de entrada recomendado cuando no recuerdas dónde paró la feature activa. Pero cada skill puede activarse de forma independiente:

```
/reversa-forward                 # detecta etapa y sugiere siguiente skill
/reversa-requirements <idea>     # nueva feature desde idea en texto libre
/reversa-clarify                 # resuelve marcadores [DOUBT] en requirements.md
/reversa-quality                 # audita claridad textual (read-only)
/reversa-plan                    # delta sobre legado desde requirements.md
/reversa-to-do                   # acciones atómicas desde roadmap.md
/reversa-audit                   # cross-check entre los tres docs (read-only)
/reversa-coding                  # ejecuta actions.md
/reversa-sync                    # converge la feature entregada en _reversa_sdd/addenda/
/reversa-principles              # gestiona reglas duraderas
/reversa-resume                  # cambia a una feature pausada
```

Hooks declarados en `.reversa/hooks.yml` (slots `before-<stage>` y `after-<stage>`) se aplican en toda transición.
