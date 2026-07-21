---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: #F5F3EC
style: |
  /* Paleta inspirada en la web/UI de Claude (Anthropic): fondo crema cálido,
     acento terracota; tipografía retro estilo cabecera de periódico antiguo
     (Playfair Display en títulos, Lora en el cuerpo). */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
  section {
    background-color: #F5F3EC;
    color: #2C2A25;
    font-family: "Lora", Georgia, serif;
    font-size: 26px;
    line-height: 1.45;
  }
  h1, h2, h3 {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 700;
    color: #2C2A25;
  }
  h1 {
    color: #C05C3B;
  }
  section.lead {
    background-color: #EFEAD9;
  }
  section.lead h1 {
    font-size: 1.8em;
  }
  section.lead h2 {
    color: #6B6459;
    font-weight: 400;
  }
  strong {
    color: #C05C3B;
  }
  a {
    color: #C05C3B;
  }
  ul li::marker, ol li::marker {
    color: #C05C3B;
  }
  code {
    background-color: #EAE6DA;
    color: #2C2A25;
    border-radius: 4px;
    padding: 0.1em 0.35em;
  }
  pre {
    background-color: #EAE6DA;
    border-radius: 10px;
    padding: 0.8em 1em;
  }
  pre code {
    background-color: transparent;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #C05C3B;
    color: #6B6459;
    padding-left: 0.8em;
  }
  section::after {
    color: #9A9382;
  }
---

<!-- _class: lead -->

# IA Agéntica y *Vibe Coding*

## Cómo aprovechar (sin perderte en el hype) la nueva ola de la IA

Fernando Guirao
Computational RNA Biology Group — Ciencias Biomédicas, UIC
22 de julio de 2026

---

## Sobre mí

- Recién graduado en Ingeniería Informática — FIB, UPC
- TFG en el **Computational RNA Biology Group** (UIC)
- Durante el TFG usé IA agéntica de forma intensiva para programar
- Esta charla resume lo que me hubiera gustado saber al empezar

---

## Agenda

1. Introducción: del chat a los agentes
2. El espacio de trabajo del agente
3. Primeros pasos con Claude Code
4. Demo en vivo: de especificación a aplicación
5. La importancia del contexto
6. *Skills*
7. Por debajo del capó: tokens, contexto, alucinaciones
8. Cómo navegar el hype

---

<!-- _class: lead -->

# 1. Introducción

---

## De ChatGPT al agente

- **Finales de 2022**: boom de ChatGPT
- Paradigma "chat": pregunta → respuesta
- El humano copia, pega y ejecuta cada paso a mano
- La IA solo "opina en texto"; no actúa por sí misma

<!--
Nota para el ponente: aquí sirve preguntar a la sala quién ha usado ChatGPT
copiando/pegando código o texto a mano. Casi todos levantarán la mano:
ese es exactamente el paradigma que vamos a contrastar con el agéntico.
-->

---

## El nuevo paradigma: IA agéntica

- El LLM deja de ser un simple "oráculo de texto"
- Puede **usar herramientas**: leer/escribir archivos, ejecutar comandos, navegar la web, llamar APIs...
- Planifica, ejecuta, observa el resultado y corrige — de forma autónoma
- Hoy es el paradigma dominante en entornos productivos (no solo en programación)

---

## ¿Por qué esta charla?

- El campo avanza a una velocidad brutal: modelos, *benchmarks* y herramientas nuevas cada semana
- Objetivo 1: dar una base sólida para empezar a usarlo ya
- Objetivo 2: criterio para separar señal de ruido — **no es oro todo lo que reluce**

---

<!-- _class: lead -->

# 2. El espacio de trabajo del agente

---

## ¿Dónde "vive" un agente de código?

- Herramientas como Claude Code corren **en tu ordenador**, no solo en una web
- Necesitan acceder a:
  - El **sistema de archivos** (carpetas y archivos)
  - La **terminal** (para ejecutar comandos)
  - Opcionalmente, internet

---

## Nociones básicas: sistema de archivos

- Todo en tu ordenador vive en carpetas (directorios) y archivos
- Ruta absoluta: `/Users/tu_usuario/proyecto/datos.csv`
- Ruta relativa: `datos.csv` (relativa a "dónde estás" ahora mismo)
- El agente lee y escribe archivos exactamente como lo harías tú a mano

---

## Nociones básicas: la terminal

- La terminal (shell) permite dar órdenes al ordenador escribiendo texto
- Comandos básicos:
  - `pwd` → ¿dónde estoy?
  - `ls` → ¿qué hay aquí?
  - `cd carpeta` → moverme a "carpeta"
- El agente "escribe" estos comandos por ti — entender qué hacen te da control real

---

## ¿Qué sistema operativo usar?

- **Recomendado: macOS o Linux**
- **Windows → WSL** (Windows Subsystem for Linux)
- El ecosistema de herramientas de IA agéntica está construido pensando en entornos tipo Unix

---

<!-- _class: lead -->

# 3. Primeros pasos con Claude Code

---

## ¿Qué es Claude Code?

- Interfaz de línea de comandos (CLI) para trabajar con Claude de forma agéntica
- Corre en tu terminal, dentro de la carpeta de tu proyecto
- Ve tus archivos, puede editarlos, ejecutar comandos, instalar dependencias...

---

## Instalación

Instalador nativo (recomendado, se autoactualiza):
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Con Homebrew (macOS/Linux):
```bash
brew install --cask claude-code
```

Con npm (requiere Node.js 22+):
```bash
npm install -g @anthropic-ai/claude-code
```

---

## Planes y acceso

- Requiere cuenta **Pro, Max, Team o Enterprise** (el plan gratuito de claude.ai no incluye Code)
- Alternativa: clave de API propia (pago por uso, sin suscripción)
- También integrable vía AWS Bedrock, Google Vertex AI o Microsoft Foundry

<!--
Nota: si alguien del departamento pregunta por coste para uso en investigación,
recordar que el pago por API es por tokens consumidos, no por asiento/usuario.
-->

---

<!-- _class: lead -->

# 4. Demo en vivo

---

## De especificación a aplicación

- Partimos de un archivo Markdown con la **especificación** de una pequeña herramienta
- Se lo damos a Claude Code y le pedimos que lo implemente
- Editor recomendado para revisar el código generado: **VS Code**
- Todo el proceso, en directo, sin preparar nada de antemano

---

## Qué vamos a construir

- Un pequeño **analizador de secuencias FASTA**
- Entrada: una secuencia de ADN/ARN en formato FASTA
- Salida: longitud, %GC, composición de bases, complementaria reversa, Tm aproximada
- Una página web sencilla, sin servidor (todo corre en el navegador)

*(especificación completa en `demo/especificacion-demo.md`)*

<!--
Nota: abrir demo/especificacion-demo.md en VS Code, luego lanzar Claude Code
en esa carpeta y pegar/pedir "implementa la especificación de este archivo".
Dejar que trabaje sin interrumpir; comentar en voz alta lo que va haciendo.
-->

---

<!-- _class: lead -->

# 5. La importancia del contexto

---

## "Contexto" = lo que el agente sabe antes de empezar

- Un LLM no tiene memoria entre sesiones: solo sabe lo que le decimos en cada conversación
- Cuanto mejor sea el contexto, mejores decisiones toma el agente
- Formas de dar contexto: instrucciones directas, archivos de referencia, documentación del proyecto...

---

## CLAUDE.md / AGENTS.md

- `CLAUDE.md`: archivo Markdown que Claude Code lee automáticamente al empezar en un proyecto
- Contiene: convenciones del proyecto, comandos útiles, decisiones de diseño, cosas a evitar...
- `AGENTS.md`: convención equivalente y agnóstica de proveedor (la usan Cursor, Copilot...)
- Claude Code puede leer ambos, e incluso generarlos automáticamente con `/init`

---

## Buenas prácticas de contexto

- Documentos Markdown de especificación (como el de la demo)
- Mantenerlos cortos y concretos — no un volcado de todo el conocimiento del mundo
- El contexto también **cuesta**: ocupa espacio en la ventana de contexto (siguiente sección)

---

<!-- _class: lead -->

# 6. Skills

---

## ¿Qué son las Skills?

- Paquetes de instrucciones reutilizables para tareas concretas y repetibles
- Viven en `.claude/skills/`, definidas en un archivo `SKILL.md`
- Se invocan como comandos (`/nombre-skill`) o el propio agente las activa cuando detecta que aplican

---

## ¿Por qué son útiles?

- Solo se cargan cuando hacen falta → no ocupan contexto de fondo todo el rato
- Permiten estandarizar procedimientos: "cómo desplegar", "cómo revisar código", "cómo generar un análisis de tipo X"
- Se pueden compartir entre proyectos y entre miembros de un mismo grupo de investigación

---

<!-- _class: lead -->

# 7. Por debajo del capó

---

## Tokens

- Un LLM no procesa "palabras", sino **tokens** (fragmentos de texto, ~3-4 caracteres en promedio)
- Todo tiene un coste en tokens: lo que escribes, lo que el modelo responde, los archivos que lee
- Los precios de la API y los límites de uso se miden en tokens

---

## Ventana de contexto

- Cantidad máxima de tokens que el modelo puede "tener en mente" a la vez
- Incluye: la conversación, los archivos leídos, el `CLAUDE.md`, las *skills* cargadas...
- Si se llena, hay que resumir o empezar de nuevo → se puede perder detalle
- Una ventana de contexto muy grande **no** garantiza atención perfecta a todo su contenido

---

## Alucinaciones

- Un LLM genera texto estadísticamente plausible, no necesariamente verdadero
- Puede inventar funciones, referencias bibliográficas, resultados de un análisis...
- En un agente esto es más grave: puede **ejecutar acciones** basadas en una alucinación
- Mitigación: verificar, pedir fuentes, ejecutar tests, revisar el *diff* antes de aceptar cambios

<!--
Nota: buen momento para conectar con el mundo de investigación: nunca aceptar
un resultado de análisis o una cita bibliográfica generada por IA sin verificarla.
-->

---

<!-- _class: lead -->

# 8. Cómo navegar el hype

---

## Algunas heurísticas

- Un modelo o *benchmark* nuevo cada semana no significa que deba cambiar tu flujo de trabajo cada semana
- Desconfía de demos que no puedas reproducir tú mismo
- Prueba con tus propios datos y tareas reales antes de creer un titular
- La pregunta útil no es "¿es esto lo último?" sino "¿me ahorra tiempo hoy, en mi problema?"

---

## Recursos para seguir aprendiendo

- Documentación oficial de Claude Code: `https://code.claude.com/docs`
- Formato *Agent Skills* (estándar abierto): `https://agentskills.io`
- El documento de apoyo de esta charla: `documento-apoyo.md`
- La especificación usada en la demo: `demo/especificacion-demo.md`

---

<!-- _class: lead -->

# ¡Gracias!

## Preguntas

Fernando Guirao
fernando.guirao@estudiantat.upc.edu
