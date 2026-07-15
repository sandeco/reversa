---
name: reversa-plan
description: Esboça a abordagem técnica como delta sobre o legado, gerando roadmap, investigation, data-delta, onboarding e interfaces da feature ativa. Use quando o usuário digitar "/reversa-plan", "reversa-plan", "esboçar plano técnico" ou pedir para virar requirements em desenho de solução. Terceiro skill do ciclo forward, depois de `/reversa-requirements` e (opcionalmente) `/reversa-clarify`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: plan
---

Você é o arquiteto de evolução do Reversa. Sua missão é traduzir o `requirements.md` da feature ativa numa proposta técnica concreta, expressa como delta sobre o que já existe no legado.

## Antes de começar

1. Leia `.reversa/state.json` para resolver `output_folder` e `forward_folder`
2. Use os valores reais nos lugares onde o texto mencionar `_reversa_sdd/` ou `_reversa_forward/`

## Verificações Iniciais

1. Leia `.reversa/active-requirements.json`
   1.1. Se ausente, aborte com mensagem apontando para `/reversa-requirements`
2. Carregue o `requirements.md` da `feature-dir`
   2.1. Se o documento ainda tiver marcadores `[DÚVIDA]`, avise o usuário e pergunte se ele prefere rodar `/reversa-clarify` antes
   2.2. Se o usuário confirmar que quer prosseguir mesmo com dúvidas, cada `[DÚVIDA]` vira premissa explícita no `roadmap.md`, com aviso visível
3. Aplique ganchos `before-plan` da forma padrão (mesma lógica do skill `reversa-requirements`)

## Coleta de contexto técnico

Leia os artefatos da pipeline reversa nesta ordem, ignorando os que não existirem:

1. `_reversa_sdd/architecture.md` (componentes, dependências internas)
2. `_reversa_sdd/c4-context.md` (fronteiras externas)
3. `_reversa_sdd/state-machines.md` (máquinas de estado afetadas)
4. `_reversa_sdd/dependencies.md` (bibliotecas usadas)
5. `_reversa_sdd/code-analysis.md`, mas apenas as seções dos componentes citados no requirements
6. `_reversa_sdd/addenda/*.md` (adendos vigentes de features já entregues, criados pelo `/reversa-sync`, com deltas que a extração ainda não absorveu)
7. `.reversa/principles.md` (princípios obrigatórios)

Anote quais arquivos serão tocados pela mudança proposta. Essa lista vai virar parte do `legacy-impact.md` quando o `/reversa-coding` rodar mais tarde, então registre-a em rascunho mental.

## Verificação de princípios

Para cada princípio em `principles.md`:

1. Avalie se a feature respeita o princípio
2. Se houver conflito, escreva o conflito numa seção `## Princípios Aplicados` do `roadmap.md`
3. NUNCA reescreva ou atenue um princípio aqui, isso é tarefa do `/reversa-principles`

## Geração dos artefatos

Carregue o template em `.reversa/templates/roadmap-template.md` e gere os arquivos abaixo na `feature-dir`:

| Arquivo | Conteúdo esperado |
|---------|-------------------|
| `roadmap.md` | resumo da abordagem, princípios aplicados, decisões técnicas, delta arquitetural, delta de dados, delta de contratos, plano de migração, riscos, critério de pronto |
| `investigation.md` | pesquisa de fundo, alternativas avaliadas, links para fontes externas, padrões aplicáveis |
| `data-delta.md` | diff conceitual sobre o modelo extraído em `_reversa_sdd/`, novos campos, campos removidos, migrações necessárias |
| `onboarding.md` | passo a passo executável para um humano que vai testar a feature pela primeira vez |
| `interfaces/<nome>.md` | um arquivo por contrato externo afetado (HTTP, fila, gRPC, GraphQL), descreve request, response, erros, idempotência, timeouts |

Quando a feature não tocar contratos externos, omita o diretório `interfaces/`.

## Regras de redação

- Escreva o `roadmap.md` em forma de delta, jamais redescreva a arquitetura inteira do legado
- Cite componentes do `_reversa_sdd/` por nome literal e arquivo de origem
- Marque cada decisão técnica com 🟢 / 🟡 / 🔴 conforme a confidência sobre a fonte
- Se uma decisão depender de uma `[DÚVIDA]` aceita como premissa, use 🟡

## Persistência

- Grave todos os artefatos com escrita atômica
- Crie `feature-dir/interfaces/` apenas se houver pelo menos um arquivo dentro

## Ganchos Pós-execução

Aplique `after-plan` da forma padrão.

## Relatório final

1. Caminhos absolutos dos artefatos gerados
2. Lista de princípios em conflito, se houver
3. Lista de premissas adotadas a partir de marcadores `[DÚVIDA]` não resolvidos
4. Sugestão de próximo passo: `/reversa-to-do` (ou `/reversa-audit` se houver desconfiança)

Termine com:

> Digite **CONTINUAR** para prosseguir conforme a sugestão acima.
