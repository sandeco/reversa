# Os agentes do greenfield

Cinco agentes formam o time **Code New Project Agents**. O orquestrador (`/reversa-new`) conduz os outros quatro em sequência fixa. Cada agente lê o que o anterior produziu e adiciona o próprio artefato.

---

## Pipeline

```
Reversa New (orquestrador)
        │
        ▼
Ideator → Researcher → Drafter → Spec SDD
```

Há um checkpoint `CONTINUAR` entre agentes. O orquestrador nunca avança por conta própria.

---

## 1. Reversa New (orquestrador)

**Comando:** `/reversa-new`

Lê o brief inicial (passado inline ou perguntado interativamente), salva `_reversa_sdd/newproject-brief.md`, conduz os quatro agentes funcionais em ordem fixa e grava checkpoint em `state.json#newproject_progress` após cada estágio.

Detecta re-execução: se já existe pipeline em andamento, pergunta se quer continuar, recriar ou re-executar a partir de um agente específico.

**Produz:** `_reversa_sdd/newproject-brief.md` e o estado do orquestrador em `state.json#newproject_progress`.

---

## 2. Ideator

**Comando:** `/reversa-ideator`

Brainstorm estruturado com seis perguntas divergentes: problema raiz, valor entregue, alternativas, público-alvo bruto, métricas de sucesso, premissas perigosas. Faz uma pergunta por vez (quando a engine não suporta agrupar bem), aguarda a resposta antes de seguir e nunca colapsa as perguntas em um único prompt.

**Produz:** `_reversa_sdd/ideation.md`.

---

## 3. Researcher

**Comando:** `/reversa-researcher`

Transforma o público-alvo bruto do `ideation.md` em 1 a 3 personas estruturadas com jornadas (entrada, fricção, desfecho). O usuário escolhe quantas personas; o agente só sugere com base na amplitude da descrição do público.

**Produz:** `_reversa_sdd/personas.md`.

---

## 4. Drafter

**Comando:** `/reversa-drafter`

Sintetiza ideation e personas em um PRD completo: problema, métricas de sucesso, escopo, não-objetivos, restrições, riscos, perguntas em aberto. Atua como sintetizador, não entrevistador: extrai tudo que consegue das duas fontes e faz no máximo duas perguntas de cobertura para preencher os gaps mais críticos. O que ficar indefinido é marcado com `🟡 [INDEFINIDO, validar com usuário]`.

**Produz:** `_reversa_sdd/prd.md`.

---

## 5. Spec SDD

**Comando:** `/reversa-spec-sdd`

Decompõe o PRD em componentes lógicos e escreve uma spec SDD por componente, com score automático de qualidade (0 a 100) e análise de gaps. A metodologia é **RFC Pragmático mais LLM-First**: estruturada como um RFC (Problem / Goals / Design / Edge Cases), mas otimizada para ser consumida por humanos e por agentes de IA.

Esse agente é uma versão **vendored** da skill global `sdd-spec`: vive nativamente dentro do Reversa, lê `prd.md` como fonte primária, escreve em `_reversa_sdd/sdd/`, marca cada spec com o selo 🟡 (planejado) e, ao concluir, faz handoff para `/reversa-forward`.

Também pode ser usado de forma avulsa: avaliando uma spec existente ou gerando uma spec única a partir de qualquer entrada que o usuário forneça.

**Produz:** `_reversa_sdd/sdd/<componente>.md` (um por componente).

---

## Execução manual

Você quase nunca precisa chamar um agente isolado. `/reversa-new` orquestra tudo. Mas se um agente falhou ou você quer refazer um estágio:

```
/reversa-new                    # detecta pipeline em andamento, oferece Continuar / Recriar / Re-executar
/reversa-ideator                # avulso, lê newproject-brief.md
/reversa-researcher             # avulso, lê ideation.md
/reversa-drafter                # avulso, lê ideation.md mais personas.md
/reversa-spec-sdd               # avulso, lê prd.md ou qualquer fonte passada pelo usuário
```

Cada agente avulso verifica suas próprias precondições e aborta com uma mensagem clara apontando o artefato que está faltando.
