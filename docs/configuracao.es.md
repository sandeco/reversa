# Configuración

Reversa guarda toda su configuración y estado del análisis dentro de la carpeta `.reversa/` en la raíz del proyecto.

---

## Estructura de la carpeta `.reversa/`

```
.reversa/
├── state.json          ← estado del análisis entre sesiones
├── config.toml         ← configuración del proyecto
├── config.user.toml    ← tus preferencias personales (no commitear)
├── plan.md             ← plan de exploración (puedes editarlo)
├── version             ← versión instalada de Reversa
├── context/
│   ├── surface.json    ← datos generados por Scout
│   └── modules.json    ← datos generados por Archaeologist
└── _config/
    ├── manifest.yaml           ← metadatos de la instalación
    └── files-manifest.json     ← hashes SHA-256 para updates seguros
```

---

## `config.toml`: configuración del proyecto

```toml
[project]
name = "mi-proyecto"
language = "es"

[agents]
installed = ["reversa", "scout", "archaeologist", "detective", "architect", "writer", "reviewer"]

[output]
folder = "_reversa_sdd"

[engines]
active = ["claude-code"]
```

---

## `config.user.toml`: preferencias personales

```toml
[user]
name = "Tu Nombre"
answer_mode = "chat"  # "chat" o "file"
```

!!! warning "No commitear"
    Agrega `config.user.toml` al `.gitignore`. Cada miembro del equipo puede tener sus propias preferencias sin afectar a los demás.

---

## Modo de respuesta (`answer_mode`)

| Modo | Comportamiento |
|------|----------------|
| `chat` (por defecto) | Las preguntas aparecen en el chat, una a una. Respondes en la conversación. |
| `file` | El Reviewer genera un archivo `_reversa_sdd/questions.md` con todas las preguntas. Lo rellenas y avisas cuando termines. |

---

## Nivel de documentación (`doc_level`)

Define el volumen de artefactos que cada agente genera durante el análisis. **No se configura en la instalación:** Reversa lo pregunta al inicio del primer análisis, después de que el Scout mapea el proyecto, para que decidas con información real.

| Valor | Cuándo usar | Artefactos generados |
|-------|-------------|----------------------|
| `essencial` | Proyectos simples, scripts, prototipos **(por defecto)** | Análisis de código, dominio, arquitectura (C4 contexto), specs SDD |
| `completo` | Proyectos medianos, equipos pequeños | Todo lo esencial + diagramas C4 completos, ERD, ADRs, OpenAPI, user stories, matrices de trazabilidad |
| `detalhado` | Sistemas enterprise, alta criticidad | Todo lo completo + flowcharts por función, ADRs expandidos, diagrama de deployment, revisión cruzada obligatoria |

La elección se guarda en `.reversa/state.json` en el campo `doc_level`. Puedes editarlo manualmente en cualquier momento para ajustar el nivel durante un análisis en curso.
