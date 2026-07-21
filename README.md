# IA Agéntica y Vibe Coding — material de la charla

Material para el seminario sobre IA agéntica / vibe coding en el departamento de
Ciencias Biomédicas (UIC), 22 de julio de 2026.

## Contenido

- [`slides.md`](slides.md) — diapositivas en formato [Marp](https://marp.app)
  (Markdown → PDF / PPTX / HTML).
- [`documento-apoyo.md`](documento-apoyo.md) — documento de apoyo con más detalle,
  pensado para que el público lo lea antes, durante o después de la charla.
- [`demo/especificacion-demo.md`](demo/especificacion-demo.md) — especificación de
  la mini-aplicación que se construye en directo durante la demo (un analizador de
  secuencias FASTA).

## Cómo exportar las diapositivas

Necesitas Node.js instalado. Se puede usar Marp sin instalar nada de forma global,
con `npx`:

```bash
# Vista previa en el navegador con recarga en vivo, mientras editas slides.md
npx @marp-team/marp-cli@latest -w -s slides.md

# Exportar a PDF
npx @marp-team/marp-cli@latest slides.md -o slides.pdf

# Exportar a PowerPoint (editable)
npx @marp-team/marp-cli@latest slides.md -o slides.pptx

# Exportar a una página HTML autocontenida
npx @marp-team/marp-cli@latest slides.md -o slides.html
```

Alternativa: instalar la extensión **"Marp for VS Code"**, que añade una vista
previa en el propio editor y comandos de exportación desde la interfaz.

## Notas de presentador

Dentro de `slides.md` hay comentarios HTML (`<!-- ... -->`) en algunas diapositivas
con apuntes para el ponente. Marp los trata como notas de presentador: no aparecen
en la exportación normal, pero sí en el modo de presentador (`npx @marp-team/marp-cli@latest -s slides.md`,
opción "Presenter View").

## Para la demo en vivo

1. Abre la carpeta `demo/` en VS Code.
2. Lanza Claude Code en esa carpeta (`claude` en la terminal, situado dentro de `demo/`).
3. Pide a Claude Code que implemente `especificacion-demo.md` como una página web.
4. Abre el `index.html` resultante en el navegador para ver el resultado.

Si quieres tener una versión ya construida como red de seguridad por si la demo en
directo falla (wifi, tiempo, etc.), dímelo y genero también una implementación de
referencia en `demo/solucion/`.
