# IA Agéntica y Vibe Coding

**Documento de apoyo de la charla**
Fernando Guirao — Computational RNA Biology Group, Ciencias Biomédicas (UIC)
22 de julio de 2026

Este documento acompaña a las diapositivas (`slides.md`) y desarrolla con más detalle
cada sección, para que puedas seguir la charla y consultarlo después con calma. No
hace falta ningún conocimiento previo de programación para entenderlo.

---

## Índice

1. [Introducción](#1-introducción)
2. [El espacio de trabajo del agente](#2-el-espacio-de-trabajo-del-agente)
3. [Primeros pasos con Claude Code](#3-primeros-pasos-con-claude-code)
4. [Demo: de especificación a aplicación](#4-demo-de-especificación-a-aplicación)
5. [La importancia del contexto](#5-la-importancia-del-contexto)
6. [Skills](#6-skills)
7. [Por debajo del capó](#7-por-debajo-del-capó)
8. [Cómo navegar el hype](#8-cómo-navegar-el-hype)
9. [Glosario](#9-glosario)

---

## 1. Introducción

Desde el lanzamiento de ChatGPT a finales de 2022, la forma más habitual de usar IA
ha sido el **paradigma de chat**: escribimos una pregunta o petición, el modelo
responde con texto, y somos nosotros quienes copiamos ese texto, lo pegamos donde
haga falta (un correo, un script, un documento) y decidimos qué hacer con él. En este
esquema, el humano ejecuta cada paso; la IA solo "opina" en forma de texto.

Desde hace ya un tiempo, sin embargo, el paradigma dominante en entornos productivos
—empresas de software, pero cada vez más también en investigación y análisis de
datos— es el de la **IA agéntica**. La diferencia clave es que el modelo de lenguaje
(LLM) deja de limitarse a "hablar": puede **actuar**. Un agente de IA puede:

- Leer y escribir archivos en un ordenador real.
- Ejecutar comandos (por ejemplo, correr un script de análisis).
- Navegar por internet o consultar documentación.
- Llamar a otras herramientas o servicios (APIs).

Y lo hace de forma **autónoma e iterativa**: planifica una serie de pasos, ejecuta
uno, observa el resultado, y ajusta el siguiente paso en consecuencia — sin que un
humano tenga que copiar y pegar nada entre medio.

Este campo avanza muy rápido: cada semana aparecen modelos nuevos, comparativas
(*benchmarks*) y herramientas. El objetivo de esta charla es doble:

1. Dar una base sólida y práctica para empezar a aprovechar esta tecnología ya, en
   tu día a día de investigación.
2. Dar criterio para navegar el hype — no toda novedad merece que cambies tu forma
   de trabajar, y no todo lo que reluce es oro.

---

## 2. El espacio de trabajo del agente

Herramientas como **Claude Code** no viven "en una página web": se ejecutan en tu
propio ordenador, dentro de una carpeta de proyecto real. Para poder actuar,
necesitan tres cosas: acceso al **sistema de archivos**, acceso a la **terminal**, y
opcionalmente, acceso a internet.

### Sistema de archivos

Todo lo que guardas en un ordenador vive organizado en carpetas (también llamadas
directorios) y archivos dentro de ellas. Una **ruta** describe dónde está un archivo:

- Ruta **absoluta**: describe la ubicación completa desde la raíz del disco, por
  ejemplo `/Users/fernando/proyecto/datos.csv`.
- Ruta **relativa**: describe la ubicación respecto a "dónde estás ahora mismo", por
  ejemplo `datos.csv` o `resultados/figura1.png`.

Un agente de código lee y escribe archivos exactamente igual que lo harías tú
manualmente: abre un archivo, lo modifica, lo guarda.

### La terminal

La terminal (también llamada *shell*) es una forma de dar instrucciones al
ordenador escribiendo comandos de texto, en lugar de hacer clic en ventanas. Algunos
comandos básicos:

- `pwd` (*print working directory*): muestra en qué carpeta estás.
- `ls` (*list*): lista los archivos y carpetas del directorio actual.
- `cd nombre_carpeta` (*change directory*): te mueve a esa carpeta.

Un agente como Claude Code "escribe" estos comandos por ti para llevar a cabo las
tareas. No necesitas ser un experto en la terminal para usarlo, pero entender qué
está pasando te da control real sobre lo que el agente hace en tu ordenador.

### Sistema operativo recomendado

Se recomienda usar **macOS o Linux**. En Windows, la opción recomendada es instalar
**WSL** (*Windows Subsystem for Linux*), que permite tener un entorno Linux completo
dentro de Windows. La razón práctica es que la inmensa mayoría del ecosistema de
herramientas de IA agéntica (instaladores, librerías, documentación) está construido
pensando en entornos tipo Unix.

---

## 3. Primeros pasos con Claude Code

**Claude Code** es una interfaz de línea de comandos (CLI) que da acceso a Claude de
forma agéntica: se ejecuta en tu terminal, dentro de la carpeta de tu proyecto, y
puede ver tus archivos, editarlos, ejecutar comandos, instalar dependencias, etc.

### Instalación

Instalador nativo (opción recomendada; se actualiza solo):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Con Homebrew, el gestor de paquetes más habitual en macOS (y disponible también en
Linux):

```bash
brew install --cask claude-code
```

Con npm (el gestor de paquetes de Node.js; requiere tener Node.js 22 o superior
instalado):

```bash
npm install -g @anthropic-ai/claude-code
```

### Planes y acceso

Claude Code requiere una cuenta de pago de Claude: **Pro, Max, Team o Enterprise**
(el plan gratuito de claude.ai no incluye acceso a Code). También se puede usar con
una clave de API propia, en cuyo caso el pago es por uso (tokens consumidos) en
lugar de por suscripción — una opción interesante para uso puntual o para un grupo
de investigación que quiera centralizar la facturación. Además, es posible acceder a
Claude a través de plataformas cloud como AWS Bedrock, Google Vertex AI o Microsoft
Foundry, si el departamento ya usa alguna de ellas.

### El editor: VS Code

Aunque Claude Code funciona íntegramente desde la terminal, es muy habitual
combinarlo con un editor de código como **Visual Studio Code (VS Code)**, gratuito y
disponible para todos los sistemas operativos. VS Code permite ver los archivos del
proyecto, revisar visualmente los cambios que el agente propone, y tiene una
extensión que integra Claude Code directamente en el editor.

---

## 4. Demo: de especificación a aplicación

Una de las formas más efectivas de trabajar con un agente de código es escribir
primero una **especificación**: un documento (normalmente en Markdown) que describe,
en lenguaje natural, qué queremos construir. Cuanto más concreta sea la
especificación, mejor será el resultado.

En la charla partimos del archivo [`demo/especificacion-demo.md`](demo/especificacion-demo.md),
que describe un pequeño **analizador de secuencias FASTA**: una página web sencilla,
sin necesidad de servidor, donde puedes pegar una secuencia de ADN/ARN en formato
FASTA y obtener:

- La longitud de la secuencia.
- El porcentaje de bases G+C (%GC).
- La composición de bases (cuántas A, C, G, T/U).
- La secuencia complementaria reversa.
- Una temperatura de fusión (Tm) aproximada.

Se lo damos a Claude Code y le pedimos que implemente esa especificación. El agente:

1. Lee el archivo de especificación.
2. Planifica los archivos que necesita crear (HTML, CSS, JavaScript).
3. Los escribe.
4. Puede abrir o comprobar el resultado, y corregir errores si los encuentra.

Todo esto ocurre en cuestión de minutos y sin que nadie copie ni pegue código a
mano — la diferencia central frente al paradigma de "chat" con el que empezamos la
charla.

---

## 5. La importancia del contexto

Un LLM no tiene memoria persistente entre conversaciones: en cada sesión, solo
"sabe" lo que hay dentro de su ventana de contexto (ver sección 7) — es decir, lo
que le contamos explícitamente. Por eso, **dar buen contexto es una de las palancas
más importantes** para obtener buenos resultados de un agente.

### CLAUDE.md y AGENTS.md

`CLAUDE.md` es un archivo Markdown especial que Claude Code lee automáticamente al
empezar a trabajar en una carpeta de proyecto. Suele contener:

- Convenciones del proyecto (estilo de código, estructura de carpetas...).
- Comandos útiles (cómo ejecutar los tests, cómo lanzar la aplicación...).
- Decisiones de diseño relevantes y cosas a evitar.

`AGENTS.md` es una convención equivalente, pero **agnóstica de proveedor**: la usan
también otras herramientas como Cursor o GitHub Copilot. Claude Code sabe leer
ambos formatos, y el comando `/init` puede generar automáticamente un `CLAUDE.md`
a partir del contenido del proyecto (incluyendo un `AGENTS.md` existente, si lo hay).

### Buenas prácticas

- Los documentos de especificación en Markdown (como el de la demo) son una forma
  excelente de dar contexto muy dirigido a una tarea concreta.
- Conviene mantener estos documentos **cortos y concretos**: el contexto no es
  gratis, ocupa espacio en la ventana de contexto del modelo (sección 7), y un
  documento demasiado largo o genérico diluye la información realmente importante.

---

## 6. Skills

Las **Skills** son paquetes de instrucciones reutilizables para tareas concretas y
repetibles. En Claude Code, viven en la carpeta `.claude/skills/` del proyecto (o
del usuario), y cada una se define en un archivo `SKILL.md` con instrucciones sobre
cómo llevar a cabo esa tarea.

Se pueden invocar explícitamente como un comando (por ejemplo, `/nombre-skill`), o
el propio agente puede detectar que una skill es relevante para la tarea en curso y
activarla por su cuenta.

¿Por qué son útiles?

- **Eficiencia de contexto**: a diferencia de un `CLAUDE.md` (que se carga siempre),
  el contenido de una skill solo se carga en memoria cuando realmente se usa.
- **Estandarización**: permiten fijar un procedimiento ("cómo generar una figura con
  nuestro estilo", "cómo correr nuestro pipeline de análisis") de forma que
  cualquier persona del grupo obtenga resultados consistentes.
- **Reutilización**: se pueden compartir entre proyectos y entre miembros de un
  mismo grupo de investigación.

Las Skills siguen el formato abierto [Agent Skills](https://agentskills.io), por lo
que no son exclusivas de Claude Code.

---

## 7. Por debajo del capó

### Tokens

Un LLM no procesa "palabras" tal cual, sino **tokens**: fragmentos de texto que en
promedio equivalen a unos 3-4 caracteres. Por ejemplo, una palabra larga o poco
común puede dividirse en varios tokens. Todo tiene un coste en tokens: el texto que
escribimos, la respuesta del modelo, y también el contenido de cualquier archivo
que el agente lea. Los precios de uso de la API, así como los límites de las
distintas suscripciones, se miden en tokens.

### Ventana de contexto

La **ventana de contexto** es la cantidad máxima de tokens que un modelo puede
"tener en mente" simultáneamente en una conversación. Incluye todo lo relevante para
la tarea actual: el historial de la conversación, los archivos que el agente ha
leído, el contenido de `CLAUDE.md`, las skills cargadas, etc.

Cuando la ventana de contexto se llena, es necesario resumir partes de la
conversación o empezar una nueva — lo cual puede hacer que se pierda algún detalle.
Es importante entender que una ventana de contexto muy grande **no garantiza** que
el modelo preste la misma atención a todo su contenido: la información situada al
principio de una conversación muy larga puede pesar menos que la más reciente.

### Alucinaciones

Un LLM genera, en esencia, el texto estadísticamente más plausible dado lo anterior
— no necesariamente el texto verdadero. Esto puede llevar a **alucinaciones**: el
modelo "inventa" con total confianza funciones que no existen, referencias
bibliográficas inexistentes, o incluso resultados de un análisis que nunca se
ejecutó realmente.

En un agente, esto es especialmente delicado, porque el modelo no solo puede decir
algo falso: puede **ejecutar acciones** basadas en esa alucinación (por ejemplo,
usar una función inventada, o dar por buenos unos resultados sin haberlos calculado
de verdad). Algunas formas de mitigarlo:

- Verificar siempre resultados y afirmaciones importantes, especialmente citas o
  datos científicos.
- Pedir al agente que muestre su razonamiento o las fuentes que ha usado.
- Ejecutar tests automáticos que comprueben que el código hace lo que debería.
- Revisar el *diff* (los cambios exactos propuestos) antes de aceptarlos, igual que
  revisarías el cambio de un colaborador humano.

---

## 8. Cómo navegar el hype

Algunas heurísticas prácticas para no perderse en el ruido mediático de la IA:

- Que salga un modelo o *benchmark* nuevo cada semana no significa que debas cambiar
  tu forma de trabajar cada semana.
- Desconfía de demos espectaculares que no puedas reproducir tú mismo, con tus
  propios datos.
- Antes de creer un titular o un hilo viral, prueba la herramienta con tus propias
  tareas reales.
- La pregunta que de verdad importa no es "¿es esto lo más nuevo?", sino "¿me ahorra
  tiempo hoy, en mi problema concreto?"

### Recursos para seguir aprendiendo

- Documentación oficial de Claude Code: `https://code.claude.com/docs`
- Formato Agent Skills (estándar abierto): `https://agentskills.io`
- La especificación usada en la demo de esta charla: [`demo/especificacion-demo.md`](demo/especificacion-demo.md)

---

## 9. Glosario

- **LLM (*Large Language Model*)**: modelo de inteligencia artificial entrenado con
  grandes cantidades de texto, capaz de generar y entender lenguaje natural.
- **Agente / IA agéntica**: un LLM al que se le da la capacidad de actuar (leer y
  escribir archivos, ejecutar comandos, usar herramientas) de forma autónoma, en
  lugar de solo responder texto.
- **CLI (*Command Line Interface*)**: programa que se controla escribiendo comandos
  de texto en una terminal, en lugar de mediante clics en una interfaz gráfica.
- **Terminal / *shell***: programa que permite escribir comandos de texto para
  controlar el ordenador.
- **Token**: unidad mínima de texto que procesa un LLM (aproximadamente 3-4
  caracteres en promedio).
- **Ventana de contexto**: cantidad máxima de tokens que un modelo puede considerar
  a la vez en una conversación.
- **Alucinación**: cuando un modelo genera información falsa o inventada con
  apariencia de certeza.
- **Prompt**: el texto de instrucción o pregunta que se le da a un modelo.
- **Repositorio (repo)**: carpeta de proyecto, normalmente versionada con un sistema
  de control de versiones como Git.
- **CLAUDE.md / AGENTS.md**: archivos Markdown que documentan el contexto de un
  proyecto para que un agente de IA lo lea automáticamente.
- **Skill**: paquete reutilizable de instrucciones para una tarea concreta y
  repetible.
