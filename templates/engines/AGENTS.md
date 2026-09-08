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

### Regra de orçamento de contexto

Para dispatch portável, `fork_turns` deve ser exatamente `"none"`: nunca use `"all"` nem uma contagem numérica. Passe um handoff limitado a 4.000 tokens, com caminhos para artefatos duráveis, em vez de transcrever o contexto pai, resultados de agentes ou trechos de fonte. Se precisar de mais contexto, crie um único handoff focalizado de no máximo 2.000 tokens e passe apenas o caminho. A referência `reversa/references/codex-routing.md` é a fonte de verdade operacional.

### Limite de sessão e prevenção de compactação

Todo Gate aprovado é uma fronteira natural de contexto: antes do próximo passo lógico, grave um checkpoint durável com decisão, evidência validada, escopo restante e caminhos para artefatos. Após dez iterações de modelo, atualize o checkpoint, mas não divida uma sessão estreita e saudável apenas pela contagem: preservar o cache é preferível. Continue como a próxima tarefa focalizada apenas no limite de um Gate aprovado ou ao surgir aviso de compactação/pressão de contexto. Se a auditoria local de tokens indicar ao menos três chamadas com cache hit abaixo de 90%, trate o próximo sweep amplo, teste ou review como investigação de cache miss: checkpoint antes, caminhos para artefatos e instruções estáveis antes dos achados dinâmicos. Se houver duas ou mais chamadas individuais abaixo de 20% de cache hit na mesma sessão, trate como burst crítico: antes do próximo passo amplo, confira perfil, instruções estáveis e handoff por caminhos de artefatos. No próximo Gate aprovado, inicie um sucessor focalizado apenas com esse perfil, instruções estáveis e caminhos de artefatos; nunca copie prosa do pai nem interrompa um Gate obrigatório. Agrupe leituras, buscas, logs e contagens independentes em uma chamada focalizada com um único resultado agregado e limitado; mantenha ações dependentes, segurança e validação de Gate separadas. Nunca reconstrua a transcrição pai; o sucessor lê apenas o checkpoint. Isso não autoriza pular Gates, enfraquecer validação nem repetir efeito já concluído.

## Regra não-negociável

{{REVERSA_POLICY}}
