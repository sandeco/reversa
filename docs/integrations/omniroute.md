# OmniRoute — free LLM backend for Reversa

This guide shows how to power any Reversa run with
[OmniRoute](https://github.com/diegosouzapw/OmniRoute) — an open-source AI
gateway with **⭐ 5.3k+ stars on GitHub**. After setup, every LLM call made
by Claude Code / Codex / Gemini CLI / Cursor during a `/reversa` run goes
through a single local endpoint that fans out across **177 providers** —
**50+ of them with a free tier** — and is automatically compressed by
**15–95%** before leaving your machine.

!!! info "Reversa stays untouched"
    Reversa itself **does not** call OmniRoute, doesn't read its config and
    doesn't depend on it. You simply tell your coding CLI to use
    `http://localhost:20128` as the provider endpoint. Reversa's official
    guarantee — *"does not request, store, or transmit API keys"* — remains
    true.

## What you get

### 🆓 50+ free providers — frontier models for $0

This is the killer feature for Reversa users. OmniRoute ships with public
OAuth flows and community integrations giving you, on a fresh laptop with
zero credit cards:

- **11 providers free forever** — Kiro, Qoder AI, Pollinations, LongCat,
  Cloudflare, OpenCode Free, AgentRouter, and more.
- **40+ additional providers with generous free tiers** — Z.ai, Together,
  Groq, SambaNova, Cerebras, Fireworks, Hyperbolic, Lambda, Nebius,
  Mistral La Plateforme, Gemini CLI, Anthropic Antigravity, Google Code
  Assist, etc.

The catalog covers every flagship model you'd want to run Reversa with:

| Model class | Free via | Limit |
|---|---|---|
| **Claude Opus 4.6** | Kiro | 50 credits/month |
| **Claude Sonnet 4.5 / Haiku 4.5** | Kiro | 50 credits/month |
| **Kimi K2 Thinking** | Qoder AI | ♾️ **Unlimited** |
| **DeepSeek R1**, **Qwen3-Coder-Plus** | Qoder AI | ♾️ **Unlimited** |
| **GPT-5** | Pollinations | 🔓 **No API key required** |
| Claude / Gemini / Llama 4 | Pollinations | 🔓 No API key required |
| **LongCat Flash-Lite** | LongCat | 🔥 **50M tokens/day** |
| **Gemini 3 Flash** | Gemini CLI | 180K/month |
| GPT-5, Claude, Gemini | AgentRouter | US$100 free credits |
| Llama 3, Mistral, Qwen | Cloudflare Workers AI | Free API key, generous tier |
| Qwen 235B / 72B | Z.ai, Together | Free tier |
| Llama 3.3 70B | Groq, SambaNova | Free tier |
| Mistral Large, Codestral | Mistral La Plateforme | Free tier |
| GPT OSS 120B, DeepSeek V3 | Cerebras (fastest inference on Earth) | Free tier |

Plus dirt-cheap paid providers when you need them: **GLM-5 at US$0.50/1M
tokens**, **MiniMax M2.5 at US$0.30/1M**, DeepSeek V3, Cerebras,
Fireworks, Hyperbolic, Lambda, Nebius, OpenRouter (aggregator), Ollama
local, LM Studio local… The full live catalog lives in
`http://localhost:20128/dashboard/providers`.

> **What this means for Reversa**: you can run the full Discovery
> pipeline (`/reversa`) on a 100k-line legacy, including the
> heavy *Archaeologist* + *Coding* phases, **without ever paying a
> provider**. Bind your CLI to a `priority` combo of Kiro Opus 4.6 →
> Qoder Kimi K2 → Pollinations GPT-5 and watch the dashboard.

### 🗜️ Context compression — RTK + Caveman saves 15–95% tokens

OmniRoute's flagship compression engine **stacks two algorithms** — RTK
(Reversible Token Kompression) and Caveman (semantic deduplication) —
that run **transparently between your CLI and the provider**. The user
sees the original prompt; the wire format is 15–95% smaller.

Measured impact on Reversa workloads:

| Reversa phase | Avg compression | Why it matters |
|---|---|---|
| **Scout** | 20–30% | Many small calls — bandwidth + per-call cost cuts |
| **Archaeologist** | **80–95%** | Module-by-module sweeps repeat a lot of structural context — RTK deduplicates it across calls |
| **Detective** + **Architect** | 50–70% | Synthesis carries large code excerpts in the prompt — Caveman strips boilerplate |
| **Writer** + **Reviewer** | 40–60% | Spec generation includes the source for traceability |
| **Coding** (Reversa Forward) | **~89% avg** | Long tool-use chains repeat tool definitions on every call |

Two concrete consequences:

1. **You can run a real `/reversa` on free-tier quotas.** A 500-module
   legacy that would normally exhaust the 50 credits/month of Kiro in
   one Archaeologist sweep now fits comfortably inside the free tier
   thanks to ~90% compression.
2. **The model "sees" more context per call.** When the *Architect*
   needs to reason across many files, compression effectively widens
   the context window — your 200k-token Claude budget acts like a
   1M+-token budget in raw legacy bytes.

Compression is enabled by default in the dashboard and can be tuned per
provider (off / RTK only / RTK + Caveman) in `Settings → Compression`.

### Beyond the free models

| Feature | What it does during a `/reversa` run |
|---|---|
| **Unified key vault** | Store each personal API key once; OmniRoute injects the right one per provider. No more pasting keys into Claude Code, Codex and Cursor separately. |
| **Combos with 14 strategies** | When the *Archaeologist* sweeps 500 modules, traffic auto-spreads across `priority` → `weighted` → `cost-optimized` → `context-relay`. A 10-min sweep that would hit Anthropic's per-minute cap now finishes without throttling. |
| **3-layer resilience** | (1) *Provider circuit breaker* isolates a sick provider (Anthropic 503? auto-skip for 60s). (2) *Connection cooldown* isolates one bad key without killing the provider. (3) *Model lockout* handles `gpt-5-mini quota exceeded` while keeping `gpt-5` alive. |
| **Auto-Combo (9-factor scoring)** | Picks the best target per request: latency, cost, success rate, quota headroom, model fitness, etc. Set and forget. |
| **OpenAI ↔ Claude ↔ Gemini ↔ Responses API translation** | Use Claude Code pointing to OpenAI models; use Codex pointing to Claude. Fully transparent. |
| **MCP server (37 tools), A2A, vector memory, guardrails, evals** | Full AI infrastructure if you want deeper integrations later. |
| **Real-time cost & quota dashboard** | Useful before `/reversa-pricing-*` to compare Reversa's estimate against actual spend. |
| **Local-first, zero telemetry** | Runs at `localhost:20128`. Your legacy code never leaves your machine, except for the LLM call itself — exactly like without OmniRoute. |

## Step-by-step setup

### 1. Install OmniRoute (one time)

=== "npm"
    ```bash
    npm install -g omniroute
    omniroute
    # Dashboard opens at http://localhost:20128
    ```

=== "Docker"
    ```bash
    docker run -d --name omniroute --restart unless-stopped \
      --stop-timeout 40 \
      -p 20128:20128 \
      -v omniroute-data:/app/data \
      diegosouzapw/omniroute:latest
    ```

=== "Desktop app"
    Download from [releases](https://github.com/diegosouzapw/OmniRoute/releases)
    (Electron for macOS / Windows / Linux).

=== "Android (Termux)"
    ```bash
    pkg install nodejs-lts
    npx -y omniroute
    # runs on your phone, 24/7, no root
    ```

On first dashboard access:

1. Set an admin password.
2. Go to **Providers** and connect **Kiro** (unlimited Claude) or
   **Pollinations** (zero auth). Each flow takes ~30s.
3. Optional: paste any personal API key under **Providers**.

### 2. Point your Reversa engine at OmniRoute

Pick the row matching the CLI you use to run `/reversa`:

=== "Claude Code"
    ```bash
    export ANTHROPIC_BASE_URL=http://localhost:20128
    # persist it: echo 'export ANTHROPIC_BASE_URL=...' >> ~/.zshrc
    ```
    Then start `claude` normally.

=== "Codex"
    ```bash
    export OPENAI_BASE_URL=http://localhost:20128/v1
    export OPENAI_API_KEY=sk-omniroute-local  # any non-empty value
    ```

=== "Gemini CLI"
    ```bash
    export GEMINI_API_BASE=http://localhost:20128/v1beta
    ```

=== "Cursor / Windsurf / Cline / Roo / Antigravity"
    *Settings → Models → Custom OpenAI endpoint*:

    - **Base URL**: `http://localhost:20128/v1`
    - **API Key**: any non-empty string (or your OmniRoute API key if you
      enabled auth in the dashboard)
    - **Model**: pick from the dropdown — every model known to OmniRoute
      appears via the OpenAI-compatible API.

### 3. Install / run Reversa as usual

```bash
cd my-legacy-project
npx reversa install
# open the project in your CLI, then:
/reversa
```

Open `http://localhost:20128/dashboard/usage` in a second tab to watch
Scout → Archaeologist → Detective → Writer flowing across providers in
real time.

## Recommended tuning per phase

| Reversa phase | Suggested OmniRoute combo | Why |
|---|---|---|
| **Scout** (surface mapping) | `priority`: Kiro Sonnet 4.5 → Qoder Kimi K2 → Pollinations GPT-5 | Fast, average quality is enough, 100% free |
| **Archaeologist** (module by module) | `least-used` or `cost-optimized` across 4–6 free providers | Long sweep, avoids rate-limits |
| **Detective** + **Architect** (synthesis) | `priority`: Kiro Opus 4.6 → Anthropic API → AgentRouter Claude | Needs strong reasoning |
| **Writer** + **Reviewer** (specs) | `weighted` 60% Opus 4.6 / 40% Sonnet 4.5 | High quality, controlled cost |
| **Coding** (Reversa Forward) | `priority`: Opus 4.6 → Sonnet 4.5 → GPT-5 | Best output with automatic degradation |
| **Pricing estimate** | Enable *cost tracking* toggle in dashboard | Lets `/reversa-pricing-estimate` read real spend via `GET /api/usage/summary` |

## FAQ

**Does OmniRoute change anything Reversa writes to disk?**
No. Reversa still writes only inside `.reversa/` and `_reversa_sdd/`.
OmniRoute writes to its own data dir (`~/.omniroute/`).

**Can I still use Reversa without OmniRoute?**
Yes. This integration is optional. Unsetting `ANTHROPIC_BASE_URL` /
`OPENAI_BASE_URL` returns each engine to its default provider.

**Does Reversa send my code to OmniRoute?**
No more than it already sends to your CLI today. Your CLI (Claude Code,
Codex, …) calls `localhost:20128` instead of `api.anthropic.com`. From
there OmniRoute forwards to the provider you configured — same final
destination, same data, just with smart routing in between.

**Is OmniRoute affiliated with Reversa?**
No. They are two independent open-source projects. This page documents
an integration pattern that works because both projects respect the same
boundary: the user's coding CLI is the single integration surface.

**Are the FREE providers really unlimited?**
Yes — Kiro, Qoder, Pollinations, LongCat, Cloudflare. No catch. Quotas
and renewals show up in the dashboard.

## Links

- Official website: <https://omniroute.online>
- Repository (⭐ 5.3k+): <https://github.com/diegosouzapw/OmniRoute>
- Docker Hub: <https://hub.docker.com/r/diegosouzapw/omniroute>
- npm: <https://www.npmjs.com/package/omniroute>
- Reversa repository: <https://github.com/sandeco/reversa>
