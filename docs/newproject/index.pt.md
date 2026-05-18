# Code New Project Agents

O time **Code New Project Agents** é a contraparte greenfield do time de Descoberta. Enquanto o Discovery responde *o que o legado existente faz?*, o time de Projeto Novo responde *o que vamos construir do zero e quais specs comprovam isso?*.

O pipeline parte de uma ideia em uma linha e chega a um conjunto completo de specs SDD, prontas para entrar no ciclo dos Code Forward Agents.

Pré-marcado no instalador.

---

## Quando usar

Você tem uma ideia, mas ainda não tem código. Pode ser uma frase ("quero que o usuário exporte faturas em PDF"), pode ser um parágrafo. Você quer pensar o produto antes de abrir a IDE: validar o problema, desenhar as personas, escrever um PRD e quebrar o PRD em specs SDD que um agente de IA consiga implementar.

Ative com:

```
/reversa-new
```

O orquestrador coleta o brief, conduz os quatro agentes funcionais em ordem fixa, salva checkpoint entre cada um e pede `CONTINUAR` antes de avançar. Se a sessão for interrompida, basta digitar `/reversa-new` de novo: ele lê `state.json#newproject_progress` e retoma exatamente de onde parou.

---

## Pipeline

```
/reversa-new              (orquestrador)
       │
       ▼
/reversa-ideator          → _reversa_sdd/ideation.md
       │
       ▼ CONTINUAR
/reversa-researcher       → _reversa_sdd/personas.md
       │
       ▼ CONTINUAR
/reversa-drafter          → _reversa_sdd/prd.md
       │
       ▼ CONTINUAR
/reversa-spec-sdd         → _reversa_sdd/sdd/<componente>.md
       │
       ▼
handoff: sugere /reversa-forward
```

O agente Spec SDD é uma versão **vendored** da skill global `sdd-spec`, adaptada para viver dentro do Reversa: lê `prd.md`, escreve em `_reversa_sdd/sdd/`, marca cada artefato com selo 🟡 (planejado) e, ao concluir, faz handoff para o pipeline Forward.

---

## Onde os artefatos ficam

O time escreve apenas dentro de `_reversa_sdd/` (a mesma pasta usada pelo Discovery). Specs greenfield convivem com specs de legado sem conflito porque os nomes dos arquivos são distintos.

```
<seu-projeto>/
└── _reversa_sdd/
    ├── newproject-brief.md      (orquestrador)
    ├── ideation.md              (Ideator)
    ├── personas.md              (Researcher)
    ├── prd.md                   (Drafter)
    └── sdd/
        └── <componente>.md      (Spec SDD)
```

O estado do orquestrador fica em `.reversa/state.json` sob a chave `newproject_progress`, com `stage`, `started_at`, `last_checkpoint_at`, `completed_stages` e o `brief` truncado.

---

## Re-execução

Quando o pipeline já está em andamento e você digita `/reversa-new` de novo, o orquestrador detecta o `stage` salvo e oferece quatro opções:

1. **Continuar de onde parou** (recomendado)
2. **Recriar tudo do zero** (sobrescreve artefatos, exige confirmação explícita)
3. **Re-executar a partir de um agente específico** (submenu com os quatro agentes)
4. **Cancelar**

O orquestrador nunca decide sozinho: toda sobrescrita exige `sim` explícito.

---

## Próximos passos

- [Os agentes do greenfield](agentes.md): o que cada agente faz, entradas e saídas.
- [Code Forward Agents](../forward/index.md): o próximo passo natural depois que o Spec SDD termina.
