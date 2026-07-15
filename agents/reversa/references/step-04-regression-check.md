# Passo 4, verificação de regressão semântica

> Este passo só roda em **re-extrações**, ou seja, quando uma pipeline reversa é executada num projeto que já passou por pelo menos um ciclo `/reversa-coding`. Em projetos sem `_reversa_forward/` ou sem `regression-watch.md`, a verificação de regressão é silenciosamente pulada (a "Reconciliação de adendos" ao final ainda é verificada).

## Por que existe

O Reversa não é só extração one-shot. Cada `/reversa-coding` deixa em `_reversa_forward/<feature>/regression-watch.md` uma lista de regras que precisam continuar verdadeiras na próxima extração. A pipeline reversa, ao re-rodar, tem o dever de checar essas regras contra o código atual e reportar regressões. Esse é o diferencial competitivo do Reversa frente a frameworks forward puros.

## Quando rodar

Após o **último agente do plano** concluir, antes da mensagem final de "extração concluída". O gatilho é posição (último item de `.reversa/plan.md`), não nome de agente, porque o último agente varia conforme os opcionais selecionados no install (Reviewer pode estar ausente, por exemplo). Faça os checks na ordem:

1. Verifique se `_reversa_forward/` existe na raiz do projeto. Se não existir, pule direto para a seção "Reconciliação de adendos".
2. Liste todas as subpastas de `_reversa_forward/` que contêm `regression-watch.md`.
3. Se a lista estiver vazia, pule direto para a seção "Reconciliação de adendos".
4. Caso contrário, prossiga com o procedimento abaixo, uma feature por vez.

## Procedimento por feature

Para cada `_reversa_forward/<feature>/regression-watch.md`:

1. Carregue o arquivo. Identifique a tabela principal de watch items (colunas `ID | Origem | Regra esperada após mudança | Tipo de verificação | Sinal de violação`).
2. Para cada watch item da tabela principal (não os arquivados):
   2.1. Identifique o `Tipo de verificação`, valores possíveis: `presença`, `ausência`, `redação`, `confidência`.
   2.2. Aplique a verificação correspondente contra os artefatos recém-gerados em `_reversa_sdd/`:
        - `presença`: a regra precisa estar presente em `_reversa_sdd/domain.md` (ou no arquivo apontado pela coluna Origem) com a mesma essência semântica.
        - `ausência`: a regra original NÃO pode mais aparecer no SDD.
        - `redação`: o texto foi alterado deliberadamente, verifique se a versão nova bate com a expectativa.
        - `confidência`: a regra continua presente, mas a confidência (🟢, 🟡, 🔴) deve ser igual ou maior à esperada.
   2.3. Atribua um veredito:
        - 🟢 **verde**, a expectativa bateu integralmente.
        - 🟡 **amarelo**, há equivalência semântica mas o texto difere, ou a evidência é parcial. Veredito padrão quando há ambiguidade. Aguarda julgamento humano.
        - 🔴 **vermelho**, a expectativa NÃO bateu. A regra confirmada antes virou regra ferida.
3. Após avaliar todos os watch items, atualize a seção `## Histórico de re-extrações` do mesmo `regression-watch.md` adicionando bloco datado:

```
### Re-extração YYYY-MM-DD HH:MM

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | regra preservada em _reversa_sdd/domain.md#regra-X |
| W005 | 🔴 vermelho | regra removida do código atual; mudança não pretendida |
| W010 | 🟡 amarelo | texto equivalente mas difere literalmente; aguarda julgamento |
```

4. NÃO altere a tabela principal de watch items. NÃO recicle IDs. NÃO mova watch items para "Arquivadas" automaticamente.

5. Para cada watch item com três vereditos verdes consecutivos no histórico, e desde que `setup.json#watch.archive-after` permita, mova o item da tabela principal para a seção `## Arquivadas` no final do arquivo. Mantenha o ID original.

## Política de escrita

- Escrita atômica (tempfile mais rename) em `regression-watch.md`.
- Nunca reescreva ou apague entradas do histórico de re-extrações.
- O bloco novo de re-extração vai sempre no topo da seção `## Histórico de re-extrações` (ordem decrescente).

## Relatório ao usuário

Após percorrer todas as features, apresente:

1. Total de features verificadas
2. Total de watch items verificados
3. Quebra por veredito: verdes, amarelos, vermelhos
4. Lista detalhada dos vermelhos (ID, feature, regra, motivo da divergência)
5. Lista detalhada dos amarelos que pediram julgamento humano

Se houver pelo menos um vermelho, apresente um aviso destacado:

> 🔴 **Atenção**, foram detectadas **N regressões semânticas** em features previamente codadas. Revise antes de seguir.

Se a `setup.json#watch.block-on-red` for `true`, sugira ao usuário **não** prosseguir com novos `/reversa-requirements` até que cada vermelho seja triado. O Reversa apenas alerta, jamais bloqueia automaticamente o fluxo do usuário.

## Reconciliação de adendos

Depois de percorrer as features (ou mesmo se nenhuma tiver `regression-watch.md`), verifique se existe `_reversa_sdd/addenda/` com arquivos `.md` criados pelo `/reversa-sync`. Se existir:

1. Para cada adendo cuja seção `## Vigência` NÃO contém linha `Superado pela re-extração de ...`, acrescente ao final dessa seção a linha:

   ```
   Superado pela re-extração de YYYY-MM-DD.
   ```

2. Jamais apague o adendo, jamais reescreva as linhas anteriores da seção Vigência, jamais toque nas demais seções. Append-only, escrita atômica.
3. Adendos já superados em re-extrações anteriores ficam como estão (são histórico).
4. Inclua no relatório ao usuário quantos adendos foram marcados como superados nesta re-extração.

A razão: os adendos são pontes entre uma entrega forward e a re-extração. Com a extração regenerada a partir do código atual, os deltas descritos nos adendos já estão absorvidos nos artefatos principais, e os consumidores (por exemplo `/reversa-requirements` e `/reversa-plan`) só devem considerar adendos vigentes.

## Caso especial, sem `_reversa_sdd/`

Se durante o procedimento o `_reversa_sdd/` não tiver os arquivos esperados (porque a re-extração foi parcial ou o nível de documentação foi reduzido), registre veredito 🟡 amarelo com observação `evidência ausente, _reversa_sdd/<arquivo> não foi gerado nesta extração` e siga em frente.

## Lacuna conhecida

Equivalência semântica entre regra esperada e regra extraída é avaliação subjetiva. Quando tiver dúvida, prefira veredito amarelo. Veredito vermelho deve ser reservado para casos onde a regra simplesmente sumiu ou foi explicitamente contradita.
