# Prompt para el agente de IA de cada integrante

Copia el bloque de abajo en tu agente (Claude Code, Gemini, Codex, Cursor…) **abierto en la carpeta del repo**. Cambia `<TU NOMBRE>` por tu nombre (por ejemplo, `Jimena`).

```text
Rol: eres mi asistente para documentar mi trabajo en el proyecto final de SF Vibe Lab. Soy <TU NOMBRE>, integrante del equipo.

Contexto: antes de hacer nada, lee completos AGENTS.md, docs/ESTADO.md, docs/README.md,
docs/equipo/<tu-nombre en minúsculas>.md, docs/contribucion.md, docs/bitacora_ia.md
(formato de las entradas) y docs/prompts/README.md (plantilla de prompts).

Tarea:
1. Entrevístame, una pregunta a la vez, sobre lo que hice en el proyecto en esta entrega:
   - Qué hice, en qué historias (HU) y cuándo.
   - Qué herramienta de IA usé y qué le pedí.
   - Qué me dio la IA, qué estuvo mal y cómo lo detecté.
   - Cómo lo verifiqué.
   - Cuánto tiempo me ahorró.
   - Cuántas horas le dediqué.
   No supongas respuestas: si no sé algo, déjalo como "_(completar)_".
2. Con mis respuestas, y solo después de que yo apruebe el texto:
   a. Completa mi archivo docs/equipo/<tu-nombre>.md (tareas, historias, evidencia, horas).
   b. Llena mi fila en docs/contribucion.md, en la tabla del hito que corresponda.
   c. Agrega mis entradas en docs/bitacora_ia.md: una fila en la tabla "Resumen" (Autor = mi nombre) y
      una sección con el mismo formato que las demás. Marca con ⚠ cada error de la IA y explica cómo se detectó.
   d. Por cada entrada, crea su prompt estructurado en docs/prompts/<tu-nombre>/Jxx-tema.md con la plantilla.
   e. Si hubo un problema o una pregunta al profesor o al cliente, agrega la entrada en docs/preguntas_y_reportes.md
      con autor, fecha y sus 5 partes.
3. Muéstrame el diff y espera mi aprobación antes de hacer commit. El commit lo hago con MI cuenta de GitHub.

Restricciones:
- Solo registra lo que YO hice. No te atribuyas ni me atribuyas trabajo de otra persona.
- Ninguna clave, token ni dato personal real en ningún archivo (regla M3).
- No cambies el código, ni las entradas o filas de otros integrantes, ni el estado de las historias.
- Escribe en español, en frases cortas y claras.

Salida: los archivos editados y un resumen de lo que agregaste.
```

> **Nota para la propia entrada:** usar este prompt también es un uso de IA. Si lo usas, regístralo en la bitácora (por ejemplo, "Documentar mi contribución de la Entrega 1").
