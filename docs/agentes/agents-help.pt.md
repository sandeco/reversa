# Guia com analogias

Não sabe qual agente chamar? Ativa o guia:

```
/reversa-agents-help
```

Ele explica cada agente com uma analogia do mundo real. Mas já que você está aqui, aqui vai o resumo completo:

---

## O time completo com analogias

### 🎼 Reversa: o regente de orquestra

Um regente não toca nenhum instrumento. Ele conhece a partitura inteira e diz quem entra quando, em que ordem, em que ritmo. Sem ele, cada músico tocaria sua parte sem se conectar com os outros.

> Use `/reversa` para iniciar ou retomar a análise completa. Ele cuida da sequência por você.

---

### 🗺️ Scout: o corretor de imóveis

O corretor faz o primeiro tour no imóvel. Não abre gavetas, não lê documentos, não mexe em nada. Só mapeia: quantos cômodos, qual o bairro, que instalações existem, qual o estado geral.

> Use o Scout no começo. Ele gera o inventário do projeto sem entrar na lógica do código.

---

### ⛏️ Archaeologist: o escavador

O arqueólogo escava o terreno com paciência, camada por camada. Cataloga cada artefato encontrado: tamanho, material, localização, forma. Ele não interpreta a civilização, só descreve com precisão o que está lá.

> Use o Archaeologist para analisar o código módulo a módulo. Roda um módulo por sessão para economizar tokens.

---

### 🔍 Detective: Sherlock Holmes

Sherlock Holmes chega depois do arqueólogo. Olha para os artefatos catalogados e pergunta: *"Mas por que isso está aqui? Quem colocou? O que isso revela sobre quem viveu aqui?"* Ele não escava. Ele interpreta.

> Use o Detective após o Archaeologist. Ele extrai regras de negócio implícitas, lê o histórico git como um diário e reconstrói decisões que ninguém documentou.

---

### 📐 Architect: o cartógrafo

O cartógrafo visita um território e produz mapas formais: planta baixa, mapa de elevação, planta estrutural. Alguém que nunca pisou lá consegue entender tudo olhando para os mapas.

> Use o Architect após o Detective. Ele sintetiza tudo em diagramas C4, ERD completo e mapa de integrações.

---

### 📝 Writer: o tabelião

O tabelião transforma o que foi descoberto em contratos formais, precisos e rastreáveis. Cada cláusula tem grau de certeza declarado. O documento vale como contrato: um agente de IA pode reimplementar o sistema a partir dele.

> Use o Writer após o Architect. Ele gera specs SDD, OpenAPI e user stories com rastreabilidade de código.

---

### ⚖️ Reviewer: o revisor de specs

O Reviewer pega os contratos do Writer e tenta furar: *"Isso é contradição. Esse ponto não tem prova. Essa regra some se o usuário fizer X."* Ele não quer destruir, quer garantir que o que ficou de pé seja sólido.

> Use o Reviewer após o Writer. Ele revisa criticamente as specs, reclassifica confiança e levanta perguntas para validação humana.

---

### 🖼️ Visor: o ilustrador forense

O ilustrador forense trabalha só com imagens. Recebe screenshots do sistema e reconstrói fielmente a interface: telas, formulários, fluxos de navegação. Não precisa que o sistema esteja rodando. Só das fotos.

> Use o Visor quando tiver screenshots disponíveis. Ele documenta a UI sem precisar de acesso ao sistema.

---

### 🗄️ Data Master: o geólogo

O geólogo mapeia o subsolo: a camada que ninguém vê mas que sustenta tudo. Tabelas, relacionamentos, constraints, triggers, procedures. A fundação invisível sobre a qual a aplicação está construída.

> Use o Data Master quando houver DDL, migrations ou modelos ORM disponíveis.

---

### 🎨 Design System: o estilista

O estilista cataloga o guarda-roupa: paleta de cores, tipografia, espaçamentos, tokens de design. As "regras de moda" que governam a aparência do sistema.

> Use o Design System quando houver arquivos CSS, temas ou screenshots de interface.

---

## Sequência recomendada

```
/reversa → orquestra tudo automaticamente

Ou manualmente:
Scout → Archaeologist (N sessões) → Detective → Architect → Writer → Reviewer

Opcionais em qualquer fase:
Visor · Data Master · Design System
```
