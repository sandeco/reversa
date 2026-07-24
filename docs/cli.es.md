# CLI

Reversa tiene un CLI simple para gestionar la instalación y el ciclo de vida de los agentes en tu proyecto. Todos los comandos se ejecutan con `npx reversa` en la raíz del proyecto.

---

## Comportamiento inicial

Al iniciar y antes de mostrar el logo ASCII de Reversa, el CLI debe limpiar la pantalla del terminal. El logo debe aparecer en la parte superior del terminal, sin contenido anterior encima.

La firma `by sandeco` debe aparecer en blanco en la última línea del arte, después de un margen a la derecha del final del `Reversa` grande. No debe quedar flotando a media altura del logo.

Formato esperado:

```text
  ______
  | ___ \
  | |_/ /_____   _____ _ __ ___  __ _
  |    // _ \ \ / / _ \ '__/ __|/ _` |
  | |\ \  __/\ V /  __/ |  \__ \ (_| |
  \_| \_\___| \_/ \___|_|  |___/\__,_|  by sandeco

  AI-Powered Reverse Engineering Framework
```

---

## Comandos disponibles

### `install`

```bash
npx reversa install
```

Instala Reversa en el proyecto heredado actual. Detecta los motores presentes, pregunta tus preferencias y crea toda la estructura necesaria.

Úsalo una vez, en la raíz del proyecto que quieres analizar.

#### Layout del menú de instalación

El instalador debe tratar el menú como la interfaz principal, no como un volcado de texto. Las preguntas deben estar numeradas, tener una línea en blanco antes de la pregunta y, cuando haya opciones, una línea en blanco entre la pregunta y la lista.

Después de que el usuario confirma una pregunta de selección múltiple, el CLI no debe imprimir todos los elementos seleccionados en una sola línea continua. Esto queda prohibido porque genera un párrafo largo e ilegible. Usa una de estas alternativas:

- No renderizar la selección completa y avanzar a la siguiente pregunta.
- Renderizar un resumen corto, una línea por equipo.

El menú de agentes lista equipos, no agentes individuales. El usuario elige a nivel de equipo; el instalador expande cada equipo seleccionado en sus agentes:

1. `Reversa Agents Core` (renderizado en gris como separator, siempre instalado)
2. `Migration Agents`
3. `Code Forward Agents`
4. `Pricing and Size Agents`
5. `Translators N8N->Specs->Python` (desmarcado por defecto)

`Reversa Agents Core` se renderiza como un separator gris no seleccionable que visualmente muestra `(*)` como si fuera un ítem marcado y deshabilitado: el usuario lo ve, sabe que está incluido, y el cursor lo salta. Contiene todos los agentes de descubrimiento (Reversa, Scout, Soul Extractor, Archaeologist, Detective, Architect, Writer, Reviewer, Visor, Data Master, Design System, Agents Help, Reconstructor), por lo que el antiguo grupo "Discovery Add-ons" ya no existe como concepto separado. Aunque el menú oculta el detalle por agente, el resumen final de la instalación sigue desglosando el conteo por equipo (Discovery, Migration, Code Forward, New Project, Documentation, Translators y Pricing).

---

### `status`

```bash
npx reversa status
```

Muestra el estado actual del análisis: qué fase está en curso, qué agentes ya corrieron, qué falta completar.

Útil para tener una visión rápida antes de retomar una sesión.

---

### `update`

```bash
npx reversa update
```

Actualiza los agentes a la versión más reciente de Reversa.

El comando es inteligente: verifica el manifiesto SHA-256 de cada archivo y nunca sobreescribe archivos que hayas personalizado.

---

### `add-agent`

```bash
npx reversa add-agent
```

Agrega un agente específico al proyecto. Útil si no instalaste todos los agentes en la instalación inicial y ahora quieres incluir, por ejemplo, el Data Master o el Design System.

---

### `add-engine`

```bash
npx reversa add-engine
```

Agrega soporte para un motor de IA que no estaba presente cuando instalaste.

---

### `uninstall`

```bash
npx reversa uninstall
```

Elimina Reversa del proyecto: borra los archivos creados por la instalación.

!!! info "Tus archivos quedan intactos"
    `uninstall` elimina **solo** lo que Reversa creó. Ningún archivo original del proyecto es tocado. Las especificaciones generadas en `_reversa_sdd/` también se conservan por defecto.

---

## Comandos de chat del orquestador (no son CLI)

Después de activar `/reversa` en el chat del motor, estos atajos actualizan la documentación sin pasar por `npx reversa`:

| Comando | Acción |
|---------|--------|
| `indice` | Genera/actualiza `_reversa_sdd/README.md` |
| `atualizar` | Actualiza specs desde los commits del último marco |
| `atualizar [unidad]` | Mismo flujo, acotado a una unidad |
| `atualizar --baseline` | Graba el HEAD como marco inicial en `.reversa/doc-sync.json` |

El marco doc↔código queda en `.reversa/doc-sync.json` y en el historial append-only de la tabla **Sincronização doc ↔ código** del README índice — no en cada archivo de spec.
