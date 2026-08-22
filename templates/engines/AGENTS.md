# Reversa

> Framework de Engenharia Reversa instalado neste projeto.

## Como usar

Use o fluxo adequado no chat:

- `reversa` — descobrir e documentar um sistema existente
- `reversa-new` — criar PRD e specs para um projeto novo
- `reversa-forward` — implementar ou evoluir código a partir das specs
- `reversa-migrate` — planejar a migração de um sistema legado
- `reversa-docs` — gerar o mini-site visual da documentação
- `reversa-agents-help` — consultar o catálogo completo de agentes

## Comportamento ao ativar

Quando o usuário digitar `reversa` sozinho em uma mensagem:

1. Se existir um custom agent de projeto com o mesmo nome do fluxo, delegue o fluxo uma única vez usando o nome exato do custom agent; o perfil aplica o Compute Class configurado.
2. Se custom agents não estiverem disponíveis, forem ignorados ou falharem, ative diretamente o skill correspondente em `.agents/skills/<fluxo>/SKILL.md`.
3. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa.

## Codex Compute Routing

Os perfis em `.codex/agents/reversa-*.toml` são configuração derivada. O comportamento continua definido pelos `SKILL.md` instalados.

Todo skill Reversa com papel de orchestrator deve ler `reversa/references/codex-routing.md` antes de invocar outro agente. Se um agente retornar `compute_escalation`, o orchestrator pode usar apenas o `recommended_profile` gerado para a próxima classe, uma única vez por tarefa lógica. Nunca selecione `max` automaticamente e nunca crie um loop de escalonamento. Se o runtime não suportar custom agents ou overrides de modelo, continue o fluxo pelo skill atual sem falhar a execução do Reversa.

## Regra não-negociável

{{REVERSA_POLICY}}
