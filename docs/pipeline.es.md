# Pipeline de análisis

Reversa transforma un sistema heredado en especificaciones ejecutables en 5 fases.

---

## Visión general

```
Fase 1          Fase 2        Fase 3              Fase 4        Fase 5
Reconocimiento  Excavación    Interpretación      Generación    Revisión
   Scout        Archaeologist    Detective           Writer      Reviewer
                               Architect
```

**Agentes independientes** que corren en cualquier fase: **Visor**, **Data Master**, **Design System**

---

## Fase 1: Reconocimiento

**Agente:** Scout

El Scout hace el primer tour del proyecto. Como un agente inmobiliario visitando una propiedad por primera vez: no abre cajones, no lee todos los documentos, solo mapea el territorio.

---

Cuando el Scout termina, Reversa presenta su resumen y pregunta el **nivel de documentación** (`doc_level`): esencial, completo o detallado. La elección define qué artefactos generará cada agente en las fases siguientes — consulta [Cómo usar](uso.md#nivel-de-documentación) para la tabla completa.

---

## Fase 2: Excavación

**Agente:** Archaeologist

El Archaeologist excava el código módulo por módulo. Con paciencia y precisión, cataloga cada artefacto: funciones, algoritmos, estructuras de datos, flujos de control. Sin interpretaciones. Solo describe con precisión lo que hay.

**Importante:** el Archaeologist analiza un módulo por sesión, a propósito. Intentar analizarlo todo de una vez consume contexto y reduce la calidad del análisis.

---

## Fase 3: Interpretación

**Agentes:** Detective + Architect

**El Detective** es el Sherlock Holmes del equipo. Mira lo que el Archaeologist catalogó y pregunta: *"¿Por qué está esto aquí? ¿Quién tomó esta decisión? ¿Qué revela el historial de git?"* Extrae reglas de negocio implícitas, ADRs retroactivos, máquinas de estado y matrices de permisos.

**El Architect** es el cartógrafo. Sintetiza todo en documentación arquitectónica formal: diagramas C4, ERD completo, mapa de integraciones y deuda técnica.

---

## Fase 4: Generación

**Agente:** Writer

El Writer transforma todo lo descubierto en contratos formales: specs SDD por componente, specs OpenAPI para las APIs, user stories para los flujos de usuario. Cada afirmación se marca con la [escala de confianza](escala-confianca.md). Genera un archivo a la vez, con tu aprobación antes de continuar.

---

## Fase 5: Revisión

**Agente:** Reviewer

El Reviewer intenta romper las specs: busca contradicciones internas, conflictos entre specs, afirmaciones marcadas como 🟢 que son inferencias, comportamientos obvios no especificados. Luego recopila las brechas 🔴 y las presenta como preguntas para validación humana.

---

## Agentes independientes

| Agente | Cuándo usar |
|--------|-------------|
| **Visor** | Cuando tengas screenshots del sistema disponibles |
| **Data Master** | Cuando haya DDL, migrations o modelos ORM disponibles |
| **Design System** | Cuando haya archivos CSS, temas o screenshots de interfaz |
| **Soul Extractor** | Justo después del Scout, para una Spec ejecutiva única (`soul.md`) con propósito, entidades centrales y decisiones fundadoras |

---

## Correr el pipeline sin paradas

`/reversa-autonomous` ejecuta esas mismas 5 fases, con los mismos agentes, los mismos checkpoints y la misma escala de confianza. La diferencia está en *cuándo* pregunta.

El flujo normal reparte las preguntas por el camino: datos de instalación al inicio, nivel de documentación después del Scout, organización de las specs antes del Writer. El modo autónomo concentra todas en una **entrevista única al comienzo**, saltando lo que ya esté respondido en `.reversa/state.json` o `.reversa/config.toml`. Tras esa entrevista corre hasta el final, deteniéndose solo ante una lista cerrada de situaciones que realmente requieren un humano.

Fue diseñado para sesiones sin supervisión, con aprobación automática de herramientas (modo YOLO de Claude Code o equivalente), así que las barreras son más estrictas de lo habitual: la escritura queda restringida a `.reversa/` y la carpeta de salida, y ningún comando destructivo o de efecto externo (borrar, `git push`, publicar, instalar dependencias) se ejecuta por cuenta propia. Lo ambiguo fuera de las carpetas de Reversa queda intacto y se reporta en el resumen final.

Los checkpoints se guardan igual que en el flujo normal, así que una ejecución autónoma interrumpida puede retomarse tanto con `/reversa` como con `/reversa-autonomous`.
