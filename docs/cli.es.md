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

**Modo no interactivo (CI/headless):**

```bash
npx reversa install --yes \
  --project mi-app \
  --engines opencode,claude-code \
  --user Desarrollador
```

Flags disponibles: `--project`, `--engines`, `--user`, `--chat-language`, `--doc-language`, `--output`, `--git-strategy`, `--answer-mode`, `--agents`, `--reinstall=yes`.

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

### `mcp`

```bash
npx reversa mcp
```

Inicia el servidor MCP de Reversa sobre stdio. Proporciona 3 herramientas, 2 recursos y 1 prompt para integración con agentes de IA:

- **Herramientas:** `reversa_status(path)`, `reversa_analyze(path, level?)`, `reversa_confidence(path)`
- **Recursos:** `reversa://state`, `reversa://inventory`
- **Prompt:** `reversa-new-analysis`

Configúralo en cualquier cliente MCP:

```json
{
  "mcpServers": {
    "reversa": {
      "command": "npx",
      "args": ["reversa", "mcp"]
    }
  }
}
```

Úsalo para consultar estado e informes sin salir del chat del agente. El pipeline se ejecuta cuando el agente escribe `reversa` o `/reversa`.
