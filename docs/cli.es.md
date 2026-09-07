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

No existe selección de agentes: el instalador siempre instala **todos** los agentes incluidos en el paquete. El resumen final de la instalación desglosa el conteo por equipo (Discovery, Migration, Code Forward, New Project, Documentation, Translators y Pricing).

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

Actualiza todo a la versión más reciente de Reversa: todos los agentes del paquete se reinstalan, incluyendo agentes que no existían cuando instalaste.

El comando es inteligente: verifica el manifiesto SHA-256 de cada archivo y nunca sobreescribe archivos que hayas personalizado.

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
