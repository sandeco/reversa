# Cómo usar

## Activar Reversa

Después de instalar, abre el proyecto en tu agente de IA y activa Reversa:

=== "Claude Code / Cursor / Gemini CLI"

    ```
    /reversa
    ```

=== "Codex y motores sin slash commands"

    ```
    reversa
    ```

Eso es todo. Reversa toma el control y coordina todo el análisis desde ahí.

---

## Elegir el comando de entrada

`/reversa` es el punto de entrada para analizar un sistema existente, pero no es el único flujo:

| Objetivo | Comando |
|----------|---------|
| Analizar un legado existente y producir specs | `/reversa` |
| El mismo análisis, de punta a punta, sin paradas intermedias | `/reversa-autonomous` |
| Empezar un proyecto nuevo desde una idea en una línea | `/reversa-new` (con `expresso` llega hasta el código) |
| Evolucionar el sistema una feature a la vez, de la spec al código | `/reversa-forward` |
| Converger una feature entregada de vuelta en la extracción | `/reversa-sync` |
| Reconstruir el legado en un stack moderno | `/reversa-migrate` |
| Renderizar el conocimiento extraído como mini-sitio HTML | `/reversa-docs` |
| Registrar y corregir defectos con trazabilidad causal | `/reversa-debugger`, `/reversa-debugger-fix` |
| Estimar esfuerzo, tamaño y precio desde las specs | `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate` |

---

## Modo sin supervisión

Si quieres que el análisis corra sin ti frente a la terminal:

```
/reversa-autonomous
```

Ejecuta exactamente los mismos agentes y fases que `/reversa`, pero concentra todas las preguntas en una **entrevista única al inicio** (datos de instalación, nivel de documentación, organización de las specs) y salta lo que ya esté respondido en `.reversa/state.json`. Tras la entrevista va hasta el final, deteniéndose solo ante la lista cerrada de situaciones que realmente requieren un humano.

La misma idea existe del lado greenfield: `/reversa-new expresso "<tu idea>"` va de la idea al código implementado sin parar, encadenando con el ciclo forward en cuanto las specs están listas.

!!! warning "Hecho para sesiones con aprobación automática"
    Estos modos son para entornos donde las herramientas se aprueban automáticamente (modo YOLO de Claude Code o equivalente). Como nadie está aprobando cada acción, las barreras son más estrictas: la escritura queda restringida a `.reversa/` y las carpetas de salida, y ningún comando destructivo o de efecto externo (borrar, `git push`, publicar, instalar dependencias) se ejecuta por cuenta propia. Aun así, haz backup del proyecto antes de empezar, como se recomienda en la [página inicial](index.md).

---

## Qué ocurre al activarlo

Reversa verifica si hay un análisis en curso:

**Primera vez:** crea un plan de exploración personalizado para tu proyecto, lo presenta para aprobación y comienza el análisis en la fase 1.

**Sesión retomada:** lee el checkpoint guardado en `.reversa/state.json` y continúa exactamente donde se quedó. No importa si cerraste el editor, reiniciaste la máquina o lo dejaste dormido tres días.

---

## Flujo típico de un análisis completo

```
Escribes /reversa
        ↓
Reversa crea el plan de exploración
        ↓
Revisas y apruebas el plan
        ↓
Scout mapea la superficie del proyecto
        ↓
Reversa presenta el resumen del Scout y eliges el nivel de documentación
        ↓
Archaeologist analiza módulo por módulo
        ↓
Detective y Architect interpretan lo encontrado
        ↓
Writer genera las especificaciones (una a la vez, con tu aprobación)
        ↓
Reviewer revisa todo y plantea preguntas de validación
        ↓
Especificaciones listas en _reversa_sdd/
```

El proceso es incremental y conversacional. No necesitas estar presente todo el tiempo: Reversa te avisa cuando te necesita.

---

## ¿Cuánto tiempo lleva?

Depende del tamaño del proyecto, pero una regla general:

| Tamaño del proyecto | Estimado |
|---------------------|----------|
| Pequeño (< 10 módulos) | 2 a 4 sesiones |
| Mediano (10 a 30 módulos) | 5 a 10 sesiones |
| Grande (30+ módulos) | 10+ sesiones |

El Archaeologist analiza un módulo por sesión a propósito, para conservar contexto. Para proyectos grandes retomarás varias veces, pero cada retomada es automática y sin pérdida de progreso.

---

## Consejo: desbordamiento de contexto

Si la sesión se alarga y el contexto empieza a agotarse, Reversa guarda el checkpoint automáticamente y avisa:

> "Voy a pausar aquí. Todo está guardado. Escribe `/reversa` en una nueva sesión para continuar."

Sin drama. Sin pérdida. Solo continúa después.

---

## Nivel de documentación

Después de que el Scout termina, Reversa presenta un resumen de lo que encontró (cantidad de módulos, integraciones, presencia de base de datos) y pregunta qué volumen de documentación quieres para el proyecto:

| Nivel | Cuándo usar | Qué genera |
|-------|-------------|------------|
| **Esencial** | Proyectos simples, scripts, prototipos | Artefactos principales: análisis de código, dominio, arquitectura, specs SDD |
| **Completo** | Proyectos medianos, equipos pequeños (por defecto) | Todo lo esencial + diagramas C4, ERD, ADRs, OpenAPI, user stories y matrices de trazabilidad |
| **Detallado** | Sistemas enterprise, múltiples equipos | Todo lo completo + flowcharts por función, ADRs expandidos, diagrama de deployment y revisión cruzada obligatoria |

La elección se guarda en `.reversa/state.json` y todos los agentes siguientes la respetan automáticamente. Si necesitas ajustarla después de iniciado el análisis, edita el campo `doc_level` en ese archivo.

---

## Activar un agente específico manualmente

Si quieres ejecutar un agente suelto, sin pasar por el orquestador:

```
/reversa-scout
/reversa-detective
/reversa-data-master
```

Útil cuando ya tienes un análisis en curso y quieres ejecutar un agente específico por alguna razón puntual.
