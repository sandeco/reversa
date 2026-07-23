---
name: reversa-image-prompt-json
description: Cria prompts JSON estruturados para geração de imagens com estética luxuosa e cinematográfica (foto de produto, comida, cosmético, joia, moda). Use com "prompt para imagem", "gerar imagem de produto", "foto de produto com IA", "prompt para Midjourney/DALL-E/Flux", "montar prompt JSON de imagem".
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: image-prompt-builder
---

# Image Prompt Builder

Skill para construir prompts JSON estruturados para geração de imagens de produtos com
estética cinematográfica e luxuosa — otimizada para **Nano Banana 2 (Gemini 3.1 Flash Image)**
via **Google Antigravity**, com suporte a todos os parâmetros nativos do modelo.

---

## Fluxo obrigatório

Ao ser ativada, esta skill deve **SEMPRE** seguir estas etapas em ordem:

1. **Entrevista guiada** — Coletar informações do usuário por blocos
2. **Confirmação** — Mostrar resumo e pedir aprovação
3. **Geração do JSON** — Montar o prompt estruturado final

---

## ETAPA 1 — Entrevista guiada por blocos

Colete as informações em **3 rodadas de perguntas**, nunca tudo de uma vez.

---

### Rodada 1 — Produto e Cena

Pergunte ao usuário:

> "Vamos montar seu prompt de imagem! Preciso entender o produto primeiro. Me conta:"

1. **Tipo de produto**: O que é o produto? (ex: bolo de chocolate, frasco de perfume, tênis, shake, joia...)
2. **Nome da marca**: Tem marca visível? Se sim, qual é o nome?
3. **Aparência do produto**: Descreva a cor, textura, acabamento, forma. Quanto mais detalhe, melhor.
4. **Elementos extras**: Tem acompanhamentos? (frutas, gelo, flores, folhas, reflexos...)
5. **Tipo de cena**: Qual é o clima geral da imagem?
   - Opções sugeridas: luxuoso e cinematográfico / clean e minimalista / dramático e contrastado / quente e aconchegante / futurista e tecnológico

---

### Rodada 2 — Composição e Ação

> "Ótimo! Agora me conta sobre o visual dinâmico da imagem:"

6. **Ação principal**: O produto está estático ou tem movimento? (ex: líquido explodindo, partículas suspensas, fumaça, splash, corte revelando interior...)
7. **Elementos suspensos no ar**: Quais elementos voam ao redor do produto? (ex: gotas, pó, fragmentos, folhas, cristais, bolhas...)
8. **Superfície de apoio**: Onde o produto está? (ex: mármore branco polido, pedra preta fosca, madeira rústica, vidro transparente, superfície abstrata...)
9. **Ângulo da câmera**: Como a câmera filma o produto?
   - Opções: ângulo baixo (dominância) / nível dos olhos / levemente acima / macro extremo / ângulo 3/4

---

### Rodada 3 — Iluminação, Cores e Especificações Técnicas

> "Quase lá! Agora a parte visual e técnica:"

10. **Estilo de iluminação**: Como você quer a luz?
    - Opções: estúdio clean e brilhante / dramático com sombras / luz natural suave / luz de produto de luxo com rim light / luz néon colorida

11. **Paleta de cores do fundo**: Qual cor/gradiente domina o fundo? (ex: preto carvão com bokeh âmbar, gradiente rosa para champanhe, azul escuro para branco...)

12. **Cores de destaque (accents)**: Quais cores surgem nos elementos ao redor? (ex: dourado, prata, vermelho vivo, tons pastéis...)

13. **Resolução**: Qual nível de qualidade você precisa?
    - `512px` — iteração rápida / testes
    - `1K` — redes sociais e uso digital
    - `2K` — conteúdo profissional
    - `4K` — produção máxima / impressão

14. **Aspect Ratio**: Qual proporção da imagem? (padrão: `16:9`)
    - `16:9` — widescreen (padrão) ✅
    - `1:1` — quadrado (Instagram feed)
    - `9:16` — vertical (Stories, Reels, TikTok)
    - `4:3` — clássico
    - `3:4` — retrato
    - `4:1` / `1:4` — banner horizontal / vertical
    - `8:1` / `1:8` — super banner

15. **Estilo de renderização**: Fotorrealista ultra-detalhado / ilustração / 3D render / foto analógica / outro?

16. **Algo mais?**: Algum detalhe especial que você quer garantir na imagem?

---

## ETAPA 2 — Confirmação

Após coletar todas as respostas, mostre um **resumo em tópicos** para o usuário confirmar:

```
📋 RESUMO DO PROMPT:
- Produto: [tipo] — [marca]
- Aparência: [descrição]
- Cena: [tipo]
- Ação: [descrição]
- Elementos suspensos: [lista]
- Superfície: [descrição]
- Ângulo: [ângulo]
- Iluminação: [estilo]
- Fundo: [cores]
- Accents: [cores]
- Resolução: [ex: 2K]
- Aspect Ratio: [ex: 1:1]
- Renderização: [ex: ultra-photorealistic]

Está correto? Posso montar o prompt JSON agora?
```

Só avance para a Etapa 3 após confirmação do usuário.

---

## ETAPA 3 — Geração do JSON

Com as respostas confirmadas, monte o prompt seguindo **exatamente** este schema:

```json
{
  "master_prompt": {
    "scene_type": "[velocidade/estilo] [nicho] photography",
    "product": {
      "type": "[descrição rica e adjetivada do produto]",
      "brand_name": "[nome da marca ou 'no visible branding']",
      "appearance": "[cor, textura, forma, acabamento detalhados]",
      "accompaniments": [
        "[elemento 1 com descrição sensorial]",
        "[elemento 2 com descrição sensorial]"
      ]
    },
    "composition": {
      "action": "[ação dramática central capturada em movimento]",
      "surrounding_elements": [
        "[elemento suspenso 1 com detalhe de movimento]",
        "[elemento suspenso 2 com detalhe de movimento]",
        "[elemento suspenso 3 com detalhe de movimento]"
      ],
      "placement": "[posicionamento hero centralizado na superfície especificada]"
    },
    "lighting": {
      "style": "[estilo de iluminação completo]",
      "effects": [
        "[efeito de rim light]",
        "[efeito de key light]",
        "[efeito de backlight ou top light]",
        "[efeito extra se necessário]"
      ]
    },
    "color_palette": {
      "background": "[gradiente/bokeh do fundo com descrição de transição]",
      "accents": "[lista de cores de destaque separadas por vírgula]"
    },
    "technical_specs": {
      "camera": "[tipo de lente], [ângulo escolhido]",
      "shutter": "[tipo de captura — freeze-motion, long exposure, etc.]",
      "depth_of_field": "[foco principal], [descrição do blur]",
      "rendering_style": "[fotorrealista / ilustração / 3D render / foto analógica / etc.]"
    },
    "output_specs": {
      "resolution": "[512px | 1K | 2K | 4K]",
      "aspect_ratio": "16:9",
      "model": "nano-banana-2",
      "synthid_watermark": true
    }
  }
}
```

---

## Regras de qualidade do JSON

- **Adjetivos de luxo e premium** são obrigatórios em todo campo descritivo
- **Movimento congelado** deve sempre estar presente em `action` e `surrounding_elements`
- **Superfícies reflexivas** devem ser mencionadas em `placement`
- O produto é sempre o **herói centralizado** da cena
- `surrounding_elements` deve ter **mínimo 3, máximo 6 itens**
- `lighting.effects` deve ter **sempre 3 ou 4 efeitos** (rim, key, back/top + extra opcional)
- `scene_type` deve seguir o padrão: `"[adjetivo de velocidade/estilo] [nicho] photography"`
- `output_specs.resolution` deve usar os valores nativos do Nano Banana 2: `512px`, `1K`, `2K` ou `4K`
- `output_specs.aspect_ratio` deve usar os valores nativos suportados pelo modelo
- `output_specs.model` deve sempre ser `"nano-banana-2"`
- `output_specs.synthid_watermark` deve sempre ser `true` (padrão obrigatório do Google)

---

## Após gerar o JSON

Apresente o JSON formatado em bloco de código e adicione:

> 💡 **Dica de uso no Antigravity:** Cole este JSON diretamente no campo de prompt do Nano Banana 2 no Google Antigravity. Os campos `output_specs` são interpretados nativamente pelo modelo — não é necessário nenhum prefixo adicional.

Pergunte se o usuário quer ajustar algum campo, trocar o aspect ratio ou gerar variações.

---

## Exemplos de referência

Para inspiração dos padrões de linguagem, consulte `/mnt/skills/user/image-prompt-builder/references/examples.md` se disponível.
