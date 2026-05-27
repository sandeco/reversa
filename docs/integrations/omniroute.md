# OmniRoute — free LLM backend for Reversa

This guide shows how to power any Reversa run with
[OmniRoute](https://github.com/diegosouzapw/OmniRoute), an open-source AI
gateway. After setup, every LLM call made by Claude Code / Codex / Gemini
CLI / Cursor during a `/reversa` run goes through a single local endpoint
that fans out across **177 providers** — with **free** access to flagship
models.

!!! info "Reversa stays untouched"
    Reversa itself **does not** call OmniRoute, doesn't read its config and
    doesn't depend on it. You simply tell your coding CLI to use
    `http://localhost:20128` as the provider endpoint. Reversa's official
    guarantee — *"does not request, store, or transmit API keys"* — remains
    true.

## What you get

### Free models out of the box (no credit card)

OmniRoute ships with public OAuth flows and community integrations. As of
v3.8.x, **11 providers are free forever**:

| Model | Provider | Access | Limit |
|---|---|---|---|
| **Claude Sonnet 4.5 / Haiku 4.5 / Opus 4.6** | Kiro | Free OAuth | 50 credits/month |
| **Kimi K2 Thinking** | Qoder AI | Free OAuth | ♾️ Unlimited |
| **DeepSeek R1**, **Qwen3-Coder-Plus** | Qoder AI | Free OAuth | ♾️ Unlimited |
| **GPT-5**, Claude, Gemini, Llama 4 | Pollinations | No key | No explicit limit |
| **LongCat Flash-Lite** | LongCat | Free OAuth | 50M tokens/day |
| **Gemini 3 Flash** | Gemini CLI | Free OAuth | 180K/month |
| **GPT-5, Claude, Gemini** | AgentRouter | API key | US$100 credit |
| Workers AI (Llama 3, Mistral, …) | Cloudflare | Free API key | Generous free tier |
| Qwen (235B / 72B) | Z.ai, Together | API key | Free tier |
| Llama 3.3 70B | Groq, SambaNova | API key | Free tier |
| Mistral Large, Codestral | Mistral La Plateforme | API key | Free tier |

Plus ~40 dirt-cheap paid providers: **GLM-5 at US$0.50/1M**,
**MiniMax M2.5 at US$0.30/1M**, DeepSeek V3, Cerebras, Fireworks,
Hyperbolic, Lambda, Nebius, OpenRouter (aggregator), Ollama local,
LM Studio local… The full live catalog lives in
`http://localhost:20128/dashboard/providers`.

### Beyond the free models

| Feature | What it does during a `/reversa` run |
|---|---|
| **Unified key vault** | Store each personal API key once; OmniRoute injects the right one per provider. No more pasting keys into Claude Code, Codex and Cursor separately. |
| **Combos with 14 strategies** | When the *Archaeologist* sweeps 500 modules, traffic auto-spreads across `priority` → `weighted` → `cost-optimized` → `context-relay`. A 10-min sweep that would hit Anthropic's per-minute cap now finishes without throttling. |
| **3-layer resilience** | (1) *Provider circuit breaker* isolates a sick provider (Anthropic 503? auto-skip for 60s). (2) *Connection cooldown* isolates one bad key without killing the provider. (3) *Model lockout* handles `gpt-5-mini quota exceeded` while keeping `gpt-5` alive. |
| **Auto-Combo (9-factor scoring)** | Picks the best target per request: latency, cost, success rate, quota headroom, model fitness, etc. Set and forget. |
| **RTK + Caveman compression (15–95%)** | Shrinks prompts on heavy tool-use sessions (~89% avg on *Coding* sessions). Cheaper and faster. |
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
- Repository: <https://github.com/diegosouzapw/OmniRoute>
- Brazilian WhatsApp community 🇧🇷: <https://chat.whatsapp.com/CeGCxdFzqBe5Uki288wOvf>
- International WhatsApp community 🌍: <https://chat.whatsapp.com/JI7cDQ1GyaiDHhVBpLxf8b?mode=gi_t>
- Docker Hub: <https://hub.docker.com/r/diegosouzapw/omniroute>
- npm: <https://www.npmjs.com/package/omniroute>
- Reversa repository: <https://github.com/sandeco/reversa>
