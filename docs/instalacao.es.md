# Instalación

## Requisitos

- **Node.js 18+** instalado en tu máquina

Si no tienes Node.js, instálalo en [nodejs.org](https://nodejs.org) y vuelve aquí.

---

## Un comando, eso es todo

En la raíz del proyecto heredado que quieres analizar:

```bash
npx reversa install
```

El instalador hace todo esto por ti:

1. Detecta los motores de IA presentes en el entorno (Claude Code, Codex, Cursor, Gemini CLI, Windsurf)
2. Pregunta qué **Teams** de agentes instalar. `Reversa Agents Core` y `Bug Agents` siempre están incluidos, no entran en la selección; `Migration Agents`, `Code Forward Agents`, `Code New Project Agents`, `Documentation Agents` y `Pricing and Size Agents` vienen marcados; `Translators N8N->Specs->Python` queda desmarcado por defecto. El CLI expande cada Team elegido en sus agentes y resuelve por sí solo las dependencias entre Teams (elegir `Code New Project Agents` trae también `Code Forward Agents`, donde sus specs continúan)
3. Recopila el nombre del proyecto, idioma y preferencias
4. Copia los agentes a `.agents/skills/` y `.claude/skills/` (para Claude Code)
5. Crea el archivo de entrada del motor (`CLAUDE.md`, `AGENTS.md`, etc.)
6. Crea la estructura `.reversa/` con estado, configuración y plan
7. Genera el manifiesto SHA-256 para actualizaciones seguras en el futuro

Es como `npm install`, pero para tu equipo de agentes de ingeniería inversa.

---

## Qué se crea en el proyecto

```
proyecto-heredado/
├── .reversa/               ← estado, config y contexto del análisis
├── .agents/skills/         ← agentes universales (todos los motores)
├── .claude/skills/         ← mirror para Claude Code
├── CLAUDE.md               ← punto de entrada para Claude Code (si se detecta)
├── AGENTS.md               ← punto de entrada para Codex (si se detecta)
└── _reversa_sdd/           ← donde se generarán las specs (vacío inicialmente)
```

!!! success "Tus archivos quedan intactos"
    El instalador **solo crea archivos nuevos**. Nunca modifica ni elimina ningún archivo existente en tu proyecto.

---

## Backup antes de empezar

!!! warning "Recomendación fuerte: haz un backup"
    Aunque Reversa nunca modifica tus archivos, los agentes de IA pueden cometer errores. Antes de iniciar el análisis:

    1. Asegúrate de que todos los archivos están commiteados en Git
    2. Ten el repositorio en GitHub, GitLab o Bitbucket
    3. Haz una copia local de la carpeta como seguridad extra: `cp -r mi-proyecto mi-proyecto-backup`

    Si algo inesperado ocurre, `git restore .` lo resuelve.

---

## Agregar otro motor después

Si quieres añadir soporte para otro motor más tarde:

```bash
npx reversa add-engine
```

El instalador detecta lo que ya existe y agrega solo lo que falta.
