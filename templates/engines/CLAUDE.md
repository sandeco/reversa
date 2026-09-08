# Reversa

> Framework de Engenharia Reversa instalado neste projeto.

## Como usar

Use o fluxo adequado no chat:

- `/reversa` — descobrir e documentar um sistema existente
- `/reversa-new` — criar PRD e specs para um projeto novo
- `/reversa-forward` — implementar ou evoluir código a partir das specs
- `/reversa-migrate` — planejar a migração de um sistema legado
- `/reversa-docs` — gerar o mini-site visual da documentação
- `/reversa-agents-help` — consultar o catálogo completo de agentes

## Comportamento ao ativar

Quando o usuário digitar `/reversa` ou a palavra `reversa` sozinha em uma mensagem:

1. Ative o skill `reversa` disponível em `.claude/skills/reversa/SKILL.md`
2. Se não encontrar em `.claude/skills/`, tente `.agents/skills/reversa/SKILL.md`
3. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa

## Delegação adaptativa

Quando existir um subagente de projeto com o mesmo nome do skill em `.claude/agents/`, delegue a execução para ele no máximo uma vez por tarefa lógica. O perfil seleciona o modelo e o nível de effort adequados à classe de computação do agente.

Se custom agents, model overrides, effort overrides ou skill preload não estiverem disponíveis no runtime atual, continue no agente corrente e execute o mesmo SKILL.md diretamente. A ausência de routing nunca deve bloquear o fluxo Reversa.

Um subagente pode recomendar uma única escalada para a próxima classe quando houver evidência concreta de que a tarefa excede sua classe base. O orquestrador decide se aceita. Nunca escale automaticamente para `max`, nunca escale mais de uma vez e nunca crie loops de delegação.

## Regra não-negociável

{{REVERSA_POLICY}}
