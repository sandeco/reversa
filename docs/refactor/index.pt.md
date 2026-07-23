# Code Quality Agents

O Team **Code Quality Agents** melhora a estrutura interna de um sistema legado **sem alterar o comportamento observável**, e prova essa preservação antes de tocar o código. É manutenção perfectiva e preventiva sobre código que já funciona: refatoração, modularização, desacoplamento, otimização, simplificação algorítmica, padronização e remoção de código morto.

É um eixo diferente dos outros Teams: o Code Forward cria código novo, o Bug Agents corrige defeitos, o Migration troca de plataforma. Este Team melhora o que já funciona, mantendo o que funciona funcionando.

Regra fundadora: **propor uma transformação e aplicá-la são atos separados, e nada toca o legado sem prova de preservação de comportamento.**

Team opcional, marcado por padrão no instalador.

---

## Quando usar

O sistema roda, mas um trecho está difícil de ler, lento, acoplado demais, inconsistente ou cheio de código que ninguém chama, e você quer melhorar com segurança em vez de reescrever. Toda mudança fica ancorada na alma (`soul.md`) e nas regras confirmadas que o Discovery Team extraiu, e o código do legado só muda por um diff aprovado com rede de segurança comprovada.

O Team funciona melhor sobre uma extração (`_reversa_sdd/`): a alma e as specs confirmadas são o guarda-chuva que distingue um comportamento real de um acidental.

---

## Os 8 comandos

```
/reversa-refactor ──inventaria──► _reversa_refactor/<contexto>/opportunities/
      │ prioriza por ROI real (hotpath, não estética), roteia
      ▼
  estrutura    /reversa-restructure   /reversa-modularize   /reversa-decouple
  desempenho   /reversa-optimize      /reversa-simplify
  higiene      /reversa-standardize   /reversa-prune
      │ cada um: rede de segurança ──► gate (diff aprovado) ──► prova de preservação
      ▼
transformations/OPP-.../  (plan.html, diffs, evidência)  ── sempre reversível
```

| Agente | Função |
|--------|--------|
| **Refactor** | Orquestrador: lê a alma e o mapa do legado, inventaria oportunidades de melhoria, prioriza por ROI real (hotpath, não estética), roteia para o especialista certo e conduz os gates. Nunca aplica transformação. `/reversa-refactor` |
| **Restructure** | Estrutura interna no nível de método e classe pelo catálogo Fowler (extrair método, renomear, simplificar condicionais, remover duplicação), em passos pequenos e reversíveis. `/reversa-restructure` |
| **Modularize** | Divide um trecho grande em módulos menores, coesos e com responsabilidade bem definida, respeitando as fronteiras de domínio da alma. `/reversa-modularize` |
| **Decouple** | Reduz dependências diretas (inversão de dependência, costuras/seams do Feathers, quebra de ciclos), medindo o acoplamento antes e depois. `/reversa-decouple` |
| **Optimize** | Reduz tempo de execução, memória e consumo de recursos, sempre com medição antes/depois e saída preservada. `/reversa-optimize` |
| **Simplify** | Troca lógica complexa por solução mais simples e clara, com prova de equivalência de saída. O objetivo é reduzir complexidade cognitiva, não custo de recurso. `/reversa-simplify` |
| **Standardize** | Aplica convenções consistentes de nomenclatura, formatação e organização do padrão dominante do projeto. Puramente cosmético e estrutural, jamais muda semântica. `/reversa-standardize` |
| **Prune** | Remove código morto, e só o que provar ser morto (sem referência estática e sem entrada dinâmica conhecida), distinguindo morto de órfão suspeito. `/reversa-prune` |

---

## O invariante: preservação de comportamento

Refatorar muda a estrutura, nunca o comportamento observável. Este Team transforma isso em invariante provado, com três mecanismos:

- **Rede de segurança primeiro**: antes de qualquer mudança de estrutura ou lógica, o especialista verifica se há testes que fixam o comportamento atual. Sem cobertura, ele oferece gerar **testes de caracterização** (Feathers) que fixam o comportamento como está, provados verdes antes de a transformação começar. Recusada a rede, a transformação cai para vermelho e o relatório registra que foi aplicada sem prova mecânica.
- **Ancorado na alma**: toda mudança é conferida contra `soul.md` e as specs confirmadas. Nenhuma regra de negócio confirmada pode virar regra ferida, e código que implementa uma regra confirmada nunca é tratado como morto.
- **Provado, depois reversível**: após aplicar, o especialista prova que a rede de segurança segue verde (comportamento intacto), e a mudança é sempre reversível pelo diff registrado. `optimize`, `decouple` e `simplify` ainda carregam medição antes/depois ou prova de equivalência, não apenas uma afirmação.

---

## Anatomia das saídas

Tudo vive em `_reversa_refactor/`, separado da extração (`_reversa_sdd/`), da evolução (`_reversa_forward/`) e dos bugs (`_reversa_bugs/`). O trabalho é agrupado por **contexto**: a feature, módulo ou caso de uso em melhoria.

```
_reversa_refactor/
├── README.md                     o contrato do registro (modo de controle, política de rede)
└── <contexto>/                   ex.: calculo-de-frete/
    ├── opportunities/            oportunidades detectadas, uma por arquivo (verbo, alvo, ROI, confiança)
    ├── transformations/
    │   └── OPP-20260723-K4T9-extrair-regras-de-frete/
    │       ├── plan.html         plano visual, aprovado ANTES de tocar qualquer arquivo
    │       ├── safety-net/       testes de caracterização + resultado verde/vermelho
    │       ├── before-after/     medição, prova de equivalência ou prova de morte
    │       ├── CHG-NNN.diff       diffs aplicados, a fonte de reversão
    │       └── transformation.md  registro (rede de segurança, método de preservação, aprovação)
    └── generated/                índice das oportunidades e seu estado (nunca editado à mão)
```

Cada oportunidade herda a escala de confiança do Reversa (🟢 coberta e entendida, 🟡 parcial, 🔴 sem prova de comportamento) e uma estimativa de ROI. O orquestrador prioriza um hotpath de alta frequência acima de um módulo grande porém raramente executado. Quando um alvo pede mais de um verbo, o orquestrador encadeia os especialistas um por vez, cada um com seu gate.

---

## Non-destructive

Os Code Quality Agents escrevem apenas em `_reversa_refactor/`. O código do projeto muda exclusivamente por gate com diff aprovado, sempre reversível. Refatorar não é exceção à diretiva, é o caso que mais depende dela. Qualquer especialista que não conseguir provar preservação para no gate e nunca aplica em silêncio. Remover código, alterar a spec efetiva e operações destrutivas têm gate obrigatório em qualquer modo de controle.
