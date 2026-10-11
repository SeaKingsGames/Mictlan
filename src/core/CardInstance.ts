import type { CardDef } from '../data/types.ts';

export type Zone = 'deck' | 'hand' | 'field' | 'mictlan'; // mictlan = cementerio
export type BattlePosition = 'attack' | 'defense';

/** Modificador de estadísticas (lo aplican efectos y equipos). */
export interface StatModifier {
  readonly atk: number;
  readonly def: number;
  readonly sourceId: number;        // instancia que lo causó (para quitarlo si se va)
  readonly untilEndOfTurn: boolean;
}

/**
 * Una carta concreta dentro de un duelo. TypeScript puro: sin Phaser ni Supabase.
 * La definición nunca se modifica; todo cambio vive aquí.
 */
export class CardInstance {
  readonly instanceId: number;
  readonly owner: 0 | 1;
  readonly def: CardDef;

  zone: Zone = 'deck';
  fieldSlot = -1;                   // 0-4 cuando está en el campo
  position: BattlePosition = 'attack';
  faceDown = false;
  hasAttackedThisTurn = false;

  private modifiers: StatModifier[] = [];

  constructor(instanceId: number, owner: 0 | 1, def: CardDef) {
    this.instanceId = instanceId;
    this.owner = owner;
    this.def = def;
  }

  get atk(): number {
    return Math.max(0, this.modifiers.reduce((sum, m) => sum + m.atk, this.def.atk));
  }

  get defense(): number {
    return Math.max(0, this.modifiers.reduce((sum, m) => sum + m.def, this.def.def));
  }

  get activeModifiers(): readonly StatModifier[] { return this.modifiers; }

  addModifier(mod: StatModifier): void { this.modifiers.push(mod); }

  removeModifiersFrom(sourceId: number): void {
    this.modifiers = this.modifiers.filter(m => m.sourceId !== sourceId);
  }

  clearEndOfTurnModifiers(): void {
    this.modifiers = this.modifiers.filter(m => !m.untilEndOfTurn);
  }

  /** Al salir del campo pierde buffs y estado de batalla. */
  resetForZoneChange(): void {
    this.modifiers = [];
    this.fieldSlot = -1;
    this.faceDown = false;
    this.hasAttackedThisTurn = false;
    this.position = 'attack';
  }

  toString(): string {
    return `#${this.instanceId} ${this.def.name} ${this.atk}/${this.defense} [${this.zone}]`;
  }
}
