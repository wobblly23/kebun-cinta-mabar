// js/farm.js - Complete Multi-Crop Sunnyside System, Timed Growth, Animal Production, Mining & Combat

const CROP_DEFINITIONS = {
  carrot: {
    id: 'carrot',
    name: 'Wortel Manis',
    icon: '🥕',
    growTime: 25, // 25s (with water 12.5s)
    sellPrice: 15,
    seedPrice: 6,
    healHp: 20,
    loveReward: 5,
    desc: 'Wortel renyah manis kaya vitamin.'
  },
  cabbage: {
    id: 'cabbage',
    name: 'Kubis Segar',
    icon: '🥬',
    growTime: 35,
    sellPrice: 28,
    seedPrice: 10,
    healHp: 28,
    loveReward: 8,
    desc: 'Kubis hijau segar berlapis-lapis.'
  },
  potato: {
    id: 'potato',
    name: 'Kentang Emas',
    icon: '🥔',
    growTime: 50,
    sellPrice: 42,
    seedPrice: 16,
    healHp: 35,
    loveReward: 12,
    desc: 'Kentang gurih untuk santap malam bersama.'
  },
  beetroot: {
    id: 'beetroot',
    name: 'Bit Manis Merah',
    icon: '🍠',
    growTime: 65,
    sellPrice: 58,
    seedPrice: 22,
    healHp: 45,
    loveReward: 16,
    desc: 'Bit merah kaya nutrisi penambah tenaga.'
  },
  cauliflower: {
    id: 'cauliflower',
    name: 'Kembang Kol',
    icon: '🥦',
    growTime: 80,
    sellPrice: 78,
    seedPrice: 30,
    healHp: 60,
    loveReward: 20,
    desc: 'Kembang kol putih bersih lezat dimasak sup.'
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Labu Emas',
    icon: '🎃',
    growTime: 110,
    sellPrice: 125,
    seedPrice: 45,
    healHp: 85,
    loveReward: 32,
    desc: 'Labu emas besar bernilai jual sangat tinggi.'
  },
  radish: {
    id: 'radish',
    name: 'Lobak Putih',
    icon: '🥗',
    growTime: 40,
    sellPrice: 32,
    seedPrice: 12,
    healHp: 30,
    loveReward: 9,
    desc: 'Lobak segar penambah nafsu makan.'
  },
  wheat: {
    id: 'wheat',
    name: 'Gandum Panen',
    icon: '🌾',
    growTime: 55,
    sellPrice: 48,
    seedPrice: 18,
    healHp: 40,
    loveReward: 14,
    desc: 'Gandum emas melambai untuk membuat roti harum.'
  }
};

const FURNITURE_DEFINITIONS = {
  bed_double: { id: 'bed_double', name: 'Ranjang Pasangan Manis 🛏️', price: 90, icon: '🛏️', w: 2, h: 3, desc: 'Ranjang empuk untuk tidur bersama menyambut pagi.' },
  dining_table: { id: 'dining_table', name: 'Meja Makan & Kursi 🪑', price: 75, icon: '🪑', w: 2, h: 2, desc: 'Meja makan kayu untuk santap malam berdua.' },
  fireplace: { id: 'fireplace', name: 'Perapian Hangat 🔥', price: 120, icon: '🔥', w: 2, h: 2, desc: 'Menghangatkan rumah saat senja dan malam hari.' },
  sofa: { id: 'sofa', name: 'Sofa Beludru Merah 🛋️', price: 85, icon: '🛋️', w: 3, h: 2, desc: 'Sofa nyaman untuk bersantai berdua.' },
  rug: { id: 'rug', name: 'Karpet Tenun Romantis 🧶', price: 50, icon: '🧶', w: 3, h: 2, desc: 'Karpet lembut penambah cinta di lantai rumah.' },
  bookshelf: { id: 'bookshelf', name: 'Rak Buku Cerita 📚', price: 70, icon: '📚', w: 2, h: 2, desc: 'Koleksi buku dongeng dan resep masakan.' },
  cabinet: { id: 'cabinet', name: 'Lemari Kayu Antik 🗄️', price: 60, icon: '🗄️', w: 2, h: 2, desc: 'Lemari pakaian dan penyimpanan barang.' },
  plant: { id: 'plant', name: 'Tanaman Hias Monstera 🪴', price: 35, icon: '🪴', w: 2, h: 2, desc: 'Menyegarkan suasana ruang keluarga.' },
  anvil: { id: 'anvil', name: 'Paron Besi Pandai 🔨', price: 100, icon: '🔨', w: 2, h: 2, desc: 'Landasan tempa besi milik pandai besi.' },
  barrel_swords: { id: 'barrel_swords', name: 'Tong Pedang Baja ⚔️', price: 80, icon: '⚔️', w: 2, h: 2, desc: 'Tong kayu berisi pedang hasil tempaan.' },
  crate_merchant: { id: 'crate_merchant', name: 'Kotak Sayur Pedagang 📦', price: 40, icon: '📦', w: 2, h: 2, desc: 'Kotak kayu penuh hasil panen segar toko.' }
};

const ITEM_CATALOG = {
  // 1. Alat Kerja & Senjata
  hoe: { id: 'hoe', category: 'tools', type: 'tool', name: 'Cangkul Baja', icon: '🌾', desc: 'Mencangkul tanah berumput menjadi petak ladang subur.' },
  water: { id: 'water', category: 'tools', type: 'tool', name: 'Penyiram Air', icon: '💧', desc: 'Menyiram air pada tanah agar bibit cepat tumbuh mekar.' },
  axe: { id: 'axe', category: 'tools', type: 'tool', name: 'Kapak Penebang', icon: '🪓', desc: 'Menebang pohon dan batang kayu untuk bahan kerajinan.' },
  pickaxe: { id: 'pickaxe', category: 'tools', type: 'tool', name: 'Beliung Tambang', icon: '⛏️', desc: 'Menambang bebatuan dan bongkahan bijih emas berharga.' },
  fishing_rod: { id: 'fishing_rod', category: 'tools', type: 'tool', name: 'Pancing Bambu', icon: '🎣', desc: 'Memancing ikan segar di tepi danau yang tenang.' },
  sword_iron: { id: 'sword_iron', category: 'tools', type: 'weapon', name: 'Pedang Besi Tempa', icon: '⚔️', desc: 'Pedang tajam untuk berburu monster di Hutan Misterius.' },
  flower: { id: 'flower', category: 'tools', type: 'gift', name: 'Bunga Mawar Cinta', icon: '💖', desc: 'Bunga mawar merah harum untuk dihadiahkan kepada kekasih.' },

  // 2. Bibit Tanaman Lengkap
  seed_carrot: { id: 'seed_carrot', category: 'seeds', type: 'seed', cropId: 'carrot', name: 'Bibit Wortel', icon: '🥕', desc: 'Wortel manis renyah (Tumbuh 25 detik).' },
  seed_cabbage: { id: 'seed_cabbage', category: 'seeds', type: 'seed', cropId: 'cabbage', name: 'Bibit Kubis', icon: '🥬', desc: 'Kubis hijau segar berlapis (Tumbuh 35 detik).' },
  seed_potato: { id: 'seed_potato', category: 'seeds', type: 'seed', cropId: 'potato', name: 'Bibit Kentang', icon: '🥔', desc: 'Kentang emas gurih lezat (Tumbuh 50 detik).' },
  seed_beetroot: { id: 'seed_beetroot', category: 'seeds', type: 'seed', cropId: 'beetroot', name: 'Bibit Bit Merah', icon: '🍠', desc: 'Bit merah kaya nutrisi (Tumbuh 65 detik).' },
  seed_cauliflower: { id: 'seed_cauliflower', category: 'seeds', type: 'seed', cropId: 'cauliflower', name: 'Bibit Kembang Kol', icon: '🥦', desc: 'Kembang kol putih mekar (Tumbuh 80 detik).' },
  seed_pumpkin: { id: 'seed_pumpkin', category: 'seeds', type: 'seed', cropId: 'pumpkin', name: 'Bibit Labu Kuning', icon: '🎃', desc: 'Labu emas besar bernilai jual tinggi (Tumbuh 110 detik).' },
  seed_radish: { id: 'seed_radish', category: 'seeds', type: 'seed', cropId: 'radish', name: 'Bibit Lobak', icon: '🥗', desc: 'Lobak renyah penyehat badan (Tumbuh 40 detik).' },
  seed_wheat: { id: 'seed_wheat', category: 'seeds', type: 'seed', cropId: 'wheat', name: 'Bibit Gandum', icon: '🌾', desc: 'Gandum emas untuk membuat roti harum (Tumbuh 55 detik).' },

  // 3. Hasil Panen, Ikan, & Bahan Baku
  carrot: { id: 'carrot', category: 'produce', type: 'food', name: 'Wortel Manis', icon: '🥕', heal: 20, desc: 'Bisa dimakan untuk memulihkan +20 HP, atau dijual ke toko.' },
  cabbage: { id: 'cabbage', category: 'produce', type: 'food', name: 'Kubis Segar', icon: '🥬', heal: 28, desc: 'Bisa dimakan untuk memulihkan +28 HP, atau dijual ke toko.' },
  potato: { id: 'potato', category: 'produce', type: 'food', name: 'Kentang Emas', icon: '🥔', heal: 35, desc: 'Bisa dimakan untuk memulihkan +35 HP, atau dijual ke toko.' },
  beetroot: { id: 'beetroot', category: 'produce', type: 'food', name: 'Bit Merah Manis', icon: '🍠', heal: 45, desc: 'Bisa dimakan untuk memulihkan +45 HP, atau dijual ke toko.' },
  cauliflower: { id: 'cauliflower', category: 'produce', type: 'food', name: 'Kembang Kol', icon: '🥦', heal: 60, desc: 'Bisa dimakan untuk memulihkan +60 HP, atau dijual ke toko.' },
  pumpkin: { id: 'pumpkin', category: 'produce', type: 'food', name: 'Labu Emas', icon: '🎃', heal: 85, desc: 'Bisa dimakan untuk memulihkan +85 HP, atau dijual dengan harga tinggi.' },
  radish: { id: 'radish', category: 'produce', type: 'food', name: 'Lobak Putih', icon: '🥗', heal: 30, desc: 'Bisa dimakan untuk memulihkan +30 HP, atau dijual ke toko.' },
  wheat: { id: 'wheat', category: 'produce', type: 'material', name: 'Gandum Panen', icon: '🌾', desc: 'Gandum emas melambai untuk dijual ke pedagang.' },
  fish: { id: 'fish', category: 'produce', type: 'food', name: 'Ikan Danau Segar', icon: '🐟', heal: 45, desc: 'Tangkapan ikan danau segar (+45 HP saat dimakan).' },
  milk: { id: 'milk', category: 'produce', type: 'food', name: 'Susu Sapi Murni', icon: '🥛', heal: 35, desc: 'Susu segar dari sapi Mak Siti (+35 HP).' },
  egg: { id: 'egg', category: 'produce', type: 'food', name: 'Telur Ayam Segar', icon: '🥚', heal: 15, desc: 'Telur ayam segar kaya protein (+15 HP).' },
  wool: { id: 'wool', category: 'produce', type: 'material', name: 'Wol Domba Lembut', icon: '🧶', desc: 'Bahan wol hangat berkualitas tinggi.' },
  wood: { id: 'wood', category: 'produce', type: 'material', name: 'Kayu Glondong', icon: '🪵', desc: 'Bahan kayu dari pohon dan batang tebangan.' },
  stone: { id: 'stone', category: 'produce', type: 'material', name: 'Batu Kali', icon: '🪨', desc: 'Batu hasil tambangan untuk dijual.' },
  ore: { id: 'ore', category: 'produce', type: 'material', name: 'Bijih Emas Murni', icon: '💎', desc: 'Bongkahan bijih emas langka bernilai tinggi!' },
  monster_gel: { id: 'monster_gel', category: 'produce', type: 'material', name: 'Gel Monster', icon: '🧪', desc: 'Bahan berharga hasil buruan monster Hutan Misterius.' }
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

    this.currentLocation = 'farm'; // 'farm' | 'house_mc' | 'house_budi' | 'house_siti' | 'house_blacksmith' | 'woods'

    this.grid = [];
    this.houseMC = [];
    this.houseBudi = null;
    this.houseSiti = null;
    this.houseBlacksmith = null;
    this.mysticWoodsGrid = [];

    // Economy & Health
    this.coins = 80;
    this.lovePoints = 0;
    this.loveLevel = 1;
    this.playerHp = 100;
    this.playerMaxHp = 100;

    // Tools
    this.unlockedTools = {
      hoe: true,
      water: true,
      axe: true,
      pickaxe: true,
      fishing_rod: false,
      sword_iron: false,
      sword_gold: false,
      flower: true
    };

    // Exactly 5 Quick Slots in Hotbar
    this.hotbar = ['hoe', 'water', 'axe', 'pickaxe', 'seed_carrot'];
    this.activeHotbarIndex = 0;

    // Player Bag / Inventory: { [itemId]: count }
    this.inventory = {
      hoe: 1,
      water: 1,
      axe: 1,
      pickaxe: 1,
      flower: 99,
      seed_carrot: 4,
      seed_cabbage: 2,
      seed_potato: 2
    };

    this.unlockedBots = { slime: false, boni: false, chicky: false };
    this.ownedAnimals = [];
    this.activePet = null;

    // MC House Starts Empty!
    this.ownedFurniture = [];
    this.placedFurnitureMC = [];

    // Shared Storage
    this.chest = {
      seeds: { carrot: 4, cabbage: 2, potato: 2, beetroot: 0, cauliflower: 0, pumpkin: 0, radish: 0, wheat: 0 },
      produce: {
        carrot: 0, cabbage: 0, potato: 0, beetroot: 0, cauliflower: 0, pumpkin: 0, radish: 0, wheat: 0,
        wood: 0, stone: 0, ore: 0, fish: 0, milk: 0, egg: 0, wool: 0, monster_gel: 0
      }
    };

    // World Resource Nodes
    this.resourceNodes = [];

    // Monsters in Mystic Woods
    this.monsters = [];

    // Time & Day Cycle
    this.timeMinutes = 480; // 08:00
    this.dayCount = 1;
    this.timeSpeed = 1.8;

    // NPCs with Active Wander Movement
    this.npcs = [
      {
        id: 'pak_budi',
        name: 'Pak Budi (Toko Tani)',
        role: 'merchant',
        x: 9 * 16,
        y: 25 * 16,
        originX: 9 * 16,
        originY: 25 * 16,
        houseLocation: 'house_budi',
        doorX: 9,
        doorY: 24,
        portrait: 'assets/npcs/npc_merchant.png',
        dir: 'down',
        isMoving: false,
        anim: 0,
        timer: 2.5,
        targetX: 9 * 16,
        targetY: 25 * 16,
        dialog: 'Halo! Selamat datang di Toko Tani. Mau bibit wortel, kubis, labu, atau perabotan cantik untuk mengisi rumahmu?'
      },
      {
        id: 'mak_siti',
        name: 'Mak Siti (Peternakan)',
        role: 'rancher',
        x: 18 * 16,
        y: 25 * 16,
        originX: 18 * 16,
        originY: 25 * 16,
        houseLocation: 'house_siti',
        doorX: 18,
        doorY: 24,
        portrait: 'assets/npcs/npc_rancher.png',
        dir: 'down',
        isMoving: false,
        anim: 0,
        timer: 3.0,
        targetX: 18 * 16,
        targetY: 25 * 16,
        dialog: 'Halo anak muda manis! Mau pelihara ayam, sapi, atau hewan peliharaan imut yang setia menemanimu?'
      },
      {
        id: 'borin',
        name: 'Borin (Pandai Besi)',
        role: 'blacksmith',
        x: 27 * 16,
        y: 25 * 16,
        originX: 27 * 16,
        originY: 25 * 16,
        houseLocation: 'house_blacksmith',
        doorX: 27,
        doorY: 24,
        portrait: 'assets/characters/portrait_boy.png',
        dir: 'down',
        isMoving: false,
        anim: 0,
        timer: 2.0,
        targetX: 27 * 16,
        targetY: 25 * 16,
        dialog: 'Dentang palu pandai besi! Beli pedang tajam untuk berburu monster di Hutan Misterius?'
      },
      {
        id: 'paman_sam',
        name: 'Paman Sam (Nelayan)',
        role: 'fisher',
        x: 37 * 16,
        y: 19 * 16,
        originX: 37 * 16,
        originY: 19 * 16,
        houseLocation: null,
        doorX: null,
        doorY: null,
        portrait: 'assets/npcs/npc_fisher.png',
        dir: 'left',
        isMoving: false,
        anim: 0,
        timer: 3.5,
        targetX: 37 * 16,
        targetY: 19 * 16,
        dialog: 'Angin danau sangat sepoi-sepoi! Beli alat pancing bambu untuk mencari ikan segar di sini!'
      },
      {
        id: 'mbah_dukun',
        name: 'Mbah Dukun (Kontraktor)',
        role: 'bot_elder',
        x: 11 * 16,
        y: 14 * 16,
        originX: 11 * 16,
        originY: 14 * 16,
        houseLocation: null,
        doorX: null,
        doorY: null,
        portrait: 'assets/bots/bot_boni.png',
        dir: 'down',
        isMoving: false,
        anim: 0,
        timer: 2.8,
        targetX: 11 * 16,
        targetY: 14 * 16,
        dialog: 'Hehehe... Butuh pembantu otomatis di kebun? Bayar koin dan panggil Slimey atau Boni untuk bekerja!'
      }
    ];

    this.initWorld();
    this.initMCHouse();
    this.initNPCHouses();
    this.initMysticWoods();
    this.loadFromStorage();
  }

  // --- OUTDOOR VILLAGE & FARM MAP ---
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

    // 1. Cobblestone Village Pathways
    for (let x = 2; x <= 45; x++) this.grid[9][x].type = 'path';
    for (let x = 2; x <= 45; x++) this.grid[18][x].type = 'path';
    for (let y = 9; y <= 27; y++) this.grid[y][24].type = 'path';
    for (let y = 18; y <= 27; y++) {
      this.grid[y][9].type = 'path';
      this.grid[y][18].type = 'path';
      this.grid[y][27].type = 'path';
    }

    // 2. MC House Footprint (Top Center x: 21..27, y: 3..8)
    for (let y = 3; y <= 8; y++) {
      for (let x = 21; x <= 27; x++) {
        this.grid[y][x].type = 'building';
        this.grid[y][x].collidable = (y !== 8 || x !== 24); // Door at (24, 8)
      }
    }
    this.grid[8][23].type = 'chest'; this.grid[8][23].collidable = true;
    this.grid[8][25].type = 'sell_bin'; this.grid[8][25].collidable = true;

    // 3. Toko Pak Budi (x: 7..11, y: 20..24)
    for (let y = 20; y <= 24; y++) {
      for (let x = 7; x <= 11; x++) {
        this.grid[y][x].type = 'building';
        this.grid[y][x].collidable = (y !== 24 || x !== 9);
      }
    }

    // 4. Mak Siti Ranch House (x: 16..20, y: 20..24)
    for (let y = 20; y <= 24; y++) {
      for (let x = 16; x <= 20; x++) {
        this.grid[y][x].type = 'building';
        this.grid[y][x].collidable = (y !== 24 || x !== 18);
      }
    }

    // 5. Pandai Besi Borin (x: 25..29, y: 20..24)
    for (let y = 20; y <= 24; y++) {
      for (let x = 25; x <= 29; x++) {
        this.grid[y][x].type = 'building';
        this.grid[y][x].collidable = (y !== 24 || x !== 27);
      }
    }

    // 6. Mak Siti Pasture (x: 2..12, y: 3..8)
    for (let x = 2; x <= 12; x++) {
      this.grid[3][x].type = 'fence'; this.grid[3][x].collidable = true;
      this.grid[8][x].type = 'fence'; this.grid[8][x].collidable = true;
    }
    for (let y = 3; y <= 8; y++) {
      this.grid[y][2].type = 'fence'; this.grid[y][2].collidable = true;
      this.grid[y][12].type = 'fence'; this.grid[y][12].collidable = true;
    }
    this.grid[8][7].type = 'path'; this.grid[8][7].collidable = false; // Pasture gate

    // 7. Farming Soil Beds (x: 14..21 & 27..34, y: 11..16)
    for (let y = 11; y <= 16; y++) {
      for (let x = 14; x <= 21; x++) { this.grid[y][x].type = 'farmland'; this.grid[y][x].tilled = true; }
      for (let x = 27; x <= 34; x++) { this.grid[y][x].type = 'farmland'; this.grid[y][x].tilled = true; }
    }
    // Covered stone well positioned scenicly beside farmland (pathway x:24 remains 100% open!)
    this.grid[12][13].type = 'well'; this.grid[12][13].collidable = true;

    // 8. Scenic Lake & Pier on East (x: 36..46, y: 12..28) - 100% CLEAN BLUE WATER!
    for (let y = 12; y <= 28; y++) {
      for (let x = 36; x <= 46; x++) {
        this.grid[y][x].type = 'water';
        this.grid[y][x].collidable = true;
      }
    }
    // Wooden bridge walkway across water (width 36..41 on row 19)
    for (let x = 36; x <= 41; x++) {
      this.grid[19][x].type = 'bridge';
      this.grid[19][x].collidable = false;
    }

    // 9. Gate to Mystic Woods (North East)
    for (let x = 44; x <= 46; x++) {
      this.grid[1][x].type = 'portal_woods'; this.grid[1][x].collidable = false;
    }

    // Spawn Natural Resource Nodes (Cleanly placed, no overlap!)
    this.initResourceNodes();

    // Starter crop: Wortel & Kubis (starts at stage 1 seedling, NOT instant pumpkin!)
    this.plantCrop(16, 12, 'carrot');
    this.plantCrop(17, 12, 'cabbage');
    this.grid[12][16].watered = true;
    this.grid[12][17].watered = true;
  }

  initResourceNodes() {
    this.resourceNodes = [
      // Mineable Rocks in natural rocky areas (away from bridge entrance)
      { id: 'r1', type: 'rock', x: 4, y: 16, hp: 3, maxHp: 3, respawn: 0 },
      { id: 'r2', type: 'rock', x: 5, y: 20, hp: 3, maxHp: 3, respawn: 0 },
      { id: 'r3', type: 'rock', x: 32, y: 23, hp: 3, maxHp: 3, respawn: 0 },
      { id: 'r4', type: 'ore', x: 33, y: 26, hp: 4, maxHp: 4, respawn: 0 },
      // Choppable Logs & Stumps naturally placed under trees
      { id: 'w1', type: 'log', x: 13, y: 2, hp: 2, maxHp: 2, respawn: 0 },
      { id: 'w2', type: 'stump', x: 30, y: 2, hp: 2, maxHp: 2, respawn: 0 },
      { id: 'w3', type: 'log', x: 33, y: 6, hp: 2, maxHp: 2, respawn: 0 },
      { id: 'w4', type: 'stump', x: 3, y: 23, hp: 2, maxHp: 2, respawn: 0 }
    ];
  }

  // --- RUMAH UTAMA MC (STARTS EMPTY SO PLAYER DECORATES!) ---
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
    // Starter welcome rug in the center
    if (this.placedFurnitureMC.length === 0) {
      this.placedFurnitureMC = [{ id: 'rug', x: 7, y: 6 }];
    }
  }

  // --- NPC HOUSES (DIFFERENT & FULLY FURNISHED!) ---
  initNPCHouses() {
    // 1. Toko Pak Budi (14x10) - Filled with merchant goods
    this.houseBudi = this.createFurnishedRoom(14, 10, [
      { id: 'bookshelf', x: 2, y: 2 },
      { id: 'crate_merchant', x: 5, y: 2 },
      { id: 'cabinet', x: 8, y: 2 },
      { id: 'dining_table', x: 3, y: 5 },
      { id: 'plant', x: 10, y: 4 },
      { id: 'rug', x: 6, y: 5 }
    ]);

    // 2. Mak Siti Ranch Interior (14x10) - Farmhouse style
    this.houseSiti = this.createFurnishedRoom(14, 10, [
      { id: 'bed_double', x: 2, y: 2 },
      { id: 'fireplace', x: 6, y: 2 },
      { id: 'cabinet', x: 9, y: 2 },
      { id: 'dining_table', x: 6, y: 5 },
      { id: 'plant', x: 10, y: 5 },
      { id: 'rug', x: 2, y: 6 }
    ]);

    // 3. Blacksmith Borin Interior (14x10) - Forge & Anvil
    this.houseBlacksmith = this.createFurnishedRoom(14, 10, [
      { id: 'fireplace', x: 3, y: 2 },
      { id: 'anvil', x: 6, y: 3 },
      { id: 'barrel_swords', x: 9, y: 2 },
      { id: 'cabinet', x: 10, y: 5 },
      { id: 'dining_table', x: 3, y: 6 },
      { id: 'bookshelf', x: 6, y: 6 }
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

  // --- MYSTIC WOODS (COMBAT & RESOURCE MAP) ---
  initMysticWoods() {
    this.woodsCols = 40;
    this.woodsRows = 30;
    this.mysticWoodsGrid = [];

    for (let y = 0; y < this.woodsRows; y++) {
      const row = [];
      for (let x = 0; x < this.woodsCols; x++) {
        const isBorder = (x <= 1 || x >= this.woodsCols - 2 || y <= 1 || y >= this.woodsRows - 2);
        row.push({
          type: isBorder ? 'woods_border' : 'woods_grass',
          collidable: isBorder
        });
      }
      this.mysticWoodsGrid.push(row);
    }

    // Portal back to village at (2, 15)
    this.mysticWoodsGrid[15][2].type = 'portal_village';
    this.mysticWoodsGrid[15][2].collidable = false;
    this.mysticWoodsGrid[15][1].collidable = false;

    // Organic Winding Dirt Trails through the Mystic Woods
    // Main trail from portal (2, 15) to ancient sanctuary (20, 15)
    for (let x = 2; x <= 22; x++) {
      this.mysticWoodsGrid[15][x].type = 'woods_path';
      if (x % 2 === 0) this.mysticWoodsGrid[14][x].type = 'woods_path';
    }
    // North branch to Ancient Ruin Grounds (18, 5..15)
    for (let y = 6; y <= 15; y++) {
      this.mysticWoodsGrid[y][18].type = 'woods_path';
      if (y % 2 === 0) this.mysticWoodsGrid[y][19].type = 'woods_path';
    }
    for (let x = 14; x <= 24; x++) {
      this.mysticWoodsGrid[6][x].type = 'woods_path';
    }
    // South branch to Slime Hollow (20, 15..24)
    for (let y = 15; y <= 24; y++) {
      this.mysticWoodsGrid[y][20].type = 'woods_path';
      if (y % 2 === 1) this.mysticWoodsGrid[y][21].type = 'woods_path';
    }
    for (let x = 12; x <= 28; x++) {
      this.mysticWoodsGrid[24][x].type = 'woods_path';
    }
    // East branch to Deep Woods (22..34, 15)
    for (let x = 22; x <= 34; x++) {
      this.mysticWoodsGrid[15][x].type = 'woods_path';
      if (x % 2 === 1) this.mysticWoodsGrid[16][x].type = 'woods_path';
    }

    // Dedicated Tree Placement List (Lush, non-overlapping natural forest canopy)
    this.woodsTrees = [];

    // Outer Perimeter Canopy
    // Top border (y=1)
    for (let x = 1; x < this.woodsCols - 1; x += 3) {
      this.woodsTrees.push({ x: x, y: 1, type: (x % 2 === 0 ? 'big' : 'small') });
      this.mysticWoodsGrid[1][x].collidable = true;
    }
    // Bottom border (y=28)
    for (let x = 1; x < this.woodsCols - 1; x += 3) {
      this.woodsTrees.push({ x: x, y: 28, type: (x % 2 === 0 ? 'big' : 'small') });
      this.mysticWoodsGrid[28][x].collidable = true;
    }
    // Left border (x=1, leaving opening for portal at y=13..17)
    for (let y = 2; y < this.woodsRows - 2; y += 3) {
      if (y >= 13 && y <= 17) continue; // Portal opening
      this.woodsTrees.push({ x: 1, y: y, type: 'big' });
      this.mysticWoodsGrid[y][1].collidable = true;
    }
    // Right border (x=38)
    for (let y = 2; y < this.woodsRows - 2; y += 3) {
      this.woodsTrees.push({ x: 38, y: y, type: (y % 2 === 0 ? 'big' : 'small') });
      this.mysticWoodsGrid[y][38].collidable = true;
    }

    // Interior Natural Forest Groves (Framing the clearings)
    const interiorTrees = [
      // NW Grove
      { x: 5, y: 5, type: 'big' }, { x: 8, y: 4, type: 'small' }, { x: 6, y: 8, type: 'small' },
      // North Ruins Framing
      { x: 13, y: 4, type: 'big' }, { x: 25, y: 4, type: 'big' }, { x: 26, y: 8, type: 'small' },
      // NE Grove
      { x: 31, y: 5, type: 'big' }, { x: 35, y: 6, type: 'small' }, { x: 33, y: 9, type: 'big' },
      // Mid-West Grove
      { x: 8, y: 11, type: 'big' }, { x: 7, y: 18, type: 'small' },
      // Mid-East Grove
      { x: 28, y: 11, type: 'big' }, { x: 30, y: 18, type: 'small' },
      // SW Grove
      { x: 5, y: 22, type: 'big' }, { x: 8, y: 25, type: 'small' }, { x: 6, y: 26, type: 'big' },
      // South Slime Hollow Framing
      { x: 15, y: 22, type: 'small' }, { x: 25, y: 22, type: 'big' }, { x: 17, y: 26, type: 'big' },
      // SE Grove
      { x: 32, y: 22, type: 'big' }, { x: 35, y: 24, type: 'small' }
    ];

    interiorTrees.forEach(t => {
      this.woodsTrees.push(t);
      if (this.mysticWoodsGrid[t.y] && this.mysticWoodsGrid[t.y][t.x]) {
        this.mysticWoodsGrid[t.y][t.x].collidable = true;
      }
    });

    // Rich Interactive Woods Nodes: Minable Rocks, Crystal Ores, Fallen Logs, Stumps, Mushrooms & Ancient Altar
    this.woodsNodes = [
      // Ancient Altar at Center (20, 15)
      { id: 'altar_1', type: 'ancient_altar', x: 20, y: 15, hp: 9999, collidable: true },
      // Glowing Crystal Ore Veins (Drop Amethyst & Gold!)
      { id: 'wo_1', type: 'woods_ore', x: 12, y: 7, hp: 3, maxHp: 3 },
      { id: 'wo_2', type: 'woods_ore', x: 24, y: 6, hp: 3, maxHp: 3 },
      { id: 'wo_3', type: 'woods_ore', x: 14, y: 21, hp: 3, maxHp: 3 },
      { id: 'wo_4', type: 'woods_ore', x: 33, y: 17, hp: 3, maxHp: 3 },
      // Mystic Dark Rocks
      { id: 'wr_1', type: 'woods_rock', x: 10, y: 9, hp: 3, maxHp: 3 },
      { id: 'wr_2', type: 'woods_rock', x: 23, y: 9, hp: 3, maxHp: 3 },
      { id: 'wr_3', type: 'woods_rock', x: 11, y: 17, hp: 3, maxHp: 3 },
      { id: 'wr_4', type: 'woods_rock', x: 26, y: 21, hp: 3, maxHp: 3 },
      // Fallen Mossy Logs
      { id: 'wl_1', type: 'woods_log', x: 13, y: 12, hp: 3, maxHp: 3 },
      { id: 'wl_2', type: 'woods_log', x: 27, y: 8, hp: 3, maxHp: 3 },
      { id: 'wl_3', type: 'woods_log', x: 22, y: 20, hp: 3, maxHp: 3 },
      // Ancient Mossy Stumps
      { id: 'ws_1', type: 'woods_stump', x: 18, y: 8, hp: 2, maxHp: 2 },
      { id: 'ws_2', type: 'woods_stump', x: 25, y: 16, hp: 2, maxHp: 2 },
      { id: 'ws_3', type: 'woods_stump', x: 12, y: 25, hp: 2, maxHp: 2 },
      // Glowing Blue & Red Mushrooms (Decor & Foraging)
      { id: 'wm_b1', type: 'shroom_blue', x: 7, y: 9, hp: 1 },
      { id: 'wm_b2', type: 'shroom_blue', x: 21, y: 7, hp: 1 },
      { id: 'wm_b3', type: 'shroom_blue', x: 16, y: 18, hp: 1 },
      { id: 'wm_b4', type: 'shroom_blue', x: 34, y: 11, hp: 1 },
      { id: 'wm_r1', type: 'shroom_red', x: 11, y: 14, hp: 1 },
      { id: 'wm_r2', type: 'shroom_red', x: 27, y: 15, hp: 1 },
      { id: 'wm_r3', type: 'shroom_red', x: 19, y: 25, hp: 1 },
      { id: 'wm_r4', type: 'shroom_red', x: 25, y: 24, hp: 1 }
    ];

    // Aggressive Monsters (4 Slimes + 3 Skeletons)
    this.monsters = [
      { id: 's1', type: 'slime', x: 12 * 16, y: 8 * 16, hp: 40, maxHp: 40, atk: 10, speed: 28, dir: 'down', anim: 0, reward: 20, level: 1 },
      { id: 's2', type: 'slime', x: 24 * 16, y: 8 * 16, hp: 40, maxHp: 40, atk: 10, speed: 28, dir: 'down', anim: 0, reward: 20, level: 1 },
      { id: 's3', type: 'slime', x: 14 * 16, y: 21 * 16, hp: 40, maxHp: 40, atk: 10, speed: 28, dir: 'down', anim: 0, reward: 20, level: 1 },
      { id: 's4', type: 'slime', x: 28 * 16, y: 21 * 16, hp: 40, maxHp: 40, atk: 10, speed: 28, dir: 'down', anim: 0, reward: 20, level: 1 },
      { id: 'sk1', type: 'skeleton', x: 18 * 16, y: 7 * 16, hp: 65, maxHp: 65, atk: 16, speed: 34, dir: 'down', anim: 0, reward: 35, level: 2 },
      { id: 'sk2', type: 'skeleton', x: 22 * 16, y: 17 * 16, hp: 65, maxHp: 65, atk: 16, speed: 34, dir: 'down', anim: 0, reward: 35, level: 2 },
      { id: 'sk3', type: 'skeleton', x: 32 * 16, y: 14 * 16, hp: 65, maxHp: 65, atk: 16, speed: 34, dir: 'down', anim: 0, reward: 35, level: 3 }
    ];
  }

  isCollidable(tx, ty, location = 'farm') {
    if (location === 'farm') {
      if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return true;
      if (this.grid[ty][tx].collidable) return true;
      const hitsNode = this.resourceNodes.some(n => n.hp > 0 && n.x === tx && n.y === ty);
      if (hitsNode) return true;
      return false;
    } else if (location === 'house_mc') {
      if (tx < 0 || tx >= this.houseMCWidth || ty < 0 || ty >= this.houseMCHeight) return true;
      if (this.houseMC[ty][tx].collidable) return true;
      const hitsFurn = this.placedFurnitureMC.some(f => {
        if (f.id === 'rug') return false; // Rugs can be walked on
        const def = FURNITURE_DEFINITIONS[f.id] || { w: 1, h: 1 };
        return tx >= f.x && tx < f.x + def.w && ty >= f.y && ty < f.y + def.h;
      });
      return hitsFurn;
    } else if (location.startsWith('house_')) {
      const room = location === 'house_budi' ? this.houseBudi : (location === 'house_siti' ? this.houseSiti : this.houseBlacksmith);
      if (!room) return false;
      if (tx < 0 || tx >= room.w || ty < 0 || ty >= room.h) return true;
      if (room.grid[ty][tx].collidable) return true;
      const hitsFurn = room.furniture.some(f => {
        if (f.id === 'rug') return false; // Rugs can be walked on
        const def = FURNITURE_DEFINITIONS[f.id] || { w: 1, h: 1 };
        return tx >= f.x && tx < f.x + def.w && ty >= f.y && ty < f.y + def.h;
      });
      return hitsFurn;
    } else if (location === 'woods') {
      if (tx < 0 || tx >= this.woodsCols || ty < 0 || ty >= this.woodsRows) return true;
      if (this.mysticWoodsGrid[ty][tx].collidable) return true;
      const hitsWoodsNode = (this.woodsNodes || []).some(n => n.hp > 0 && n.collidable !== false && n.x === tx && n.y === ty);
      return hitsWoodsNode;
    }
    return false;
  }

  // --- MINING & WOODCUTTING ACTIONS ---
  mineRock(tx, ty) {
    const list = this.currentLocation === 'woods' ? (this.woodsNodes || []) : this.resourceNodes;
    const node = list.find(n => n.hp > 0 && (n.type === 'rock' || n.type === 'ore' || n.type === 'woods_rock' || n.type === 'woods_ore') && n.x === tx && n.y === ty);
    if (!node) return null;

    node.hp -= 1;
    if (node.hp <= 0) {
      const isOre = (node.type === 'ore' || node.type === 'woods_ore');
      const yieldStone = 2 + Math.floor(Math.random() * 2);
      const yieldOre = isOre ? (1 + Math.floor(Math.random() * 2)) : 0;
      this.chest.produce.stone = (this.chest.produce.stone || 0) + yieldStone;
      if (isOre) this.chest.produce.ore = (this.chest.produce.ore || 0) + yieldOre;
      this.addToInventory('stone', yieldStone);
      if (isOre) this.addToInventory('ore', yieldOre);
      node.respawn = 45; // 45s respawn
      this.addLovePoints(5);
      this.autoSave();
      return { destroyed: true, yield: yieldStone, oreYield: yieldOre, nodeType: node.type };
    }
    return { destroyed: false, hp: node.hp };
  }

  chopWood(tx, ty) {
    const list = this.currentLocation === 'woods' ? (this.woodsNodes || []) : this.resourceNodes;
    const node = list.find(n => n.hp > 0 && (n.type === 'log' || n.type === 'stump' || n.type === 'tree_chop' || n.type === 'woods_log' || n.type === 'woods_stump') && n.x === tx && n.y === ty);
    if (!node) return null;

    node.hp -= 1;
    if (node.hp <= 0) {
      const yieldWood = 2 + Math.floor(Math.random() * 2);
      this.chest.produce.wood = (this.chest.produce.wood || 0) + yieldWood;
      this.addToInventory('wood', yieldWood);
      node.respawn = 45;
      this.addLovePoints(5);
      this.autoSave();
      return { destroyed: true, yield: yieldWood, nodeType: node.type };
    }
    return { destroyed: false, hp: node.hp };
  }

  // --- INVENTORY & 5-SLOT HOTBAR SYSTEM ---
  addToInventory(itemId, count = 1) {
    if (!ITEM_CATALOG[itemId]) return;
    this.inventory[itemId] = (this.inventory[itemId] || 0) + count;
    // Auto equip if hotbar has an empty slot
    if (!this.hotbar.includes(itemId)) {
      const emptyIdx = this.hotbar.findIndex(s => !s);
      if (emptyIdx !== -1) {
        this.hotbar[emptyIdx] = itemId;
      }
    }
    this.autoSave();
  }

  removeFromInventory(itemId, count = 1) {
    if (!this.inventory[itemId]) return false;
    this.inventory[itemId] -= count;
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
      for (let i = 0; i < 5; i++) {
        if (this.hotbar[i] === itemId) this.hotbar[i] = null;
      }
    }
    this.autoSave();
    return true;
  }

  equipHotbarSlot(slotIdx, itemId) {
    if (slotIdx < 0 || slotIdx >= 5) return false;
    if (itemId && !this.inventory[itemId]) return false;
    this.hotbar[slotIdx] = itemId;
    this.autoSave();
    return true;
  }

  swapHotbarSlots(idxA, idxB) {
    if (idxA < 0 || idxA >= 5 || idxB < 0 || idxB >= 5) return false;
    const temp = this.hotbar[idxA];
    this.hotbar[idxA] = this.hotbar[idxB];
    this.hotbar[idxB] = temp;
    this.autoSave();
    return true;
  }

  eatFood(itemId) {
    const item = ITEM_CATALOG[itemId];
    if (!item || !item.heal || !this.inventory[itemId]) return null;
    this.inventory[itemId]--;
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
      for (let i = 0; i < 5; i++) {
        if (this.hotbar[i] === itemId) this.hotbar[i] = null;
      }
    }
    const healed = item.heal;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healed);
    this.autoSave();
    return { name: item.name, healed };
  }

  // --- CONSUME FOOD / CROPS TO HEAL HP (PERCENTAGE-BASED) ---
  eatCrop(cropId) {
    const def = CROP_DEFINITIONS[cropId] || ITEM_CATALOG[cropId];
    if (!def) return null;
    if (this.playerHp >= this.playerMaxHp) return { full: true };
    const hasInInv = (this.inventory[cropId] || 0) > 0;
    const hasInChest = (this.chest.produce[cropId] || 0) > 0;
    if (!hasInInv && !hasInChest) return null;

    if (hasInInv) {
      this.removeFromInventory(cropId, 1);
    } else {
      this.chest.produce[cropId]--;
    }

    // Specific percentage recovery per crop / food item:
    const percentMap = {
      carrot: 15,       // Wortel segar +15% HP
      cabbage: 20,      // Kubis renyah +20% HP
      strawberry: 20,   // Stroberi manis +20% HP
      potato: 25,       // Kentang rebus +25% HP
      corn: 25,         // Jagung manis +25% HP
      beetroot: 30,     // Bit merah +30% HP
      cauliflower: 30,  // Kembang kol +30% HP
      pumpkin: 35,      // Labu madu +35% HP
      radish: 20,       // Lobak segar +20% HP
      fish: 25,         // Ikan bakar segar +25% HP
      egg: 18,          // Telur ayam bergizi +18% HP
      milk: 30          // Susu sapi segar +30% HP
    };
    const percent = percentMap[cropId] || def.healPercent || 20;
    const healAmount = Math.max(1, Math.round(this.playerMaxHp * (percent / 100)));
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmount);
    this.autoSave();
    return { def, heal: healAmount, percent };
  }

  // --- MC HOUSE CUSTOM FURNITURE ARRANGEMENT ---
  placeFurnitureMC(furnId, tx, ty) {
    const def = FURNITURE_DEFINITIONS[furnId];
    if (!def) return false;
    if (tx < 1 || tx + def.w > this.houseMCWidth - 1 || ty < 3 || ty + def.h > this.houseMCHeight - 1) return false;
    if (tx <= 8 && tx + def.w > 8 && ty + def.h >= 11) return false;

    this.placedFurnitureMC.push({ id: furnId, x: tx, y: ty });
    this.autoSave();
    return true;
  }

  removeFurnitureMC(tx, ty) {
    const fIdx = this.placedFurnitureMC.findIndex(f => {
      const def = FURNITURE_DEFINITIONS[f.id] || { w: 1, h: 1 };
      return tx >= f.x && tx < f.x + def.w && ty >= f.y && ty < f.y + def.h;
    });

    if (fIdx !== -1) {
      const f = this.placedFurnitureMC[fIdx];
      this.placedFurnitureMC.splice(fIdx, 1);
      this.ownedFurniture.push(f.id);
      this.autoSave();
      return true;
    }
    return false;
  }

  // --- FARMING ACTIONS WITH REALISTIC TIMED GROWTH ---
  tillSoil(x, y) {
    if (this.currentLocation !== 'farm') return false;
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const tile = this.grid[y][x];
    if (tile.collidable || tile.type === 'path' || tile.type === 'water' || tile.type === 'building' || tile.type === 'fence' || tile.tilled) return false;
    tile.type = 'farmland';
    tile.tilled = true;
    this.autoSave();
    return true;
  }

  waterSoil(x, y) {
    if (this.currentLocation !== 'farm') return false;
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const tile = this.grid[y][x];
    if (!tile.tilled || tile.watered) return false;
    tile.watered = true;
    tile.waterTimer = 180; // 180s watering dampness
    this.autoSave();
    return true;
  }

  plantCrop(x, y, cropId) {
    if (this.currentLocation !== 'farm') return false;
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const tile = this.grid[y][x];
    if (tile.tilled && !tile.crop) {
      tile.crop = {
        id: cropId,
        stage: 0,       // 0 to 5 stages
        progress: 0,    // 0 to 100%
        growTimer: 0,
        ready: false
      };
      this.autoSave();
      return true;
    }
    return false;
  }

  harvestCrop(x, y) {
    if (this.currentLocation !== 'farm') return null;
    const tile = this.grid[y][x];
    if (tile.crop && tile.crop.ready) {
      const cropId = tile.crop.id;
      const def = CROP_DEFINITIONS[cropId];
      tile.crop = null;
      if (def) {
        this.chest.produce[cropId] = (this.chest.produce[cropId] || 0) + 1;
        this.addToInventory(cropId, 1);
        this.addLovePoints(def.loveReward);
        this.autoSave();
      }
      return def;
    }
    return null;
  }

  sellAllProduce() {
    let totalEarnings = 0;
    for (const [prodId, count] of Object.entries(this.chest.produce)) {
      if (count > 0) {
        const def = CROP_DEFINITIONS[prodId];
        let price = def ? def.sellPrice : 0;
        if (prodId === 'wood') price = 5;
        if (prodId === 'stone') price = 4;
        if (prodId === 'ore') price = 18;
        if (prodId === 'fish') price = 22;
        if (prodId === 'milk') price = 26;
        if (prodId === 'egg') price = 14;
        if (prodId === 'wool') price = 22;
        if (prodId === 'monster_gel') price = 18;

        totalEarnings += count * price;
        this.chest.produce[prodId] = 0;
      }
    }

    // Clear sold produce from bag inventory as well
    const pKeys = ['carrot', 'cabbage', 'potato', 'beetroot', 'cauliflower', 'pumpkin', 'radish', 'wheat', 'fish', 'milk', 'egg', 'wool', 'wood', 'stone', 'ore', 'monster_gel'];
    pKeys.forEach(pk => {
      if (this.inventory[pk]) {
        delete this.inventory[pk];
        for (let i = 0; i < 5; i++) {
          if (this.hotbar[i] === pk) this.hotbar[i] = null;
        }
      }
    });

    this.coins += totalEarnings;
    if (totalEarnings > 0) {
      this.addLovePoints(Math.floor(totalEarnings / 5));
      this.autoSave();
    }
    return totalEarnings;
  }

  // --- SHOPPING & ECONOMY ---
  buySeed(cropId) {
    const def = CROP_DEFINITIONS[cropId];
    if (def && this.coins >= def.seedPrice) {
      this.coins -= def.seedPrice;
      this.chest.seeds[cropId] = (this.chest.seeds[cropId] || 0) + 1;
      this.addToInventory(`seed_${cropId}`, 1);
      this.addLovePoints(1);
      this.autoSave();
      return true;
    }
    return false;
  }

  buyTool(toolId, price) {
    if (this.coins >= price && !this.unlockedTools[toolId]) {
      this.coins -= price;
      this.unlockedTools[toolId] = true;
      this.addToInventory(toolId, 1);
      this.addLovePoints(15);
      this.autoSave();
      return true;
    }
    return false;
  }

  buyAnimal(animalType, name, price) {
    if (this.coins >= price) {
      this.coins -= price;
      // Strictly bounded inside Mak Siti pasture enclosure (x: 2..12, y: 3..8)
      const bounds = { minX: 3.5, maxX: 10.5, minY: 4.2, maxY: 7.2 };
      const rx = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const ry = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      this.ownedAnimals.push({
        id: `${animalType}_${Date.now()}`,
        name,
        type: animalType,
        x: rx,
        y: ry,
        produceTimer: 45 // 45s cooldown
      });
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

  // --- UPDATE LOOP WITH REALISTIC TIMERS (NOT INSTANT!) ---
  update(delta, playerPxX, playerPxY) {
    this.timeMinutes += delta * this.timeSpeed;
    if (this.timeMinutes >= 1440) {
      this.timeMinutes -= 1440;
      this.dayCount++;
    }

    // Realistic Timed Crop Growth
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.grid[y][x];

        // Watering timer countdown
        if (tile.watered) {
          tile.waterTimer -= delta;
          if (tile.waterTimer <= 0) tile.watered = false;
        }

        // Crop growth progresses based on water and defined growTime
        if (tile.crop && !tile.crop.ready) {
          const def = CROP_DEFINITIONS[tile.crop.id];
          if (def) {
            // Must be watered to grow fast, otherwise progresses very slowly
            const growthRate = tile.watered ? 2.0 : 0.4;
            tile.crop.growTimer += delta * growthRate;
            tile.crop.progress = Math.min(100, (tile.crop.growTimer / def.growTime) * 100);

            // 6 Stages (0, 1, 2, 3, 4, 5)
            tile.crop.stage = Math.min(5, Math.floor((tile.crop.progress / 100) * 6));

            if (tile.crop.progress >= 100) {
              tile.crop.progress = 100;
              tile.crop.stage = 5;
              tile.crop.ready = true;
            }
          }
        }
      }
    }

    // Animal Production Timers
    this.ownedAnimals.forEach(a => {
      if (a.produceTimer > 0) {
        a.produceTimer -= delta;
        if (a.produceTimer <= 0) {
          // Ready to produce!
          if (a.type === 'chicken') this.chest.produce.egg = (this.chest.produce.egg || 0) + 1;
          else if (a.type === 'cow') this.chest.produce.milk = (this.chest.produce.milk || 0) + 1;
          else if (a.type === 'sheep') this.chest.produce.wool = (this.chest.produce.wool || 0) + 1;
          a.produceTimer = 50 + Math.random() * 20; // reset cooldown
        }
      }
    });

    // Resource Nodes Respawn Timer
    this.resourceNodes.forEach(node => {
      if (node.respawn > 0) {
        node.respawn -= delta;
        if (node.respawn <= 0) {
          node.hp = node.maxHp;
        }
      }
    });

    // Active NPC Wandering
    if (this.currentLocation === 'farm') {
      this.updateNPCs(delta, playerPxX, playerPxY);
    }

    // Monster AGGRO & Combat in Mystic Woods
    if (this.currentLocation === 'woods') {
      return this.updateMonstersAggro(delta, playerPxX, playerPxY);
    }
    return null;
  }

  // --- ACTIVE NPC WANDER AI ---
  updateNPCs(delta, px, py) {
    this.npcs.forEach(npc => {
      const distToPlayer = Math.hypot(npc.x + 8 - px, npc.y + 8 - py);

      if (distToPlayer < 36) {
        npc.isMoving = false;
        const dx = px - (npc.x + 8);
        const dy = py - (npc.y + 8);
        if (Math.abs(dx) > Math.abs(dy)) npc.dir = dx > 0 ? 'right' : 'left';
        else npc.dir = dy > 0 ? 'down' : 'up';
        return;
      }

      npc.timer -= delta;
      if (npc.timer <= 0) {
        npc.timer = 2.5 + Math.random() * 3.5;
        if (Math.random() < 0.45) {
          npc.isMoving = true;
          if (npc.role === 'fisher') {
            // Paman Sam stays strictly on wooden pier walkway deck (x: 37*16 to 40*16, row y: 19*16)
            npc.targetX = (37 + Math.random() * 3) * 16;
            npc.targetY = 19 * 16;
          } else {
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 20;
            const candX = npc.originX + Math.cos(angle) * radius;
            const candY = npc.originY + Math.sin(angle) * radius;
            const tx = Math.floor((candX + 8) / 16);
            const ty = Math.floor((candY + 8) / 16);
            if (!this.isCollidable(tx, ty, 'farm')) {
              npc.targetX = candX;
              npc.targetY = candY;
            } else {
              npc.isMoving = false;
            }
          }
        } else {
          npc.isMoving = false;
        }
      }

      if (npc.isMoving) {
        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 2) {
          const step = 18 * delta;
          const nx = npc.x + (dx / dist) * step;
          const ny = npc.y + (dy / dist) * step;

          if (npc.role === 'fisher') {
            npc.x = Math.max(36.5 * 16, Math.min(40.5 * 16, nx));
            npc.y = 19 * 16;
            npc.anim = (npc.anim + delta * 5) % 6;
            npc.dir = dx > 0 ? 'right' : 'left';
          } else {
            const nextTx = Math.floor((nx + 8) / 16);
            const nextTy = Math.floor((ny + 8) / 16);
            if (!this.isCollidable(nextTx, nextTy, 'farm')) {
              npc.x = nx;
              npc.y = ny;
              npc.anim = (npc.anim + delta * 5) % 6;
              if (Math.abs(dx) > Math.abs(dy)) npc.dir = dx > 0 ? 'right' : 'left';
              else npc.dir = dy > 0 ? 'down' : 'up';
            } else {
              npc.isMoving = false;
              npc.anim = 0;
            }
          }
        } else {
          npc.isMoving = false;
          npc.anim = 0;
        }
      }
    });
  }

  // --- MONSTER AGGRO & ATTACK SYSTEM ---
  updateMonstersAggro(delta, px, py) {
    let playerHitDamage = 0;
    this.monsters.forEach(m => {
      m.anim = (m.anim + delta * 6) % 4;
      const dist = Math.hypot(m.x + 16 - px, m.y + 16 - py);

      if (dist < 75) {
        m.aggro = true;
        const dx = px - (m.x + 16);
        const dy = py - (m.y + 16);
        m.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

        const step = m.speed * delta;
        const nx = m.x + (dx / dist) * step;
        const ny = m.y + (dy / dist) * step;
        const tx = Math.floor(nx / 16);
        const ty = Math.floor(ny / 16);

        if (!this.isCollidable(tx, ty, 'woods')) {
          m.x = nx;
          m.y = ny;
        }

        if (dist < 22) {
          if (!m.atkCooldown || m.atkCooldown <= 0) {
            m.atkCooldown = 1.4;
            playerHitDamage += m.atk;
          }
        }
      } else {
        m.aggro = false;
        if (!m.timer || m.timer <= 0) {
          m.timer = 2 + Math.random() * 2.5;
          m.vx = (Math.random() - 0.5) * 16;
          m.vy = (Math.random() - 0.5) * 16;
          m.dir = Math.abs(m.vx) > Math.abs(m.vy) ? (m.vx > 0 ? 'right' : 'left') : (m.vy > 0 ? 'down' : 'up');
        } else {
          m.timer -= delta;
          const nx = m.x + m.vx * delta;
          const ny = m.y + m.vy * delta;
          const tx = Math.floor(nx / 16);
          const ty = Math.floor(ny / 16);
          if (!this.isCollidable(tx, ty, 'woods')) { m.x = nx; m.y = ny; }
          else { m.timer = 0; }
        }
      }

      if (m.atkCooldown > 0) m.atkCooldown -= delta;
    });

    return playerHitDamage > 0 ? playerHitDamage : null;
  }

  attackMonster(playerX, playerY, damage = 25) {
    for (let i = 0; i < this.monsters.length; i++) {
      const m = this.monsters[i];
      const dist = Math.hypot(m.x + 16 - playerX, m.y + 16 - playerY);
      if (dist < 34) {
        m.hp -= damage;
        const pushDirX = m.x + 16 - playerX;
        const pushDirY = m.y + 16 - playerY;
        const pLen = Math.hypot(pushDirX, pushDirY) || 1;
        m.x += (pushDirX / pLen) * 16;
        m.y += (pushDirY / pLen) * 16;

        if (m.hp <= 0) {
          const earned = m.reward || 20;
          this.coins += earned;
          this.chest.produce.monster_gel = (this.chest.produce.monster_gel || 0) + 1;
          this.addToInventory('monster_gel', 1);
          this.addLovePoints(15);

          const deadM = { ...m };
          m.hp = m.maxHp;
          m.x = (6 + Math.random() * 26) * 16;
          m.y = (6 + Math.random() * 20) * 16;
          this.autoSave();
          return { hit: true, defeated: true, earned, monster: deadM };
        }
        return { hit: true, defeated: false, monster: m };
      }
    }
    return null;
  }

  // --- COMPANION PET COMBAT ASSISTANCE IN MYSTIC WOODS ---
  petAttackWoods(delta, petX, petY) {
    if (this.currentLocation !== 'woods' || !this.activePet) return null;
    this.petAtkCooldown = (this.petAtkCooldown || 0) - delta;
    if (this.petAtkCooldown > 0) return null;

    let target = null;
    let minDist = 75; // pet engagement range
    this.monsters.forEach(m => {
      if (m.hp > 0) {
        const d = Math.hypot(m.x + 16 - petX, m.y + 16 - petY);
        if (d < minDist) {
          minDist = d;
          target = m;
        }
      }
    });

    if (target) {
      const petDmg = 12;
      target.hp -= petDmg;
      this.petAtkCooldown = 1.1;

      // Knockback monster
      const pushX = (target.x + 16) - petX;
      const pushY = (target.y + 16) - petY;
      const len = Math.hypot(pushX, pushY) || 1;
      target.x += (pushX / len) * 12;
      target.y += (pushY / len) * 12;

      let defeated = false;
      let earned = 0;
      if (target.hp <= 0) {
        defeated = true;
        earned = target.reward || 20;
        this.coins += earned;
        this.chest.produce.monster_gel = (this.chest.produce.monster_gel || 0) + 1;
        this.addToInventory('monster_gel', 1);
        this.addLovePoints(15);
        target.hp = target.maxHp;
        target.x = (6 + Math.random() * 26) * 16;
        target.y = (6 + Math.random() * 20) * 16;
        this.autoSave();
      }

      return {
        monster: target,
        damage: petDmg,
        defeated,
        earned
      };
    }
    return null;
  }

  // --- DAY & NIGHT CYCLE ---
  getTimeOfDay() {
    const hours = this.timeMinutes / 60;
    let phase = 'day';
    let label = 'Siang Cerah ☀️';
    let ambient = 'rgba(255, 255, 255, 0)';

    if (hours >= 4.5 && hours < 6.5) {
      phase = 'sunrise';
      label = 'Pagi Fajar 🌅';
      const progress = (hours - 4.5) / 2.0;
      const alpha = 0.35 * (1 - progress);
      ambient = `rgba(255, 170, 90, ${alpha.toFixed(2)})`;
    } else if (hours >= 6.5 && hours < 16.5) {
      phase = 'day';
      label = 'Siang Cerah ☀️';
      ambient = 'rgba(255, 255, 255, 0)';
    } else if (hours >= 16.5 && hours < 19.0) {
      phase = 'sunset';
      label = 'Senja Romantis 🌇';
      const progress = (hours - 16.5) / 2.5;
      const alpha = 0.08 + 0.24 * progress;
      ambient = `rgba(255, 120, 60, ${alpha.toFixed(2)})`;
    } else {
      phase = 'night';
      label = 'Malam Berbintang 🌙';
      ambient = 'rgba(18, 30, 75, 0.36)';
    }

    return { phase, ambient, label };
  }

  sleepTogether() {
    this.timeMinutes = 420; // 07:00 AM
    this.dayCount++;
    this.playerHp = this.playerMaxHp;
    this.addLovePoints(40);
    this.autoSave();
  }

  // --- SAVE & RESTORE ---
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
      version: 7,
      coins: this.coins,
      lovePoints: this.lovePoints,
      loveLevel: this.loveLevel,
      playerHp: this.playerHp,
      dayCount: this.dayCount,
      timeMinutes: Math.round(this.timeMinutes),
      unlockedTools: this.unlockedTools,
      unlockedBots: this.unlockedBots,
      ownedAnimals: this.ownedAnimals,
      activePet: this.activePet,
      ownedFurniture: this.ownedFurniture,
      placedFurnitureMC: this.placedFurnitureMC,
      chest: this.chest,
      hotbar: this.hotbar,
      inventory: this.inventory,
      tiles: compressedTiles
    };
  }

  applySnapshot(data) {
    if (!data) return;
    if (data.coins !== undefined) this.coins = data.coins;
    if (data.lovePoints !== undefined) this.lovePoints = data.lovePoints;
    if (data.loveLevel !== undefined) this.loveLevel = data.loveLevel;
    if (data.playerHp !== undefined) this.playerHp = data.playerHp;
    if (data.dayCount !== undefined) this.dayCount = data.dayCount;
    if (data.timeMinutes !== undefined) this.timeMinutes = data.timeMinutes;
    if (data.unlockedTools) this.unlockedTools = { ...this.unlockedTools, ...data.unlockedTools };
    if (data.unlockedBots) this.unlockedBots = data.unlockedBots;
    if (data.ownedAnimals) this.ownedAnimals = data.ownedAnimals;
    if (data.activePet !== undefined) this.activePet = data.activePet;
    if (data.ownedFurniture) this.ownedFurniture = data.ownedFurniture;
    if (data.placedFurnitureMC) this.placedFurnitureMC = data.placedFurnitureMC;
    if (data.chest) this.chest = data.chest;

    if (data.hotbar && Array.isArray(data.hotbar) && data.hotbar.length === 5) {
      this.hotbar = data.hotbar;
    } else if (!this.hotbar || this.hotbar.length !== 5) {
      this.hotbar = ['hoe', 'water', 'axe', 'pickaxe', 'seed_carrot'];
    }

    if (data.inventory && typeof data.inventory === 'object') {
      this.inventory = { ...this.inventory, ...data.inventory };
    }

    // Ensure baseline starter tools exist in inventory
    ['hoe', 'water', 'axe', 'pickaxe', 'flower'].forEach(t => {
      if (!this.inventory[t]) this.inventory[t] = 1;
    });

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
      localStorage.setItem('kebun_cinta_save_v7', JSON.stringify(this.getSnapshot()));
    } catch (e) {
      console.warn('Save error:', e);
    }
  }

  loadFromStorage() {
    try {
      const str = localStorage.getItem('kebun_cinta_save_v7') || localStorage.getItem('kebun_cinta_save_v6') || localStorage.getItem('kebun_cinta_save_v5');
      if (str) {
        const data = JSON.parse(str);
        if (!data.version || data.version < 7) {
          data.placedFurnitureMC = [{ id: 'rug', x: 7, y: 6 }];
        }
        this.applySnapshot(data);

        // Sanitize legacy grid so central path is always open
        if (this.grid[12] && this.grid[12][24]) {
          this.grid[12][24].type = 'path';
          this.grid[12][24].collidable = false;
        }
        if (this.grid[12] && this.grid[12][13]) {
          this.grid[12][13].type = 'well';
          this.grid[12][13].collidable = true;
        }
        this.autoSave();
      }
    } catch (e) {
      console.warn('Load error:', e);
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
window.ITEM_CATALOG = ITEM_CATALOG;
