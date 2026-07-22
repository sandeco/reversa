# OmniRoute — backend de LLM gratis para Reversa

Esta guía muestra cómo potenciar cualquier ejecución de Reversa usando
[OmniRoute](https://github.com/diegosouzapw/OmniRoute) — una pasarela de
IA open-source con **⭐ 5.3k+ estrellas en GitHub**. Después del setup,
cada llamada LLM hecha por Claude Code / Codex / Gemini CLI / Cursor
durante un `/reversa` pasa por un único endpoint local que distribuye
entre **177 proveedores** — **50+ con free tier** — y se comprime
automáticamente en un **15–95%** antes de salir de tu máquina.

!!! info "Reversa permanece intacto"
    Reversa en sí **no** llama a OmniRoute, no lee su configuración y no
    depende de él. Solo le dices a tu CLI de código que use
    `http://localhost:20128` como endpoint de proveedor. La garantía
    oficial de Reversa — *"does not request, store, or transmit API keys"*
    — sigue siendo verdadera.

## Lo que obtienes

### 🆓 50+ proveedores gratis — modelos de frontera por US$0

Esta es la feature estrella para usuarios de Reversa. OmniRoute incluye
flujos OAuth públicos e integraciones comunitarias dando, en una laptop
nueva sin tarjeta de crédito:

- **11 proveedores gratis para siempre** — Kiro, Qoder AI, Pollinations,
  LongCat, Cloudflare, OpenCode Free, AgentRouter y más.
- **40+ proveedores adicionales con free tier generoso** — Z.ai,
  Together, Groq, SambaNova, Cerebras, Fireworks, Hyperbolic, Lambda,
  Nebius, Mistral La Plateforme, Gemini CLI, Anthropic Antigravity,
  Google Code Assist, etc.

El catálogo cubre todo modelo de primera línea que querrías usar con
Reversa:

| Clase de modelo | Gratis vía | Límite |
|---|---|---|
| **Claude Opus 4.6** | Kiro | 50 créditos/mes |
| **Claude Sonnet 4.5 / Haiku 4.5** | Kiro | 50 créditos/mes |
| **Kimi K2 Thinking** | Qoder AI | ♾️ **Ilimitado** |
| **DeepSeek R1**, **Qwen3-Coder-Plus** | Qoder AI | ♾️ **Ilimitado** |
| **GPT-5** | Pollinations | 🔓 **Sin API key** |
| Claude / Gemini / Llama 4 | Pollinations | 🔓 Sin API key |
| **LongCat Flash-Lite** | LongCat | 🔥 **50M tokens/día** |
| **Gemini 3 Flash** | Gemini CLI | 180K/mes |
| GPT-5, Claude, Gemini | AgentRouter | US$100 en crédito |
| Llama 3, Mistral, Qwen | Cloudflare Workers AI | API key gratis, tier generoso |
| Qwen 235B / 72B | Z.ai, Together | Free tier |
| Llama 3.3 70B | Groq, SambaNova | Free tier |
| Mistral Large, Codestral | Mistral La Plateforme | Free tier |
| GPT OSS 120B, DeepSeek V3 | Cerebras (inferencia más rápida del mundo) | Free tier |

Más proveedores de pago muy baratos cuando los necesitas: **GLM-5 a
US$0,50/1M tokens**, **MiniMax M2.5 a US$0,30/1M**, DeepSeek V3,
Cerebras, Fireworks, Hyperbolic, Lambda, Nebius, OpenRouter (agregador),
Ollama local, LM Studio local… El catálogo completo aparece en
`http://localhost:20128/dashboard/providers`.

> **Qué significa esto para Reversa**: puedes correr la pipeline
> completa de Discovery (`/reversa`) sobre un legacy de 100k líneas,
> incluyendo las fases pesadas de *Archaeologist* + *Coding*, **sin
> pagarle a ningún proveedor**. Apunta tu CLI a un combo `priority`
> Kiro Opus 4.6 → Qoder Kimi K2 → Pollinations GPT-5 y mira el
> dashboard.

### 🗜️ Compresión de contexto — RTK + Caveman ahorra 15–95% de tokens

El motor de compresión estrella de OmniRoute **apila dos algoritmos** —
RTK (Reversible Token Kompression) y Caveman (deduplicación semántica)
— que corren **transparentemente entre tu CLI y el proveedor**. Tu CLI
ve el prompt original; lo que viaja por el cable es 15–95% más pequeño.

Impacto medido en cargas de Reversa:

| Fase Reversa | Compresión promedio | Por qué importa |
|---|---|---|
| **Scout** | 20–30% | Muchas llamadas pequeñas — recorta ancho de banda y costo por llamada |
| **Archaeologist** | **80–95%** | El barrido módulo-a-módulo repite mucho contexto estructural — RTK lo deduplica entre llamadas |
| **Detective** + **Architect** | 50–70% | La síntesis lleva extractos grandes de código en el prompt — Caveman quita boilerplate |
| **Writer** + **Reviewer** | 40–60% | La generación de specs incluye el fuente para trazabilidad |
| **Coding** (Reversa Forward) | **~89% promedio** | Las cadenas largas de tool-use repiten definiciones de tool en cada llamada |

Dos consecuencias concretas:

1. **Puedes correr un `/reversa` real con cuotas free.** Un legacy de
   500 módulos que normalmente agotaría los 50 créditos/mes de Kiro en
   un barrido del Archaeologist ahora cabe holgadamente en el free tier
   gracias a ~90% de compresión.
2. **El modelo "ve" más contexto por llamada.** Cuando el *Architect*
   necesita razonar sobre muchos archivos, la compresión amplía
   efectivamente la ventana de contexto — tu presupuesto de 200k tokens
   de Claude actúa como un presupuesto de 1M+ tokens en bytes brutos de
   legacy.

La compresión viene encendida por defecto en el dashboard y se puede
ajustar por proveedor (off / solo RTK / RTK + Caveman) en
`Settings → Compression`.

### Más allá de los modelos gratis

| Recurso | Qué hace durante un `/reversa` |
|---|---|
| **Almacén unificado de claves** | Guarda cada API key personal una vez; OmniRoute inyecta la correcta por proveedor. Basta de pegar claves en Claude Code, Codex y Cursor por separado. |
| **Combos con 14 estrategias** | Cuando el *Archaeologist* recorre 500 módulos, el tráfico se distribuye en combos `priority` → `weighted` → `cost-optimized` → `context-relay`. Un barrido de 10 min que golpearía el límite por minuto de Anthropic ahora termina sin throttling. |
| **Resiliencia en 3 capas** | (1) *Provider circuit breaker* aísla un proveedor enfermo (¿Anthropic 503? Salta 60s automático). (2) *Connection cooldown* aísla una clave mala sin matar al proveedor. (3) *Model lockout* maneja `gpt-5-mini quota exceeded` manteniendo `gpt-5` vivo. |
| **Auto-Combo (scoring de 9 factores)** | Elige el mejor destino por petición según latencia, costo, tasa de éxito, cuota, fitness del modelo, etc. Configura y olvida. |
| **Traducción OpenAI ↔ Claude ↔ Gemini ↔ Responses API** | Usa Claude Code apuntando a modelos OpenAI; usa Codex apuntando a Claude. Totalmente transparente. |
| **MCP server (37 tools), A2A, memoria vectorial, guardrails, evals** | Infra de IA completa, si quieres integraciones más profundas en el futuro. |
| **Dashboard de costo y cuota en tiempo real** | Útil antes de `/reversa-pricing-*` para comparar la estimación de Reversa con el gasto real. |
| **Local-first, cero telemetría** | Corre en `localhost:20128`. Tu código legacy nunca sale de la máquina, excepto por la llamada LLM en sí — exactamente como sin OmniRoute. |

## Paso a paso

### 1. Instala OmniRoute (una sola vez)

=== "npm"
    ```bash
    npm install -g omniroute
    omniroute
    # Dashboard abre en http://localhost:20128
    ```

=== "Docker"
    ```bash
    docker run -d --name omniroute --restart unless-stopped \
      --stop-timeout 40 \
      -p 20128:20128 \
      -v omniroute-data:/app/data \
      diegosouzapw/omniroute:latest
    ```

=== "App de escritorio"
    Descarga de [releases](https://github.com/diegosouzapw/OmniRoute/releases)
    (Electron para macOS / Windows / Linux).

=== "Android (Termux)"
    ```bash
    pkg install nodejs-lts
    npx -y omniroute
    # corre en tu teléfono, 24/7, sin root
    ```

En el primer acceso al dashboard:

1. Define una contraseña de admin.
2. Ve a **Providers** y conecta **Kiro** (Claude ilimitado) o
   **Pollinations** (cero auth). Cada conexión tarda ~30s.
3. Opcional: pega cualquier API key personal en **Providers**.

### 2. Apunta tu engine de Reversa a OmniRoute

Elige la fila de la CLI que usas para correr `/reversa`:

=== "Claude Code"
    ```bash
    export ANTHROPIC_BASE_URL=http://localhost:20128
    # persistente: echo 'export ANTHROPIC_BASE_URL=...' >> ~/.zshrc
    ```
    Luego inicia `claude` normalmente.

=== "Codex"
    ```bash
    export OPENAI_BASE_URL=http://localhost:20128/v1
    export OPENAI_API_KEY=sk-omniroute-local  # cualquier valor no vacío
    ```

=== "Gemini CLI"
    ```bash
    export GEMINI_API_BASE=http://localhost:20128/v1beta
    ```

=== "Cursor / Windsurf / Cline / Roo / Antigravity"
    *Settings → Models → Custom OpenAI endpoint*:

    - **Base URL**: `http://localhost:20128/v1`
    - **API Key**: cualquier string no vacío (o tu API key de OmniRoute,
      si habilitaste auth en el dashboard)
    - **Model**: elige del dropdown — cada modelo conocido por OmniRoute
      aparece vía API OpenAI-compatible.

### 3. Instala / corre Reversa normalmente

```bash
cd mi-legacy
npx reversa install
# abre el proyecto en tu CLI y:
/reversa
```

Abre `http://localhost:20128/dashboard/usage` en una segunda pestaña para
ver Scout → Archaeologist → Detective → Writer fluyendo entre proveedores
en tiempo real.

## Tuning recomendado por fase

| Fase Reversa | Combo sugerido en OmniRoute | Por qué |
|---|---|---|
| **Scout** (mapeo de superficie) | `priority`: Kiro Sonnet 4.5 → Qoder Kimi K2 → Pollinations GPT-5 | Rápido, calidad media basta, 100% gratis |
| **Archaeologist** (módulo por módulo) | `least-used` o `cost-optimized` entre 4–6 proveedores gratis | Barrido largo, evita rate-limit |
| **Detective** + **Architect** (síntesis) | `priority`: Kiro Opus 4.6 → Anthropic API → AgentRouter Claude | Necesita razonamiento fuerte |
| **Writer** + **Reviewer** (specs) | `weighted` 60% Opus 4.6 / 40% Sonnet 4.5 | Calidad alta, costo controlado |
| **Coding** (Reversa Forward) | `priority`: Opus 4.6 → Sonnet 4.5 → GPT-5 | Mejor salida con degradación automática |
| **Pricing estimate** | Activa *cost tracking* en el dashboard | Permite que `/reversa-pricing-estimate` lea gasto real vía `GET /api/usage/summary` |

## FAQ

**¿OmniRoute cambia algo que Reversa escribe en disco?**
No. Reversa sigue escribiendo solo dentro de `.reversa/` y
`_reversa_sdd/`. OmniRoute escribe en su propio directorio
(`~/.omniroute/`).

**¿Puedo seguir usando Reversa sin OmniRoute?**
Sí. Esta integración es opcional. Quitar `ANTHROPIC_BASE_URL` /
`OPENAI_BASE_URL` devuelve cada engine a su proveedor por defecto.

**¿Reversa envía mi código a OmniRoute?**
No más de lo que ya envía a tu CLI hoy. Tu CLI (Claude Code, Codex…)
llama a `localhost:20128` en vez de `api.anthropic.com`. Desde ahí
OmniRoute reenvía al proveedor que configuraste — mismo destino final,
mismos datos, solo con routing inteligente en el medio.

**¿OmniRoute tiene alguna afiliación con Reversa?**
No. Son dos proyectos open-source independientes. Esta página documenta
un patrón de integración que funciona porque ambos proyectos respetan
el mismo límite: la CLI de código del usuario es la única superficie
de integración.

**¿Los proveedores gratis son realmente ilimitados?**
Sí — Kiro, Qoder, Pollinations, LongCat, Cloudflare. Sin trampa. Cuotas
y renovaciones aparecen en el dashboard.

## Enlaces

- Sitio oficial: <https://omniroute.online>
- Repositorio (⭐ 5.3k+): <https://github.com/diegosouzapw/OmniRoute>
- Docker Hub: <https://hub.docker.com/r/diegosouzapw/omniroute>
- npm: <https://www.npmjs.com/package/omniroute>
- Repositorio Reversa: <https://github.com/sandeco/reversa>
