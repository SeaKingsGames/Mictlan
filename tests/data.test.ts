import { describe, expect, it } from 'vitest';
import { cardDb, decks } from '../src/data/index.ts';
import { CardDatabase } from '../src/data/cardDatabase.ts';
import { CardInstance } from '../src/core/CardInstance.ts';
import { buildShuffledDeck, draw, InstanceIdCounter } from '../src/core/deck.ts';
import { createRng } from '../src/core/rng.ts';
import type { CardDef } from '../src/data/types.ts';

describe('base de datos de cartas', () => {
  it('carga todas las cartas del JSON', () => {
    expect(cardDb.size).toBeGreaterThan(0);
    expect(cardDb.get(7).name).toBe('Mictlantecuhtli');
  });

  it('rechaza IDs duplicados', () => {
    const a = cardDb.get(1);
    expect(() => new CardDatabase([a, { ...a, name: 'Copia' }])).toThrow(/duplicado/);
  });

  it('las definiciones son de solo lectura', () => {
    const card = cardDb.get(1) as { atk: number };
    expect(() => { card.atk = 9999; }).toThrow();
  });

  it('todos los mazos son válidos', () => {
    for (const deck of decks) expect(cardDb.validateDeck(deck), deck.id).toEqual([]);
  });

  it('detecta más de 3 copias', () => {
    expect(cardDb.validateDeck({ id: 'x', name: 'x', cards: [1, 1, 1, 1] })).toHaveLength(1);
  });
});

describe('mazo y robo', () => {
  const deckIds = decks[0].cards;

  it('misma semilla = mismo barajado', () => {
    const a = buildShuffledDeck(deckIds, 0, cardDb, new InstanceIdCounter(), createRng(42));
    const b = buildShuffledDeck(deckIds, 0, cardDb, new InstanceIdCounter(), createRng(42));
    expect(a.map(c => c.def.id)).toEqual(b.map(c => c.def.id));
  });

  it('robar 5 mueve cartas del mazo a la mano', () => {
    const deck = buildShuffledDeck(deckIds, 0, cardDb, new InstanceIdCounter(), createRng(1));
    const hand: CardInstance[] = [];
    draw(deck, hand, 5);
    expect(hand).toHaveLength(5);
    expect(deck).toHaveLength(deckIds.length - 5);
    expect(hand.every(c => c.zone === 'hand')).toBe(true);
  });

  it('cada instancia tiene un ID único', () => {
    const deck = buildShuffledDeck(deckIds, 0, cardDb, new InstanceIdCounter(), createRng(1));
    expect(new Set(deck.map(c => c.instanceId)).size).toBe(deck.length);
  });
});

describe('CardInstance', () => {
  const def: CardDef = cardDb.get(7);

  it('aplica y quita modificadores de fin de turno', () => {
    const c = new CardInstance(1, 0, def);
    c.addModifier({ atk: 500, def: 0, sourceId: 99, untilEndOfTurn: true });
    expect(c.atk).toBe(def.atk + 500);
    c.clearEndOfTurnModifiers();
    expect(c.atk).toBe(def.atk);
  });

  it('el ATK nunca baja de 0', () => {
    const c = new CardInstance(1, 0, def);
    c.addModifier({ atk: -99999, def: 0, sourceId: 1, untilEndOfTurn: false });
    expect(c.atk).toBe(0);
  });
});
