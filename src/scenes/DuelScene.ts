import * as Phaser from 'phaser';
import { cardDb, getDeck } from '../data/index.ts';
import { HAND_SIZE } from '../data/types.ts';
import type { CardInstance } from '../core/CardInstance.ts';
import { buildShuffledDeck, draw, InstanceIdCounter } from '../core/deck.ts';
import { createRng } from '../core/rng.ts';
import { CARD_W, CardView } from '../ui/CardView.ts';

/**
 * Fase 1, paso 1: baraja el mazo de prueba, roba 5 y las muestra.
 * Clic en cartas = arma el orden de una futura cadena de fusión.
 */
export class DuelScene extends Phaser.Scene {
  private views: CardView[] = [];
  private chain: CardView[] = [];
  private infoText!: Phaser.GameObjects.Text;
  private chainText!: Phaser.GameObjects.Text;

  constructor() { super('DuelScene'); }

  create(): void {
    const { width } = this.scale;

    this.add.text(width / 2, 40, 'Duelo de prueba', {
      fontFamily: 'Georgia', fontSize: '34px', color: '#f3e7d3',
    }).setOrigin(0.5);

    this.infoText = this.add.text(width / 2, 84, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#c9b79c',
    }).setOrigin(0.5);

    this.chainText = this.add.text(width / 2, 300, '', {
      fontFamily: 'Arial', fontSize: '20px', color: '#e8a33d', align: 'center',
      wordWrap: { width: width - 200 },
    }).setOrigin(0.5);

    this.makeButton(width / 2, 160, 'Barajar y robar 5', () => this.dealNewHand());

    const errors = cardDb.validateDeck(getDeck('prueba'));
    if (errors.length) console.warn('Mazo de prueba con problemas:', errors);

    this.dealNewHand();
  }

  private dealNewHand(): void {
    const seed = Math.floor(Math.random() * 2 ** 31);
    const deck = buildShuffledDeck(getDeck('prueba').cards, 0, cardDb, new InstanceIdCounter(), createRng(seed));
    const hand: CardInstance[] = [];
    draw(deck, hand, HAND_SIZE);

    this.views.forEach(v => v.destroy());
    this.chain = [];

    const { width, height } = this.scale;
    const gap = 24;
    const totalW = hand.length * CARD_W + (hand.length - 1) * gap;
    const startX = width / 2 - totalW / 2 + CARD_W / 2;

    this.views = hand.map((card, i) => {
      const view = new CardView(this, startX + i * (CARD_W + gap), height - 150, card);
      view.on('select', (v: CardView) => this.toggleInChain(v));
      return view;
    });

    this.infoText.setText(`${cardDb.size} cartas en la base · quedan ${deck.length} en el mazo · semilla ${seed}`);
    this.updateChainText();
  }

  private toggleInChain(view: CardView): void {
    const idx = this.chain.indexOf(view);
    if (idx >= 0) this.chain.splice(idx, 1);
    else this.chain.push(view);
    this.views.forEach(v => {
      const pos = this.chain.indexOf(v);
      v.setSelectionOrder(pos >= 0 ? pos + 1 : null);
    });
    this.updateChainText();
  }

  private updateChainText(): void {
    this.chainText.setText(
      this.chain.length === 0
        ? 'Toca cartas para armar una cadena de fusión'
        : 'Cadena: ' + this.chain.map(v => v.card.def.name).join('  →  '),
    );
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial', fontSize: '18px', color: '#14110f', fontStyle: 'bold',
    }).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, text.width + 40, 46, 0xe8a33d);
    const button = this.add.container(x, y, [bg, text]).setSize(bg.width, bg.height);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => bg.setFillStyle(0xf2b95a));
    button.on('pointerout', () => bg.setFillStyle(0xe8a33d));
    button.on('pointerdown', onClick);
  }
}
