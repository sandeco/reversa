# Guia de Checkpoints — .reversa/state.json

O Reversa é o único agente que **escreve** no state.json. Os demais agentes apenas leem.

## Regras absolutas

1. **Nunca remova campos existentes.** Apenas adicione ou atualize.
2. **Sempre leia o arquivo antes de escrever** — outro agente pode ter atualizado `checkpoints`.
3. **Salve após cada fase concluída**, não apenas no final.
4. **Em caso de estouro de contexto**, salve imediatamente antes de pausar.

## O que salvar a cada fase

### Ao iniciar uma fase
```json
{
  "phase": "reconhecimento"
}
```

### Ao concluir um agente
```json
{
  "checkpoints": {
    "scout": {
      "completed_at": "2026-04-26T10:30:00Z",
      "files": [
        "_reversa_sdd/inventory.md",
        "_reversa_sdd/dependencies.md",
        ".reversa/context/surface.json"
      ]
    }
  }
}
```

### Ao concluir o Reviewer

O checkpoint `reviewer` só pode ser salvo depois do gate especial descrito em `reversa/SKILL.md`. Persista o recibo sem remover os campos já existentes:

```json
{
  "checkpoints": {
    "reviewer": {
      "completed_at": "2026-04-26T12:00:00Z",
      "files": [
        "_reversa_sdd/confidence-report.md",
        "_reversa_sdd/questions.md"
      ],
      "integrity": {
        "status": "passed",
        "command": "python3 <skill>/scripts/verify-discovery-review.py _reversa_sdd --doc-level completo",
        "result_path": ".reversa/reviewer-integrity-result.json",
        "findings": 0,
        "unwaived_findings": 0,
        "waiver_path": null
      }
    }
  }
}
```

Use `status: "waived"` e preencha `waiver_path` somente quando o resultado do gate confirmar `waived=true`, `waiver.status=valid` e zero `unwaived_findings`.

### Ao concluir uma fase inteira
```json
{
  "phase": "escavacao",
  "completed": ["reconhecimento"],
  "pending": ["escavacao", "interpretacao", "geracao", "revisao"]
}
```

### Ao marcar uma tarefa parcial do Archaeologist
```json
{
  "checkpoints": {
    "archaeologist": {
      "modules_analyzed": ["auth", "orders"],
      "modules_pending": ["payments", "users"]
    }
  }
}
```

## Sequência de fases

```
null → reconhecimento → escavacao → interpretacao → geracao → revisao
```

Ao mover de fase:
- Retire a fase concluída de `pending` e adicione a `completed`
- Atualize `phase` para a próxima fase

## Exemplo de state.json com análise em andamento

```json
{
  "version": "1.0.0",
  "project": "meu-sistema",
  "user_name": "Ana",
  "chat_language": "pt-br",
  "doc_language": "Português",
  "answer_mode": "chat",
  "output_folder": "_reversa_sdd",
  "phase": "escavacao",
  "completed": ["reconhecimento"],
  "pending": ["escavacao", "interpretacao", "geracao", "revisao"],
  "checkpoints": {
    "scout": {
      "completed_at": "2026-04-26T10:30:00Z",
      "files": [
        "_reversa_sdd/inventory.md",
        "_reversa_sdd/dependencies.md",
        ".reversa/context/surface.json"
      ]
    },
    "archaeologist": {
      "modules_analyzed": ["auth", "orders"],
      "modules_pending": ["payments", "users"]
    }
  },
  "engines": ["claude-code"],
  "agents": ["reversa", "reversa-scout", "reversa-archaeologist"],
  "created_files": []
}
```

## Mensagem de pausa por estouro de contexto

Se o contexto estiver se esgotando, salve o checkpoint atual e diga:

> "[Nome], vou pausar aqui para preservar o contexto. Tudo está salvo em `.reversa/state.json`. Digite `reversa` em uma nova sessão para continuar de onde paramos."
