# Especificación: Analizador de secuencias FASTA

## Objetivo

Construir una página web sencilla, autocontenida (sin backend ni servidor: debe
funcionar abriendo un único archivo `index.html` en el navegador), que analice una
secuencia de ADN/ARN pegada por el usuario en formato FASTA.

## Entrada

- Un `<textarea>` donde el usuario pega texto en formato FASTA, por ejemplo:

  ```
  >ejemplo_secuencia
  ACGGCTAGCTAGCTACGGATCGATCGATCGGCTAGCATCAGCTAGCATCG
  ```

- Debe soportar tanto ADN (bases A, C, G, T) como ARN (bases A, C, G, U).
- Debe ignorar líneas en blanco y espacios dentro de la secuencia.
- Si el texto no tiene una cabecera (línea que empieza por `>`), tratar todo el
  texto como la secuencia directamente (sin cabecera).
- Un botón "Analizar" que dispara el cálculo.

## Salida

Al pulsar "Analizar", mostrar en tarjetas o secciones claramente diferenciadas:

1. **Cabecera / nombre**: el identificador extraído de la línea `>` (si existe).
2. **Longitud**: número total de bases de la secuencia.
3. **Composición de bases**: recuento y porcentaje de cada base (A, C, G, T o U).
4. **%GC**: porcentaje de bases G + C sobre el total.
5. **Secuencia complementaria reversa**:
   - Si es ADN: A↔T, C↔G, e invertir el orden.
   - Si es ARN: A↔U, C↔G, e invertir el orden.
6. **Temperatura de fusión (Tm) aproximada**:
   - Si la secuencia tiene 14 bases o menos, usar la regla de Wallace:
     `Tm = 2°C × (A+T) + 4°C × (G+C)`.
   - Si tiene más de 14 bases, usar la fórmula basada en %GC:
     `Tm = 64.9 + 41 × (GC − 16.4) / longitud`, donde `GC` es el número de bases G+C.

## Validación

- Si la secuencia contiene caracteres que no son A, C, G, T, U (ignorando
  mayúsculas/minúsculas y espacios), mostrar un aviso indicando qué caracteres no
  reconocidos se han encontrado, pero intentar analizar igualmente el resto.
- Si el campo de texto está vacío al pulsar "Analizar", mostrar un mensaje pidiendo
  que se introduzca una secuencia.

## Estilo visual

- Diseño limpio y minimalista, tipografía legible (`system-ui` o similar).
- Tema claro, con un único color de acento.
- Debe verse bien tanto en pantalla de portátil como proyectado (texto no
  demasiado pequeño).
- No hace falta que sea responsive para móvil.

## Alcance (qué NO incluir)

- No hace falta backend, base de datos, ni build step (Webpack, Vite, etc.):
  HTML + CSS + JavaScript plano en un solo archivo (o como mucho 2-3 archivos
  simples referenciados desde `index.html`).
- No hace falta soportar múltiples secuencias FASTA a la vez (solo una por
  análisis).
- No hace falta guardar ni persistir nada entre sesiones.
