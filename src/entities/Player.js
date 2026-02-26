/* -------------------------------------------------
 *  Player – keyboard-driven monster car
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { PLAYER, COMBAT, SCORE as SCORE_CFG } from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    /* state */
    this.hp               = PLAYER.HP;
    this.maxHp            = PLAYER.HP;
    this.alive            = true;
    this.shieldHits       = 0;
    this.speedMultiplier  = 1;
    this.damageMultiplier = 1;
    this.invulnerable     = false;
    this.score            = 0;
    this.combo            = 0;
    this.lastHitTime      = 0;
    this.activePowerup    = '';

    /* physics */
    this.body.setCircle(13, 9, 1);
    this.body.setDrag(PLAYER.DRAG, PLAYER.DRAG);
    this.body.setMaxVelocity(PLAYER.MAX_SPEED);
    this.body.setBounce(PLAYER.BOUNCE);
    this.body.setCollideWorldBounds(true);
    this.setDepth(10);

    /* input */
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd    = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D', brake: 'SPACE'
    });
  }

  /* ---- per-frame ------------------------------------------------ */

  update() {
    if (!this.alive) return;

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown;
    const brake = this.wasd.brake.isDown;

    /* turn (only effective when moving) */
    const speed      = this.body.velocity.length();
    const turnFactor = Math.min(speed / 80, 1);

    if (left) {
      this.body.setAngularVelocity(-PLAYER.TURN_SPEED * turnFactor);
    } else if (right) {
      this.body.setAngularVelocity(PLAYER.TURN_SPEED * turnFactor);
    } else {
      this.body.setAngularVelocity(0);
    }

    /* throttle / reverse */
    const maxSpd = PLAYER.MAX_SPEED * this.speedMultiplier;
    this.body.setMaxVelocity(maxSpd);

    if (up) {
      this.scene.physics.velocityFromRotation(
        this.rotation, PLAYER.ACCELERATION, this.body.acceleration
      );
    } else if (down) {
      this.scene.physics.velocityFromRotation(
        this.rotation, -PLAYER.ACCELERATION * 0.5, this.body.acceleration
      );
    } else {
      this.body.setAcceleration(0);
    }

    /* brake */
    if (brake) {
      this.body.setDrag(PLAYER.DRAG * 5, PLAYER.DRAG * 5);
    } else {
      this.body.setDrag(PLAYER.DRAG, PLAYER.DRAG);
    }
  }

  /* ---- damage --------------------------------------------------- */

  takeDamage(amount) {
    if (this.invulnerable || !this.alive) return;

    if (this.shieldHits > 0) {
      this.shieldHits--;
      this.scene.showFloatingText(this.x, this.y - 20, 'BLOCKED', '#4488ff');
      if (this.shieldHits <= 0) {
        this.clearTint();
        this.activePowerup = '';
      }
      return;
    }

    this.hp = Math.max(0, this.hp - amount);

    /* flash red */
    this.setTint(0xff0000);
    this.scene.time.delayedCall(120, () => {
      if (this.alive) this.restoreTint();
    });

    this.invulnerable = true;
    this.scene.time.delayedCall(COMBAT.INVULNERABILITY_MS, () => {
      this.invulnerable = false;
    });

    if (this.hp <= 0) this.die();
  }

  die() {
    this.alive = false;
    this.disableBody(true, true);
  }

  /* ---- powerups ------------------------------------------------- */

  applyPowerup(typeKey, cfg) {
    /* clear any pre-existing timed powerup */
    this.speedMultiplier  = 1;
    this.damageMultiplier = 1;

    switch (typeKey) {
      case 'SPEED':
        this.speedMultiplier = cfg.multiplier;
        this.setTint(0x00ff00);
        this.activePowerup = 'SPEED BOOST';
        this.scene.time.delayedCall(cfg.duration, () => {
          this.speedMultiplier = 1;
          if (this.alive) { this.clearTint(); this.activePowerup = ''; }
        });
        break;

      case 'SHIELD':
        this.shieldHits = cfg.hits;
        this.setTint(0x4488ff);
        this.activePowerup = `SHIELD x${cfg.hits}`;
        break;

      case 'MEGA_RAM':
        this.damageMultiplier = cfg.multiplier;
        this.setTint(0xff4444);
        this.activePowerup = 'MEGA RAM';
        this.scene.time.delayedCall(cfg.duration, () => {
          this.damageMultiplier = 1;
          if (this.alive) { this.clearTint(); this.activePowerup = ''; }
        });
        break;

      default:
        break;
    }
  }

  /* ---- score ---------------------------------------------------- */

  addScore(points) {
    const now = this.scene.time.now;
    if (now - this.lastHitTime < SCORE_CFG.COMBO_WINDOW) {
      this.combo++;
    } else {
      this.combo = 0;
    }
    this.lastHitTime = now;

    const mult = 1 + this.combo * SCORE_CFG.COMBO_MULTIPLIER;
    this.score += Math.round(points * mult);
  }

  /* ---- helpers -------------------------------------------------- */

  /** Re-apply powerup tint (or clear if none active). */
  restoreTint() {
    if (this.speedMultiplier > 1)  { this.setTint(0x00ff00); return; }
    if (this.shieldHits > 0)       { this.setTint(0x4488ff); return; }
    if (this.damageMultiplier > 1) { this.setTint(0xff4444); return; }
    this.clearTint();
  }
}
