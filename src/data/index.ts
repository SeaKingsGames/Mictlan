import cardsJson from './cards.json';
import decksJson from './decks.json';
import { CardDatabase } from './cardDatabase.ts';
import type { CardDef, DeckDef } from './types.ts';

export const cardDb = new CardDatabase(cardsJson as CardDef[]);
export const decks: readonly DeckDef[] = decksJson as DeckDef[];

export function getDeck(id: string): DeckDef {
  const deck = decks.find(d => d.id === id);
  if (!deck) throw new Error(`No existe el mazo "${id}"`);
  return deck;
}
