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

1. Leia `reversa/references/codex-routing.md` e escolha o transporte realmente disponível no runtime.
2. Se houver seletor nativo de project custom agent, delegue uma única vez ao perfil exato do fluxo.
3. Se houver apenas `spawn_agent` com overrides de modelo e reasoning, use o portable profile dispatch descrito na referência; não inicie um `codex exec` aninhado.
4. Se nenhum transporte funcionar, ative diretamente o skill correspondente em `.agents/skills/<fluxo>/SKILL.md`.
5. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa.

## Codex Compute Routing

Os perfis em `.codex/agents/reversa-*.toml` são configuração derivada e a fonte de `model` e `model_reasoning_effort`. O comportamento continua definido pelos `SKILL.md` instalados.

Todo skill Reversa com papel de orchestrator deve ler `reversa/references/codex-routing.md` antes de invocar outro agente. Se o runtime não expuser um seletor de custom profile, o orchestrator deve reproduzir o perfil com `spawn_agent`, `fork_turns: "none"` e os overrides declarados no TOML. Se um agente retornar `compute_escalation`, o orchestrator pode usar apenas o `recommended_profile` gerado para a próxima classe, uma única vez por tarefa lógica. Nunca selecione `max` automaticamente e nunca crie um loop de escalonamento. Se o dispatch falhar, continue pelo fallback local sem duplicar efeitos parciais.

## Regra não-negociável

{{REVERSA_POLICY}}
