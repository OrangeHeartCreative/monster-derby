/* -------------------------------------------------
 *  Hud – polished in-game heads-up display
 *  Rendered on a separate un-zoomed camera.
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const D = 50; // depth
const BAR_W = 160;
const BAR_H = 12;

export class Hud {

  constructor(scene) {
    this.scene = scene;

    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    /* ---- top bar backdrop (semi-transparent strip) ---- */
    this.topBg = scene.add.rectangle(W / 2, 0, W, 36, 0x000000, 0.45)
      .setOrigin(0.5, 0).setDepth(D - 1);

    /* ---- bottom bar backdrop ---- */
    this.botBg = scene.add.rectangle(W / 2, H, W, 32, 0x000000, 0.35)
      .setOrigin(0.5, 1).setDepth(D - 1);

    const S = { fontSize: '12px', fontFamily: 'monospace', stroke: '#000', strokeThickness: 2 };

    /* ---- health bar ---- */
    this.hpIcon = scene.add.text(10, 12, '\u2764', {
      fontSize: '14px', color: '#ff4444'
    }).setDepth(D);
    this.hpBg  = scene.add.rectangle(32, 16, BAR_W, BAR_H, 0x222222)
      .setOrigin(0, 0.5).setStrokeStyle(1, 0x444444, 0.6).setDepth(D);
    this.hpBar = scene.add.rectangle(32, 16, BAR_W, BAR_H, 0x22cc22)
      .setOrigin(0, 0.5).setDepth(D + 1);
    this.hpPct = scene.add.text(32 + BAR_W + 6, 16, '100%', {
      ...S, fontSize: '10px', color: '#aaa'
    }).setOrigin(0, 0.5).setDepth(D);

    /* ---- score ---- */
    this.scoreTxt = scene.add.text(W / 2, 18, '0', {
      ...S, fontSize: '20px', color: '#ffcc00', strokeThickness: 3
    }).setOrigin(0.5, 0.5).setDepth(D);
    this.scoreLabel = scene.add.text(W / 2, 4, 'SCORE', {
      fontSize: '8px', fontFamily: 'monospace', color: '#887744'
    }).setOrigin(0.5, 0).setDepth(D);

    /* ---- foes remaining ---- */
    this.foesIcon = scene.add.text(W - 10, 6, '\u2620', {
      fontSize: '12px', color: '#ff6666'
    }).setOrigin(1, 0).setDepth(D);
    this.foesTxt = scene.add.text(W - 10, 20, `${scene.aiCarsAlive}`, {
      ...S, fontSize: '16px', color: '#ff6666', strokeThickness: 3
    }).setOrigin(1, 0).setDepth(D);
    this.foesLabel = scene.add.text(W - 28, 6, 'FOES', {
      fontSize: '8px', fontFamily: 'monospace', color: '#884444'
    }).setOrigin(1, 0).setDepth(D);

    /* ---- active powerup (bottom-left) ---- */
    this.powerTxt = scene.add.text(12, H - 20, '', {
      ...S, fontSize: '13px', color: '#00ff88', strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(D);

    /* ---- combo (bottom-center) ---- */
    this.comboTxt = scene.add.text(W / 2, H - 18, '', {
      ...S, fontSize: '22px', color: '#ff8800', strokeThickness: 4
    }).setOrigin(0.5, 0.5).setDepth(D);
  }

  /** Return all HUD display objects (for camera ignore/include). */
  getObjects() {
    return [
      this.topBg, this.botBg,
      this.hpIcon, this.hpBg, this.hpBar, this.hpPct,
      this.scoreTxt, this.scoreLabel,
      this.foesIcon, this.foesTxt, this.foesLabel,
      this.powerTxt, this.comboTxt
    ];
  }

  refresh() {
    const p = this.scene.player;

    /* health */
    const pct = Phaser.Math.Clamp(p.hp / p.maxHp, 0, 1);
    this.hpBar.displayWidth = BAR_W * pct;
    if (pct > 0.5) {
      this.hpBar.fillColor = 0x22cc22;
    } else if (pct > 0.25) {
      this.hpBar.fillColor = 0xccaa22;
    } else {
      this.hpBar.fillColor = 0xcc2222;
    }
    this.hpPct.setText(`${Math.round(pct * 100)}%`);

    /* score */
    this.scoreTxt.setText(String(p.score));

    /* foes */
    this.foesTxt.setText(String(this.scene.aiCarsAlive));

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
