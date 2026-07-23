---
name: reversa-arquitetura-3d
description: Cria visualizações 3D interativas de arquitetura de software com Three.js, gerando HTML standalone navegável por câmera livre a partir de JSON de módulos e dependências. Use com "arquitetura 3D", "code city", "cidade de código", "dependency graph 3D", "call graph 3D", "tour pela arquitetura".
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: 3d-renderer
---

# Arquitetura 3D

Cria visualizações 3D de **arquitetura de software** usando Three.js. Gera sempre **HTML standalone** (arquivo único, self-contained) com cena 3D interativa, controles de câmera (mouse, touch, teclado), sidebar de parâmetros e botão de exportar a viewport como PNG.

A skill cobre cinco modos visuais consagrados em visualização de software, cada um com referência dedicada em `references/`:

| Modo | Quando usar | Referência |
|------|-------------|------------|
| **Code City** | Visão geral de tamanho/complexidade de cada arquivo, padrão "cidade de código" | `references/CODE_CITY.md` |
| **Dependency Graph 3D** | Grafo de dependências com força repulsiva, nós em 3D | `references/DEPENDENCY_GRAPH_3D.md` |
| **Layer Stack** | Camadas arquiteturais (UI / Domain / Infra) empilhadas com setas de fluxo | `references/LAYER_STACK.md` |
| **Call Graph 3D** | Árvore de chamadas explorável em profundidade | `references/CALL_GRAPH_3D.md` |
| **Architecture Tour** | Câmera animada percorrendo a cena com overlay narrativo | `references/ARCH_TOUR.md` |

Padrões compartilhados de Three.js, lighting, controles e performance vivem em `references/THREE_PATTERNS.md`. Cenários de erro e tratamento em `references/ERRORS.md`.

## Fluxo de Trabalho

### 1. Receber os dados

Os dados podem vir de:

- **JSON inline**: usuário fornece `modules.json` (lista de módulos) e/ou `deps.json` (grafo de dependências).
- **Caminho de arquivo**: usuário aponta para JSONs em `_reversa_docs/assets/data/` (gerados pelo agente `/reversa-documentation`).
- **Solicitado ao usuário**: se a skill é invocada sem dados, perguntar caminho ou pedir colagem inline.

**Schema esperado de `modules.json`**:

```json
[
  {
    "name": "src/auth/login.ts",
    "folder": "src/auth",
    "loc": 142,
    "complexity": 8,
    "type": "code"
  }
]
```

**Schema esperado de `deps.json`** (orientado):

```json
{
  "nodes": [{ "id": "src/auth/login.ts" }, { "id": "src/auth/jwt.ts" }],
  "edges": [{ "from": "src/auth/login.ts", "to": "src/auth/jwt.ts", "weight": 1 }]
}
```

### 2. Escolher o modo

Se o usuário especificou o modo, usar aquele. Se não, **sugerir 2 ou 3 opções** com base nos dados:

| Tipo de dado | Modos recomendados |
|--------------|--------------------|
| `modules.json` com LOC + complexidade | Code City (padrão), Layer Stack se houver pastas/camadas claras |
| `deps.json` com muitas arestas | Dependency Graph 3D, Code City colorindo hot path |
| Trace de execução ou call graph | Call Graph 3D |
| Pedido explícito de apresentação | Architecture Tour combinando duas das anteriores |

Quando o número de nós ultrapassa **500**, aplicar **agrupamento por pasta** automaticamente e avisar o usuário (registrar a decisão no rodapé do HTML gerado).

### 3. Gerar o código

Consultar `references/THREE_PATTERNS.md` para setup base (renderer, cena, câmera, iluminação, OrbitControls). Consultar a referência específica do modo escolhido para o algoritmo de layout e materiais.

**Regras fundamentais**:

1. **HTML standalone**: arquivo único `.html` com tudo embutido (CSS, JS, dados inline em `<script id="data">`). Quando rodada pelo Time Reversa Docs, os dados vêm de `window.RV_DATA.modules` e `window.RV_DATA.deps` (carregados pelo `assets/js/data.js` que o Publisher gera) e o `<script id="data">` fica vazio ou ausente. Páginas finais **nunca** fazem `fetch()` para arquivos locais (quebra via `file://`).
2. **Three.js local**: usar `<script src="assets/vendor/three.min.js"></script>` apontando para o arquivo baixado pelo Publisher (versão pinada em `agents/reversa-docs-publisher/references/vendor-pins.yaml`, hoje `three@0.147.0` IIFE). Em modo invocação isolada fora do time Docs, aceite CDN como fallback (`https://unpkg.com/three@0.147.0/build/three.min.js`), mas **nunca** misture versões.
3. **OrbitControls local**: usar `<script src="assets/vendor/OrbitControls.js"></script>` (também IIFE, compatível com `three@0.147`). Não use `examples/jsm/...` enquanto a skill não migrar para importmap + ESM.
4. **Renderer**: WebGLRenderer com antialiasing, pixelRatio do device.
5. **Iluminação**: HemisphereLight + DirectionalLight com sombras suaves. Para Code City, AmbientLight extra para preencher.
6. **Câmera**: PerspectiveCamera, posição inicial olhando o centro da cena de cima e levemente angulada. Distância derivada do tamanho da cena.
7. **Performance**: usar `InstancedMesh` quando há mais de 200 elementos do mesmo tipo. Limite máximo de 5.000 prédios no Code City sem agrupamento.
8. **Responsividade**: handler de resize redimensiona renderer e ajusta aspect ratio da câmera.
9. **Sidebar**: lado direito, controles sliders/checkboxes/botões em layout vertical. Cada controle tem ID estável para `localStorage`.
10. **Exportar PNG**: botão captura o canvas via `renderer.domElement.toBlob()`.

### 4. Estrutura do HTML gerado

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arquitetura 3D | <!-- PROJECT_NAME --></title>
    <script src="assets/vendor/three.min.js"></script>
    <script src="assets/vendor/OrbitControls.js"></script>
    <script src="assets/js/data.js"></script>
    <style>
        body { margin: 0; overflow: hidden; font-family: system-ui, sans-serif; }
        #scene { position: fixed; inset: 0; }
        #sidebar { position: fixed; top: 0; right: 0; width: 280px; height: 100vh; padding: 16px; background: rgba(15,15,20,0.85); color: #eaeaea; overflow-y: auto; }
        #loader { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; background: #0a0a10; color: #eaeaea; }
        /* Estilo Reversa: variantes derivam de data-style do <body> via CSS externo do agente */
    </style>
</head>
<body data-style="exploratory">
    <div id="loader">Carregando cena 3D...</div>
    <canvas id="scene"></canvas>
    <aside id="sidebar">
        <h3>Controles</h3>
        <!-- SIDEBAR_CONTROLS -->
        <button id="reset">Reset</button>
        <button id="export-png">Exportar PNG</button>
    </aside>
    <script id="data" type="application/json"><!-- DATA_JSON --></script>
    <script>
        // OrbitControls IIFE expõe THREE.OrbitControls globalmente.
        // 1. Carregar dados de window.RV_DATA quando rodando no time Docs,
        //    ou do <script id="data"> em modo standalone.
        // 2. Configurar cena, câmera, renderer, iluminação
        // 3. Construir geometria conforme o modo (Code City, Dep Graph, etc)
        // 4. Conectar sidebar aos parâmetros da cena
        // 5. Loop de renderização e tratamento de eventos
    </script>
</body>
</html>
```

### 5. Salvar e entregar

O output é sempre HTML standalone. Salvar no caminho indicado pelo agente orquestrador (geralmente `_reversa_docs/arquitetura.html`).

Quando invocada fora do contexto do `/reversa-documentation`, perguntar caminho de destino ou usar `<modo>-<timestamp>.html` no diretório atual.

## Diretrizes de qualidade

- **Câmera intuitiva**: posição inicial mostra a cena inteira; OrbitControls com damping para movimento suave.
- **Materiais coesos**: paleta limitada (5 a 8 cores no máximo); cores carregadas indicam atributo (ex: vermelho para hot path, azul para módulos leves).
- **Labels legíveis**: usar CSS2DRenderer ou sprites; labels só aparecem em hover ou zoom acima de um threshold para não poluir.
- **Loader visível**: cena começa com overlay "Carregando cena 3D..." que some quando o `requestAnimationFrame` da primeira frame termina.
- **Fallback gracioso**: se Three.js não carregar (sem internet), mostrar mensagem "Esta visualização requer carregar a biblioteca Three.js. Conecte-se à internet e recarregue."
- **Acessibilidade básica**: navegação por teclado nos botões da sidebar; foco visível.
- **Idioma**: comentários e textos visíveis em pt-br. Sem travessão.

## Diretrizes de código

- **Modularidade**: separar criação da cena, construção da geometria e gerenciamento de interação em funções com nomes claros.
- **Sem dependências além de Three.js e OrbitControls (locais em `assets/vendor/`)**: não importar GSAP, dat.GUI, ou qualquer outra lib sem necessidade clara.
- **Constantes nomeadas no topo**: cores, sizes, thresholds em um bloco de configuração visível.
- **Dispose**: ao trocar de modo ou regenerar, chamar `geometry.dispose()` e `material.dispose()` para evitar vazamento.
- **Performance check**: antes de renderizar, contar nós; se > 5.000 sem instanced mesh, abortar e mostrar aviso.

## Tratamento de erros

Consultar `references/ERRORS.md` para cenários comuns (CDN inacessível, JSON malformado, projeto vazio, WebGL não suportado, etc).
