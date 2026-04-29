---
title: Models
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/models.md
source: git
fetched_at: 2026-04-29T12:02:57.840655071-03:00
rendered_js: false
word_count: 976
summary: This document explains how to configure custom AI models and providers for the system using the models.json configuration file, including support for local and remote API endpoints.
tags:
    - configuration
    - llm
    - api-integration
    - custom-models
    - json-schema
category: configuration
optimized: true
optimized_at: 2026-04-29T00:00:00Z
---
# Custom Models

Add custom providers and models (Ollama, vLLM, LM Studio, proxies) via `~/.pi/agent/models.json`.

## Minimal Example

For local models (Ollama, LM Studio, vLLM), only `id` is required:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "llama3.1:8b" },
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}
```

The `apiKey` is required but Ollama ignores it — any value works.

## OpenAI Compatibility Issues

Some OpenAI-compatible servers don't understand the `developer` role used for reasoning-capable models. For those, set `compat.supportsDeveloperRole` to `false` so pi sends the system prompt as a `system` message instead. If the server also doesn't support `reasoning_effort`, set `compat.supportsReasoningEffort` to `false`.

Set `compat` at the provider level (applies to all models) or model level (overrides specific model).

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": false
      },
      "models": [
        {
          "id": "gpt-oss:20b",
          "reasoning": true
        }
      ]
    }
  }
}
```

## Full Example

Override defaults when needed:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        {
          "id": "llama3.1:8b",
          "name": "Llama 3.1 8B (Local)",
          "reasoning": false,
          "input": ["text"],
          "contextWindow": 128000,
          "maxTokens": 32000,
          "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
        }
      ]
    }
  }
}
```

The file reloads each time you open `/model`. Edit during session — no restart needed.

## Google AI Studio Example

Use `google-generative-ai` with a `baseUrl` for Google AI Studio models, including custom Gemma 4 entries:

```json
{
  "providers": {
    "my-google": {
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta",
      "api": "google-generative-ai",
      "apiKey": "GEMINI_API_KEY",
      "models": [
        {
          "id": "gemma-4-31b-it",
          "name": "Gemma 4 31B",
          "input": ["text", "image"],
          "contextWindow": 262144,
          "reasoning": true
        }
      ]
    }
  }
}
```

The `baseUrl` is required when adding custom models to the `google-generative-ai` API type.

## Supported APIs

| API | Description |
|-----|-------------|
| `openai-completions` | OpenAI Chat Completions (most compatible) |
| `openai-responses` | OpenAI Responses API |
| `anthropic-messages` | Anthropic Messages API |
| `google-generative-ai` | Google Generative AI |

Set `api` at provider level (default for all models) or model level (override per model).

## Provider Configuration

| Field | Description |
|-------|-------------|
| `baseUrl` | API endpoint URL |
| `api` | API type (see above) |
| `apiKey` | API key (see value resolution below) |
| `headers` | Custom headers (see value resolution below) |
| `authHeader` | Set `true` to add `Authorization: Bearer <apiKey>` automatically |
| `models` | Array of model configurations |
| `modelOverrides` | Per-model overrides for built-in models on this provider |

### Value Resolution

The `apiKey` and `headers` fields support three formats:

- **Shell command:** `"!command"` executes and uses stdout
  ```json
  "apiKey": "!security find-generic-password -ws 'anthropic'"
  "apiKey": "!op read 'op://vault/item/credential'"
  ```
- **Environment variable:** Uses the value of the named variable
  ```json
  "apiKey": "MY_API_KEY"
  ```
- **Literal value:** Used directly
  ```json
  "apiKey": "sk-..."
  ```

> [!note]
> For `models.json`, shell commands are resolved at request time. pi intentionally does not apply built-in TTL, stale reuse, or recovery logic for arbitrary commands. If your command is slow, expensive, rate-limited, or should keep using a previous value on transient failures, wrap it in your own script that implements the caching behavior you want.

`/model` availability checks use configured auth presence and do not execute shell commands.

### Custom Headers

```json
{
  "providers": {
    "custom-proxy": {
      "baseUrl": "https://proxy.example.com/v1",
      "apiKey": "MY_API_KEY",
      "api": "anthropic-messages",
      "headers": {
        "x-portkey-api-key": "PORTKEY_API_KEY",
        "x-secret": "!op read 'op://vault/item/secret'"
      },
      "models": [...]
    }
  }
}
```

## Model Configuration

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `id` | Yes | — | Model identifier (passed to the API) |
| `name` | No | `id` | Human-readable model label. Used for matching (`--model` patterns) and shown in model details/status text. |
| `api` | No | provider's `api` | Override provider's API for this model |
| `reasoning` | No | `false` | Supports extended thinking |
| `input` | No | `["text"]` | Input types: `["text"]` or `["text", "image"]` |
| `contextWindow` | No | `128000` | Context window size in tokens |
| `maxTokens` | No | `16384` | Maximum output tokens |
| `cost` | No | all zeros | `{"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0}` (per million tokens) |
| `compat` | No | provider `compat` | Provider compatibility overrides. Merged with provider-level `compat`. |

## Overriding Built-in Providers

Route a built-in provider through a proxy without redefining models:

```json
{
  "providers": {
    "anthropic": {
      "baseUrl": "https://my-proxy.example.com/v1"
    }
  }
}
```

All built-in Anthropic models remain available. Existing OAuth or API key auth continues to work.

To merge custom models into a built-in provider:

```json
{
  "providers": {
    "anthropic": {
      "baseUrl": "https://my-proxy.example.com/v1",
      "apiKey": "ANTHROPIC_API_KEY",
      "api": "anthropic-messages",
      "models": [...]
    }
  }
}
```

**Merge semantics:**
- Built-in models are kept
- Custom models are upserted by `id`
- Custom model with same `id` replaces that built-in model
- New custom `id` is added alongside built-in models

## Per-model Overrides

Use `modelOverrides` to customize specific built-in models without replacing the provider's full model list.

```json
{
  "providers": {
    "openrouter": {
      "modelOverrides": {
        "anthropic/claude-sonnet-4": {
          "name": "Claude Sonnet 4 (Bedrock Route)",
          "compat": {
            "openRouterRouting": {
              "only": ["amazon-bedrock"]
            }
          }
        }
      }
    }
  }
}
```

`modelOverrides` supports: `name`, `reasoning`, `input`, `cost` (partial), `contextWindow`, `maxTokens`, `headers`, `compat`.

If `models` is also defined for a provider, custom models are merged after built-in overrides.

## Anthropic Messages Compatibility

For `api: "anthropic-messages"`, use `compat.supportsEagerToolInputStreaming` to control fine-grained tool streaming compatibility.

By default pi sends per-tool `eager_input_streaming: true`. If a proxy rejects that field, set `supportsEagerToolInputStreaming` to `false`. Pi will omit that field and send the legacy `fine-grained-tool-streaming-2025-05-14` beta header instead.

```json
{
  "providers": {
    "anthropic-proxy": {
      "baseUrl": "https://proxy.example.com",
      "api": "anthropic-messages",
      "apiKey": "ANTHROPIC_PROXY_KEY",
      "compat": {
        "supportsEagerToolInputStreaming": false,
        "supportsLongCacheRetention": true
      },
      "models": [
        {
          "id": "claude-opus-4-7",
          "reasoning": true,
          "input": ["text", "image"]
        }
      ]
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `supportsEagerToolInputStreaming` | Whether the provider accepts `eager_input_streaming`. Default: `true`. Set to `false` to omit and use legacy beta header. |
| `supportsLongCacheRetention` | Whether the provider accepts long cache retention (`cache_control.ttl: "1h"`) when cache retention is `long`. Default: `true`. |

## OpenAI Compatibility

| Field | Description |
|-------|-------------|
| `supportsStore` | Provider supports `store` field |
| `supportsDeveloperRole` | Use `developer` vs `system` role |
| `supportsReasoningEffort` | Support for `reasoning_effort` parameter |
| `reasoningEffortMap` | Map pi thinking levels to provider-specific `reasoning_effort` values |
| `supportsUsageInStreaming` | Supports `stream_options: { include_usage: true }`. Default: `true` |
| `maxTokensField` | Use `max_completion_tokens` or `max_tokens` |
| `requiresToolResultName` | Include `name` on tool result messages |
| `requiresAssistantAfterToolResult` | Insert assistant message between tool results and user messages |
| `requiresThinkingAsText` | Convert thinking blocks to plain text |
| `requiresReasoningContentOnAssistantMessages` | Include empty `reasoning_content` on replayed assistant messages when reasoning is enabled |
| `thinkingFormat` | Use `reasoning_effort`, `deepseek`, `zai`, `qwen`, or `qwen-chat-template` thinking parameters |
| `cacheControlFormat` | Use Anthropic-style `cache_control` markers. Currently only `anthropic` is supported. |
| `supportsStrictMode` | Include `strict` field in tool definitions |
| `supportsLongCacheRetention` | Whether the provider accepts long cache retention (`prompt_cache_retention: "24h"` or `cache_control.ttl: "1h"`). Default: `true` |
| `openRouterRouting` | OpenRouter provider routing preferences sent as-is in the `provider` field of [OpenRouter API request](https://openrouter.ai/docs/guides/routing/provider-selection) |
| `vercelGatewayRouting` | Vercel AI Gateway routing config (`only`, `order`) |

`qwen` uses top-level `enable_thinking`. Use `qwen-chat-template` for local Qwen-compatible servers that require `chat_template_kwargs.enable_thinking`.

`cacheControlFormat: "anthropic"` is for OpenAI-compatible providers that expose Anthropic-style prompt caching.

### OpenRouter Example

```json
{
  "providers": {
    "openrouter": {
      "baseUrl": "https://openrouter.ai/api/v1",
      "apiKey": "OPENROUTER_API_KEY",
      "api": "openai-completions",
      "models": [
        {
          "id": "openrouter/anthropic/claude-3.5-sonnet",
          "name": "OpenRouter Claude 3.5 Sonnet",
          "compat": {
            "openRouterRouting": {
              "allow_fallbacks": true,
              "require_parameters": false,
              "data_collection": "deny",
              "zdr": true,
              "order": ["anthropic", "amazon-bedrock", "google-vertex"],
              "only": ["anthropic", "amazon-bedrock"],
              "ignore": ["gmicloud", "friendli"]
            }
          }
        }
      ]
    }
  }
}
```

### Vercel AI Gateway Example

```json
{
  "providers": {
    "vercel-ai-gateway": {
      "baseUrl": "https://ai-gateway.vercel.sh/v1",
      "apiKey": "AI_GATEWAY_API_KEY",
      "api": "openai-completions",
      "models": [
        {
          "id": "moonshotai/kimi-k2.5",
          "name": "Kimi K2.5 (Fireworks via Vercel)",
          "reasoning": true,
          "input": ["text", "image"],
          "cost": { "input": 0.6, "output": 3, "cacheRead": 0, "cacheWrite": 0 },
          "contextWindow": 262144,
          "maxTokens": 262144,
          "compat": {
            "vercelGatewayRouting": {
              "only": ["fireworks", "novita"],
              "order": ["fireworks", "novita"]
            }
          }
        }
      ]
    }
  }
}
```
