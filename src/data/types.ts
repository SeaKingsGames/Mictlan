// Tipos de datos de diseño (lo que en Unity eran ScriptableObjects).
// Son de SOLO LECTURA en partida: lo que cambia vive en CardInstance.

export type CardType = 'monster' | 'spell' | 'equip' | 'ritual';

// Los 4 rumbos. Ventaja cíclica: sol > viento > agua > tierra > sol
export type CardAttribute = 'sol' | 'viento' | 'agua' | 'tierra';

export const CARD_TAGS = [
  'jaguar', 'guerrero', 'bestia', 'serpiente', 'deidad', 'ave',
  'agua', 'muerte', 'sol', 'fuego', 'viento',
] as const;
export type CardTag = (typeof CARD_TAGS)[number];

export interface CardDef {
  readonly id: number;          // único, > 0. Es lo único que viaja por red / BD
  readonly name: string;
  readonly description: string;
  readonly type: CardType;
  readonly attribute: CardAttribute;
  readonly tags: readonly CardTag[];  // para las reglas genéricas de fusión
  readonly atk: number;
  readonly def: number;
  readonly art?: string;        // ruta de la imagen (más adelante)
  // Fase 3: readonly effects?: EffectDef[];
}

export interface DeckDef {
  readonly id: string;
  readonly name: string;
  readonly cards: readonly number[];  // IDs de carta
}

export const DECK_SIZE = 40;   // igual que YGOFM
export const MAX_COPIES = 3;
export const HAND_SIZE = 5;
export const START_LIFE = 8000;

export const hasTag = (card: CardDef, tag: CardTag): boolean => card.tags.includes(tag);
