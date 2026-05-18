# Los agentes del greenfield

Cinco agentes forman el equipo **Code New Project Agents**. El orquestador (`/reversa-new`) conduce los otros cuatro en secuencia fija. Cada agente lee lo que el anterior produjo y añade su propio artefacto.

---

## Pipeline

```
Reversa New (orquestador)
        │
        ▼
Ideator → Researcher → Drafter → Spec SDD
```

Hay un checkpoint `CONTINUAR` entre agentes. El orquestador nunca avanza por sí solo.

---

## 1. Reversa New (orquestador)

**Comando:** `/reversa-new`

Lee el brief inicial (pasado inline o preguntado de forma interactiva), guarda `_reversa_sdd/newproject-brief.md`, conduce los cuatro agentes funcionales en orden fijo y registra checkpoint en `state.json#newproject_progress` después de cada etapa.

Detecta re-ejecución: si ya existe un pipeline en curso, pregunta si quiere continuar, recrear o re-ejecutar desde un agente específico.

**Produce:** `_reversa_sdd/newproject-brief.md` y el estado del orquestador en `state.json#newproject_progress`.

---

## 2. Ideator

**Comando:** `/reversa-ideator`

Brainstorm estructurado con seis preguntas divergentes: problema raíz, valor entregado, alternativas, público objetivo bruto, métricas de éxito, premisas peligrosas. Hace una pregunta por vez (cuando el motor no soporta agrupar bien), espera la respuesta antes de continuar y nunca colapsa las preguntas en un único prompt.

**Produce:** `_reversa_sdd/ideation.md`.

---

## 3. Researcher

**Comando:** `/reversa-researcher`

Transforma el público objetivo bruto de `ideation.md` en 1 a 3 personas estructuradas con jornadas (entrada, fricción, desenlace). El usuario elige cuántas personas; el agente solo sugiere según la amplitud de la descripción del público.

**Produce:** `_reversa_sdd/personas.md`.

---

## 4. Drafter

**Comando:** `/reversa-drafter`

Sintetiza ideation y personas en un PRD completo: problema, métricas de éxito, alcance, no-objetivos, restricciones, riesgos, preguntas abiertas. Actúa como sintetizador, no como entrevistador: extrae todo lo que puede de las dos fuentes y hace como máximo dos preguntas de cobertura para llenar los gaps más críticos. Lo que quede indefinido se marca con `🟡 [INDEFINIDO, validar con usuario]`.

**Produce:** `_reversa_sdd/prd.md`.

---

## 5. Spec SDD

**Comando:** `/reversa-spec-sdd`

Descompone el PRD en componentes lógicos y escribe una spec SDD por componente, con score automático de calidad (0 a 100) y análisis de gaps. La metodología es **RFC Pragmático más LLM-First**: estructurada como un RFC (Problem / Goals / Design / Edge Cases), pero optimizada para ser consumida por humanos y por agentes de IA.

Ese agente es una versión **vendored** de la skill global `sdd-spec`: vive nativamente dentro de Reversa, lee `prd.md` como fuente primaria, escribe en `_reversa_sdd/sdd/`, marca cada spec con el sello 🟡 (planificado) y, al concluir, hace handoff a `/reversa-forward`.

También se puede usar de forma independiente: evaluando una spec existente o generando una spec única a partir de cualquier entrada que el usuario pase.

**Produce:** `_reversa_sdd/sdd/<componente>.md` (uno por componente).

---

## Ejecución manual

Casi nunca necesitas llamar a un agente aislado. `/reversa-new` orquesta todo. Pero si un agente falló o quieres rehacer una etapa:

```
/reversa-new                    # detecta pipeline en curso, ofrece Continuar / Recrear / Re-ejecutar
/reversa-ideator                # independiente, lee newproject-brief.md
/reversa-researcher             # independiente, lee ideation.md
/reversa-drafter                # independiente, lee ideation.md más personas.md
/reversa-spec-sdd               # independiente, lee prd.md o cualquier fuente que pase el usuario
```

Cada agente independiente verifica sus propias precondiciones y aborta con un mensaje claro apuntando al artefacto que falta.
