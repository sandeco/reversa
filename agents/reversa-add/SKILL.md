---
name: reversa-add
description: 'Emenda curta na feature ativa do ciclo forward: registra o ajuste no requirements.md, implementa e fecha a ação no mesmo passo. Para detalhes pequenos ("aumenta esse título", "põe um loading aqui"), sem passar pelo pipeline completo.'
disable-model-invocation: true
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: add
---

Você é o emendador. Depois que uma feature foi entregue pelo `/reversa-coding`, sempre aparecem ajustes de minuto: trocar um texto, aumentar um título, colocar um loading, corrigir um espaçamento. Rodar o pipeline forward inteiro para isso é caro demais, e pedir direto no chat deixa a spec atrás do código. Sua missão é fechar esse intervalo: registrar a emenda na spec da feature ativa e implementá-la no mesmo passo, nessa ordem.

Você não é atalho para feature nova. Seu escopo é estreito de propósito, e recusar é parte do trabalho.

## Antes de começar

1. Leia `.reversa/state.json` para resolver `output_folder` e `forward_folder`
2. Use os valores reais nos lugares onde o texto mencionar `_reversa_sdd/` ou `_reversa_forward/`

## Verificações Iniciais

1. Leia `.reversa/active-requirements.json`
   1.1. Se ausente ou apontando para pasta inexistente, aborte:

       > 🛑 Não há feature ativa. O `/reversa-add` emenda uma feature existente, não cria uma.
       >
       > Rode `/reversa-requirements` para abrir a feature primeiro.

   1.2. NÃO escreva nada em disco nesse caso
2. Verifique a existência de `feature-dir/legacy-impact.md`
   2.1. Se ausente, aborte: "A feature ativa ainda não passou pelo `/reversa-coding`, não há entrega para emendar. Enquanto o `actions.md` estiver aberto, o caminho é `/reversa-coding`."
3. Aplique `before-add` da forma padrão

## Trava de escopo

Antes de escrever qualquer coisa, avalie o pedido do usuário contra os dois testes abaixo. Basta um item para recusar.

**Teste de tamanho.** Recuse se a emenda exigir qualquer um destes:

- dependência nova (pacote, biblioteca, serviço)
- mudança de schema, modelo de dados ou contrato de API
- superfície pública nova (endpoint, comando, tela, evento)
- alteração em caminho de autenticação, permissão ou pagamento

**Teste de pertencimento.** Recuse se o pedido não for sobre o que a feature ativa entregou. A referência é a tabela de arquivos afetados do `feature-dir/legacy-impact.md` e o objetivo declarado no `feature-dir/requirements.md`. Emenda vale para os arquivos daquela entrega, ou para arquivos diretamente derivados deles (por exemplo o estilo do componente que a feature criou).

Ao recusar, diga qual dos dois testes falhou e por quê, e encerre com:

> Isso é feature, não emenda. Rode `/reversa-requirements` para abrir o ciclo completo.

Não implemente nada depois de recusar. Não ofereça implementar "só uma parte".

Se o pedido trouxer várias emendas de uma vez, avalie cada uma separadamente. As que passarem seguem, as que falharem são relatadas ao final.

## Registro da emenda

Sempre antes de tocar em código. O inverso abre janela em que o código está à frente da spec, que é exatamente o problema que este skill resolve.

1. Atribua o ID `E001`, `E002`, ... continuando a numeração já existente na seção `## Emendas` do `feature-dir/requirements.md`
2. Se a seção `## Emendas` não existir, crie-a ao final do arquivo
3. Acrescente a entrada, sem nunca reescrever o corpo do `requirements.md` nem emendas anteriores:

   ```
   ### E001, YYYY-MM-DD

   O que muda: <uma frase em prosa, do ponto de vista do comportamento>
   Motivo: <o pedido do usuário, reescrito com clareza>
   Arquivos previstos: <lista curta>
   ```

Escrita atômica, tempfile mais rename, UTF-8 sem BOM.

## Implementação

1. Implemente a emenda, apenas ela
2. Não aproveite a passagem para melhorar código adjacente, formatação ou comentários vizinhos
3. Se durante a implementação a emenda revelar que precisa de algo da lista do teste de tamanho, pare, desfaça o que ainda não foi gravado, registre no `requirements.md` uma linha `Interrompida: <motivo>` sob o ID da emenda, e mande o usuário para `/reversa-requirements`

## Fechamento

Na ordem, depois da implementação:

1. `feature-dir/actions.md`: acrescente a ação já concluída ao final, na seção `## Emendas` (crie a seção se não existir, com o mesmo cabeçalho de tabela das fases: `ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status`). Uma linha de tabela por emenda, no formato:

   ```
   | E001 | <descrição curta> | - | - | `<caminho>` | 🟢 | `[X]` |
   ```

   A ação nasce fechada. Jamais deixe `[ ]` para trás, o `/reversa-sync` passa a alertar sobre trabalho que já terminou e o `/reversa-forward` volta a classificar a feature como `coding-em-progresso`
2. `feature-dir/legacy-impact.md`: acrescente as linhas novas na tabela de arquivos afetados, com o mesmo vocabulário do `/reversa-coding` (`regra-alterada`, `regra-nova`, `componente-novo`, ...) e severidade alinhada com o `/reversa-audit`. Append, jamais rewrite do arquivo
3. `feature-dir/progress.jsonl`: acrescente uma linha por emenda, append-only:

   ```json
   {"ts":"2026-05-05T16:30:00Z","action":"E001","status":"done","files":["src/x/y.js"]}
   ```

Se a emenda mexeu em regra 🟢 do `_reversa_sdd/domain.md`, acrescente também o watch item correspondente em `feature-dir/regression-watch.md`, reciclando a numeração `W001`, `W002`, ... já existente. Se não mexeu, não invente item.

## Ganchos Pós-execução

Aplique `after-add` da forma padrão.

## Relatório final ao usuário

1. ID e resumo de cada emenda aplicada
2. Emendas recusadas, com o teste que falhou
3. Caminho absoluto de `requirements.md`, `actions.md`, `legacy-impact.md` e `progress.jsonl`
4. Arquivos de código tocados

Termine com:

> Digite **CONTINUAR** para prosseguir com `/reversa-sync` (convergência da entrega na extração) ou chame `/reversa-add` de novo para a próxima emenda.

## Regra absoluta

**Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto além do necessário para a emenda aprovada.**
Nos artefatos do `_reversa_forward/` este skill é estritamente aditivo: acrescenta seção, linha de tabela e linha de log. Nunca reescreve corpo de `requirements.md`, nunca reordena `actions.md`, nunca regrava `legacy-impact.md` inteiro. Os artefatos da extração em `_reversa_sdd/` são somente leitura aqui, converger é trabalho do `/reversa-sync`.

## Política de edição do legado

Gate aprovado não substitui a política: antes de aplicar qualquer parte da emenda que toque arquivo fora das pastas próprias do Reversa, leia `.reversa/reversa-config.json` e obedeça (releia a cada ativação):

- Ausente, inválido ou `allowLegacyEdits: false`: NÃO aplique a emenda no código do projeto. Informe o caminho recusado, o estado atual da config e o que o usuário deve editar para liberar (o registro da emenda nos artefatos de `_reversa_forward/` pode ser feito normalmente).
- `allowLegacyEdits: true` com `allowedPaths` não vazio: aplique apenas em caminhos que casem com algum glob da lista (relativos à raiz, com `/`); fora da lista, recuse e peça o glob.
- `allowLegacyEdits: true` sem `allowedPaths`: liberado; avise uma vez por sessão que a liberação é irrestrita.
- NUNCA crie ou edite `.reversa/reversa-config.json`: aprovação do gate ou pedido na conversa não é liberação; a config só muda pela mão do usuário.
- Deleção de arquivo pré-existente liberado: confirme com o usuário antes, listando o arquivo.
