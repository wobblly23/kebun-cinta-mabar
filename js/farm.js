// js/farm.js - Complete World, Multi-Location, Custom Furniture Placement, and Combat Mechanics

const CROP_DEFINITIONS = {
  carrot: { id: 'carrot', name: 'Wortel Manis', icon: '🥕', plantRow: 0, growTime: 14, sellPrice: 12, seedPrice: 5, loveReward: 4 },
  potato: { id: 'potato', name: 'Kentang Emas', icon: '🥔', plantRow: 1, growTime: 22, sellPrice: 22, seedPrice: 8, loveReward: 6 },
  tomato: { id: 'tomato', name: 'Tomat Segar', icon: '🍅', plantRow: 2, growTime: 32, sellPrice: 38, seedPrice: 15, loveReward: 10 },
  strawberry: { id: 'strawberry', name: 'Stroberi Cinta', icon: '🍓', plantRow: 3, growTime: 44, sellPrice: 65, seedPrice: 25, loveReward: 18 },
  melon: { id: 'melon', name: 'Semangka Kebun', icon: '🍉', plantRow: 4, growTime: 58, sellPrice: 110, seedPrice: 40, loveReward: 30 }
};

const FURNITURE_DEFINITIONS = {
  bed_double: { id: 'bed_double', name: 'Ranjang Pasangan Manis 🛏️', price: 90, icon: '🛏️', w: 2, h: 2, desc: 'Ranjang empuk untuk tidur bersama menyambut pagi.' },
  dining_table: { id: 'dining_table', name: 'Meja Makan & Kursi 🪑', price: 75, icon: '🪑', w: 2, h: 2, desc: 'Meja makan kayu untuk santap malam berdua.' },
  fireplace: { id: 'fireplace', name: 'Perapian Hangat 🔥', price: 120, icon: '🔥', w: 2, h: 2, desc: 'Menghangatkan rumah saat senja dan malam hari.' },
  sofa: { id: 'sofa', name: 'Sofa Beludru Merah 🛋️', price: 85, icon: '🛋️', w: 2, h: 2, desc: 'Sofa nyaman untuk bersantai berdua.' },
  rug: { id: 'rug', name: 'Karpet Hati Romantis 🧶', price: 50, icon: '🧶', w: 3, h: 2, desc: 'Karpet lembut penambah cinta di lantai rumah.' },
  bookshelf: { id: 'bookshelf', name: 'Rak Buku Cerita 📚', price: 70, icon: '📚', w: 2, h: 2, desc: 'Koleksi buku dongeng dan resep masakan.' },
  cabinet: { id: 'cabinet', name: 'Lemari Kayu Antik 🗄️', price: 60, icon: '🗄️', w: 2, h: 2, desc: 'Lemari pakaian dan penyimpanan barang.' },
  plant: { id: 'plant', name: 'Tanaman Hias Monstera 🪴', price: 35, icon: '🪴', w: 2, h: 2, desc: 'Menyegarkan suasana ruang keluarga.' }
};

const LOVE_LEVEL_TITLES = [
  "Pasangan Pemula 🌱", "Teman Berkebun Mesra 🍃", "Kekasih Penuh Semangat 🌸",
  "Petani Saling Cinta 💖", "Duet Petani Idaman 🌾", "Cinta Merekah Indah 🌺",
  "Belahan Jiwa Sejati 💍", "Legenda Cinta Abadi 👑"
];

class FarmManager {
  constructor(cols = 48, rows = 32, tileSize = 16) {
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;

    // Current location: 'farm', 'house_mc', 'house_budi', 'house_siti', 'house_blacksmith', 'woods'
    this.currentLocation = 'farm';

    // Grids for each location
    this.grid = [];
    this.houseMC = [];
    this.houseBudi = [];
    this.houseSiti = [];
    this.houseBlacksmith = [];
    this.woodsGrid = [];

    // Economy & Progression
    this.coins = 70;
    this.lovePoints = 0;
    this.loveLevel = 1;

    // Tools owned (Swords, fishing rod must be purchased!)
    this.unlockedTools = {
      hoe: true,
      water: true,
      fishing_rod: false,
      sword_iron: false,
      sword_gold: false,
      flower: true
    };

    // Helper bots unlocked
    this.unlockedBots = {
      slime: false,
      boni: false,
      chicky: false
    };

    // Owned farm animals
    this.ownedAnimals = [];

    // Active Pet companion that follows player!
    this.activePet = null; // { type: 'pet_chick' | 'pet_piggy' | 'pet_bunny', name: 'Pipit' }

    // Owned Furniture inventory (to place in MC house!)
    this.ownedFurniture = []; // Starts EMPTY so MC can design and place it!
    this.placedFurnitureMC = []; // [{ id, x, y }]

    // Shared storage chest
    this.chest = {
      seeds: { carrot: 4, potato: 0, tomato: 0, strawberry: 0, melon: 0 },
      produce: { carrot: 0, potato: 0, tomato: 0, strawberry: 0, melon: 0, fish: 0, milk: 0, egg: 0, wool: 0, monster_gel: 0 }
    };

    // Monsters in Mystic Woods
    this.monsters = [];

    // Day & Night Cycle
    this.timeMinutes = 480;
    this.dayCount = 1;
    this.timeSpeed = 2.5;

    // NPCs with buildings
    this.npcs = [
      { id: 'pak_budi', name: 'Pak Budi (Toko Tani & Perabot)', role: 'merchant', x: 8, y: 25, houseLocation: 'house_budi', doorX: 8, doorY: 24, portrait: 'assets/npcs/npc_merchant.png', dialog: 'Halo! Selamat datang di Toko Tani. Mau beli bibit unggul atau perabotan cantik untuk mengisi rumah kosongmu?' },
      { id: 'mak_siti', name: 'Mak Siti (Peternakan & Peliharaan)', role: 'rancher', x: 17, y: 25, houseLocation: 'house_siti', doorX: 17, doorY: 24, portrait: 'assets/npcs/npc_rancher.png', dialog: 'Halo anak muda! Mau pelihara ayam, sapi, atau hewan peliharaan imut yang selalu mengikutimu?' },
      { id: 'borin', name: 'Borin (Pandai Besi & Senjata)', role: 'blacksmith', x: 26, y: 25, houseLocation: 'house_blacksmith', doorX: 26, doorY: 24, portrait: 'assets/characters/portrait_boy.png', dialog: 'Dentang palu pandai besi! Mau beli pedang tajam untuk berburu monster di Hutan Misterius?' },
      { id: 'paman_sam', name: 'Paman Sam (Nelayan Danau)', role: 'fisher', x: 38, y: 20, houseLocation: null, doorX: null, doorY: null, portrait: 'assets/npcs/npc_fisher.png', dialog: 'Angin danau sangat sepoi-sepoi! Beli alat pancing bambu untuk mencari ikan segar di sini!' },
      { id: 'mbah_dukun', name: 'Mbah Dukun (Kontraktor Bot)', role: 'bot_elder', x: 11, y: 15, houseLocation: null, doorX: null, doorY: null, portrait: 'assets/bots/bot_boni.png', dialog: 'Hehehe... Butuh pembantu otomatis di kebun? Bayar koin dan panggil Slimey atau Boni untuk bekerja!' }
    ];

    this.initWorld();
    this.initMCHouse();
    this.initNPCHouses();
    this.initMysticWoods();
    this.loadFromStorage();
  }

  // --- OUTDOOR WORLD MAP ---
  initWorld() {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        row.push({ type: 'grass', tilled: false, watered: false, waterTimer: 0, crop: null, collidable: false });
      }
      this.grid.push(row);
    }

    // Outer Boundary Fences
    for (let x = 0; x < this.cols; x++) {
      this.grid[0][x].type = 'fence'; this.grid[0][x].collidable = true;
      this.grid[this.rows - 1][x].type = 'fence'; this.grid[this.rows - 1][x].collidable = true;
    }
    for (let y = 0; y < this.rows; y++) {
      this.grid[y][0].type = 'fence'; this.grid[y][0].collidable = true;
      this.grid[y][this.cols - 1].type = 'fence'; this.grid[y][this.cols - 1].collidable = true;
    }

    // 1. Rumah Utama MC (Player) at (20..25, 3..8) with door at (23, 8)
    for (let y = 3; y <= 7; y++) {
      for (let x = 20; x <= 25; x++) {
        this.grid[y][x].type = 'house_mc'; this.grid[y][x].collidable = true;
      }
    }
    this.houseDoorMC = { x: 23, y: 8 };

    // 2. NPC Buildings (Toko & Rumah NPC)
    // Pak Budi Store (x: 6..10, y: 20..24) with door at (8, 24)
    for (let y = 20; y <= 23; y++) {
      for (let x = 6; x <= 10; x++) {
        this.grid[y][x].type = 'building_budi'; this.grid[y][x].collidable = true;
      }
    }

    // Mak Siti Ranch House (x: 15..19, y: 20..24) with door at (17, 24)
    for (let y = 20; y <= 23; y++) {
      for (let x = 15; x <= 19; x++) {
        this.grid[y][x].type = 'building_siti'; this.grid[y][x].collidable = true;
      }
    }

    // Borin Blacksmith House (x: 24..28, y: 20..24) with door at (26, 24)
    for (let y = 20; y <= 23; y++) {
      for (let x = 24; x <= 28; x++) {
        this.grid[y][x].type = 'building_borin'; this.grid[y][x].collidable = true;
      }
    }

    // Mbah Dukun's Magic Hut at (10..13, 12..15)
    for (let y = 12; y <= 14; y++) {
      for (let x = 10; x <= 13; x++) {
        this.grid[y][x].type = 'building_dukun'; this.grid[y][x].collidable = true;
      }
    }

    // 3. Chest & Sell Bin near MC house
    this.grid[9][21].type = 'chest'; this.grid[9][21].collidable = true;
    this.grid[9][25].type = 'sell_bin'; this.grid[9][25].collidable = true;

    // 4. Stone Paths connecting village
    for (let y = 8; y <= 26; y++) {
      this.grid[y][23].type = 'path'; this.grid[y][22].type = 'path';
    }
    for (let x = 4; x <= 42; x++) {
      this.grid[17][x].type = 'path';
      this.grid[25][x].type = 'path';
    }

    // 5. Animal Pasture (Left side: x: 2..12, y: 2..11)
    for (let x = 2; x <= 12; x++) {
      this.grid[2][x].type = 'fence'; this.grid[2][x].collidable = true;
      this.grid[11][x].type = 'fence'; this.grid[11][x].collidable = true;
    }
    for (let y = 2; y <= 11; y++) {
      this.grid[y][2].type = 'fence'; this.grid[y][2].collidable = true;
      this.grid[y][12].type = 'fence'; this.grid[y][12].collidable = true;
    }
    this.grid[7][12].type = 'path'; this.grid[7][12].collidable = false;

    // 6. Farmland Plots
    // Plot 1: (x: 14..21, y: 9..15)
    for (let y = 10; y <= 15; y++) {
      for (let x = 14; x <= 21; x++) {
        this.grid[y][x].type = 'farmland'; this.grid[y][x].tilled = true;
      }
    }
    // Plot 2: (x: 25..32, y: 10..15)
    for (let y = 10; y <= 15; y++) {
      for (let x = 25; x <= 32; x++) {
        this.grid[y][x].type = 'farmland'; this.grid[y][x].tilled = true;
      }
    }

    // Well at (23, 11)
    this.grid[11][23].type = 'well'; this.grid[11][23].collidable = true;

    // 7. Scenic Lake & Pier on East (x: 36..46, y: 12..28)
    for (let y = 12; y <= 28; y++) {
      for (let x = 36; x <= 46; x++) {
        this.grid[y][x].type = 'water'; this.grid[y][x].collidable = true;
      }
    }
    for (let x = 36; x <= 41; x++) {
      this.grid[20][x].type = 'bridge'; this.grid[20][x].collidable = false;
    }

    // 8. Gate to Mystic Woods (North-East: x: 44..46, y: 1..2)
    for (let x = 44; x <= 46; x++) {
      this.grid[1][x].type = 'portal_woods';
      this.grid[1][x].collidable = false;
    }

    // Scenic Trees
    const trees = [
      [18, 4], [27, 4], [13, 3], [33, 4], [34, 9], [3, 16], [3, 21], [33, 26], [42, 8]
    ];
    trees.forEach(([tx, ty]) => {
      if (this.grid[ty] && this.grid[ty][tx]) {
        this.grid[ty][tx].type = 'tree'; this.grid[ty][tx].collidable = true;
      }
    });

    // Starter carrots
    this.plantCrop(16, 12, 'carrot');
    this.plantCrop(17, 12, 'carrot');
    this.grid[12][16].watered = true;
  }

  // --- RUMAH UTAMA MC (STARTS EMPTY FOR PLAYER CUSTOM DECORATION) ---
  initMCHouse() {
    this.houseMCWidth = 16;
    this.houseMCHeight = 12;
    this.houseMC = [];
    for (let y = 0; y < this.houseMCHeight; y++) {
      const row = [];
      for (let x = 0; x < this.houseMCWidth; x++) {
        const isWall = (y <= 2 || x === 0 || x === this.houseMCWidth - 1 || (y === this.houseMCHeight - 1 && x !== 8));
        row.push({ type: isWall ? 'indoor_wall' : 'indoor_floor', collidable: isWall });
      }
      this.houseMC.push(row);
    }
    this.doorMCHouse = { x: 8, y: 11 };
  }

  // --- NPC HOUSES (ALREADY FULLY FURNISHED!) ---
  initNPCHouses() {
    // 1. Pak Budi Store Interior (14x10)
    this.houseBudi = this.createFurnishedRoom(14, 10, [
      { id: 'cabinet', x: 2, y: 2 },
      { id: 'bookshelf', x: 5, y: 2 },
      { id: 'dining_table', x: 9, y: 4 },
      { id: 'plant', x: 2, y: 7 },
      { id: 'rug', x: 5, y: 5 }
    ]);

    // 2. Mak Siti Ranch Interior (14x10)
    this.houseSiti = this.createFurnishedRoom(14, 10, [
      { id: 'bed_double', x: 2, y: 2 },
      { id: 'fireplace', x: 6, y: 2 },
      { id: 'dining_table', x: 9, y: 5 },
      { id: 'plant', x: 2, y: 6 }
    ]);

    // 3. Blacksmith Borin Interior (14x10)
    this.houseBlacksmith = this.createFurnishedRoom(14, 10, [
      { id: 'fireplace', x: 3, y: 2 },
      { id: 'cabinet', x: 7, y: 2 },
      { id: 'dining_table', x: 9, y: 5 },
      { id: 'bookshelf', x: 2, y: 5 }
    ]);
  }

  createFurnishedRoom(w, h, furnitureList) {
    const grid = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        const isWall = (y <= 2 || x === 0 || x === w - 1 || (y === h - 1 && x !== Math.floor(w / 2)));
        row.push({ type: isWall ? 'indoor_wall' : 'indoor_floor', collidable: isWall });
      }
      grid.push(row);
    }
    return { w, h, grid, door: { x: Math.floor(w / 2), y: h - 1 }, furniture: furnitureList };
  }

  // --- HUTAN MISTERIUS (MYSTIC WOODS COMBAT ZONE) ---
  initMysticWoods() {
    this.woodsW = 40;
    this.woodsH = 30;
    this.woodsGrid = [];
    for (let y = 0; y < this.woodsH; y++) {
      const row = [];
      for (let x = 0; x < this.woodsW; x++) {
        const isBorder = (x === 0 || x === this.woodsW - 1 || y === 0 || y === this.woodsH - 1);
        row.push({ type: isBorder ? 'tree' : 'grass', collidable: isBorder });
      }
      this.woodsGrid.push(row);
    }

    // Portal back to village at (2, 15)
    this.woodsGrid[15][1].type = 'portal_village';
    this.woodsGrid[15][1].collidable = false;

    // Ancient stone ruins and ponds in woods
    for (let y = 10; y <= 18; y++) {
      for (let x = 16; x <= 24; x++) {
        if ((x + y) % 3 === 0) {
          this.woodsGrid[y][x].type = 'ruin_stone';
          this.woodsGrid[y][x].collidable = true;
        }
      }
    }

    // Spawn Monsters
    this.respawnMonsters();
  }

  respawnMonsters() {
    this.monsters = [
      { id: 's1', type: 'slime', x: 14 * 16, y: 8 * 16, hp: 35, maxHp: 35, atk: 4, speed: 22, dir: 'down', anim: 0 },
      { id: 's2', type: 'slime', x: 26 * 16, y: 12 * 16, hp: 35, maxHp: 35, atk: 4, speed: 22, dir: 'left', anim: 0 },
      { id: 's3', type: 'slime', x: 20 * 16, y: 22 * 16, hp: 35, maxHp: 35, atk: 4, speed: 22, dir: 'up', anim: 0 },
      { id: 'k1', type: 'skeleton', x: 30 * 16, y: 8 * 16, hp: 70, maxHp: 70, atk: 10, speed: 28, dir: 'down', anim: 0 },
      { id: 'k2', type: 'skeleton', x: 32 * 16, y: 20 * 16, hp: 70, maxHp: 70, atk: 10, speed: 28, dir: 'left', anim: 0 }
    ];
  }

  // --- COLLISION CHECK BY CURRENT LOCATION ---
  isCollidable(tx, ty, loc = this.currentLocation) {
    if (loc === 'farm') {
      if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return true;
      return this.grid[ty][tx].collidable;
    } else if (loc === 'house_mc') {
      if (tx < 0 || tx >= this.houseMCWidth || ty < 0 || ty >= this.houseMCHeight) return true;
      if (this.houseMC[ty][tx].collidable) return true;
      // Check placed furniture collision
      const hitsFurn = this.placedFurnitureMC.some(f => {
        const def = FURNITURE_DEFINITIONS[f.id] || { w: 1, h: 1 };
        return tx >= f.x && tx < f.x + def.w && ty >= f.y && ty < f.y + def.h;
      });
      return hitsFurn;
    } else if (loc === 'woods') {
      if (tx < 0 || tx >= this.woodsW || ty < 0 || ty >= this.woodsH) return true;
      return this.woodsGrid[ty][tx].collidable;
    } else if (loc === 'house_budi' || loc === 'house_siti' || loc === 'house_blacksmith') {
      const room = loc === 'house_budi' ? this.houseBudi : (loc === 'house_siti' ? this.houseSiti : this.houseBlacksmith);
      if (tx < 0 || tx >= room.w || ty < 0 || ty >= room.h) return true;
      if (room.grid[ty][tx].collidable) return true;
      const hitsFurn = room.furniture.some(f => {
        const def = FURNITURE_DEFINITIONS[f.id] || { w: 1, h: 1 };
        return tx >= f.x && tx < f.x + def.w && ty >= f.y && ty < f.y + def.h;
      });
      return hitsFurn;
    }
    return false;
  }

  // --- MC HOUSE CUSTOM FURNITURE PLACEMENT ---
  placeFurnitureMC(furnId, tx, ty) {
    const idx = this.ownedFurniture.indexOf(furnId);
    if (idx === -1) return false;
    const def = FURNITURE_DEFINITIONS[furnId];
    if (!def) return false;

    // Check bounds & collision
    if (tx < 1 || tx + def.w > this.houseMCWidth - 1 || ty < 3 || ty + def.h > this.houseMCHeight - 1) return false;

    this.ownedFurniture.splice(idx, 1);
    this.placedFurnitureMC.push({ id: furnId, x: tx, y: ty });
    this.autoSave();
    return true;
  }

  pickupFurnitureMC(tx, ty) {
    const fIdx = this.placedFurnitureMC.findIndex(f => {
      const def = FURNITURE_DEFINITIONS[f.id] || { w: 1, h: 1 };
      return tx >= f.x && tx < f.x + def.w && ty >= f.y && ty < f.y + def.h;
    });
    if (fIdx !== -1) {
      const f = this.placedFurnitureMC[fIdx];
      this.placedFurnitureMC.splice(fIdx, 1);
      this.ownedFurniture.push(f.id);
      this.autoSave();
      return f.id;
    }
    return null;
  }

  // --- FARM & ACTIONS ---
  tillSoil(tx, ty) {
    if (this.currentLocation !== 'farm') return false;
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (tile.type === 'grass' && !tile.collidable) {
      tile.type = 'farmland'; tile.tilled = true; tile.watered = false;
      this.addLovePoints(1); this.autoSave(); return true;
    }
    return false;
  }

  waterSoil(tx, ty) {
    if (this.currentLocation !== 'farm') return false;
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (tile.tilled || tile.type === 'farmland') {
      tile.watered = true; tile.waterTimer = 180;
      this.addLovePoints(2); this.autoSave(); return true;
    }
    return false;
  }

  plantCrop(tx, ty, cropType) {
    if (this.currentLocation !== 'farm') return false;
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return false;
    const tile = this.grid[ty][tx];
    if (!tile.tilled || tile.crop || !CROP_DEFINITIONS[cropType]) return false;
    tile.crop = { id: cropType, stage: 0, progress: 0, ready: false };
    this.addLovePoints(3); this.autoSave(); return true;
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

  sellAllProduce() {
    let earned = 0;
    for (const [id, count] of Object.entries(this.chest.produce)) {
      if (count > 0) {
        if (CROP_DEFINITIONS[id]) earned += count * CROP_DEFINITIONS[id].sellPrice;
        else if (id === 'fish') earned += count * 35;
        else if (id === 'milk') earned += count * 40;
        else if (id === 'egg') earned += count * 25;
        else if (id === 'wool') earned += count * 55;
        else if (id === 'monster_gel') earned += count * 30;
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
      const bounds = { minX: 3, maxX: 11, minY: 3, maxY: 10 };
      const rx = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const ry = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      this.ownedAnimals.push({ id: `${animalType}_${Date.now()}`, name, type: animalType, x: rx, y: ry });
      this.addLovePoints(20);
      this.autoSave();
      return true;
    }
    return false;
  }

  buyPet(petType, name, price) {
    if (this.coins >= price) {
      this.coins -= price;
      this.activePet = { type: petType, name };
      this.addLovePoints(30);
      this.autoSave();
      return true;
    }
    return false;
  }

  buyFurniture(furnId) {
    const def = FURNITURE_DEFINITIONS[furnId];
    if (!def || this.coins < def.price) return false;
    this.coins -= def.price;
    this.ownedFurniture.push(furnId);
    this.addLovePoints(15);
    this.autoSave();
    return true;
  }

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

  update(delta) {
    this.timeMinutes += delta * this.timeSpeed;
    if (this.timeMinutes >= 1440) {
      this.timeMinutes -= 1440;
      this.dayCount++;
    }

    // Crop Growth in farm
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

    // Monster AI in Mystic Woods
    if (this.currentLocation === 'woods') {
      this.updateMonsters(delta);
    }
  }

  updateMonsters(delta) {
    this.monsters.forEach(m => {
      m.anim = (m.anim + delta * 5) % 6;
      // Slime & Skeleton patrol wandering
      if (!m.timer || m.timer <= 0) {
        m.timer = 1.5 + Math.random() * 2;
        m.vx = (Math.random() - 0.5) * m.speed;
        m.vy = (Math.random() - 0.5) * m.speed;
        m.dir = Math.abs(m.vx) > Math.abs(m.vy) ? (m.vx > 0 ? 'right' : 'left') : (m.vy > 0 ? 'down' : 'up');
      } else {
        m.timer -= delta;
        const nx = m.x + m.vx * delta;
        const ny = m.y + m.vy * delta;
        const tx = Math.floor(nx / 16);
        const ty = Math.floor(ny / 16);
        if (!this.isCollidable(tx, ty, 'woods')) {
          m.x = nx;
          m.y = ny;
        } else {
          m.timer = 0;
        }
      }
    });
  }

  attackMonster(playerX, playerY, damage = 25) {
    let hitMonster = null;
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      const dist = Math.hypot(m.x - playerX, m.y - playerY);
      if (dist < 36) {
        m.hp -= damage;
        hitMonster = m;
        if (m.hp <= 0) {
          // Monster defeated!
          this.monsters.splice(i, 1);
          const earned = 20 + Math.floor(Math.random() * 25);
          this.coins += earned;
          this.chest.produce.monster_gel = (this.chest.produce.monster_gel || 0) + 1;
          this.addLovePoints(15);
          if (window.soundSystem) window.soundSystem.playMonsterDefeat();
          return { hit: true, defeated: true, earned, monster: m };
        } else {
          if (window.soundSystem) window.soundSystem.playMonsterHit();
          return { hit: true, defeated: false, damage, monster: m };
        }
      }
    }
    return null;
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
    this.timeMinutes = 420;
    this.dayCount++;
    this.addLovePoints(40);
    this.autoSave();
  }

  // --- SERIALIZATION ---
  getSnapshot() {
    const compressedTiles = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.grid[y][x];
        if (t.tilled || t.crop || t.watered) {
          compressedTiles.push({
            x, y, tilled: t.tilled, watered: t.watered,
            crop: t.crop ? { id: t.crop.id, stage: t.crop.stage, progress: Math.round(t.crop.progress), ready: t.crop.ready } : null
          });
        }
      }
    }

    return {
      version: 3,
      coins: this.coins,
      lovePoints: this.lovePoints,
      loveLevel: this.loveLevel,
      dayCount: this.dayCount,
      timeMinutes: Math.round(this.timeMinutes),
      unlockedTools: this.unlockedTools,
      unlockedBots: this.unlockedBots,
      ownedAnimals: this.ownedAnimals,
      activePet: this.activePet,
      ownedFurniture: this.ownedFurniture,
      placedFurnitureMC: this.placedFurnitureMC,
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
    if (data.activePet !== undefined) this.activePet = data.activePet;
    if (data.ownedFurniture) this.ownedFurniture = data.ownedFurniture;
    if (data.placedFurnitureMC) this.placedFurnitureMC = data.placedFurnitureMC;
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
      localStorage.setItem('kebun_cinta_save_v3', JSON.stringify(snap));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  loadFromStorage() {
    try {
      const str = localStorage.getItem('kebun_cinta_save_v3') || localStorage.getItem('kebun_cinta_save_data_v2');
      if (str) {
        this.applySnapshot(JSON.parse(str));
      }
    } catch (e) {
      console.warn('Load failed:', e);
    }
  }

  exportSaveFile() {
    const blob = new Blob([JSON.stringify(this.getSnapshot(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kebun-cinta-save-hari-${this.dayCount}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importSaveFile(jsonStr) {
    try {
      this.applySnapshot(JSON.parse(jsonStr));
      this.autoSave();
      return true;
    } catch (e) {
      return false;
    }
  }
}

window.FarmManager = FarmManager;
window.CROP_DEFINITIONS = CROP_DEFINITIONS;
window.FURNITURE_DEFINITIONS = FURNITURE_DEFINITIONS;
window.LOVE_LEVEL_TITLES = LOVE_LEVEL_TITLES;
