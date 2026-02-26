/* -------------------------------------------------
 *  AiCar – simple seek-and-ram opponent
 * ------------------------------------------------- */
import Phaser from 'phaser';
import { AI, COMBAT } from '../config.js';

export class AiCar extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, textureKey, name) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.monsterName      = name;
    this.hp               = AI.HP;
    this.maxHp            = AI.HP;
    this.alive            = true;
    this.shieldHits       = 0;
    this.speedMultiplier  = 1;
    this.damageMultiplier = 1;
    this.invulnerable     = false;

    /* AI target */
    this.targetX        = x;
    this.targetY        = y;
    this.nextTargetTime = 0;
    this.aggression     = AI.AGGRESSION + Math.random() * 0.2;

    /* physics */
    this.body.setCircle(13, 9, 1);
    this.body.setDrag(AI.DRAG, AI.DRAG);
    this.body.setMaxVelocity(AI.MAX_SPEED);
    this.body.setBounce(AI.BOUNCE);
    this.body.setCollideWorldBounds(true);
    this.setDepth(10);
  }

  /* ---- per-frame ------------------------------------------------ */

  update(time) {
    if (!this.alive) return;

    if (time > this.nextTargetTime) this.chooseTarget(time);

    /* steer toward target */
    const desired = Phaser.Math.Angle.Between(
      this.x, this.y, this.targetX, this.targetY
    );
    const diff = Phaser.Math.Angle.Wrap(desired - this.rotation);

    if (Math.abs(diff) > 0.1) {
      this.body.setAngularVelocity(diff > 0 ? AI.TURN_SPEED : -AI.TURN_SPEED);
    } else {
      this.body.setAngularVelocity(0);
    }

    /* throttle */
    const accel = AI.ACCELERATION * this.speedMultiplier;
    this.scene.physics.velocityFromRotation(
      this.rotation, accel, this.body.acceleration
    );
  }

  chooseTarget(time) {
    const player = this.scene.player;

    if (player && player.alive && Math.random() < this.aggression) {
      /* aim at player */
      this.targetX = player.x;
      this.targetY = player.y;
      this.nextTargetTime = time + 800 + Math.random() * 1200;
    } else {
      /* random point inside the arena */
      this.targetX = 60 + Math.random() * 680;
      this.targetY = 60 + Math.random() * 480;
      this.nextTargetTime = time + AI.TARGET_SWITCH_TIME + Math.random() * 2000;
    }
  }

  /* ---- damage --------------------------------------------------- */

  takeDamage(amount) {
    if (this.invulnerable || !this.alive) return;

    if (this.shieldHits > 0) {
      this.shieldHits--;
      return;
    }

    this.hp = Math.max(0, this.hp - amount);

    /* flash red */
    this.setTint(0xff0000);
    this.scene.time.delayedCall(120, () => {
      if (this.alive) this.clearTint();
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

    /* let the scene know */
    if (typeof this.scene.onAiDestroyed === 'function') {
      this.scene.onAiDestroyed(this);
    }
  }
}
