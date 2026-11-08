// js/farm.js - Complete Farm World, Interior House, Economy, NPCs, and Furniture Progression
// 100% Authoritative State Management for "Kebun Cinta Kita"

const CROP_DEFINITIONS = {
  carrot: {
    id: 'carrot',
    name: 'Wortel Manis',
    icon: '🥕',
    plantRow: 0,
    growTime: 16, // seconds
    sellPrice: 12,
    seedPrice: 5,
    loveReward: 4
  },
  potato: {
    id: 'potato',
    name: 'Kentang Emas',
    icon: '🥔',
    plantRow: 1,
    growTime: 24,
    sellPrice: 22,
    seedPrice: 8,
    loveReward: 6
  },
  tomato: {
    id: 'tomato',
    name: 'Tomat Segar',
    icon: '🍅',
    plantRow: 2,
    growTime: 34,
    sellPrice: 38,
    seedPrice: 15,
    loveReward: 10
  },
  strawberry: {
    id: 'strawberry',
    name: 'Stroberi Cinta',
    icon: '🍓',
    plantRow: 3,
    growTime: 46,
    sellPrice: 65,
    seedPrice: 25,
    loveReward: 18
  },
  melon: {
    id: 'melon',
    name: 'Semangka Kebun',
    icon: '🍉',
    plantRow: 4,
    growTime: 60,
    sellPrice: 110,
    seedPrice: 40,
    loveReward: 30
  }
};

const FURNITURE_DEFINITIONS = {
  bed_double: { id: 'bed_double', name: 'Ranjang Pasangan Manis 🛏️', price: 0, icon: '🛏️', desc: 'Ranjang empuk untuk tidur bersama menyambut pagi.' },
  table_dining: { id: 'table_dining', name: 'Meja Makan Kayu 🪑', price: 0, icon: '🪑', desc: 'Meja makan untuk santap malam berdua.' },
  fireplace: { id: 'fireplace', name: 'Perapian Hangat 🔥', price: 0, icon: '🔥', desc: 'Menghangatkan rumah saat senja dan malam hari.' },
  sofa_pink: { id: 'sofa_pink', name: 'Sofa Beludru Merah 🛋️', price: 110, icon: '🛋️', desc: 'Sofa nyaman untuk bersantai berdua.' },
  rug_love: { id: 'rug_love', name: 'Karpet Hati Romantis 🧶', price: 65, icon: '🧶', desc: 'Karpet lembut penambah cinta di lantai rumah.' },
  bookshelf: { id: 'bookshelf', name: 'Rak Buku Cerita 📚', price: 85, icon: '📚', desc: 'Koleksi buku dongeng dan resep masakan.' },
  plant_pot: { id: 'plant_pot', name: 'Tanaman Hias Monstera 🪴', price: 45, icon: '🪴', desc: 'Menyegarkan suasana ruang keluarga.' },
  candle_light: { id: 'candle_light', name: 'Lilin Aromaterapi 🕯️', price: 50, icon: '🕯️', desc: 'Menebarkan aroma bunga yang menenangkan.' }
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
  constructor(cols = 48, rows = 32, tileSize = 16) {
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;

    // Current player view location: 'farm' or 'house'
    this.currentLocation = 'farm';

    // Grids for Outdoor and Indoor House
    this.grid = [];
    this.houseGrid = [];

    // Economy & Progression (STARTS MANUAL!)
    this.coins = 60; // Starter money
    this.lovePoints = 0;
    this.loveLevel = 1;

    // Tools owned (Pancing, Sabit must be purchased!)
    this.unlockedTools = {
      hoe: true,
      water: true,
      fishing_rod: false,
      sickle: false,
      flower: true
    };

    // Helper bots unlocked (Starts LOCKED! Must be hired from Mbah Dukun)
    this.unlockedBots = {
      slime: false,  // 100 coins
      boni: false,   // 180 coins
      chicky: false  // 120 coins
    };

    // Owned Animals (Starts EMPTY! Must be bought from Mak Siti)
    this.ownedAnimals = [];

    // Owned Furniture inside house
    this.ownedFurniture = ['bed_double', 'table_dining', 'fireplace'];

    // Shared storage chest
    this.chest = {
      seeds: {
        carrot: 4,
        potato: 0,
        tomato: 0,
        strawberry: 0,
        melon: 0
      },
      produce: {
        carrot: 0,
        potato: 0,
        tomato: 0,
        strawberry: 0,
        melon: 0,
        fish: 0,
        milk: 0,
        egg: 0,
        wool: 0
      }
    };

    // Day & Night Cycle: 0..1440 mins. Starts at 08:00 AM (480 mins)
    this.timeMinutes = 480;
    this.dayCount = 1;
    this.timeSpeed = 2.5;

    // NPC Definitions
    this.npcs = [
      {
        id: 'pak_budi',
        name: 'Pak Budi (Toko Tani & Perabot)',
        role: 'merchant',
        x: 8,
        y: 24,
        portrait: 'assets/npcs/npc_merchant.png',
        dialog: 'Halo nak! Selamat datang di Toko Tani. Mau beli bibit unggul atau perabotan cantik untuk rumahmu?'
      },
      {
        id: 'mak_siti',
        name: 'Mak Siti (Peternakan Hewan)',
        role: 'rancher',
        x: 14,
        y: 24,
        portrait: 'assets/npcs/npc_rancher.png',
        dialog: 'Halo petani muda! Mau pelihara ayam, sapi perah, atau domba lucu untuk peternakanmu?'
      },
      {
        id: 'paman_sam',
        name: 'Paman Sam (Nelayan Danau)',
        role: 'fisher',
        x: 38,
        y: 20,
        portrait: 'assets/npcs/npc_fisher.png',
        dialog: 'Angin sepoi-sepoi danau sangat menyenangkan! Mau beli alat pancing bambu untuk mencari ikan segar?'
      },
      {
        id: 'mbah_dukun',
        name: 'Mbah Dukun (Kontraktor Bot)',
        role: 'bot_elder',
        x: 11,
        y: 28,
        portrait: 'assets/bots/bot_boni.png',
        dialog: 'Hehehe... Butuh bantuan di kebun? Kumpulkan koin dan panggil roh pembantu Slimey atau Boni untuk bekerja!'
      }
    ];

    this.initWorld();
    this.initHouse();
    this.loadFromStorage();
  }

  // --- OUTDOOR WORLD GENERATION ---
  initWorld() {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        row.push({
          type: 'grass',
          tilled: false,
          watered: false,
          waterTimer: 0,
          crop: null,
          collidable: false
        });
      }
      this.grid.push(row);
    }

    // Outer Boundary Fences
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

    // 1. Cozy Farmhouse Exterior at (20..25, 3..8)
    for (let y = 3; y <= 7; y++) {
      for (let x = 20; x <= 25; x++) {
        this.grid[y][x].type = 'house';
        this.grid[y][x].collidable = true;
      }
    }
    // House Door Entrance at (23, 8)
    this.houseDoor = { x: 23, y: 8 };

    // 2. Shared Chest & Shipping Bin by the house porch
    this.grid[9][21].type = 'chest';
    this.grid[9][21].collidable = true;
    this.grid[9][25].type = 'sell_bin';
    this.grid[9][25].collidable = true;

    // 3. Main Stone Paths
    // Path from house down to market
    for (let y = 8; y <= 25; y++) {
      this.grid[y][23].type = 'path';
      this.grid[y][22].type = 'path';
    }
    // Cross path to lake and pasture
    for (let x = 12; x <= 38; x++) {
      this.grid[14][x].type = 'path';
      this.grid[24][x].type = 'path';
    }

    // 4. Animal Pasture (Left side: x: 2..12, y: 2..13)
    for (let x = 2; x <= 12; x++) {
      this.grid[2][x].type = 'fence';
      this.grid[2][x].collidable = true;
      this.grid[13][x].type = 'fence';
      this.grid[13][x].collidable = true;
    }
    for (let y = 2; y <= 13; y++) {
      this.grid[y][2].type = 'fence';
      this.grid[y][2].collidable = true;
      this.grid[y][12].type = 'fence';
      this.grid[y][12].collidable = true;
    }
    // Pasture gate at (12, 8)
    this.grid[8][12].type = 'path';
    this.grid[8][12].collidable = false;

    // 5. Farmland Plots (Center & East)
    // Left plot: (x: 14..21, y: 16..22)
    for (let y = 16; y <= 22; y++) {
      for (let x = 14; x <= 21; x++) {
        this.grid[y][x].type = 'farmland';
        this.grid[y][x].tilled = true;
      }
    }
    // Right plot: (x: 25..32, y: 16..22)
    for (let y = 16; y <= 22; y++) {
      for (let x = 25; x <= 32; x++) {
        this.grid[y][x].type = 'farmland';
        this.grid[y][x].tilled = true;
      }
    }

    // Water Well in between plots at (23, 16)
    this.grid[16][23].type = 'well';
    this.grid[16][23].collidable = true;

    // 6. Scenic Lake & Pier on East (x: 36..46, y: 12..28)
    for (let y = 12; y <= 28; y++) {
      for (let x = 36; x <= 46; x++) {
        this.grid[y][x].type = 'water';
        this.grid[y][x].collidable = true;
      }
    }
    // Wooden Pier at (36..41, 20)
    for (let x = 36; x <= 41; x++) {
      this.grid[20][x].type = 'bridge';
      this.grid[20][x].collidable = false;
    }

    // 7. Town Market / Shop Square at Bottom (x: 6..18, y: 23..29)
    for (let y = 23; y <= 29; y++) {
      for (let x = 6; x <= 18; x++) {
        this.grid[y][x].type = 'path';
      }
    }

    // 8. Scenic Trees
    const trees = [
      [18, 4], [27, 4], [13, 3], [14, 10], [33, 4], [34, 9], [34, 15],
      [3, 16], [3, 21], [3, 27], [33, 26], [34, 29]
    ];
    trees.forEach(([tx, ty]) => {
      if (this.grid[ty] && this.grid[ty][tx]) {
        this.grid[ty][tx].type = 'tree';
        this.grid[ty][tx].collidable = true;
      }
    });

    // Starter crop: plant 2 carrots so players immediately experience farming!
    this.plantCrop(16, 17, 'carrot');
    this.plantCrop(17, 17, 'carrot');
    this.grid[17][16].watered = true;
  }

  // --- INDOOR HOUSE GENERATION ---
  initHouse() {
    this.houseWidth = 18;
    this.houseHeight = 14;
    this.houseGrid = [];

    for (let y = 0; y < this.houseHeight; y++) {
      const row = [];
      for (let x = 0; x < this.houseWidth; x++) {
        const isWall = (y <= 2 || x === 0 || x === this.houseWidth - 1 || (y === this.houseHeight - 1 && x !== 9));
        row.push({
          type: isWall ? 'indoor_wall' : 'indoor_floor',
          furniture: null,
          collidable: isWall
        });
      }
      this.houseGrid.push(row);
    }

    // Exit door at bottom center (9, 13)
    this.houseExitDoor = { x: 9, y: 13 };

    // Default Starting Furniture
    // Double Bed at (3, 3)
    this.houseGrid[3][3].furniture = 'bed_double';
    this.houseGrid[3][3].collidable = true;
    this.houseGrid[3][4].furniture = 'bed_double';
    this.houseGrid[3][4].collidable = true;

    // Fireplace at (9, 2)
    this.houseGrid[2][9].furniture = 'fireplace';
    this.houseGrid[2][9].collidable = true;

    // Dining table & chairs at (13, 5)
    this.houseGrid[5][13].furniture = 'table_dining';
    this.houseGrid[5][13].collidable = true;
  }

  // Check collision depending on current location
  isCollidable(tx, ty, loc = this.currentLocation) {
    if (loc === 'farm') {
      if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return true;
      return this.grid[ty][tx].collidable;
    } else {
      if (tx < 0 || tx >= this.houseWidth || ty < 0 || ty >= this.houseHeight) return true;
      return this.houseGrid[ty][tx].collidable;
    }
  }

  // --- Enter / Exit House ---
  toggleLocation(loc = null) {
    if (loc) {
      this.currentLocation = loc;
    } else {
      this.currentLocation = this.currentLocation === 'farm' ? 'house' : 'farm';
    }
    return this.currentLocation;
  }

  // --- Farm Actions ---
  tillSoil(tx, ty) {
    if (this.currentLocation !== 'farm') return false;
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

  waterSoil(tx, ty) {
    if (this.currentLocation !== 'farm') return false;
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (tile.tilled || tile.type === 'farmland') {
      tile.watered = true;
      tile.waterTimer = 180;
      this.addLovePoints(2);
      this.autoSave();
      return true;
    }
    return false;
  }

  plantCrop(tx, ty, cropType) {
    if (this.currentLocation !== 'farm') return false;
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

  harvestCrop(tx, ty) {
    if (this.currentLocation !== 'farm') return null;
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return null;
    const tile = this.grid[ty][tx];
    if (tile.crop && tile.crop.ready) {
      const def = CROP_DEFINITIONS[tile.crop.id];
      const cropId = tile.crop.id;
      tile.crop = null;
      this.chest.produce[cropId] = (this.chest.produce[cropId] || 0) + 1;
      this.addLovePoints(def.loveReward);
      this.autoSave();
      return def;
    }
    return null;
  }

  // --- Fishing System ---
  catchFish() {
    const fishTypes = [
      { id: 'fish', name: 'Ikan Mas Segar 🐟', price: 25, love: 10 },
      { id: 'fish', name: 'Ikan Gurame Telaga 🐠', price: 45, love: 15 },
      { id: 'fish', name: 'Ikan Hati Romantis 💖', price: 80, love: 25 }
    ];
    const caught = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    this.chest.produce.fish = (this.chest.produce.fish || 0) + 1;
    this.addLovePoints(caught.love);
    this.autoSave();
    return caught;
  }

  // --- Economy & Selling ---
  sellAllProduce() {
    let earned = 0;
    for (const [id, count] of Object.entries(this.chest.produce)) {
      if (count > 0) {
        if (CROP_DEFINITIONS[id]) {
          earned += count * CROP_DEFINITIONS[id].sellPrice;
        } else if (id === 'fish') {
          earned += count * 35;
        } else if (id === 'milk') {
          earned += count * 40;
        } else if (id === 'egg') {
          earned += count * 25;
        } else if (id === 'wool') {
          earned += count * 55;
        }
        this.chest.produce[id] = 0;
      }
    }
    if (earned > 0) {
      this.coins += earned;
      this.addLovePoints(Math.floor(earned / 4));
      this.autoSave();
    }
    return earned;
  }

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

  buyTool(toolId, price) {
    if (this.coins >= price) {
      this.coins -= price;
      this.unlockedTools[toolId] = true;
      this.addLovePoints(15);
      this.autoSave();
      return true;
    }
    return false;
  }

  hireBot(botId, price) {
    if (this.coins >= price) {
      this.coins -= price;
      this.unlockedBots[botId] = true;
      this.addLovePoints(25);
      this.autoSave();
      return true;
    }
    return false;
  }

  buyAnimal(animalType, name, price) {
    if (this.coins >= price) {
      this.coins -= price;
      const pastureBounds = { minX: 3, maxX: 11, minY: 3, maxY: 12 };
      const rx = pastureBounds.minX + Math.random() * (pastureBounds.maxX - pastureBounds.minX);
      const ry = pastureBounds.minY + Math.random() * (pastureBounds.maxY - pastureBounds.minY);

      this.ownedAnimals.push({
        id: `${animalType}_${Date.now()}`,
        name: name,
        type: animalType,
        x: rx,
        y: ry
      });
      this.addLovePoints(20);
      this.autoSave();
      return true;
    }
    return false;
  }

  buyFurniture(furnId) {
    const def = FURNITURE_DEFINITIONS[furnId];
    if (!def) return false;
    if (this.coins >= def.price) {
      this.coins -= def.price;
      this.ownedFurniture.push(furnId);

      // Place in first empty interior floor tile
      for (let y = 4; y < this.houseHeight - 2; y++) {
        for (let x = 2; x < this.houseWidth - 2; x++) {
          const t = this.houseGrid[y][x];
          if (t.type === 'indoor_floor' && !t.furniture) {
            t.furniture = furnId;
            t.collidable = true;
            this.addLovePoints(25);
            this.autoSave();
            return true;
          }
        }
      }
      this.autoSave();
      return true;
    }
    return false;
  }

  // --- Love Meter ---
  addLovePoints(points) {
    this.lovePoints += points;
    const newLevel = Math.min(LOVE_LEVEL_TITLES.length, Math.floor(this.lovePoints / 80) + 1);
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
        if (tile.watered) {
          tile.waterTimer -= delta;
          if (tile.waterTimer <= 0) tile.watered = false;
        }

        if (tile.crop && !tile.crop.ready) {
          const def = CROP_DEFINITIONS[tile.crop.id];
          if (def) {
            const speed = tile.watered ? 2.5 : 1.0;
            tile.crop.progress += (delta / def.growTime) * 100 * speed;
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

  getTimeOfDay() {
    const hours = this.timeMinutes / 60;
    if (hours >= 5 && hours < 7) {
      return { phase: 'sunrise', ambient: 'rgba(255, 180, 100, 0.22)', label: 'Pagi Hari 🌅' };
    } else if (hours >= 7 && hours < 16.5) {
      return { phase: 'day', ambient: 'rgba(255, 255, 255, 0)', label: 'Siang Cerah ☀️' };
    } else if (hours >= 16.5 && hours < 19.5) {
      return { phase: 'sunset', ambient: 'rgba(255, 120, 70, 0.35)', label: 'Senja Romantis 🌇' };
    } else {
      return { phase: 'night', ambient: 'rgba(15, 25, 75, 0.65)', label: 'Malam Berbintang 🌙' };
    }
  }

  sleepTogether() {
    this.timeMinutes = 420; // 07:00 AM
    this.dayCount++;
    this.addLovePoints(40);
    this.autoSave();
  }

  // --- Snapshot Serialization ---
  getSnapshot() {
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
      version: 2,
      coins: this.coins,
      lovePoints: this.lovePoints,
      loveLevel: this.loveLevel,
      dayCount: this.dayCount,
      timeMinutes: Math.round(this.timeMinutes),
      unlockedTools: this.unlockedTools,
      unlockedBots: this.unlockedBots,
      ownedAnimals: this.ownedAnimals,
      ownedFurniture: this.ownedFurniture,
      chest: this.chest,
      tiles: compressedTiles
    };
  }

  applySnapshot(data) {
    if (!data) return;
    if (data.coins !== undefined) this.coins = data.coins;
    if (data.lovePoints !== undefined) this.lovePoints = data.lovePoints;
    if (data.loveLevel !== undefined) this.loveLevel = data.loveLevel;
    if (data.dayCount !== undefined) this.dayCount = data.dayCount;
    if (data.timeMinutes !== undefined) this.timeMinutes = data.timeMinutes;
    if (data.unlockedTools) this.unlockedTools = data.unlockedTools;
    if (data.unlockedBots) this.unlockedBots = data.unlockedBots;
    if (data.ownedAnimals) this.ownedAnimals = data.ownedAnimals;
    if (data.ownedFurniture) this.ownedFurniture = data.ownedFurniture;
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

  autoSave() {
    try {
      const snap = this.getSnapshot();
      localStorage.setItem('kebun_cinta_save_data_v2', JSON.stringify(snap));
    } catch (e) {
      console.warn('LocalStorage autoSave failed:', e);
    }
  }

  loadFromStorage() {
    try {
      const str = localStorage.getItem('kebun_cinta_save_data_v2') || localStorage.getItem('kebun_cinta_save_data');
      if (str) {
        const snap = JSON.parse(str);
        this.applySnapshot(snap);
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
    a.download = `kebun-cinta-save-hari-${this.dayCount}.json`;
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
      console.error('Import save failed:', e);
      return false;
    }
  }
}

window.FarmManager = FarmManager;
window.CROP_DEFINITIONS = CROP_DEFINITIONS;
window.FURNITURE_DEFINITIONS = FURNITURE_DEFINITIONS;
window.LOVE_LEVEL_TITLES = LOVE_LEVEL_TITLES;
