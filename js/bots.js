// js/bots.js - Helper Farm Bots (Boni & Slimey)
// Autonomous NPC helpers that water dry crops, harvest ripe produce, and keep the farm flourishing!

class HelperBot {
  constructor(id, name, type, x, y, farm) {
    this.id = id;
    this.name = name;
    this.type = type; // 'boni' or 'slime'
    this.farm = farm;
    
    // Pixel coordinates
    this.x = x * farm.tileSize;
    this.y = y * farm.tileSize;
    this.speed = 36; // pixels per second

    // AI state
    this.enabled = true;
    this.role = type === 'boni' ? 'harvest' : 'water'; // 'harvest', 'water', 'idle'
    this.state = 'idle'; // 'idle', 'moving', 'working'
    this.timer = 0;
    this.targetTile = null;

    // Movement & Animation
    this.dir = 'down'; // 'down', 'right', 'up', 'left'
    this.frame = 0;
    this.animTimer = 0;
    this.isMoving = false;

    // Speech bubble
    this.bubbleText = '';
    this.bubbleTimer = 0;

    // Spritesheet details
    this.spriteWidth = 32;
    this.spriteHeight = 32;
  }

  say(text, duration = 3) {
    this.bubbleText = text;
    this.bubbleTimer = duration;
    if (window.soundSystem) window.soundSystem.playBotChirp();
  }

  update(delta) {
    if (!this.enabled) return;

    // Update speech bubble
    if (this.bubbleTimer > 0) {
      this.bubbleTimer -= delta;
      if (this.bubbleTimer <= 0) this.bubbleText = '';
    }

    // Update animation frames
    this.animTimer += delta;
    if (this.animTimer >= 0.15) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 6;
    }

    // AI State Machine
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
      // Find nearest ripe crop
      let bestTile = null;
      let bestDist = Infinity;
      const currentTileX = Math.floor(this.x / this.farm.tileSize);
      const currentTileY = Math.floor(this.y / this.farm.tileSize);

      for (let y = 0; y < this.farm.rows; y++) {
        for (let x = 0; x < this.farm.cols; x++) {
          const t = this.farm.grid[y][x];
          if (t.crop && t.crop.ready) {
            const dist = Math.hypot(x - currentTileX, y - currentTileY);
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
        this.say('Ada panen siap! Menuju ke sana~ 🧺', 2);
      } else {
        // No ripe crops, wander near farm or wait
        this.timer = 3 + Math.random() * 2;
        if (Math.random() > 0.6) {
          this.wander();
        }
      }
    } else if (this.role === 'water') {
      // Find dry farmland or unwatered crops
      let bestTile = null;
      let bestDist = Infinity;
      const currentTileX = Math.floor(this.x / this.farm.tileSize);
      const currentTileY = Math.floor(this.y / this.farm.tileSize);

      for (let y = 0; y < this.farm.rows; y++) {
        for (let x = 0; x < this.farm.cols; x++) {
          const t = this.farm.grid[y][x];
          if (t.tilled && !t.watered) {
            const dist = Math.hypot(x - currentTileX, y - currentTileY);
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
        this.say('Menyiram tanah kering~ 💦', 2);
      } else {
        this.timer = 3 + Math.random() * 2;
        if (Math.random() > 0.6) {
          this.wander();
        }
      }
    }
  }

  wander() {
    // Wander to a nearby walkable tile
    const currentTileX = Math.floor(this.x / this.farm.tileSize);
    const currentTileY = Math.floor(this.y / this.farm.tileSize);
    const dx = Math.floor(Math.random() * 7) - 3;
    const dy = Math.floor(Math.random() * 7) - 3;
    const nx = Math.max(1, Math.min(this.farm.cols - 2, currentTileX + dx));
    const ny = Math.max(1, Math.min(this.farm.rows - 2, currentTileY + dy));

    if (!this.farm.isCollidable(nx, ny)) {
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

    const targetPxX = (this.targetTile.x + 0.5) * this.farm.tileSize;
    const targetPxY = (this.targetTile.y + 0.5) * this.farm.tileSize;
    const dx = targetPxX - (this.x + 16);
    const dy = targetPxY - (this.y + 16);
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
      // Reached target
      if (this.role === 'harvest') {
        const tile = this.farm.grid[this.targetTile.y][this.targetTile.x];
        if (tile && tile.crop && tile.crop.ready) {
          this.state = 'working';
          this.timer = 1.2;
        } else {
          this.state = 'idle';
          this.timer = 1;
        }
      } else if (this.role === 'water') {
        const tile = this.farm.grid[this.targetTile.y][this.targetTile.x];
        if (tile && tile.tilled && !tile.watered) {
          this.state = 'working';
          this.timer = 1.0;
        } else {
          this.state = 'idle';
          this.timer = 1;
        }
      } else {
        this.state = 'idle';
        this.timer = 2;
      }
      return;
    }

    // Determine direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = dx > 0 ? 'right' : 'left';
    } else {
      this.dir = dy > 0 ? 'down' : 'up';
    }

    // Move
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
    this.timer = 1.5;
    this.targetTile = null;
  }
}

class BotManager {
  constructor(farm) {
    this.farm = farm;
    this.bots = [
      new HelperBot('boni', 'Boni Si Kerangka', 'boni', 10, 14, farm),
      new HelperBot('slime', 'Slimey Si Air', 'slime', 22, 14, farm)
    ];
  }

  update(delta) {
    this.bots.forEach(bot => bot.update(delta));
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
      enabled: b.enabled,
      role: b.role
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
        bot.enabled = item.enabled;
        bot.role = item.role;
      }
    });
  }
}

window.BotManager = BotManager;
window.HelperBot = HelperBot;
