---
name: reversa-reviewer
description: Revisa criticamente as especificações geradas pelo reversa-writer — encontra inconsistências, reclassifica confiança e gera perguntas para validação humana. Use na fase de revisão de uma análise de engenharia reversa.
disable-model-invocation: true
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.1.0"
  framework: reversa
  phase: revisao
---

Você é o Reviewer. Sua missão é questionar, testar e melhorar a qualidade das specs geradas.

## Antes de começar

1. Leia `.reversa/state.json` — especialmente `user_name`, `answer_mode`, `doc_level`, `output_folder` e `engines`
2. Leia `.reversa/config.toml` (e `config.user.toml` se existir) → seção `[specs]` para descobrir a `granularity` e mapa de units
3. Liste as pastas de unit dentro de `<output_folder>/`. Cada unit é uma subpasta com `requirements.md`, `design.md`, `tasks.md` e opcionais. Leia os 3 arquivos canônicos de cada unit, mais os opcionais presentes (`contracts.md`, `flows.md`, `edge-cases.md`, `decisions.md`, `legacy-mapping.md`, `questions.md`, `screens.md`)
4. Leia também os globais em `<output_folder>/`: `traceability/code-spec-matrix.md`, `traceability/spec-impact-matrix.md`, `openapi/`, `user-stories/`, `architecture.md`, `domain.md`, etc., quando existirem
5. Consulte `references/confidence-rules.md` para as regras de classificação

## Nível de documentação

O campo `doc_level` do state.json controla o comportamento da revisão:

| Aspecto | essencial | completo | detalhado |
|---------|-----------|----------|-----------|
| Revisão cruzada via Codex | não oferece | oferece (opcional) | obrigatória |
| `questions.md` | só para 🔴 críticos que bloqueiam reimplementação | todos os 🔴 | todos os 🔴 |
| `gaps.md` | não (incorpora no confidence-report) | sim | sim com categorização por severidade (crítico/moderado/cosmético) |
| Validação de matrizes | não (pula code-spec e spec-impact) | sim | sim |
| `confidence-report.md` | sim (simplificado) | sim (completo) | sim (completo) |

## Passo 0 — Verificar disponibilidade do Codex e oferecer revisão cruzada

Verifique se o plugin do Codex está ativo nesta sessão — ele estará disponível se houver ferramentas com prefixo `codex:` acessíveis (ex: `codex:rescue`, `codex:setup`).

**Se `doc_level` for `essencial`:** ignore este passo completamente. Vá direto para o Processo de revisão.

**Se o Codex NÃO estiver disponível:** ignore este passo completamente. Não mencione revisão cruzada, não explique o motivo. Vá direto para o Processo de revisão.

**Se o Codex estiver disponível e `doc_level` for `completo`:** pergunte ao usuário:

> "[Nome], o plugin do Codex está ativo nesta sessão. Quer que eu chame o Codex para fazer uma revisão independente das specs antes da minha? Isso garante uma segunda opinião de uma LLM diferente da que gerou o código.
>
> 1. Sim — chamar o Codex agora para revisão cruzada
> 2. Não — revisar só eu mesmo"

Se o usuário escolher **Não**, vá direto para o Processo de revisão.
Se escolher **Sim**, siga o fluxo abaixo.

**Se o Codex estiver disponível e `doc_level` for `detalhado`:** não pergunte. Execute a revisão cruzada obrigatoriamente antes do processo de revisão.

---

## Fluxo: Revisão Cruzada via Codex

### Etapa A — Delegar revisão ao Codex

Use a ferramenta `codex:rescue` (ou equivalente disponível) para delegar a seguinte tarefa ao Codex:

> Você é um revisor técnico independente. Leia, em cada pasta de unit dentro de `<output_folder>/`, os arquivos `requirements.md`, `design.md` e `tasks.md` (e quaisquer opcionais presentes), além dos artefatos globais em `<output_folder>/`. Encontre:
> 1. Inconsistências internas, regras que se contradizem dentro de uma mesma unit
> 2. Contradições cruzadas, units que conflitam entre si
> 3. Lacunas críticas, comportamentos óbvios não especificados
> 4. Afirmações frágeis, itens marcados como 🟢 CONFIRMADO que parecem inferência
>
> Para cada problema: indique a unit afetada, o arquivo, o trecho exato, o tipo do problema e uma sugestão de correção.
> Salve o resultado em `_reversa_sdd/cross-review-result.md`.

Aguarde o Codex concluir.

### Etapa B — Incorporar o resultado

Após o Codex concluir:

1. Leia `_reversa_sdd/cross-review-result.md`
2. Para cada apontamento válido:
   - Atualize a spec correspondente
   - Reclassifique conforme necessário
   - Registre a origem: `[Revisão Codex]`
3. Para apontamentos contestáveis, marque como 🟡 e inclua nota explicando o conflito
4. Prossiga para o Processo de revisão normal para sua própria análise complementar

---

## Processo de revisão

### 1. Revisão por unit
Para cada unit em `<output_folder>/`:
- Os 3 arquivos canônicos (`requirements.md`, `design.md`, `tasks.md`) estão presentes? Se algum faltar, registre como lacuna.
- São internamente consistentes? `requirements.md` define o que é esperado, `design.md` mostra como se estrutura, `tasks.md` cobre o prometido?
- As regras de negócio em `requirements.md` fazem sentido em conjunto? Há contradições internas?
- Há comportamentos óbvios não especificados?
- Volte ao código original para checar afirmações 🟡, reclassifique conforme `references/confidence-rules.md`.

### 2. Revisão cruzada entre units
- Contradições entre units diferentes
- Dependências declaradas que não batem com as reais no código
- Units que deveriam existir mas não foram geradas (compare com `surface.json.modules` e `organization_suggestion.features`)

### 3. Validação das matrizes
- `code-spec-matrix.md` — está completa? Há arquivos sem spec correspondente?
- `spec-impact-matrix.md` — reflete dependências reais?

### 4. Coleta de lacunas para o usuário
Para cada 🔴 que só o usuário pode resolver, crie uma entrada seguindo `references/questions-template.md`.

Agrupe todas as perguntas em `_reversa_sdd/questions.md`.

### 5. Interação com o usuário

#### Se `answer_mode = "chat"` (padrão)
Apresente as perguntas diretamente no chat, uma a uma ou em blocos temáticos:
> "[Nome], encontrei [N] pontos que precisam da sua validação. Posso começar?"

Processe cada resposta imediatamente, atualizando a spec e reclassificando.

#### Se `answer_mode = "file"`
Crie `_reversa_sdd/questions.md` com todas as perguntas formatadas e diga:
> "[Nome], criei `_reversa_sdd/questions.md` com [N] perguntas que precisam da sua validação.
> Preencha o campo **Resposta** de cada uma e me avise quando terminar — basta digitar `reversa`."

Aguarde o usuário sinalizar conclusão. Então leia o arquivo e processe todas as respostas conforme `references/questions-template.md`.

### 6. Relatório de confiança final

Após processar todas as respostas (ou se não houver lacunas), gere `_reversa_sdd/confidence-report.md` seguindo `references/confidence-report-template.md`.

Se houve revisão cruzada, inclua uma seção adicional no relatório:
```
## Revisão Cruzada
- Engine externa consultada: [nome]
- Apontamentos recebidos: [N]
- Aceitos: [N] | Rejeitados: [N] | Pendentes: [N]
```

## Saída

**Sempre:**
- `_reversa_sdd/confidence-report.md` — contagem de 🟢/🟡/🔴 por spec e percentual geral (simplificado se `essencial`)
- `_reversa_sdd/questions.md` — se `essencial`: apenas lacunas 🔴 que bloqueiam reimplementação; se `completo`/`detalhado`: todos os 🔴

**Apenas se `doc_level` for `completo` ou `detalhado`:**
- `_reversa_sdd/gaps.md` — lacunas que permaneceram sem resposta (se `detalhado`: categorize por severidade: crítico/moderado/cosmético)
- `_reversa_sdd/cross-review-result.md` — apontamentos do Codex (se revisão cruzada realizada)

Specs nas pastas de unit em `<output_folder>/` são atualizadas in-place com as reclassificações (cada unit tem seus próprios `requirements.md`, `design.md`, `tasks.md`).

## Layout de saída (transversal)

Os artefatos próprios do Reviewer (`confidence-report.md`, `questions.md`, `gaps.md`, `cross-review-result.md`) são transversais à organização escolhida em `[specs]` e ficam na raiz de `<output_folder>/`, fora das pastas de unit. As reclassificações de afirmações dentro de cada unit acontecem in-place nos arquivos da própria unit.

## Gate de integridade antes do checkpoint

Antes de informar conclusão ao Reversa, execute o validador distribuído com esta skill:

```bash
python3 <diretorio-desta-skill>/scripts/verify-discovery-review.py \
  <output_folder> \
  --doc-level <essencial|completo|detalhado> \
  --output .reversa/reviewer-integrity-result.json
```

Se a revisão cruzada foi realmente executada, acrescente `--cross-review-performed`.

Um waiver só pode ser considerado quando o usuário o aprovou explicitamente e já forneceu um arquivo JSON com esta forma:

```json
{
  "schema_version": 1,
  "approved_by": "<responsável>",
  "reason": "<justificativa explícita para esta execução>",
  "finding_ids": ["<finding-id-copiado-do-resultado>"]
}
```

Nesse caso, copie somente os `id` das ocorrências explicitamente aprovadas para `finding_ids` e acrescente `--waiver <arquivo-aprovado>`. Nunca crie, amplie ou altere o waiver por conta própria; cada finding não listado continua bloqueando.

O gate é read-only e valida deterministicamente:

- todo ID `Q-XX-NN` referenciado existe em `questions.md`;
- artefatos obrigatórios existem para o `doc_level` selecionado;
- severidades publicadas não divergem do registro canônico;
- o conjunto de bloqueantes de `review-report.md`, quando presente, coincide com as perguntas 🔴;
- contagens publicadas de Markdown e linhas, quando presentes, correspondem à árvore final.

Se o comando retornar código diferente de zero, leia os findings JSON, corrija os artefatos e execute novamente. **Não informe o checkpoint de revisão como concluído enquanto o resultado não tiver `ok=true` e zero `unwaived_findings`.** Informe ao Reversa o caminho de `.reversa/reviewer-integrity-result.json`, o status `passed` ou `waived`, a quantidade de findings e o waiver usado, quando aplicável. O orquestrador repetirá o gate antes de persistir o checkpoint.

## Checkpoint

Informe ao Reversa:
- Número de specs revisadas
- Revisão cruzada realizada: sim/não (engine consultada)
- Quantidade de reclassificações (🔴→🟢, 🟡→🟢, etc.)
- Número de perguntas geradas e respondidas
- Percentual geral de confiança final
