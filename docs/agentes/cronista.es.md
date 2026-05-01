# Chronicler

El agente que impide que el código nuevo se vuelva legado.

## Qué hace

El Chronicler cierra el ciclo de feedback entre las specs generadas por Reversa y los cambios diarios de código. Funciona en dos modos — antes de un cambio (briefing solo lectura) y después (actualiza specs, changelog y el dashboard de drift).

## Por qué existe

Reversa genera specs a partir del código legado existente. Pero el código sigue cambiando, y las specs envejecen en semanas. Sin un guardián, las specs se desincronizan y se vuelven tan inútiles como la documentación ausente que Reversa vino a resolver.

El Chronicler es ese guardián. Trata las specs como **fuentes de verdad activas**, no snapshots.

---

## Dos modos

### `before <descripción-o-archivos>`

Briefing solo lectura. Úsalo **antes** del cambio.

```
/reversa-chronicler before lib/auth/login.js
/reversa-chronicler before "voy a agregar rate limiting al login"
```

El agente:
1. Lee `_reversa_sdd/traceability/code-spec-matrix.md` para identificar specs que cubren los archivos afectados
2. Lee solo esas specs (consciente de tokens)
3. Presenta contratos, invariantes y reglas de negocio que el cambio debe respetar
4. Pregunta si tu cambio planeado los respeta
5. No escribe nada — puramente informativo

### `after`

Modo predeterminado si hay cambios sin commitear o eventos en cola. Úsalo **después** del cambio.

```
/reversa-chronicler after
/reversa-chronicler
```

El agente:
1. Recolecta archivos modificados de `git diff HEAD` y (si hay hooks) `.reversa/chronicler-queue.json`
2. Mapea archivos a specs impactadas vía `code-spec-matrix.md`
3. Hace 3 preguntas: **Por qué** el cambio, **breaking change**, **contexto extra**
4. Actualiza cada spec impactada in-place, reclasifica confianza (🟢/🟡/🔴)
5. Append en `<output_folder>/changelog/YYYY-MM-DD.md`
6. Actualiza `<output_folder>/drift.md`
7. Limpia entradas procesadas de la cola

---

## Salidas

| Archivo | Cuándo |
|---|---|
| `_reversa_sdd/changelog/YYYY-MM-DD.md` | Modo `after`, siempre |
| `_reversa_sdd/sdd/[componente].md` | Modo `after`, in-place si impactado |
| `_reversa_sdd/traceability/code-spec-matrix.md` | Modo `after`, con archivos nuevos/eliminados |
| `_reversa_sdd/drift.md` | Modo `after`, siempre (dashboard) |
| `.reversa/state.json` | Modo `after`, checkpoint |

---

## Trigger manual vs automatizado

Manual: `/reversa-chronicler` funciona en cualquier engine sin setup.

Automatizado: instala hooks vía [`npx reversa add-hooks`](../hooks.es.md). Los hooks encolan eventos para que el agente los procese después.

---

## Cuándo NO ejecutar

- Sin `_reversa_sdd/`: corre `/reversa` primero
- Sin `code-spec-matrix.md`: corre `/reversa-architect` primero
- Sin cambios de código: nada que hacer

---

## Integración

El Chronicler complementa al Reviewer (validación inicial), Archaeologist (análisis profundo) y Architect (síntesis). Cuando detecta cambios que afectan más de 5 specs o tocan entry points / schemas, sugiere escalar a esos agentes.
