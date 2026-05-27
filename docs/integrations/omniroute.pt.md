# OmniRoute — backend de LLM grátis para o Reversa

Este guia mostra como turbinar qualquer execução do Reversa usando o
[OmniRoute](https://github.com/diegosouzapw/OmniRoute), um gateway de IA
open-source. Depois do setup, toda chamada LLM feita pelo Claude Code /
Codex / Gemini CLI / Cursor durante um `/reversa` passa por um endpoint
local único que distribui entre **177 provedores** — com acesso **grátis**
a modelos de ponta.

!!! info "O Reversa continua intocado"
    O Reversa em si **não** chama o OmniRoute, não lê configuração dele e
    não depende dele. Você só diz para a sua CLI de código usar
    `http://localhost:20128` como endpoint de provedor. A garantia oficial
    do Reversa — *"does not request, store, or transmit API keys"* —
    permanece verdadeira.

## O que você ganha

### Modelos grátis sem cartão de crédito

O OmniRoute embute fluxos OAuth públicos e integrações comunitárias. Na
versão 3.8.x, **11 provedores ficam grátis para sempre**:

| Modelo | Provedor | Acesso | Limite |
|---|---|---|---|
| **Claude Sonnet 4.5 / Haiku 4.5 / Opus 4.6** | Kiro | OAuth grátis | 50 créditos/mês |
| **Kimi K2 Thinking** | Qoder AI | OAuth grátis | ♾️ Ilimitado |
| **DeepSeek R1**, **Qwen3-Coder-Plus** | Qoder AI | OAuth grátis | ♾️ Ilimitado |
| **GPT-5**, Claude, Gemini, Llama 4 | Pollinations | Sem chave | Sem limite explícito |
| **LongCat Flash-Lite** | LongCat | OAuth grátis | 50M tokens/dia |
| **Gemini 3 Flash** | Gemini CLI | OAuth grátis | 180K/mês |
| **GPT-5, Claude, Gemini** | AgentRouter | API key | US$100 em crédito |
| Workers AI (Llama 3, Mistral…) | Cloudflare | API key grátis | Free tier generoso |
| Qwen (235B / 72B) | Z.ai, Together | API key | Free tier |
| Llama 3.3 70B | Groq, SambaNova | API key | Free tier |
| Mistral Large, Codestral | Mistral La Plateforme | API key | Free tier |

E mais ~40 provedores pagos baratíssimos: **GLM-5 a US$0,50/1M**,
**MiniMax M2.5 a US$0,30/1M**, DeepSeek V3, Cerebras, Fireworks,
Hyperbolic, Lambda, Nebius, OpenRouter (agregador), Ollama local,
LM Studio local… O catálogo completo aparece em
`http://localhost:20128/dashboard/providers`.

### Além dos modelos grátis

| Recurso | O que faz durante um `/reversa` |
|---|---|
| **Cofre unificado de chaves** | Guarde cada API key pessoal uma vez; o OmniRoute injeta a certa por provedor. Chega de colar key no Claude Code, no Codex e no Cursor separadamente. |
| **Combos com 14 estratégias** | Quando o *Archaeologist* varre 500 módulos, o tráfego se distribui em combos `priority` → `weighted` → `cost-optimized` → `context-relay`. Uma varredura de 10 min que bateria o limite por minuto da Anthropic agora termina sem throttling. |
| **Resiliência em 3 camadas** | (1) *Provider circuit breaker* isola provedor doente (Anthropic 503? Pula 60s automático). (2) *Connection cooldown* isola uma chave ruim sem matar o provedor. (3) *Model lockout* trata `gpt-5-mini quota exceeded` mantendo `gpt-5` vivo. |
| **Auto-Combo (scoring de 9 fatores)** | Escolhe o melhor alvo por requisição com base em latência, custo, taxa de sucesso, quota, fitness do modelo etc. Configura e esquece. |
| **Compressão RTK + Caveman (15–95%)** | Encolhe o prompt em sessões pesadas de tool-use (média ~89% nas sessões do *Coding*). Mais barato e mais rápido. |
| **Tradução OpenAI ↔ Claude ↔ Gemini ↔ Responses API** | Use Claude Code apontando para modelos OpenAI; use Codex apontando para Claude. Tudo transparente. |
| **MCP server (37 tools), A2A, memória vetorial, guardrails, evals** | Infra de IA completa, caso queira integrações mais profundas no futuro. |
| **Dashboard de custo e quota em tempo real** | Útil antes de `/reversa-pricing-*` para comparar a estimativa do Reversa com o gasto real. |
| **Local-first, zero telemetria** | Roda em `localhost:20128`. Seu legado nunca sai da máquina, exceto pela chamada LLM em si — exatamente como já era sem o OmniRoute. |

## Passo a passo

### 1. Instale o OmniRoute (uma vez só)

=== "npm"
    ```bash
    npm install -g omniroute
    omniroute
    # Dashboard abre em http://localhost:20128
    ```

=== "Docker"
    ```bash
    docker run -d --name omniroute --restart unless-stopped \
      --stop-timeout 40 \
      -p 20128:20128 \
      -v omniroute-data:/app/data \
      diegosouzapw/omniroute:latest
    ```

=== "App desktop"
    Baixe em [releases](https://github.com/diegosouzapw/OmniRoute/releases)
    (Electron para macOS / Windows / Linux).

=== "Android (Termux)"
    ```bash
    pkg install nodejs-lts
    npx -y omniroute
    # roda no celular, 24/7, sem root
    ```

No primeiro acesso ao dashboard:

1. Defina senha de admin.
2. Vá em **Providers** e conecte **Kiro** (Claude ilimitado) ou
   **Pollinations** (zero auth). Cada conexão leva ~30s.
3. Opcional: cole qualquer API key pessoal em **Providers**.

### 2. Aponte sua engine Reversa para o OmniRoute

Escolha a linha da CLI que você usa para rodar `/reversa`:

=== "Claude Code"
    ```bash
    export ANTHROPIC_BASE_URL=http://localhost:20128
    # persistente: echo 'export ANTHROPIC_BASE_URL=...' >> ~/.zshrc
    ```
    Depois inicie `claude` normalmente.

=== "Codex"
    ```bash
    export OPENAI_BASE_URL=http://localhost:20128/v1
    export OPENAI_API_KEY=sk-omniroute-local  # qualquer valor não-vazio
    ```

=== "Gemini CLI"
    ```bash
    export GEMINI_API_BASE=http://localhost:20128/v1beta
    ```

=== "Cursor / Windsurf / Cline / Roo / Antigravity"
    *Settings → Models → Custom OpenAI endpoint*:

    - **Base URL**: `http://localhost:20128/v1`
    - **API Key**: qualquer string não-vazia (ou sua API key do OmniRoute,
      se você habilitou auth no dashboard)
    - **Model**: escolha no dropdown — todo modelo conhecido pelo OmniRoute
      aparece via API OpenAI-compatible.

### 3. Instale / rode o Reversa normalmente

```bash
cd meu-legado
npx reversa install
# abra o projeto na sua CLI e:
/reversa
```

Abra `http://localhost:20128/dashboard/usage` numa segunda aba para ver
Scout → Archaeologist → Detective → Writer fluindo entre provedores em
tempo real.

## Tuning recomendado por fase

| Fase Reversa | Combo sugerido no OmniRoute | Por quê |
|---|---|---|
| **Scout** (mapeamento de superfície) | `priority`: Kiro Sonnet 4.5 → Qoder Kimi K2 → Pollinations GPT-5 | Rápido, qualidade média basta, 100% grátis |
| **Archaeologist** (módulo a módulo) | `least-used` ou `cost-optimized` entre 4–6 provedores grátis | Varredura longa, evita rate-limit |
| **Detective** + **Architect** (síntese) | `priority`: Kiro Opus 4.6 → Anthropic API → AgentRouter Claude | Precisa de raciocínio forte |
| **Writer** + **Reviewer** (specs) | `weighted` 60% Opus 4.6 / 40% Sonnet 4.5 | Qualidade alta, custo controlado |
| **Coding** (Reversa Forward) | `priority`: Opus 4.6 → Sonnet 4.5 → GPT-5 | Melhor saída com degradação automática |
| **Pricing estimate** | Toggle de *cost tracking* no dashboard | Permite `/reversa-pricing-estimate` ler gasto real via `GET /api/usage/summary` |

## FAQ

**O OmniRoute muda alguma coisa que o Reversa escreve em disco?**
Não. O Reversa continua escrevendo só dentro de `.reversa/` e
`_reversa_sdd/`. O OmniRoute escreve no diretório dele (`~/.omniroute/`).

**Posso continuar usando o Reversa sem o OmniRoute?**
Sim. Esta integração é opcional. Desfazer `ANTHROPIC_BASE_URL` /
`OPENAI_BASE_URL` devolve cada engine ao provedor padrão dela.

**O Reversa manda meu código para o OmniRoute?**
Não mais do que já manda para a sua CLI hoje. A sua CLI (Claude Code,
Codex…) chama `localhost:20128` em vez de `api.anthropic.com`. Dali o
OmniRoute encaminha para o provedor que você configurou — mesmo destino
final, mesmos dados, só com roteamento inteligente no meio.

**OmniRoute tem alguma afiliação com o Reversa?**
Não. São dois projetos open-source independentes. Esta página documenta
um padrão de integração que funciona porque os dois projetos respeitam
o mesmo limite: a CLI de código do usuário é a única superfície de
integração.

**Os provedores grátis são realmente ilimitados?**
Sim — Kiro, Qoder, Pollinations, LongCat, Cloudflare. Sem pegadinha.
Quotas e renovações aparecem no dashboard.

## Links

- Site oficial: <https://omniroute.online>
- Repositório: <https://github.com/diegosouzapw/OmniRoute>
- Comunidade WhatsApp 🇧🇷: <https://chat.whatsapp.com/CeGCxdFzqBe5Uki288wOvf>
- Comunidade WhatsApp 🌍: <https://chat.whatsapp.com/JI7cDQ1GyaiDHhVBpLxf8b?mode=gi_t>
- Docker Hub: <https://hub.docker.com/r/diegosouzapw/omniroute>
- npm: <https://www.npmjs.com/package/omniroute>
- Repositório Reversa: <https://github.com/sandeco/reversa>
