# Cartas — juego de cartas prehispánico

Juego de cartas estilo Yu-Gi-Oh! Forbidden Memories con mitología prehispánica.
Stack: TypeScript + Vite + Phaser 4 · Supabase (después) · Vercel.

## Comandos

```bash
npm install        # solo la primera vez
npm run dev        # abre el juego en http://localhost:5173 (y en tu red local para probar en el celular)
npm test           # corre los tests del motor
npm run build      # build de producción en dist/ (lo que publica Vercel)
```

## Carpetas

```
src/
  data/     types.ts, cards.json, decks.json, cardDatabase.ts   ← datos de diseño (solo lectura)
  core/     CardInstance.ts, deck.ts, rng.ts                    ← motor en TypeScript puro
  ui/       CardView.ts                                         ← dibujo de cartas (Phaser)
  scenes/   DuelScene.ts                                        ← escena de prueba
tests/      data.test.ts                                        ← Vitest
```

## Reglas del proyecto

- `src/core` y `src/data` no importan Phaser ni Supabase.
- Las definiciones de carta no se modifican en partida; lo que cambia vive en `CardInstance`.
- Por red y en base de datos solo viajan IDs.

## Agregar una carta

Edita `src/data/cards.json` con un `id` nuevo (único, mayor que 0) y corre `npm test`.
Si algo está mal (ID repetido, etiqueta inexistente, más de 3 copias en un mazo), el test te lo dice.
