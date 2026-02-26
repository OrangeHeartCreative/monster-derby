/* -------------------------------------------------
 *  Hud – in-game heads-up display
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH } from '../config.js';

const D = 50; // depth

export class Hud {

  constructor(scene) {
    this.scene = scene;

    const S = { fontSize: '14px', fontFamily: 'monospace', stroke: '#000', strokeThickness: 2 };

    /* ---- health bar ---- */
    this.hpLabel = scene.add.text(12, 10, 'HP', { ...S, color: '#fff' }).setDepth(D);
    this.hpBg    = scene.add.rectangle(80, 16, 180, 14, 0x333333).setOrigin(0, 0.5).setDepth(D);
    this.hpBar   = scene.add.rectangle(80, 16, 180, 14, 0x22cc22).setOrigin(0, 0.5).setDepth(D + 1);

    /* ---- score ---- */
    this.scoreTxt = scene.add.text(GAME_WIDTH / 2, 10, 'SCORE: 0', {
      ...S, fontSize: '18px', color: '#ffcc00', strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(D);

    /* ---- foes remaining ---- */
    this.foesTxt = scene.add.text(GAME_WIDTH - 12, 10, `FOES: ${scene.aiCarsAlive}`, {
      ...S, color: '#ff6666'
    }).setOrigin(1, 0).setDepth(D);

    /* ---- active powerup ---- */
    this.powerTxt = scene.add.text(12, GAME_WIDTH ? 578 : 578, '', {
      ...S, color: '#00ff00'
    }).setDepth(D);

    /* ---- combo ---- */
    this.comboTxt = scene.add.text(GAME_WIDTH / 2, 575, '', {
      ...S, fontSize: '20px', color: '#ff8800', strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(D);
  }

  refresh() {
    const p = this.scene.player;

    /* health */
    const pct = Phaser.Math.Clamp(p.hp / p.maxHp, 0, 1);
    this.hpBar.displayWidth = 180 * pct;
    this.hpBar.fillColor    = pct > 0.3 ? 0x22cc22 : 0xcc2222;

    /* score */
    this.scoreTxt.setText(`SCORE: ${p.score}`);

    /* foes */
    this.foesTxt.setText(`FOES: ${this.scene.aiCarsAlive}`);

    /* powerup */
    this.powerTxt.setText(p.activePowerup || '');

    /* combo */
    if (p.combo > 0) {
      this.comboTxt.setText(`COMBO x${p.combo + 1}!`).setAlpha(1);
    } else {
      this.comboTxt.setAlpha(0);
    }
  }
}
