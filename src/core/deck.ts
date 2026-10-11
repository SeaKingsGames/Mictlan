import type { CardDatabase } from '../data/cardDatabase.ts';
import { CardInstance } from './CardInstance.ts';
import { shuffle, type Rng } from './rng.ts';

/** Contador de IDs de instancia (cada carta en el duelo tiene uno único). */
export class InstanceIdCounter {
  private next = 1;
  take(): number { return this.next++; }
}

/** Convierte una lista de IDs de carta en instancias barajadas, listas para robar. */
export function buildShuffledDeck(
  cardIds: readonly number[],
  owner: 0 | 1,
  db: CardDatabase,
  ids: InstanceIdCounter,
  rng: Rng,
): CardInstance[] {
  const instances = cardIds.map(id => new CardInstance(ids.take(), owner, db.get(id)));
  return shuffle(instances, rng);
}

/** Saca hasta `count` cartas del tope del mazo y las pone en la mano. */
export function draw(deck: CardInstance[], hand: CardInstance[], count: number): CardInstance[] {
  const drawn = deck.splice(0, Math.max(0, count));
  for (const card of drawn) {
    card.zone = 'hand';
    hand.push(card);
  }
  return drawn;
}
