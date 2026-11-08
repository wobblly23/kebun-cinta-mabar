// js/animals.js - Pasture Animals System
// Animals start EMPTY and appear when purchased from Mak Siti's Animal Ranch!

class FarmAnimal {
  constructor(id, name, type, x, y, bounds, farm) {
    this.id = id;
    this.name = name;
    this.type = type; // 'cow', 'chicken', 'pig', 'sheep', 'baby_chick'
    this.farm = farm;
    this.bounds = bounds;

    this.x = x * farm.tileSize;
    this.y = y * farm.tileSize;
    this.speed = type === 'baby_chick' ? 24 : (type === 'chicken' ? 20 : 16);

    this.dir = 'right';
    this.state = 'idle';
    this.timer = 2 + Math.random() * 3;
    this.frame = 0;
    this.animTimer = 0;

    this.petCooldown = 0;
    this.hearts = [];
  }

  update(delta) {
    this.animTimer += delta;
    if (this.animTimer >= 0.25) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 2;
    }

    if (this.petCooldown > 0) {
      this.petCooldown -= delta;
    }

    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.y += h.vy * delta;
      h.life -= delta;
      if (h.life <= 0) this.hearts.splice(i, 1);
    }

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
    this.petCooldown = 15;

    for (let i = 0; i < 4; i++) {
      this.hearts.push({
        x: this.x + 8 + (Math.random() * 12 - 6),
        y: this.y - 4,
        vy: -20 - Math.random() * 15,
        life: 1.5
      });
    }

    if (window.soundSystem) window.soundSystem.playPet();
    this.farm.addLovePoints(15);

    let produce = null;
    if (this.type === 'cow') {
      produce = { name: 'Susu Segar 🥛', id: 'milk' };
      this.farm.chest.produce.milk = (this.farm.chest.produce.milk || 0) + 1;
    } else if (this.type === 'chicken') {
      produce = { name: 'Telur Emas 🥚', id: 'egg' };
      this.farm.chest.produce.egg = (this.farm.chest.produce.egg || 0) + 1;
    } else if (this.type === 'sheep') {
      produce = { name: 'Wol Lembut 🧶', id: 'wool' };
      this.farm.chest.produce.wool = (this.farm.chest.produce.wool || 0) + 1;
    } else {
      produce = { name: 'Kasih Sayang ❤️', id: null };
    }

    this.farm.autoSave();
    return produce;
  }
}

class AnimalManager {
  constructor(farm) {
    this.farm = farm;
    this.pastureBounds = { minX: 3, maxX: 11, minY: 3, maxY: 12 };
    this.animals = [];
    this.syncFromFarm();
  }

  syncFromFarm() {
    this.animals = [];
    if (this.farm.ownedAnimals && Array.isArray(this.farm.ownedAnimals)) {
      this.farm.ownedAnimals.forEach(oa => {
        this.animals.push(new FarmAnimal(oa.id, oa.name, oa.type, oa.x, oa.y, this.pastureBounds, this.farm));
      });
    }
  }

  update(delta) {
    // Keep sync with farm owned animals count
    if (this.animals.length !== (this.farm.ownedAnimals || []).length) {
      this.syncFromFarm();
    }
    this.animals.forEach(a => a.update(delta));
  }

  getNearestAnimal(px, py, maxDist = 36) {
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
