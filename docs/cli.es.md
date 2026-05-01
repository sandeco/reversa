# CLI

Reversa tiene un CLI simple para gestionar la instalación y el ciclo de vida de los agentes en tu proyecto. Todos los comandos se ejecutan con `npx reversa` en la raíz del proyecto.

---

## Comandos disponibles

### `install`

```bash
npx reversa install
```

Instala Reversa en el proyecto heredado actual. Detecta los motores presentes, pregunta tus preferencias y crea toda la estructura necesaria.

Úsalo una vez, en la raíz del proyecto que quieres analizar.

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
    `uninstall` elimina **solo** lo que Reversa creó. Ningún archivo original del proyecto es tocado. Las especificaciones generadas en `_reversa_sdd/` también se conservan por defecto. Los hooks instalados vía `add-hooks` también son eliminados.

---

### `add-hooks`

```bash
npx reversa add-hooks --engine claude-code
```

Instala hooks del Chronicler en la config de la engine para que corra automáticamente tras cada edición. Muestra preview, pide confirmación, escribe.

Engines: `claude-code`, `cursor`, `kimi-cli`, `codex`, `opencode`. Ver [Hooks](hooks.es.md).

---

### `remove-hooks`

```bash
npx reversa remove-hooks --engine claude-code
npx reversa remove-hooks --all
```

Elimina hooks del Chronicler. Otros hooks añadidos manualmente se preservan.

---

### `drift-check`

```bash
npx reversa drift-check
```

CI gate. Lee `_reversa_sdd/drift.md` y exit 1 si hay specs pendientes. Ver [drift-check](drift-check.es.md).
