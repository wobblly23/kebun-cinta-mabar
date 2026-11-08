// js/farm.js - Farm World, Crops, Chest, Economy, and Save System
// Authoritative state management for "Kebun Cinta Kita"

const CROP_DEFINITIONS = {
  carrot: {
    id: 'carrot',
    name: 'Wortel Manis',
    icon: '🥕',
    seedIndex: 0, // In items.png row 1
    plantRow: 0,  // In plants.png row 0
    growTime: 18, // seconds
    sellPrice: 15,
    seedPrice: 5,
    loveReward: 5
  },
  potato: {
    id: 'potato',
    name: 'Kentang Emas',
    icon: '🥔',
    seedIndex: 1,
    plantRow: 1,
    growTime: 25,
    sellPrice: 25,
    seedPrice: 8,
    loveReward: 8
  },
  tomato: {
    id: 'tomato',
    name: 'Tomat Segar',
    icon: '🍅',
    seedIndex: 2,
    plantRow: 2,
    growTime: 35,
    sellPrice: 40,
    seedPrice: 15,
    loveReward: 12
  },
  strawberry: {
    id: 'strawberry',
    name: 'Stroberi Cinta',
    icon: '🍓',
    seedIndex: 3,
    plantRow: 3,
    growTime: 45,
    sellPrice: 65,
    seedPrice: 25,
    loveReward: 20
  },
  melon: {
    id: 'melon',
    name: 'Semangka Kebun',
    icon: '🍉',
    seedIndex: 4,
    plantRow: 4,
    growTime: 60,
    sellPrice: 110,
    seedPrice: 40,
    loveReward: 35
  }
};

const LOVE_LEVEL_TITLES = [
  "Pasangan Pemula 🌱",
  "Teman Berkebun Mesra 🍃",
  "Kekasih Penuh Semangat 🌸",
  "Petani Saling Cinta 💖",
  "Duet Petani Idaman 🌾",
  "Cinta Merekah Indah 🌺",
  "Belahan Jiwa Sejati 💍",
  "Legenda Cinta Abadi 👑"
];

class FarmManager {
  constructor(cols = 36, rows = 24, tileSize = 16) {
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;
    
    // Grid: 2D array of tile objects
    this.grid = [];
    
    // Shared economy & love
    this.coins = 150;
    this.lovePoints = 0;
    this.loveLevel = 1;

    // Shared storage chest
    this.chest = {
      seeds: {
        carrot: 8,
        potato: 6,
        tomato: 4,
        strawberry: 4,
        melon: 2
      },
      produce: {
        carrot: 0,
        potato: 0,
        tomato: 0,
        strawberry: 0,
        melon: 0,
        milk: 0,
        egg: 0,
        wool: 0
      }
    };

    // Day & Night Cycle
    // Time runs 0..1440 (minutes in a day), e.g. starts at 08:00 (480 mins)
    this.timeMinutes = 480; 
    this.dayCount = 1;
    this.timeSpeed = 2.5; // minutes per real second

    this.initMap();
    this.loadFromStorage();
  }

  initMap() {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        row.push({
          type: 'grass',
          subType: 0,
          tilled: false,
          watered: false,
          waterTimer: 0,
          crop: null, // { id, stage, progress, ready }
          collidable: false
        });
      }
      this.grid.push(row);
    }

    // Design a cozy romantic farm layout:
    // 1. House at top center (x: 15..20, y: 2..8)
    for (let y = 2; y <= 7; y++) {
      for (let x = 15; x <= 20; x++) {
        this.grid[y][x].type = 'house';
        this.grid[y][x].collidable = true;
      }
    }
    // House entrance at (18, 8)
    this.houseDoor = { x: 18, y: 8 };

    // 2. Stone path from house door down and branching
    for (let y = 8; y <= 16; y++) {
      this.grid[y][18].type = 'path';
      this.grid[y][17].type = 'path';
    }
    for (let x = 6; x <= 30; x++) {
      this.grid[13][x].type = 'path';
    }

    // 3. Animal Pasture on the left (x: 2..12, y: 2..11)
    // Fences around pasture
    for (let x = 2; x <= 12; x++) {
      this.grid[2][x].type = 'fence';
      this.grid[2][x].collidable = true;
      this.grid[11][x].type = 'fence';
      this.grid[11][x].collidable = true;
    }
    for (let y = 2; y <= 11; y++) {
      this.grid[y][2].type = 'fence';
      this.grid[y][2].collidable = true;
      this.grid[y][12].type = 'fence';
      this.grid[y][12].collidable = true;
    }
    // Gate to pasture
    this.grid[11][7].type = 'path';
    this.grid[11][7].collidable = false;

    // 4. Romantic Water Pond with wooden bridge on bottom right (x: 24..33, y: 16..22)
    for (let y = 17; y <= 22; y++) {
      for (let x = 25; x <= 33; x++) {
        this.grid[y][x].type = 'water';
        this.grid[y][x].collidable = true;
      }
    }
    // Wooden Bridge crossing the pond
    for (let x = 28; x <= 30; x++) {
      this.grid[19][x].type = 'bridge';
      this.grid[19][x].collidable = false;
    }

    // 5. Pre-tilled romantic farm plots for the couple!
    // Left plot: (x: 6..14, y: 15..20)
    for (let y = 15; y <= 20; y++) {
      for (let x = 6; x <= 14; x++) {
        this.grid[y][x].tilled = true;
        this.grid[y][x].type = 'farmland';
      }
    }
    // Right plot: (x: 21..24, y: 15..20)
    for (let y = 15; y <= 20; y++) {
      for (let x = 21; x <= 24; x++) {
        this.grid[y][x].tilled = true;
        this.grid[y][x].type = 'farmland';
      }
    }

    // Plant some initial crops for immediate joy!
    this.plantCrop(8, 16, 'carrot');
    this.plantCrop(9, 16, 'carrot');
    this.plantCrop(10, 16, 'strawberry');
    this.plantCrop(11, 16, 'strawberry');
    this.plantCrop(12, 16, 'tomato');
    this.grid[16][8].watered = true;
    this.grid[16][9].watered = true;

    // 6. Shared Chest & Selling Bin near house porch
    this.grid[9][16].type = 'chest';
    this.grid[9][16].collidable = true;

    this.grid[9][19].type = 'sell_bin';
    this.grid[9][19].collidable = true;

    // 7. Scenic Trees
    const treeCoords = [
      [14, 3], [21, 3], [1, 14], [2, 19], [34, 4], [32, 8], [33, 12], [23, 10]
    ];
    treeCoords.forEach(([tx, ty]) => {
      if (this.grid[ty] && this.grid[ty][tx]) {
        this.grid[ty][tx].type = 'tree';
        this.grid[ty][tx].collidable = true;
      }
    });

    // 8. Outer boundary fences
    for (let x = 0; x < this.cols; x++) {
      this.grid[0][x].type = 'fence';
      this.grid[0][x].collidable = true;
      this.grid[this.rows - 1][x].type = 'fence';
      this.grid[this.rows - 1][x].collidable = true;
    }
    for (let y = 0; y < this.rows; y++) {
      this.grid[y][0].type = 'fence';
      this.grid[y][0].collidable = true;
      this.grid[y][this.cols - 1].type = 'fence';
      this.grid[y][this.cols - 1].collidable = true;
    }
  }

  // Check collision for coordinate (in tile units)
  isCollidable(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return true;
    return this.grid[ty][tx].collidable;
  }

  // --- Farm Actions ---

  // Till grass into farmland
  tillSoil(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (tile.type === 'grass' && !tile.collidable) {
      tile.type = 'farmland';
      tile.tilled = true;
      tile.watered = false;
      this.addLovePoints(1);
      this.autoSave();
      return true;
    }
    return false;
  }

  // Water farmland
  waterSoil(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (tile.tilled || tile.type === 'farmland') {
      tile.watered = true;
      tile.waterTimer = 180; // stays watered for 180s
      this.addLovePoints(2);
      this.autoSave();
      return true;
    }
    return false;
  }

  // Plant a crop on farmland
  plantCrop(tx, ty, cropType) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (!tile.tilled || tile.crop) return false;
    if (!CROP_DEFINITIONS[cropType]) return false;

    tile.crop = {
      id: cropType,
      stage: 0,
      progress: 0,
      ready: false
    };
    this.addLovePoints(3);
    this.autoSave();
    return true;
  }

  // Harvest ripe crop
  harvestCrop(tx, ty) {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return null;
    const tile = this.grid[ty][tx];
    if (tile.crop && tile.crop.ready) {
      const def = CROP_DEFINITIONS[tile.crop.id];
      const cropId = tile.crop.id;
      // Remove crop
      tile.crop = null;
      // Add produce to shared chest
      this.chest.produce[cropId] = (this.chest.produce[cropId] || 0) + 1;
      // Award love points
      this.addLovePoints(def.loveReward);
      this.autoSave();
      return def;
    }
    return null;
  }

  // Sell all produce in chest
  sellAllProduce() {
    let earned = 0;
    for (const [id, count] of Object.entries(this.chest.produce)) {
      if (count > 0) {
        if (CROP_DEFINITIONS[id]) {
          earned += count * CROP_DEFINITIONS[id].sellPrice;
        } else if (id === 'milk') {
          earned += count * 35;
        } else if (id === 'egg') {
          earned += count * 20;
        } else if (id === 'wool') {
          earned += count * 50;
        }
        this.chest.produce[id] = 0;
      }
    }
    if (earned > 0) {
      this.coins += earned;
      this.addLovePoints(Math.floor(earned / 5));
      this.autoSave();
    }
    return earned;
  }

  // Buy seeds from shop into shared chest
  buySeeds(cropId, amount = 1) {
    const def = CROP_DEFINITIONS[cropId];
    if (!def) return false;
    const cost = def.seedPrice * amount;
    if (this.coins >= cost) {
      this.coins -= cost;
      this.chest.seeds[cropId] = (this.chest.seeds[cropId] || 0) + amount;
      this.autoSave();
      return true;
    }
    return false;
  }

  // Love Points & Romance Level
  addLovePoints(points) {
    this.lovePoints += points;
    const newLevel = Math.min(LOVE_LEVEL_TITLES.length, Math.floor(this.lovePoints / 100) + 1);
    if (newLevel > this.loveLevel) {
      this.loveLevel = newLevel;
      if (window.soundSystem) window.soundSystem.playLevelUp();
    }
  }

  getLoveTitle() {
    return LOVE_LEVEL_TITLES[Math.min(this.loveLevel - 1, LOVE_LEVEL_TITLES.length - 1)];
  }

  // --- Growth & World Update Loop ---
  update(delta) {
    // 1. Advance Day/Night time
    this.timeMinutes += delta * this.timeSpeed;
    if (this.timeMinutes >= 1440) {
      this.timeMinutes -= 1440;
      this.dayCount++;
    }

    // 2. Crop Growth
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.grid[y][x];

        // Dry out watered soil slowly
        if (tile.watered) {
          tile.waterTimer -= delta;
          if (tile.waterTimer <= 0) {
            tile.watered = false;
          }
        }

        // Grow crop
        if (tile.crop && !tile.crop.ready) {
          const def = CROP_DEFINITIONS[tile.crop.id];
          if (def) {
            // Grows 2.5x faster when soil is watered!
            const speed = tile.watered ? 2.5 : 1.0;
            tile.crop.progress += (delta / def.growTime) * 100 * speed;

            // Calculate stage: 0 (seed), 1 (sprout), 2 (growing), 3 (bud), 4 (ripe)
            tile.crop.stage = Math.min(4, Math.floor((tile.crop.progress / 100) * 5));

            if (tile.crop.progress >= 100) {
              tile.crop.progress = 100;
              tile.crop.stage = 4;
              tile.crop.ready = true;
            }
          }
        }
      }
    }
  }

  // Time of Day info for atmospheric lighting
  getTimeOfDay() {
    // 04:00 - 07:00 Sunrise
    // 07:00 - 16:30 Day
    // 16:30 - 19:30 Sunset (Warm romantic orange)
    // 19:30 - 04:00 Night (Romantic moonlit blue with fireflies)
    const hours = this.timeMinutes / 60;
    if (hours >= 5 && hours < 7) {
      return { phase: 'sunrise', ambient: 'rgba(255, 180, 100, 0.25)', label: 'Pagi Hari 🌅' };
    } else if (hours >= 7 && hours < 16.5) {
      return { phase: 'day', ambient: 'rgba(255, 255, 255, 0)', label: 'Siang Cerah ☀️' };
    } else if (hours >= 16.5 && hours < 19.5) {
      return { phase: 'sunset', ambient: 'rgba(255, 120, 80, 0.35)', label: 'Senja Romantis 🌇' };
    } else {
      return { phase: 'night', ambient: 'rgba(20, 30, 85, 0.65)', label: 'Malam Berbintang 🌙' };
    }
  }

  // Sleep in house to pass the night to 07:00 morning
  sleepTogether() {
    this.timeMinutes = 420; // 07:00 AM
    this.dayCount++;
    this.addLovePoints(50);
    this.autoSave();
  }

  // --- Serialization & P2P State Synchronization ---

  // Export serializable snapshot for WebRTC or Save File
  getSnapshot() {
    // Compress grid state into lightweight representation
    const compressedTiles = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.grid[y][x];
        if (t.tilled || t.crop || t.watered) {
          compressedTiles.push({
            x, y,
            tilled: t.tilled,
            watered: t.watered,
            crop: t.crop ? { id: t.crop.id, stage: t.crop.stage, progress: Math.round(t.crop.progress), ready: t.crop.ready } : null
          });
        }
      }
    }

    return {
      version: 1,
      coins: this.coins,
      lovePoints: this.lovePoints,
      loveLevel: this.loveLevel,
      dayCount: this.dayCount,
      timeMinutes: Math.round(this.timeMinutes),
      chest: this.chest,
      tiles: compressedTiles
    };
  }

  // Apply snapshot received from Host or Save File
  applySnapshot(data) {
    if (!data) return;
    if (data.coins !== undefined) this.coins = data.coins;
    if (data.lovePoints !== undefined) this.lovePoints = data.lovePoints;
    if (data.loveLevel !== undefined) this.loveLevel = data.loveLevel;
    if (data.dayCount !== undefined) this.dayCount = data.dayCount;
    if (data.timeMinutes !== undefined) this.timeMinutes = data.timeMinutes;
    if (data.chest) this.chest = data.chest;

    if (data.tiles && Array.isArray(data.tiles)) {
      data.tiles.forEach(t => {
        if (this.grid[t.y] && this.grid[t.y][t.x]) {
          const tile = this.grid[t.y][t.x];
          tile.tilled = t.tilled;
          if (tile.tilled) tile.type = 'farmland';
          tile.watered = t.watered;
          tile.crop = t.crop;
        }
      });
    }
  }

  // --- LocalStorage Save System ---
  autoSave() {
    try {
      const snap = this.getSnapshot();
      localStorage.setItem('kebun_cinta_save_data', JSON.stringify(snap));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  loadFromStorage() {
    try {
      const str = localStorage.getItem('kebun_cinta_save_data');
      if (str) {
        const snap = JSON.parse(str);
        this.applySnapshot(snap);
        console.log('Kebun Cinta: Data simpanan berhasil dimuat!');
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }

  exportSaveFile() {
    const snap = this.getSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kebun-cinta-backup-hari-${this.dayCount}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importSaveFile(jsonString) {
    try {
      const snap = JSON.parse(jsonString);
      this.applySnapshot(snap);
      this.autoSave();
      return true;
    } catch (e) {
      console.error('Import save error:', e);
      return false;
    }
  }
}

window.FarmManager = FarmManager;
window.CROP_DEFINITIONS = CROP_DEFINITIONS;
window.LOVE_LEVEL_TITLES = LOVE_LEVEL_TITLES;

