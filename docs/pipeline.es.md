# Pipeline de análisis

Reversa transforma un sistema heredado en especificaciones ejecutables en 5 fases.

Para consultas rápidas durante el desarrollo, Reversa también expone un servidor MCP (`npx reversa mcp`) que permite a los agentes verificar el estado del análisis y leer informes sin salir de la sesión de codificación. El pipeline de 5 fases y el servidor MCP son complementarios: MCP lee resultados, el pipeline los crea.

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
