/* -------------------------------------------------
 *  PreloadScene – generate every placeholder texture
 *  so the game needs zero external image files.
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { MONSTER_ROSTER } from '../config.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  /* ---- helpers --------------------------------------------------- */

  /** Return an integer colour darkened by `amount` (0-255). */
  static darken(color, amount) {
    const r = Math.max(0, ((color >> 16) & 0xff) - amount);
    const g = Math.max(0, ((color >> 8) & 0xff) - amount);
    const b = Math.max(0, (color & 0xff) - amount);
    return (r << 16) | (g << 8) | b;
  }

  /* ---- lifecycle ------------------------------------------------- */

  create() {
    /* ---- styled loading screen ---- */
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0e0e);
    bg.fillRect(0, 0, 800, 600);
    bg.fillStyle(0x1a1008, 0.6);
    bg.fillCircle(400, 260, 380);
    bg.fillStyle(0x1a1408, 0.25);
    bg.fillCircle(400, 260, 480);

    bg.lineStyle(1, 0x443300, 0.35);
    bg.lineBetween(200, 320, 600, 320);

    this.add.text(400, 200, 'CRASH  DERBY', {
      fontSize: '36px', fontFamily: 'monospace', color: '#ff4444',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(400, 240, 'MONSTERS', {
      fontSize: '46px', fontFamily: 'monospace', color: '#ffcc00',
      stroke: '#220000', strokeThickness: 6
    }).setOrigin(0.5);

    const dots = this.add.text(400, 350, 'FORGING MACHINES…', {
      fontSize: '13px', fontFamily: 'monospace', color: '#886644'
    }).setOrigin(0.5);

    /* tiny loading bar */
    const barW = 180;
    this.add.rectangle(400, 380, barW, 6, 0x222222)
      .setStrokeStyle(1, 0x443300, 0.4);
    const fill = this.add.rectangle(400 - barW / 2, 380, 0, 6, 0xff6622)
      .setOrigin(0, 0.5);

    /* run generation in stepped fashion so bar has time to appear */
    this.time.delayedCall(60, () => {
      fill.displayWidth = barW * 0.15;
      this.generateLogoTexture();

      this.time.delayedCall(60, () => {
        fill.displayWidth = barW * 0.4;
        this.generateCarTextures();

        this.time.delayedCall(60, () => {
          fill.displayWidth = barW * 0.6;
          this.generatePowerupTextures();
          this.generatePitfallTextures();

          this.time.delayedCall(60, () => {
            fill.displayWidth = barW * 0.85;
            this.generateParticleTextures();
            this.generateObstacleTexture();

            this.time.delayedCall(60, () => {
              fill.displayWidth = barW;
              dots.setText('READY');

              this.time.delayedCall(350, () => {
                this.scene.start('MenuScene');
              });
            });
          });
        });
      });
    });
  }

  /* ---- logo texture (skull & crossed pistons) ------------------- */

  generateLogoTexture() {
    const g = this.add.graphics();
    const w = 120;
    const h = 100;

    /* crossed pistons behind skull */
    g.lineStyle(5, 0x888888, 1);
    g.beginPath();
    g.moveTo(10, 85); g.lineTo(110, 15);
    g.strokePath();
    g.beginPath();
    g.moveTo(110, 85); g.lineTo(10, 15);
    g.strokePath();

    /* piston heads (rectangles at each end) */
    g.fillStyle(0xaaaaaa);
    g.fillRect(2, 8, 16, 12);   // top-left
    g.fillRect(102, 8, 16, 12); // top-right
    g.fillRect(2, 80, 16, 12);  // bottom-left
    g.fillRect(102, 80, 16, 12);// bottom-right
    /* piston rod grooves */
    g.fillStyle(0x666666);
    g.fillRect(5, 12, 10, 3);
    g.fillRect(105, 12, 10, 3);
    g.fillRect(5, 84, 10, 3);
    g.fillRect(105, 84, 10, 3);

    /* skull cranium */
    g.fillStyle(0xeeeeee);
    g.fillCircle(60, 38, 22);
    /* jaw */
    g.fillRoundedRect(42, 48, 36, 16, 4);
    /* darker cranium shading */
    g.fillStyle(0xcccccc);
    g.fillCircle(60, 40, 16);
    g.fillStyle(0xeeeeee);
    g.fillCircle(60, 36, 16);

    /* eye sockets */
    g.fillStyle(0xff2200);
    g.fillCircle(52, 36, 6);
    g.fillCircle(68, 36, 6);
    /* dark inner eyes */
    g.fillStyle(0x330000);
    g.fillCircle(52, 36, 3);
    g.fillCircle(68, 36, 3);
    /* glowing red pupils */
    g.fillStyle(0xff4400);
    g.fillCircle(52, 35, 1);
    g.fillCircle(68, 35, 1);

    /* nose cavity */
    g.fillStyle(0x222222);
    g.fillTriangle(58, 44, 62, 44, 60, 48);

    /* teeth */
    g.fillStyle(0xffffff);
    for (let i = 0; i < 6; i++) {
      g.fillRect(47 + i * 4, 50, 3, 5);
    }
    /* tooth gaps */
    g.fillStyle(0x222222);
    for (let i = 0; i < 5; i++) {
      g.fillRect(50 + i * 4, 51, 1, 3);
    }

    /* jaw line / crack detail */
    g.lineStyle(1, 0x999999, 0.5);
    g.beginPath();
    g.moveTo(52, 30); g.lineTo(55, 26); g.lineTo(58, 32);
    g.strokePath();

    g.generateTexture('logo', w, h);
    g.destroy();
  }

  /* ---- car textures (facing RIGHT = 0°) ------------------------- */

  generateCarTextures() {
    MONSTER_ROSTER.forEach(monster => {
      this.makeCarTexture(monster.textureKey, monster.color, monster.id);
    });
  }

  /** Draw the base car chassis shared by every monster. */
  drawCarBase(g, w, h, bodyColor) {
    const dark = PreloadScene.darken(bodyColor, 60);

    // Wheels (four corners)
    g.fillStyle(0x222222);
    g.fillRect(2, 0, 8, 6);
    g.fillRect(2, h - 6, 8, 6);
    g.fillRect(w - 10, 0, 8, 6);
    g.fillRect(w - 10, h - 6, 8, 6);
    // Wheel highlight
    g.fillStyle(0x444444);
    g.fillRect(3, 1, 6, 2);
    g.fillRect(3, h - 5, 6, 2);
    g.fillRect(w - 9, 1, 6, 2);
    g.fillRect(w - 9, h - 5, 6, 2);

    // Body outline
    g.fillStyle(dark);
    g.fillRect(6, 2, w - 12, h - 4);
    // Body fill
    g.fillStyle(bodyColor);
    g.fillRect(8, 4, w - 16, h - 8);

    // Exhaust
    g.fillStyle(0x777777);
    g.fillRect(6, 8, 3, 3);
    g.fillRect(6, h - 11, 3, 3);
  }

  makeCarTexture(key, bodyColor, monsterId) {
    const g = this.add.graphics();
    const w = 44;
    const h = 28;

    this.drawCarBase(g, w, h, bodyColor);

    /* --- monster driver (visible from above, seated in rear half) --- */
    const drawFn = this.monsterDrawers[monsterId] ?? this.monsterDrawers._default;
    drawFn(g);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** Per-monster drawing helpers keyed by roster id. */
  get monsterDrawers() {
    return {
      // Werewolf-like beast – large fangs, pointed ears
      fang(g) {
        g.fillStyle(0x557733);
        g.fillRect(14, 7, 10, 14);                       // head
        g.fillStyle(PreloadScene.darken(0x557733, 40));
        g.fillRect(13, 5, 4, 5);                          // left ear
        g.fillRect(13, 18, 4, 5);                         // right ear
        g.fillStyle(0xffff00);
        g.fillRect(22, 9, 3, 3);                          // fierce yellow eyes
        g.fillRect(22, 17, 3, 3);
        g.fillStyle(0xffffff);
        g.fillTriangle(26, 8, 30, 10, 26, 12);           // oversized fangs
        g.fillTriangle(26, 16, 30, 18, 26, 20);
        g.fillRect(25, 12, 2, 1);                         // small inner fangs
        g.fillRect(25, 15, 2, 1);
      },

      // Ogre / hulk – massive head, horns, underbite tusks
      brute(g) {
        g.fillStyle(0x884444);
        g.fillRect(12, 5, 14, 18);                        // big blocky head
        g.fillStyle(PreloadScene.darken(0x884444, 50));
        g.fillRect(12, 4, 14, 2);                         // brow ridge
        g.fillStyle(0xccaa66);
        g.fillTriangle(12, 4, 8, 0, 14, 6);              // horns
        g.fillTriangle(12, 24, 8, 28, 14, 22);
        g.fillStyle(0xff2222);
        g.fillRect(22, 8, 4, 3);                          // angry eyes
        g.fillRect(22, 17, 4, 3);
        g.fillStyle(0xeeddaa);
        g.fillRect(26, 6, 2, 3);                          // tusks
        g.fillRect(26, 19, 2, 3);
      },

      // Serpent driver – narrow head, slit eyes, forked tongue
      viper(g) {
        g.fillStyle(0x2266aa);
        g.fillRect(16, 9, 12, 10);                        // sleek narrow head
        g.fillStyle(PreloadScene.darken(0x2266aa, 30));
        g.fillRect(15, 10, 2, 8);                         // hood flare
        g.fillRect(15, 10, 14, 2);                        // hood top
        g.fillRect(15, 16, 14, 2);                        // hood bottom
        g.fillStyle(0x00ff44);
        g.fillRect(24, 11, 3, 2);                         // slit eyes
        g.fillRect(24, 15, 3, 2);
        g.fillStyle(0x000000);
        g.fillRect(25, 11, 1, 2);                         // slit pupils
        g.fillRect(25, 15, 1, 2);
        g.fillStyle(0xff4466);
        g.fillRect(28, 13, 4, 1);                         // forked tongue
        g.fillRect(32, 12, 2, 1);
        g.fillRect(32, 14, 2, 1);
      },

      // Lava demon – cracked glowing head, ember eyes
      magma(g) {
        g.fillStyle(0x993300);
        g.fillRect(13, 6, 12, 16);                        // rocky head
        g.fillStyle(0xff6600);
        g.fillRect(15, 8, 1, 12);                         // lava cracks
        g.fillRect(19, 7, 1, 14);
        g.fillRect(22, 9, 1, 10);
        g.fillStyle(0xffaa00);
        g.fillRect(17, 10, 1, 6);
        g.fillStyle(0xffcc00);
        g.fillRect(23, 8, 3, 3);                          // ember eyes
        g.fillRect(23, 17, 3, 3);
        g.fillStyle(0xff2200);
        g.fillRect(24, 9, 1, 1);                          // burning pupils
        g.fillRect(24, 18, 1, 1);
        g.fillStyle(0x555555, 0.5);
        g.fillRect(11, 9, 2, 2);                          // smoke wisps
        g.fillRect(10, 13, 2, 2);
      },

      // Ghost / wraith – translucent, hollow eyes, trailing wisps
      specter(g) {
        g.fillStyle(0x8844bb, 0.6);
        g.fillRect(14, 6, 11, 16);                        // ghostly form
        g.fillStyle(0x8844bb, 0.3);
        g.fillRect(11, 8, 3, 12);                         // trailing wisp
        g.fillRect(9, 10, 2, 8);
        g.fillStyle(0x000000);
        g.fillRect(21, 8, 4, 4);                          // hollow eyes
        g.fillRect(21, 16, 4, 4);
        g.fillStyle(0xffffff);
        g.fillRect(23, 9, 1, 1);                          // pinprick pupils
        g.fillRect(23, 17, 1, 1);
        g.fillStyle(0x220033);
        g.fillRect(22, 12, 3, 3);                         // wailing mouth
      },

      // Armored colossus – helmet, visor slit, metal jaw
      titan(g) {
        g.fillStyle(0x666677);
        g.fillRect(12, 5, 14, 18);                        // helmet
        g.fillStyle(PreloadScene.darken(0x666677, 30));
        g.fillRect(12, 4, 14, 3);                         // helmet crest
        g.fillRect(12, 22, 14, 3);
        g.fillStyle(0x44aaff);
        g.fillRect(22, 9, 4, 2);                          // visor slit glow
        g.fillRect(22, 17, 4, 2);
        g.fillStyle(0xaaaaaa);
        g.fillRect(14, 8, 2, 2);                          // rivets
        g.fillRect(14, 18, 2, 2);
        g.fillRect(14, 13, 2, 2);
        g.fillStyle(0x555566);
        g.fillRect(22, 12, 3, 4);                         // metal jaw plate
        g.fillStyle(0x888888);
        g.fillRect(23, 13, 1, 2);
      },

      // Electric gremlin – spiky hair, crackling eyes, jagged features
      blitz(g) {
        g.fillStyle(0xccaa00);
        g.fillRect(15, 8, 10, 12);                        // head
        g.fillStyle(0xffee00);
        g.fillTriangle(15, 6, 12, 0, 18, 8);             // lightning spikes
        g.fillTriangle(15, 22, 12, 28, 18, 20);
        g.fillTriangle(20, 5, 19, 0, 23, 7);
        g.fillTriangle(20, 23, 19, 28, 23, 21);
        g.fillStyle(0xffffff);
        g.fillRect(23, 9, 3, 3);                          // crackling eyes
        g.fillRect(23, 16, 3, 3);
        g.fillStyle(0x44ddff);
        g.fillRect(24, 10, 2, 2);                         // electric-blue iris
        g.fillRect(24, 17, 2, 2);
        g.fillStyle(0xffff88);
        g.fillRect(13, 11, 1, 1);                         // spark flickers
        g.fillRect(27, 13, 1, 1);
        g.fillRect(13, 17, 1, 1);
      },

      // Plant-golem – mossy head, vine tendrils, thorn spikes
      thorn(g) {
        g.fillStyle(0x337744);
        g.fillRect(14, 7, 11, 14);                        // mossy head
        g.fillStyle(0x225533);
        g.fillRect(14, 7, 11, 2);                         // bark brow
        g.fillStyle(0x88cc44);
        g.fillTriangle(14, 5, 11, 3, 16, 7);             // thorn spikes
        g.fillTriangle(14, 23, 11, 25, 16, 21);
        g.fillTriangle(25, 5, 28, 3, 23, 7);
        g.fillTriangle(25, 23, 28, 25, 23, 21);
        g.fillStyle(0x44aa55);
        g.fillRect(11, 10, 3, 1);                         // vine tendrils
        g.fillRect(10, 12, 2, 1);
        g.fillRect(11, 17, 3, 1);
        g.fillRect(10, 15, 2, 1);
        g.fillStyle(0xaaff22);
        g.fillRect(22, 9, 3, 3);                          // glowing sap eyes
        g.fillRect(22, 16, 3, 3);
        g.fillStyle(0x335511);
        g.fillRect(23, 10, 1, 1);                         // dark pupils
        g.fillRect(23, 17, 1, 1);
      },

      // Fallback generic monster
      _default(g) {
        g.fillStyle(0xffffff);
        g.fillRect(22, 8, 3, 3);
        g.fillRect(22, 17, 3, 3);
        g.fillStyle(0xff0000);
        g.fillRect(23, 9, 2, 2);
        g.fillRect(23, 18, 2, 2);
      }
    };
  }

  /* ---- powerup textures ----------------------------------------- */

  generatePowerupTextures() {
    this.makePowerupTexture('power_speed',    0x00ff00);
    this.makePowerupTexture('power_shield',   0x4488ff);
    this.makePowerupTexture('power_mega_ram', 0xff4444);
  }

  makePowerupTexture(key, color) {
    const g = this.add.graphics();
    const s = 22;

    // Outer glow
    g.fillStyle(color, 0.25);
    g.fillCircle(s / 2, s / 2, s / 2);

    // Main body
    g.fillStyle(color);
    g.fillCircle(s / 2, s / 2, s / 2 - 2);

    // Highlight
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(s / 2 - 2, s / 2 - 2, 3);

    // Icon hints
    g.fillStyle(0xffffff);
    if (key.includes('speed')) {
      g.fillTriangle(s / 2, 4, s / 2 + 5, s / 2, s / 2 - 2, s / 2);
      g.fillTriangle(s / 2, s - 4, s / 2 - 5, s / 2, s / 2 + 2, s / 2);
    } else if (key.includes('shield')) {
      g.fillRect(s / 2 - 3, 5, 6, 12);
      g.fillRect(s / 2 - 5, 5, 10, 3);
    } else {
      // star / burst
      g.fillRect(s / 2 - 1, 5, 2, s - 10);
      g.fillRect(5, s / 2 - 1, s - 10, 2);
    }

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /* ---- pitfall textures ----------------------------------------- */

  generatePitfallTextures() {
    this.makePitfallOil();
    this.makePitfallPit();
    this.makePitfallSpikes();
  }

  makePitfallOil() {
    const g = this.add.graphics();
    const s = 36;
    g.fillStyle(0x553311);
    g.fillCircle(s / 2, s / 2, s / 2);
    g.fillStyle(0x886622);
    g.fillCircle(s / 2 - 2, s / 2 - 2, s / 2 - 4);
    g.fillStyle(0xaa8844, 0.4);
    g.fillCircle(s / 2 + 4, s / 2 - 4, 5);
    g.generateTexture('oil_slick', s, s);
    g.destroy();
  }

  makePitfallPit() {
    const g = this.add.graphics();
    const s = 36;
    g.fillStyle(0x222222);
    g.fillCircle(s / 2, s / 2, s / 2);
    g.fillStyle(0x111111);
    g.fillCircle(s / 2, s / 2, s / 2 - 4);
    g.fillStyle(0x000000);
    g.fillCircle(s / 2, s / 2, s / 2 - 8);
    g.generateTexture('pit_hole', s, s);
    g.destroy();
  }

  makePitfallSpikes() {
    const g = this.add.graphics();
    const s = 36;
    g.fillStyle(0x884400);
    g.fillRect(0, 0, s, s);
    g.fillStyle(0xff8800);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cx = 5 + i * 8;
        const cy = 5 + j * 8;
        g.fillTriangle(cx, cy - 3, cx + 3, cy + 3, cx - 3, cy + 3);
      }
    }
    g.generateTexture('spike_strip', s, s);
    g.destroy();
  }

  /* ---- particle textures ---------------------------------------- */

  generateParticleTextures() {
    this.makeSquare('spark',  0xffee44, 4);
    this.makeSquare('smoke',  0x888888, 6);
    this.makeSquare('debris', 0xaa6633, 3);
  }

  makeSquare(key, color, size) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  /* ---- obstacle texture ----------------------------------------- */

  generateObstacleTexture() {
    const g = this.add.graphics();
    const r = 18;
    g.fillStyle(0x444444);
    g.fillCircle(r, r, r);
    g.fillStyle(0x333333);
    g.fillCircle(r, r, r - 4);
    g.fillStyle(0x222222);
    g.fillCircle(r, r, r - 9);
    g.generateTexture('obstacle', r * 2, r * 2);
    g.destroy();
  }
}
