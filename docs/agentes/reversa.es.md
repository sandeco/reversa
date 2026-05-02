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

---

## Integración MCP

Reversa también se puede consultar vía MCP (`npx reversa mcp`). El servidor MCP proporciona:
- **Herramientas:** `reversa_status`, `reversa_analyze`, `reversa_confidence`
- **Recursos:** `reversa://state`, `reversa://inventory`
- **Prompt:** `reversa-new-analysis`

Úsalas para consultar estado e informes sin salir del chat del agente. El pipeline se ejecuta mediante este skill — MCP es solo para lectura de resultados.
