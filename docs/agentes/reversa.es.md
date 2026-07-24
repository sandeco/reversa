# Reversa (Orquestador)

**Comando:** `/reversa`
**Fase:** Orquestación

---

## 🎼 El director de orquesta

Un director no toca ningún instrumento. Conoce la partitura completa y dice quién entra cuándo, en qué orden, a qué ritmo. Sin él, cada músico tocaría su parte sin conectarse con los demás. Con él, todo se convierte en música.

---

## Qué hace

El orquestador central es el primero y el último en entrar en escena. No escribe código, no analiza módulos, no genera specs. Conoce la partitura completa y sabe quién necesita entrar cuándo, en qué orden y a qué ritmo.

Sin él, cada agente tocaría su parte sin conectarse con los demás. Con él, todo se convierte en música.

---

## Responsabilidades

- Verifica si hay un análisis en curso (lee `.reversa/state.json`)
- Primera sesión: crea el plan de exploración personalizado y lo presenta al usuario
- Sesiones posteriores: retoma exactamente donde se quedó
- Ejecuta los agentes del plan **secuencialmente**, uno a la vez
- Guarda checkpoints después de que cada agente termina
- Presenta un resumen breve de lo generado en cada etapa
- Avisa cuando el contexto se está agotando y guarda el estado antes de parar
- Verifica si hay una nueva versión disponible y avisa discretamente
- Tras el pipeline (o vía atajos), genera el índice `_reversa_sdd/README.md` y graba el **marco doc↔código** en `.reversa/doc-sync.json`

---

## Comandos de chat (con `/reversa` activo)

| Comando | Acción |
|---------|--------|
| `indice` | Genera/actualiza el README resumen en `_reversa_sdd/` |
| `atualizar` | Actualización incremental desde los commits del último marco |
| `atualizar [unidad]` | Mismo flujo, acotado a una unidad |
| `atualizar --baseline` | Graba el HEAD actual como marco inicial (sin reescribir specs) |
| `status` | Fase actual y lo que falta en el plan |
| `ajuda` | Lista los comandos |

El marco **no** se escribe en cada archivo de documentación: queda centralizado en `.reversa/doc-sync.json`, con historial append-only en la tabla `## Sincronização doc ↔ código` del README índice.

---

## Reglas que nunca rompe

- Nunca ejecuta múltiples agentes simultáneamente sin pedido explícito del usuario
- Nunca se desvía de la secuencia del plan aprobado sin avisar
- Nunca elimina, modifica ni sobreescribe archivos preexistentes del proyecto

---

## Cómo activar

=== "Claude Code / Cursor / Gemini CLI"
    ```
    /reversa
    ```

=== "Codex y motores sin slash commands"
    ```
    reversa
    ```
