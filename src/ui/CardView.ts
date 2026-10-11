import * as Phaser from 'phaser';
import type { CardInstance } from '../core/CardInstance.ts';
import type { CardAttribute } from '../data/types.ts';

export const CARD_W = 150;
export const CARD_H = 210;

const ATTRIBUTE_COLORS: Record<CardAttribute, number> = {
  sol: 0xe8a33d,
  viento: 0x8fb8c9,
  agua: 0x3d7fe8,
  tierra: 0x8a6a3d,
};

const ATTRIBUTE_LABEL: Record<CardAttribute, string> = {
  sol: 'SOL', viento: 'VIENTO', agua: 'AGUA', tierra: 'TIERRA',
};

/**
 * Dibujo de una carta. Solo MUESTRA una CardInstance: nunca cambia el estado del duelo.
 * Emite 'select' al hacer clic.
 */
export class CardView extends Phaser.GameObjects.Container {
  readonly card: CardInstance;
  private readonly frame: Phaser.GameObjects.Rectangle;
  private readonly badge: Phaser.GameObjects.Container;
  private readonly badgeText: Phaser.GameObjects.Text;
  private readonly statsText: Phaser.GameObjects.Text;
  private homeY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, card: CardInstance) {
    super(scene, x, y);
    this.card = card;
    this.homeY = y;
    const color = ATTRIBUTE_COLORS[card.def.attribute];

    this.frame = scene.add.rectangle(0, 0, CARD_W, CARD_H, 0x2a211b).setStrokeStyle(3, color);
    const band = scene.add.rectangle(0, -CARD_H / 2 + 14, CARD_W - 6, 22, color);
    const attr = scene.add.text(0, -CARD_H / 2 + 14, ATTRIBUTE_LABEL[card.def.attribute], {
      fontFamily: 'Arial', fontSize: '12px', color: '#14110f', fontStyle: 'bold',
    }).setOrigin(0.5);

    const name = scene.add.text(0, -CARD_H / 2 + 46, card.def.name, {
      fontFamily: 'Georgia', fontSize: '16px', color: '#f3e7d3', align: 'center',
      wordWrap: { width: CARD_W - 16 },
    }).setOrigin(0.5, 0);

    // Espacio del arte (más adelante una imagen)
    const art = scene.add.rectangle(0, 18, CARD_W - 20, 70, 0x3a2e25).setStrokeStyle(1, 0x5a4a3c);

    const tags = scene.add.text(0, 62, card.def.tags.join(' · '), {
      fontFamily: 'Arial', fontSize: '11px', color: '#c9b79c', align: 'center',
      wordWrap: { width: CARD_W - 12 },
    }).setOrigin(0.5, 0);

    this.statsText = scene.add.text(0, CARD_H / 2 - 16, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const circle = scene.add.circle(0, 0, 16, 0xd94f30).setStrokeStyle(2, 0xffffff);
    this.badgeText = scene.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.badge = scene.add.container(CARD_W / 2 - 8, -CARD_H / 2 + 8, [circle, this.badgeText]).setVisible(false);

    this.add([this.frame, band, attr, name, art, tags, this.statsText, this.badge]);
    this.refresh();

    this.setSize(CARD_W, CARD_H);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerover', () => this.lift(true));
    this.on('pointerout', () => this.lift(false));
    this.on('pointerdown', () => this.emit('select', this));

    scene.add.existing(this);
  }

  /** Vuelve a leer ATK/DEF de la instancia (por si un efecto los cambió). */
  refresh(): void {
    this.statsText.setText(`ATK ${this.card.atk} / DEF ${this.card.defense}`);
  }

  /** order = posición en la cadena de fusión (1, 2, 3...) o null para quitar. */
  setSelectionOrder(order: number | null): void {
    this.badge.setVisible(order !== null);
    this.badgeText.setText(order === null ? '' : String(order));
    this.frame.setFillStyle(order === null ? 0x2a211b : 0x3d2a20);
  }

  private lift(up: boolean): void {
    this.scene.tweens.add({ targets: this, y: up ? this.homeY - 24 : this.homeY, duration: 120, ease: 'Quad.easeOut' });
  }
}
