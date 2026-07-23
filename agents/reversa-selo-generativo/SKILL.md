---
name: reversa-selo-generativo
description: Cria selos visuais generativos seeded com p5.js, gerando HTML standalone com arte algorítmica reprodutível derivada de um hash ou string. Use com "selo", "selo generativo", "identidade visual do projeto", "hero capa", "artwork seeded", "capa reprodutível", "selo de documentação".
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: generative-seal
---

# Selo Generativo

Cria **selos visuais únicos e reprodutíveis** para projetos do Reversa usando p5.js. Cada projeto recebe seu próprio artwork generativo derivado de um seed determinístico: o mesmo seed gera o mesmo selo, sempre.

Inspirado no padrão Art Blocks (seeded randomness) e na skill `algorithmic-art` da Anthropic, mas com escopo deliberadamente menor: produz **apenas o selo**, não um manifesto filosófico, não uma plataforma de exploração. É um elemento decorativo de identidade.

## Quando usar

- **Hero da `index.html`** do mini-site gerado pelo `/reversa-documentation`.
- **Mini-selo no header** de cada página do mini-site (versão reduzida).
- **Capa de slides** no `deck.html`.
- **Identidade visual** de qualquer artefato gerado pelo Reversa que precise de uma marca distintiva.

A skill é **leve por design**: usa só p5.js, gera canvas único, exporta como SVG ou PNG. Não tem sidebar de exploração, não tem múltiplos modos, não tem animação obrigatória (animação é opcional).

## Princípios

1. **Reprodutibilidade absoluta**: mesmo seed sempre gera o mesmo selo.
2. **Paleta limitada**: 3 a 5 cores por selo, derivadas do estilo visual escolhido.
3. **Composição equilibrada**: forma central reconhecível com elementos auxiliares orbitando ou compondo.
4. **Sem texto no canvas**: o selo é puramente visual; nome do projeto e título ficam fora do canvas, em HTML.
5. **Adaptável de tamanho**: o mesmo canvas funciona em 64x64 (mini-selo header) e 800x800 (hero grande).
6. **Sem dependências além de p5.js**: nada de GSAP, dat.GUI, lodash. Só p5.

## Fluxo de Trabalho

### 1. Receber o seed

O seed pode vir de:

- **String direta**: usuário ou agente passa um hash sha256, nome do projeto, ou qualquer string.
- **Caminho de arquivo**: usuário aponta para `.reversa/soul.md`, a skill computa `sha256` do conteúdo.
- **Fallback**: se nada for fornecido, usar `sha256` do timestamp atual (selo "do momento", não reprodutível).

```javascript
async function computeSeed(input) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}
```

O seed é uma string hexadecimal de 64 caracteres. A skill extrai múltiplos números dele para alimentar parâmetros distintos.

### 2. Escolher paleta

A paleta deriva do estilo visual escolhido pelo usuário do `/reversa-documentation`, ou pode ser fornecida diretamente.

Consultar `references/PALETTE_BY_STYLE.md` para a tabela completa de paletas por estilo. As 4 paletas base são:

| Estilo | Paleta |
|--------|--------|
| `sober` | Tons neutros: cinzas, azul-petróleo, terracota leve, branco quebrado |
| `premium` | Dark mode: preto profundo, dourado, vermelho-vinho, prata, azul-meia-noite |
| `dense` | Saturados: laranja, ciano, magenta, lima, índigo |
| `exploratory` | Pastéis luminosos: rosa-aurora, ciano-glaciar, lilás-névoa, branco luz |

A escolha de qual cor é "central" e quais são "auxiliares" sai do seed.

### 3. Escolher padrão generativo

A skill tem **5 padrões consagrados**, cada um com aparência distinta. O seed determina qual padrão usar (primeiros 2 dígitos hex modulo 5):

| Padrão | Aparência | Quando combina |
|--------|-----------|----------------|
| `flow-field` | Campos de fluxo Perlin, traços orgânicos curvos | Estilo `sober`, `exploratory` |
| `particle-orbit` | Partículas orbitando um centro com trilhas | Estilo `premium`, `exploratory` |
| `crystal-lattice` | Forma cristalina simétrica, geometria limpa | Estilo `dense`, `sober` |
| `wave-interference` | Padrões de interferência tipo moiré, ondas circulares | Estilo `premium`, `dense` |
| `noise-strata` | Estratos de ruído horizontal, paisagem abstrata | Estilo `sober`, `exploratory` |

Detalhes em `references/GENERATIVE_PATTERNS.md`.

A skill pode aceitar override do padrão via parâmetro, ignorando a derivação por seed.

### 4. Gerar o código

Estrutura do HTML resultante:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Selo: <!-- PROJECT_NAME --></title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--seal-bg, #0a0a14); }
        #seal-container { display: block; }
        .label { color: var(--seal-fg, #eaeaea); text-align: center; margin-top: 16px; font-family: system-ui, sans-serif; }
    </style>
</head>
<body>
    <div>
        <div id="seal-container"></div>
        <div class="label"><!-- PROJECT_NAME --></div>
    </div>
    <script id="seal-config" type="application/json">
        <!-- CONFIG_JSON -->
    </script>
    <script>
        // 1. Ler config (seed, paleta, padrão, tamanho)
        // 2. Seedar p5.js: randomSeed(seedInt); noiseSeed(seedInt);
        // 3. Executar padrão escolhido
        // 4. Salvar canvas como referência
    </script>
</body>
</html>
```

**Regras fundamentais**:

1. **HTML standalone**: arquivo único, p5.js via CDN, nada externo.
2. **p5.js 1.9.0+**: usar `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js`.
3. **Seeded sempre**: `randomSeed(seedInt)` e `noiseSeed(seedInt)` no primeiro setup, antes de qualquer chamada a `random()` ou `noise()`.
4. **Conversão de hash hex para int**: pegar primeiros 16 chars hex, converter via `parseInt(hex.slice(0, 16), 16)`.
5. **Canvas quadrado**: tamanho default 800x800, mas parametrizável.
6. **noLoop()**: por default o selo é estático. Se animação for solicitada, usar `frameRate(30)` e algoritmo de baixo custo.
7. **Sem texto no canvas**: nome do projeto fica em `<div class="label">` fora do canvas.

### 5. Variantes de tamanho

A skill aceita parâmetro `size` para gerar selo grande (hero, 800x800), médio (capa de slide, 400x400) ou mini (header, 64x64 ou 128x128).

Em selos menores (<200px), aplicar simplificações automáticas:
- Reduzir contagem de partículas em 80%.
- Aumentar espessura de traços proporcionalmente.
- Desativar animação.

### 6. Salvar e entregar

Output é HTML standalone. O canvas pode ser exportado como PNG via botão (opcional) ou como SVG para uso em headers (recomendado para mini-selos: SVG escala perfeitamente).

```javascript
function exportSVG() {
    // Padrões compatíveis com SVG (crystal-lattice, wave-interference) podem ser regenerados como SVG real.
    // Padrões raster (flow-field denso) exportam como PNG embutido em <img>.
}
```

Para uso em outras páginas do mini-site (mini-selo no header), gerar uma vez em SVG, embutir inline no HTML do viewer template.

## Diretrizes de qualidade

- **Reconhecibilidade**: o selo deve ter uma forma central forte; quem viu uma vez deve reconhecer o projeto pelo selo.
- **Equilíbrio cromático**: nunca usar todas as cores da paleta no mesmo selo; tipicamente 1 cor dominante (60%), 1 secundária (30%), 1 acento (10%).
- **Não chamar mais atenção que o conteúdo**: o selo é identidade, não foco. Em hero grande, ok ser protagonista; em mini-selo no header, deve ceder espaço ao nome do projeto.
- **Acessibilidade**: contraste mínimo entre fundo e elementos primários. Selos com fundo escuro têm elementos claros e vice-versa.
- **Idioma**: comentários em pt-br, sem travessão.

## Diretrizes de código

- **Constantes nomeadas no topo**: tamanho, paleta, parâmetros do padrão visíveis no início.
- **Função única de geração**: cada padrão é uma função `drawFlowField()`, `drawCrystalLattice()`, etc, isolada e testável.
- **Sem efeitos colaterais globais**: tudo escopado dentro de `setup()` e `draw()` do p5.

## Tratamento de erros

Consultar `references/ERRORS.md` para cenários (p5.js indisponível, canvas não suportado, seed inválido, tamanho extremo).
