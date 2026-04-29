# Guía con analogías

¿No sabes qué agente llamar? Activa la guía:

```
/reversa-agents-help
```

---

## El equipo completo con analogías

### 🎼 Reversa: el director de orquesta

Un director no toca ningún instrumento. Conoce la partitura completa y dice quién entra cuándo, en qué orden, a qué ritmo. Sin él, cada músico tocaría su parte sin conectarse con los demás.

> Usa `/reversa` para iniciar o retomar el análisis completo.

---

### 🗺️ Scout: el agente inmobiliario

El agente hace el primer tour de la propiedad. No abre cajones, no lee documentos, no toca nada. Solo mapea: cuántas habitaciones, qué instalaciones existen, cuál es el estado general.

> Usa el Scout al principio. Genera el inventario del proyecto sin entrar en la lógica del código.

---

### ⛏️ Archaeologist: el excavador

El arqueólogo excava el terreno con paciencia, capa a capa. Cataloga cada artefacto encontrado: tamaño, material, ubicación, forma. No interpreta la civilización, solo describe con precisión lo que hay.

> Usa el Archaeologist para analizar el código módulo a módulo. Corre un módulo por sesión para conservar tokens.

---

### 🔍 Detective: Sherlock Holmes

Sherlock Holmes llega después del arqueólogo. Mira los artefactos catalogados y pregunta: *"¿Por qué está esto aquí? ¿Quién lo puso? ¿Qué revela sobre quién vivió aquí?"* No excava, interpreta.

> Usa el Detective después del Archaeologist. Extrae reglas de negocio implícitas, lee el historial de git como un diario y reconstruye decisiones que nadie documentó.

---

### 📐 Architect: el cartógrafo

El cartógrafo visita un territorio y produce mapas formales. Alguien que nunca estuvo allí puede entender todo mirando los mapas.

> Usa el Architect después del Detective. Sintetiza todo en diagramas C4, ERD completo y mapa de integraciones.

---

### 📝 Writer: el notario

El notario transforma lo descubierto en contratos formales, precisos y trazables. Cada cláusula tiene nivel de certeza declarado. El documento vale como contrato.

> Usa el Writer después del Architect. Genera specs SDD, OpenAPI y user stories con trazabilidad de código.

---

### ⚖️ Reviewer: el revisor de specs

El Reviewer toma los contratos del Writer e intenta hacerles agujeros. No para destruir, sino para garantizar que lo que quede sea sólido.

> Usa el Reviewer después del Writer.

---

### 🖼️ Visor: el ilustrador forense

El ilustrador forense trabaja solo con imágenes. Recibe screenshots del sistema y reconstruye fielmente la interfaz: pantallas, formularios, flujos de navegación.

> Usa el Visor cuando tengas screenshots disponibles.

---

### 🗄️ Data Master: el geólogo

El geólogo mapea el subsuelo: la capa que nadie ve pero que lo sostiene todo. Tablas, relaciones, constraints, triggers, procedures.

> Usa el Data Master cuando haya DDL, migrations o modelos ORM disponibles.

---

### 🎨 Design System: el estilista

El estilista cataloga el guardarropa: paleta de colores, tipografía, espaciados, tokens de diseño.

> Usa el Design System cuando haya archivos CSS, temas o screenshots de interfaz.

---

## Secuencia recomendada

```
/reversa → orquesta todo automáticamente

O manualmente:
Scout → Archaeologist (N sesiones) → Detective → Architect → Writer → Reviewer

Opcionales en cualquier fase:
Visor · Data Master · Design System
```
