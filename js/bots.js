// js/bots.js - Active Helper Farm Bots with Smooth Walking and Autonomous AI

class HelperBot {
  constructor(id, name, type, x, y, farm) {
    this.id = id;
    this.name = name;
    this.type = type; // 'boni', 'slime', 'chicky'
    this.farm = farm;

    this.x = x * farm.tileSize;
    this.y = y * farm.tileSize;
    this.speed = type === 'slime' ? 34 : (type === 'chicky' ? 42 : 38);

    this.role = type === 'boni' ? 'harvest' : (type === 'slime' ? 'water' : 'feed');
    this.state = 'idle';
    this.timer = 1.0;
    this.targetTile = null;

    this.dir = 'down';
    this.frame = 0;
    this.animTimer = 0;
    this.isMoving = false;

    this.bubbleText = '';
    this.bubbleTimer = 0;
  }

  say(text, duration = 3) {
    this.bubbleText = text;
    this.bubbleTimer = duration;
    if (window.soundSystem) window.soundSystem.playBotChirp();
  }

  isUnlocked() {
    return !!(this.farm.unlockedBots && this.farm.unlockedBots[this.id]);
  }

  update(delta) {
    if (!this.isUnlocked()) return;

    if (this.bubbleTimer > 0) {
      this.bubbleTimer -= delta;
      if (this.bubbleTimer <= 0) this.bubbleText = '';
    }

    // Always advance animation frames smoothly
    this.animTimer += delta;
    if (this.animTimer >= 0.12) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 6;
    }

    // AI Routine
    if (this.state === 'idle') {
      this.isMoving = false;
      this.timer -= delta;
      if (this.timer <= 0) {
        this.findTask();
      }
    } else if (this.state === 'moving') {
      this.isMoving = true;
      this.moveToTarget(delta);
    } else if (this.state === 'working') {
      this.isMoving = false;
      this.timer -= delta;
      if (this.timer <= 0) {
        this.finishTask();
      }
    }
  }

  findTask() {
    if (this.role === 'harvest') {
      let bestTile = null;
      let bestDist = Infinity;
      const ctx = Math.floor((this.x + 8) / this.farm.tileSize);
      const cty = Math.floor((this.y + 8) / this.farm.tileSize);

      for (let y = 0; y < this.farm.rows; y++) {
        for (let x = 0; x < this.farm.cols; x++) {
          const t = this.farm.grid[y][x];
          if (t.crop && t.crop.ready) {
            const dist = Math.hypot(x - ctx, y - cty);
            if (dist < bestDist) {
              bestDist = dist;
              bestTile = { x, y };
            }
          }
        }
      }

      if (bestTile) {
        this.targetTile = bestTile;
        this.state = 'moving';
        this.say('Ada panen siap! Menuju ke sana~ 🧺', 2.5);
      } else {
        this.timer = 1.5 + Math.random() * 2;
        this.wander();
      }
    } else if (this.role === 'water') {
      let bestTile = null;
      let bestDist = Infinity;
      const ctx = Math.floor((this.x + 8) / this.farm.tileSize);
      const cty = Math.floor((this.y + 8) / this.farm.tileSize);

      for (let y = 0; y < this.farm.rows; y++) {
        for (let x = 0; x < this.farm.cols; x++) {
          const t = this.farm.grid[y][x];
          if (t.tilled && !t.watered) {
            const dist = Math.hypot(x - ctx, y - cty);
            if (dist < bestDist) {
              bestDist = dist;
              bestTile = { x, y };
            }
          }
        }
      }

      if (bestTile) {
        this.targetTile = bestTile;
        this.state = 'moving';
        this.say('Menyiram tanah kering~ 💦', 2.5);
      } else {
        this.timer = 1.5 + Math.random() * 2;
        this.wander();
      }
    } else {
      this.timer = 2;
      this.wander();
    }
  }

  wander() {
    const ctx = Math.floor(this.x / this.farm.tileSize);
    const cty = Math.floor(this.y / this.farm.tileSize);
    const dx = Math.floor(Math.random() * 9) - 4;
    const dy = Math.floor(Math.random() * 9) - 4;
    const nx = Math.max(13, Math.min(33, ctx + dx));
    const ny = Math.max(9, Math.min(23, cty + dy));

    if (!this.farm.isCollidable(nx, ny, 'farm')) {
      this.targetTile = { x: nx, y: ny };
      this.state = 'moving';
    }
  }

  moveToTarget(delta) {
    if (!this.targetTile) {
      this.state = 'idle';
      this.timer = 1;
      return;
    }

    const tpx = (this.targetTile.x + 0.5) * this.farm.tileSize;
    const tpy = (this.targetTile.y + 0.5) * this.farm.tileSize;
    const dx = tpx - (this.x + 16);
    const dy = tpy - (this.y + 16);
    const dist = Math.hypot(dx, dy);

    if (dist < 5) {
      this.state = 'working';
      this.timer = 1.0;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = dx > 0 ? 'right' : 'left';
    } else {
      this.dir = dy > 0 ? 'down' : 'up';
    }

    const step = this.speed * delta;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  finishTask() {
    if (!this.targetTile) {
      this.state = 'idle';
      this.timer = 1;
      return;
    }

    const { x, y } = this.targetTile;
    if (this.role === 'harvest') {
      const def = this.farm.harvestCrop(x, y);
      if (def) {
        this.say(`Panen ${def.name} selesai! 🧺✨`, 3);
        if (window.soundSystem) window.soundSystem.playHarvest();
      }
    } else if (this.role === 'water') {
      const ok = this.farm.waterSoil(x, y);
      if (ok) {
        this.say('Croot! Segar kembali~ 💦', 2.5);
        if (window.soundSystem) window.soundSystem.playWater();
      }
    }

    this.state = 'idle';
    this.timer = 1.2;
    this.targetTile = null;
  }
}

class BotManager {
  constructor(farm) {
    this.farm = farm;
    this.bots = [
      new HelperBot('slime', 'Slimey Si Air 💦', 'slime', 20, 13, farm),
      new HelperBot('boni', 'Boni Si Panen 💀', 'boni', 18, 13, farm),
      new HelperBot('chicky', 'Chicky Si Asisten 🐥', 'chicky', 15, 13, farm)
    ];
  }

  update(delta) {
    this.bots.forEach(b => b.update(delta));
  }

  getBotsData() {
    return this.bots.map(b => ({
      id: b.id,
      name: b.name,
      x: Math.round(b.x),
      y: Math.round(b.y),
      dir: b.dir,
      frame: b.frame,
      isMoving: b.isMoving,
      state: b.state,
      bubbleText: b.bubbleText,
      unlocked: b.isUnlocked()
    }));
  }

  applyBotsData(data) {
    if (!Array.isArray(data)) return;
    data.forEach(item => {
      const bot = this.bots.find(b => b.id === item.id);
      if (bot) {
        bot.x = item.x;
        bot.y = item.y;
        bot.dir = item.dir;
        bot.frame = item.frame;
        bot.isMoving = item.isMoving;
        bot.state = item.state;
        bot.bubbleText = item.bubbleText;
      }
    });
  }
}

window.BotManager = BotManager;
window.HelperBot = HelperBot;
