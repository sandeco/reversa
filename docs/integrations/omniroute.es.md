# OmniRoute — backend de LLM gratis para Reversa

Esta guía muestra cómo potenciar cualquier ejecución de Reversa usando
[OmniRoute](https://github.com/diegosouzapw/OmniRoute), una pasarela de IA
open-source. Después del setup, cada llamada LLM hecha por Claude Code /
Codex / Gemini CLI / Cursor durante un `/reversa` pasa por un único
endpoint local que distribuye entre **177 proveedores** — con acceso
**gratuito** a modelos de primera línea.

!!! info "Reversa permanece intacto"
    Reversa en sí **no** llama a OmniRoute, no lee su configuración y no
    depende de él. Solo le dices a tu CLI de código que use
    `http://localhost:20128` como endpoint de proveedor. La garantía
    oficial de Reversa — *"does not request, store, or transmit API keys"*
    — sigue siendo verdadera.

## Lo que obtienes

### Modelos gratis sin tarjeta de crédito

OmniRoute incluye flujos OAuth públicos e integraciones comunitarias. En
la versión 3.8.x, **11 proveedores son gratis para siempre**:

| Modelo | Proveedor | Acceso | Límite |
|---|---|---|---|
| **Claude Sonnet 4.5 / Haiku 4.5 / Opus 4.6** | Kiro | OAuth gratis | 50 créditos/mes |
| **Kimi K2 Thinking** | Qoder AI | OAuth gratis | ♾️ Ilimitado |
| **DeepSeek R1**, **Qwen3-Coder-Plus** | Qoder AI | OAuth gratis | ♾️ Ilimitado |
| **GPT-5**, Claude, Gemini, Llama 4 | Pollinations | Sin clave | Sin límite explícito |
| **LongCat Flash-Lite** | LongCat | OAuth gratis | 50M tokens/día |
| **Gemini 3 Flash** | Gemini CLI | OAuth gratis | 180K/mes |
| **GPT-5, Claude, Gemini** | AgentRouter | API key | US$100 en crédito |
| Workers AI (Llama 3, Mistral…) | Cloudflare | API key gratis | Free tier generoso |
| Qwen (235B / 72B) | Z.ai, Together | API key | Free tier |
| Llama 3.3 70B | Groq, SambaNova | API key | Free tier |
| Mistral Large, Codestral | Mistral La Plateforme | API key | Free tier |

Más ~40 proveedores de pago muy baratos: **GLM-5 a US$0,50/1M**,
**MiniMax M2.5 a US$0,30/1M**, DeepSeek V3, Cerebras, Fireworks,
Hyperbolic, Lambda, Nebius, OpenRouter (agregador), Ollama local,
LM Studio local… El catálogo completo aparece en
`http://localhost:20128/dashboard/providers`.

### Más allá de los modelos gratis

| Recurso | Qué hace durante un `/reversa` |
|---|---|
| **Almacén unificado de claves** | Guarda cada API key personal una vez; OmniRoute inyecta la correcta por proveedor. Basta de pegar claves en Claude Code, Codex y Cursor por separado. |
| **Combos con 14 estrategias** | Cuando el *Archaeologist* recorre 500 módulos, el tráfico se distribuye en combos `priority` → `weighted` → `cost-optimized` → `context-relay`. Un barrido de 10 min que golpearía el límite por minuto de Anthropic ahora termina sin throttling. |
| **Resiliencia en 3 capas** | (1) *Provider circuit breaker* aísla un proveedor enfermo (¿Anthropic 503? Salta 60s automático). (2) *Connection cooldown* aísla una clave mala sin matar al proveedor. (3) *Model lockout* maneja `gpt-5-mini quota exceeded` manteniendo `gpt-5` vivo. |
| **Auto-Combo (scoring de 9 factores)** | Elige el mejor destino por petición según latencia, costo, tasa de éxito, cuota, fitness del modelo, etc. Configura y olvida. |
| **Compresión RTK + Caveman (15–95%)** | Encoge el prompt en sesiones intensas de tool-use (~89% promedio en sesiones de *Coding*). Más barato y más rápido. |
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
- Repositorio: <https://github.com/diegosouzapw/OmniRoute>
- Comunidad WhatsApp 🇧🇷: <https://chat.whatsapp.com/CeGCxdFzqBe5Uki288wOvf>
- Comunidad WhatsApp 🌍: <https://chat.whatsapp.com/JI7cDQ1GyaiDHhVBpLxf8b?mode=gi_t>
- Docker Hub: <https://hub.docker.com/r/diegosouzapw/omniroute>
- npm: <https://www.npmjs.com/package/omniroute>
- Repositorio Reversa: <https://github.com/sandeco/reversa>
