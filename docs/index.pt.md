# Reversa

**Transforme sistemas legados em especificações executáveis por agentes de IA.**

Sabe aquele sistema que ninguém quer tocar? O que tem 10 anos, roda em produção, gera dinheiro todos os dias, mas ninguém sabe ao certo *o que ele faz* por dentro? O Reversa foi feito para ele.

---

## O que é o Reversa?

O Reversa é um framework de engenharia reversa de especificações. Você o instala dentro do projeto legado, ativa um agente de IA que já usa no dia a dia, e ele coordena um time de especialistas para analisar o código e gerar especificações completas, rastreáveis e prontas para uso por qualquer agente codificador.

**Em outras palavras:** o Reversa transforma código sem documentação em contratos operacionais que um agente de IA consegue entender e usar para evoluir o sistema com segurança.

---

## Veja em ação

[![Assistir no YouTube](https://img.youtube.com/vi/ARQBBKnfP_c/maxresdefault.jpg)](https://www.youtube.com/watch?v=ARQBBKnfP_c)

---

## Começo rápido

Na raiz do projeto legado:

```bash
npx reversa install
```

Depois, abra o projeto no seu agente de IA favorito e digite:

```
/reversa
```

Pronto. O Reversa assume o volante e guia você até o fim.

---

## O que você vai encontrar aqui

<div class="grid cards" markdown>

- **Por que o Reversa existe**

    O problema que ele resolve e por que a solução importa.

    [:octicons-arrow-right-24: Ler mais](por-que-reversa.md)

- **Instalação**

    Dois minutos e você está pronto para começar.

    [:octicons-arrow-right-24: Instalar](instalacao.md)

- **Pipeline de análise**

    As 5 fases que transformam código em especificação.

    [:octicons-arrow-right-24: Ver pipeline](pipeline.md)

- **Agentes**

    Conheça o time: 14 especialistas, cada um com sua função.

    [:octicons-arrow-right-24: Ver agentes](agentes/index.md)

</div>

---

## Garantia de segurança

!!! danger "💾 Faça backup do projeto antes de começar"
    Embora o Reversa nunca modifique seus arquivos, agentes de IA podem cometer erros. **Recomendamos fortemente:**

    1. **Versione o projeto no Git** — confirme que todos os arquivos estão commitados antes de iniciar a análise
    2. **Tenha o repositório no GitHub** (ou GitLab, Bitbucket) — para ter uma cópia remota segura
    3. **Faça uma cópia local da pasta** — um simples `cp -r meu-projeto meu-projeto-backup` protege contra qualquer imprevisto

    Se algo inesperado acontecer durante a análise, você pode restaurar o estado original com `git restore .` ou a partir da cópia de backup.

!!! warning "O Reversa nunca toca nos seus arquivos"
    Os agentes escrevem **apenas** em `.reversa/` e `_reversa_sdd/`. Nenhum arquivo do seu projeto é modificado, apagado ou sobrescrito. Nunca.

!!! info "Sem chaves de API"
    O Reversa não solicita, não armazena e não transmite chaves de API de nenhum serviço. A inteligência vem do agente que você já usa no ambiente.
