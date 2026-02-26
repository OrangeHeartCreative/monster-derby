/* -------------------------------------------------
 *  Player – keyboard-driven monster car
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { PLAYER, COMBAT, SCORE as SCORE_CFG } from '../config.js';

export class Player extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, textureKey = 'monster_fang', stats = {}) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxSpeed = stats.maxSpeed ?? PLAYER.MAX_SPEED;
    this.accelerationForce = stats.acceleration ?? PLAYER.ACCELERATION;
    this.baseDrag = stats.drag ?? PLAYER.DRAG;
    this.turnSpeed = stats.turnSpeed ?? PLAYER.TURN_SPEED;
    this.bounce = stats.bounce ?? PLAYER.BOUNCE;
    this.baseHp = stats.hp ?? PLAYER.HP;
    this.sideGrip = stats.sideGrip ?? PLAYER.SIDE_GRIP;
    this.sideGripBrake = stats.sideGripBrake ?? PLAYER.SIDE_GRIP_BRAKE;

    /* state */
    this.hp               = this.baseHp;
    this.maxHp            = this.baseHp;
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
    this.body.setDrag(this.baseDrag, this.baseDrag);
    this.body.setMaxVelocity(this.maxSpeed);
    this.body.setBounce(this.bounce);
    this.body.setCollideWorldBounds(true);
    this.setDepth(10);

    /* input */
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd    = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D'
    });
  }

  /* ---- per-frame ------------------------------------------------ */

  update(_time, delta) {
    if (!this.alive) return;

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown;
    const accel = this.cursors.space.isDown;

    /* direction keys set the target facing angle */
    let dx = 0;
    let dy = 0;
    if (left)  dx -= 1;
    if (right) dx += 1;
    if (up)    dy -= 1;
    if (down)  dy += 1;

    if (dx !== 0 || dy !== 0) {
      const target = Math.atan2(dy, dx);
      const step = Phaser.Math.DegToRad(this.turnSpeed) * (delta / 1000);
      this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, target, step);
    }
    this.body.setAngularVelocity(0);

    /* space = accelerate in facing direction */
    const maxSpd = this.maxSpeed * this.speedMultiplier;
    this.body.setMaxVelocity(maxSpd);

    if (accel) {
      this.scene.physics.velocityFromRotation(
        this.rotation, this.accelerationForce, this.body.acceleration
      );
    } else {
      this.body.setAcceleration(0);
    }

    this.body.setDrag(this.baseDrag, this.baseDrag);
    this.applyGrip(false);
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

  applyGrip(braking) {
    const velocity = this.body.velocity;
    if (velocity.lengthSq() < 4) return;

    const forward = new Phaser.Math.Vector2(
      Math.cos(this.rotation),
      Math.sin(this.rotation)
    );

    const forwardSpeed = velocity.dot(forward);
    const forwardVel = forward.scale(forwardSpeed);
    const lateralVel = velocity.clone().subtract(forwardVel);
    const grip = braking ? this.sideGripBrake : this.sideGrip;

    velocity.x = forwardVel.x + lateralVel.x * (1 - grip);
    velocity.y = forwardVel.y + lateralVel.y * (1 - grip);
  }
}
