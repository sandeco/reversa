# Agentes

Reversa coordina **9 Teams especializados** de agentes. Cada agente hace una cosa y la hace bien; cada Team agrupa a los agentes en torno a una fase del trabajo.

---

## Los 9 Teams

| Team | Función | En el instalador |
|------|---------|------------------|
| **Reversa Agents Core** | Descubrimiento y orquestación del legado: mapea, excava, interpreta y documenta. Detallado en las tablas siguientes. | Siempre instalado |
| **Code New Project Agents** | Pipeline greenfield, desde una idea en una línea hasta specs SDD. Ver [Code New Project Agents](../newproject/index.md). | Marcado por defecto |
| **Code Forward Agents** | Llevan adelante la entrega desde las specs: requirements, plan, to-do, audit, quality, coding. Ver [Code Forward Agents](../forward/index.md). | Marcado por defecto |
| **Migration Agents** | Convierten las specs del legado en un plan de reconstrucción en un stack moderno. Ver [Migración](../migracao/index.md). | Marcado por defecto |
| **Pricing and Size Agents** | Estiman esfuerzo, tamaño y precio sobre las specs. Ver [Pricing](../pricing/index.md). | Marcado por defecto |
| **Documentation Team** | Renderiza el conocimiento extraído como mini-sitio HTML autocontenido. Ver [Equipo de Documentación](../documentation/index.md). | Marcado por defecto |
| **Bug Agents** | Rastrea, debate y corrige defectos con trazabilidad causal hasta las specs. Ver [Bug Agents](../bugs/index.md). | Siempre instalado |
| **Code Quality Agents** | Mejoran el código existente sin cambiar el comportamiento: refactorizan, modularizan, desacoplan, optimizan, simplifican, estandarizan, eliminan código muerto. Ver [Code Quality Agents](../refactor/index.md). | Marcado por defecto |
| **Translators N8N->Specs->Python** | Adaptadores que transforman artefactos estructurados (p. ej. un workflow N8N) en specs. Ver [N8N Translator](n8n.md). | Desmarcado |

Las tablas siguientes detallan los agentes que componen el Team **Reversa Agents Core**.

---

## Agentes obligatorios

| Agente | Fase | Analogía | Función |
|--------|------|----------|---------|
| [Reversa](reversa.md) | Orquestación | El director de orquesta | Coordina todos los agentes, guarda checkpoints, guía al usuario |
| [Scout](scout.md) | Reconocimiento | El agente inmobiliario | Mapea la superficie: carpetas, lenguajes, frameworks, dependencias |
| [Archaeologist](arqueologo.md) | Excavación | El excavador | Análisis profundo módulo a módulo: algoritmos, flujos, estructuras de datos |
| [Detective](detetive.md) | Interpretación | Sherlock Holmes | Extrae reglas de negocio implícitas, ADRs, máquinas de estado, permisos |
| [Architect](arquiteto.md) | Interpretación | El cartógrafo | Sintetiza todo en diagramas C4, ERD y mapa de integraciones |
| [Writer](redator.md) | Generación | El notario | Genera specs SDD, OpenAPI y user stories con trazabilidad de código |

---

## Agentes opcionales

| Agente | Analogía | Cuándo usar |
|--------|----------|-------------|
| [Reviewer](revisor.md) | El revisor de specs | Después del Writer: revisa specs críticamente y valida brechas |
| [Visor](visor.md) | El ilustrador forense | Cuando tengas screenshots del sistema disponibles |
| [Data Master](data-master.md) | El geólogo | Cuando haya DDL, migrations o modelos ORM disponibles |
| [Design System](design-system.md) | El estilista | Cuando haya archivos CSS, temas o screenshots de interfaz |
| [Soul Extractor](extract-soul.md) | El ensayista | Justo después del Scout, para una Spec ejecutiva única (`soul.md`) con propósito, entidades centrales y decisiones fundadoras |
| [Agents Help](agents-help.md) | El guía turístico | Cuando quieras cada agente de Reversa explicado con analogías |
| [Reconstructor](reconstructor.md) | El albañil | Cuando quieras reconstruir el software de abajo hacia arriba desde las specs generadas, una tarea a la vez |
| **Autonomous** | El turno de noche | Cuando nadie va a supervisar: ejecuta toda la secuencia de `/reversa` de punta a punta, con una entrevista única al inicio |

---

## Modo autónomo

`/reversa-autonomous` hereda el orquestador `reversa`: mismo plan, misma secuencia de agentes, mismos checkpoints y misma escala de confianza. La diferencia está en *cuándo* pregunta. Toda decisión que el flujo normal reparte por el camino (datos de instalación, nivel de documentación, organización de las specs) se concentra en una **entrevista única al inicio**; las preguntas ya respondidas en `state.json` o `config.toml` no se repiten.

Fue diseñado para sesiones con aprobación automática de herramientas (modo YOLO de Claude Code o equivalente). Como no hay un humano aprobando cada acción, las barreras son más estrictas: la escritura queda restringida a `.reversa/` y la carpeta de salida, ningún comando destructivo o de efecto externo (borrar, `git push`, publicar, instalar) se ejecuta por cuenta propia, y lo ambiguo fuera de las carpetas de Reversa se deja intacto y se reporta al final.

Tras la entrevista solo se detiene ante una **parada legítima**: una lista cerrada de situaciones que realmente requieren un humano. El resto corre hasta el final.

---

## Traductores (adaptadores de entrada)

Use cuando el "código" heredado no sea código fuente, sino un artefacto estructurado como un workflow visual. Generan una spec SDD y preparan el estado para que el pipeline principal continúe.

| Agente | Analogía | Cuándo usar |
|--------|----------|-------------|
| [N8N Translator](n8n.md) | El traductor jurado | Cuando tengas un workflow N8N exportado en JSON y quieras documentarlo como spec o portar a Python |

---

## Secuencia recomendada

```
/reversa             → orquesta todo automáticamente, con pausas entre agentes
/reversa-autonomous  → misma secuencia, entrevista única al inicio, sin paradas intermedias

O manualmente:
Scout → Archaeologist (N sesiones) → Detective → Architect → Writer → Reviewer

Opcionales en cualquier fase:
Visor · Data Master · Design System
```
