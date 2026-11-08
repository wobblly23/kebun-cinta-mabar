// js/animals.js - Pasture Animals & Interaction
// Cow, Chicken, Pig, Sheep, and Baby Chick with grazing AI and couple petting interaction!

class FarmAnimal {
  constructor(id, name, type, x, y, bounds, farm) {
    this.id = id;
    this.name = name;
    this.type = type; // 'cow', 'chicken', 'pig', 'sheep', 'baby_chick'
    this.farm = farm;
    this.bounds = bounds; // { minX, maxX, minY, maxY }

    this.x = x * farm.tileSize;
    this.y = y * farm.tileSize;
    this.speed = type === 'baby_chick' ? 24 : (type === 'chicken' ? 20 : 16);

    this.dir = 'right'; // 'left', 'right'
    this.state = 'idle'; // 'idle', 'grazing', 'walking'
    this.timer = 2 + Math.random() * 3;
    this.frame = 0;
    this.animTimer = 0;

    // Petting cooldown & floating hearts
    this.petCooldown = 0;
    this.hearts = []; // [{ x, y, vy, life }]
  }

  update(delta) {
    // Update animation frames
    this.animTimer += delta;
    if (this.animTimer >= 0.25) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 2; // 2 frames per animal
    }

    if (this.petCooldown > 0) {
      this.petCooldown -= delta;
    }

    // Update floating hearts
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.y += h.vy * delta;
      h.life -= delta;
      if (h.life <= 0) {
        this.hearts.splice(i, 1);
      }
    }

    // AI state timer
    this.timer -= delta;
    if (this.timer <= 0) {
      const r = Math.random();
      if (r < 0.4) {
        this.state = 'idle';
        this.timer = 2 + Math.random() * 3;
      } else if (r < 0.7) {
        this.state = 'grazing';
        this.timer = 3 + Math.random() * 3;
      } else {
        this.state = 'walking';
        this.timer = 2 + Math.random() * 2;
        // Pick new random direction
        this.targetX = (this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX)) * this.farm.tileSize;
        this.targetY = (this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY)) * this.farm.tileSize;
      }
    }

    if (this.state === 'walking' && this.targetX !== undefined) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        this.state = 'idle';
        this.timer = 2;
      } else {
        this.dir = dx > 0 ? 'right' : 'left';
        const step = this.speed * delta;
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
    }
  }

  pet() {
    if (this.petCooldown > 0) return null;
    this.petCooldown = 15; // 15s cooldown per animal

    // Spawn floating hearts
    for (let i = 0; i < 3; i++) {
      this.hearts.push({
        x: this.x + 8 + (Math.random() * 12 - 6),
        y: this.y - 4,
        vy: -20 - Math.random() * 15,
        life: 1.5
      });
    }

    if (window.soundSystem) window.soundSystem.playPet();
    this.farm.addLovePoints(15);

    // Yield produce
    let produce = null;
    if (this.type === 'cow') {
      produce = { name: 'Susu Segar 🥛', id: 'milk', count: 1 };
      this.farm.chest.produce.milk = (this.farm.chest.produce.milk || 0) + 1;
    } else if (this.type === 'chicken') {
      produce = { name: 'Telur Emas 🥚', id: 'egg', count: 1 };
      this.farm.chest.produce.egg = (this.farm.chest.produce.egg || 0) + 1;
    } else if (this.type === 'sheep') {
      produce = { name: 'Wol Lembut 🧶', id: 'wool', count: 1 };
      this.farm.chest.produce.wool = (this.farm.chest.produce.wool || 0) + 1;
    } else {
      produce = { name: 'Kasih Sayang ❤️', id: null, count: 0 };
    }

    this.farm.autoSave();
    return produce;
  }
}

class AnimalManager {
  constructor(farm) {
    this.farm = farm;
    const pastureBounds = { minX: 3, maxX: 11, minY: 3, maxY: 10 };

    this.animals = [
      new FarmAnimal('cow1', 'Bessie Si Sapi', 'cow', 5, 5, pastureBounds, farm),
      new FarmAnimal('sheep1', 'Fluffy Si Domba', 'sheep', 9, 6, pastureBounds, farm),
      new FarmAnimal('pig1', 'Barnaby Si Babi', 'pig', 7, 8, pastureBounds, farm),
      new FarmAnimal('chicken1', 'Chicky Si Ayam', 'chicken', 4, 7, pastureBounds, farm),
      new FarmAnimal('chick1', 'Pipit Anak Ayam', 'baby_chick', 8, 4, pastureBounds, farm)
    ];
  }

  update(delta) {
    this.animals.forEach(a => a.update(delta));
  }

  getNearestAnimal(px, py, maxDist = 32) {
    let nearest = null;
    let minDist = maxDist;
    this.animals.forEach(a => {
      const d = Math.hypot(a.x + 16 - px, a.y + 16 - py);
      if (d < minDist) {
        minDist = d;
        nearest = a;
      }
    });
    return nearest;
  }
}

window.AnimalManager = AnimalManager;
window.FarmAnimal = FarmAnimal;

