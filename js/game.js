// js/game.js - Complete Multi-Location World, Real Pixel Art Furniture, Combat, and Pet System

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Subsystems
    this.farm = new FarmManager(48, 32, 16);
    this.botManager = new BotManager(this.farm);
    this.animalManager = new AnimalManager(this.farm);
    this.network = new NetworkManager(this);

    // Player Data
    this.player = {
      name: 'Zahy',
      role: 'boy',
      x: 23 * 16,
      y: 9 * 16,
      speed: 75,
      dir: 'down',
      isMoving: false,
      animFrame: 0,
      animTimer: 0,
      currentAction: 'idle',
      actionTimer: 0,
      selectedTool: 'hoe',
      emote: null,
      emoteTimer: 0,
      isFishing: false,
      fishingTimer: 0,
      fishingBite: false,
      slashTimer: 0
    };

    // Pet Companion State (Follower)
    this.pet = {
      x: 22 * 16,
      y: 9 * 16,
      dir: 'down',
      anim: 0,
      isMoving: false
    };

    // Partner Player (Mabar)
    this.partner = {
      name: 'Aurel',
      role: 'girl',
      x: 24 * 16,
      y: 9 * 16,
      dir: 'down',
      isMoving: false,
      animFrame: 0,
      currentAction: 'idle',
      emote: null,
      emoteTimer: 0,
      active: false,
      location: 'farm',
      pet: null
    };

    this.camera = { x: 0, y: 0, scale: 3 };
    this.keys = {};
    this.touchJoystick = { active: false, dx: 0, dy: 0 };

    // Furniture placement mode in MC House
    this.furnitureEditMode = false;
    this.selectedFurnToPlace = null;

    // Fireflies & Combat Floating Numbers
    this.fireflies = [];
    for (let i = 0; i < 24; i++) {
      this.fireflies.push({
        x: Math.random() * (this.farm.cols * 16),
        y: Math.random() * (this.farm.rows * 16),
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        alpha: Math.random(),
        da: 0.02
      });
    }

    this.activePrompt = null;
    this.notifications = [];
    this.sparkles = [];
    this.floatingTexts = []; // [{ x, y, text, color, life }]

    this.assets = {};
    this.assetsLoaded = false;
    this.lastTime = performance.now();
  }

  loadAssets(callback) {
    const toLoad = {
      player_boy: 'assets/characters/player_boy.png',
      player_girl: 'assets/characters/player_girl.png',
      portrait_boy: 'assets/characters/portrait_boy.png',
      portrait_girl: 'assets/characters/portrait_girl.png',
      // NPCs
      npc_merchant: 'assets/npcs/npc_merchant.png',
      npc_rancher: 'assets/npcs/npc_rancher.png',
      npc_fisher: 'assets/npcs/npc_fisher.png',
      // Bots
      bot_boni: 'assets/bots/bot_boni.png',
      bot_slime: 'assets/bots/bot_slime.png',
      // Animals & Pets
      cow: 'assets/animals/cow.png',
      chicken: 'assets/animals/chicken.png',
      pig: 'assets/animals/pig.png',
      sheep: 'assets/animals/sheep.png',
      baby_chick: 'assets/animals/baby_chick.png',
      pet_chick: 'assets/pets/pet_chick.png',
      pet_piggy: 'assets/pets/pet_piggy.png',
      pet_bunny: 'assets/pets/pet_bunny.png',
      // Monsters
      slime_monster: 'assets/monsters/slime_monster.png',
      skeleton_monster: 'assets/monsters/skeleton_monster.png',
      // Crops & Items
      plants: 'assets/crops/plants.png',
      items: 'assets/crops/items.png',
      // Tiles
      grass: 'assets/tiles/grass.png',
      farmland: 'assets/tiles/farmland.png',
      path: 'assets/tiles/path.png',
      water: 'assets/tiles/water.png',
      house: 'assets/tiles/house.png',
      tree: 'assets/tiles/tree.png',
      fences: 'assets/tiles/fences.png',
      bridge: 'assets/tiles/bridge.png',
      chest: 'assets/tiles/chest.png',
      interior_tiles: 'assets/tiles/interior_tiles.png',
      mystic_grass: 'assets/tiles/mystic_grass.png',
      // Real Pixel Art Furniture
      bed_double: 'assets/furniture/bed_double.png',
      dining_table: 'assets/furniture/dining_table.png',
      fireplace: 'assets/furniture/fireplace.png',
      sofa: 'assets/furniture/sofa.png',
      bookshelf: 'assets/furniture/bookshelf.png',
      cabinet: 'assets/furniture/cabinet.png',
      plant: 'assets/furniture/plant.png',
      rug: 'assets/furniture/rug.png'
    };

    let loadedCount = 0;
    const total = Object.keys(toLoad).length;

    for (const [key, src] of Object.entries(toLoad)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.assets[key] = img;
        loadedCount++;
        if (loadedCount >= total && callback) callback();
      };
      img.onerror = () => {
        console.warn('Gagal memuat:', src);
        loadedCount++;
        if (loadedCount >= total && callback) callback();
      };
    }
  }

  init() {
    this.setupResize();
    this.setupKeyboard();
    this.setupTouchControls();
    this.setupCanvasClicks();
    this.setupHUDButtons();

    requestAnimationFrame((t) => this.loop(t));
  }

  setupResize() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx.imageSmoothingEnabled = false;

      if (window.innerWidth < 600) this.camera.scale = 2.4;
      else if (window.innerWidth < 1200) this.camera.scale = 3.0;
      else this.camera.scale = 3.4;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      this.keys[e.key.toLowerCase()] = true;

      if (e.key === '1') this.selectTool('hoe');
      if (e.key === '2') this.selectTool('water');
      if (e.key === '3') this.selectTool('seed_carrot');
      if (e.key === '4') this.selectTool('seed_strawberry');
      if (e.key === '5') this.selectTool('fishing_rod');
      if (e.key === '6') this.selectTool('sword_iron');
      if (e.key === '7') this.selectTool('flower');

      if (e.key === ' ' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        this.performToolAction();
      }

      if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'k') {
        this.performInteractAction();
      }

      if (e.key.toLowerCase() === 'h') {
        this.triggerCoupleKiss(false);
      }

      if (e.key.toLowerCase() === 'c') {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) chatInput.focus();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  setupCanvasClicks() {
    const handleClick = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (clientX - rect.left) / this.camera.scale + this.camera.x;
      const clickY = (clientY - rect.top) / this.camera.scale + this.camera.y;

      const tx = Math.floor(clickX / 16);
      const ty = Math.floor(clickY / 16);

      // Furniture edit mode in MC House
      if (this.furnitureEditMode && this.farm.currentLocation === 'house_mc') {
        if (this.selectedFurnToPlace) {
          const ok = this.farm.placeFurnitureMC(this.selectedFurnToPlace, tx, ty);
          if (ok) {
            this.showNotification('Perabotan berhasil diletakkan! 🪑✨');
            this.selectedFurnToPlace = null;
            this.updateFurnitureUI();
          }
        } else {
          // Pickup furniture
          const picked = this.farm.pickupFurnitureMC(tx, ty);
          if (picked) {
            this.showNotification('Perabotan diambil kembali ke tas! 📦');
            this.updateFurnitureUI();
          }
        }
        return;
      }

      // Check click on NPC
      if (this.farm.currentLocation === 'farm') {
        const npc = this.farm.npcs.find(n => Math.hypot(n.x - tx, n.y - ty) <= 2.0);
        if (npc) {
          this.openNPCDialog(npc);
          return;
        }
      }

      this.performActionOnTile(tx, ty);
    };

    this.canvas.addEventListener('click', (e) => handleClick(e.clientX, e.clientY));
  }

  setupTouchControls() {
    const joyBase = document.getElementById('joystickBase');
    const joyStick = document.getElementById('joystickStick');
    if (!joyBase || !joyStick) return;

    let touchId = null;
    let center = { x: 0, y: 0 };
    const maxRadius = 40;

    joyBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const baseRect = joyBase.getBoundingClientRect();
      center = { x: baseRect.left + baseRect.width / 2, y: baseRect.top + baseRect.height / 2 };
      this.touchJoystick.active = true;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.touchJoystick.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          e.preventDefault();
          const dx = touch.clientX - center.x;
          const dy = touch.clientY - center.y;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const clamped = Math.min(dist, maxRadius);
          joyStick.style.transform = `translate(${Math.cos(angle) * clamped}px, ${Math.sin(angle) * clamped}px)`;

          if (dist > 8) {
            this.touchJoystick.dx = dx / dist;
            this.touchJoystick.dy = dy / dist;
          } else {
            this.touchJoystick.dx = 0;
            this.touchJoystick.dy = 0;
          }
          break;
        }
      }
    }, { passive: false });

    const endTouch = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          this.touchJoystick.active = false;
          this.touchJoystick.dx = 0;
          this.touchJoystick.dy = 0;
          joyStick.style.transform = 'translate(0px, 0px)';
          touchId = null;
          break;
        }
      }
    };
    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);

    document.getElementById('btnAction')?.addEventListener('touchstart', (e) => { e.preventDefault(); this.performToolAction(); });
    document.getElementById('btnInteract')?.addEventListener('touchstart', (e) => { e.preventDefault(); this.performInteractAction(); });
    document.getElementById('btnEmote')?.addEventListener('touchstart', (e) => { e.preventDefault(); this.showEmote('❤️'); });
    document.getElementById('btnToolCycle')?.addEventListener('touchstart', (e) => { e.preventDefault(); this.cycleNextTool(); });
  }

  selectTool(toolId) {
    if (toolId === 'fishing_rod' && !this.farm.unlockedTools.fishing_rod) {
      this.showNotification('Alat pancing belum dibeli! Beli di Paman Sam (Dermaga) 🎣');
      return;
    }
    if ((toolId === 'sword_iron' || toolId === 'sword_gold') && !this.farm.unlockedTools[toolId]) {
      this.showNotification('Pedang belum dibeli! Beli di Toko Senjata Borin ⚔️');
      return;
    }
    this.player.selectedTool = toolId;
    document.querySelectorAll('.hotbar-slot').forEach(slot => {
      slot.classList.toggle('active', slot.dataset.tool === toolId);
    });
  }

  cycleNextTool() {
    const tools = ['hoe', 'water', 'seed_carrot', 'seed_strawberry', 'fishing_rod', 'sword_iron', 'flower'];
    const idx = tools.indexOf(this.player.selectedTool);
    this.selectTool(tools[(idx + 1) % tools.length]);
  }

  getTargetTileCoords() {
    let tx = Math.floor((this.player.x + 16) / 16);
    let ty = Math.floor((this.player.y + 24) / 16);
    if (this.player.dir === 'down') ty += 1;
    else if (this.player.dir === 'up') ty -= 1;
    else if (this.player.dir === 'right') tx += 1;
    else if (this.player.dir === 'left') tx -= 1;
    return { tx, ty };
  }

  // --- Dynamic Contextual Action Prompt ---
  updateActivePrompt() {
    const { tx, ty } = this.getTargetTileCoords();
    const px = this.player.x + 16;
    const py = this.player.y + 20;
    const loc = this.farm.currentLocation;

    // Inside Buildings
    if (loc === 'house_mc') {
      if (Math.hypot(px - (this.farm.doorMCHouse.x * 16 + 8), py - (this.farm.doorMCHouse.y * 16 + 8)) < 24) {
        this.activePrompt = { text: 'Keluar ke Desa [E] 🚪', action: () => this.teleport('farm', 23, 9) };
        return;
      }
      // Check if near placed bed
      const hasBed = this.farm.placedFurnitureMC.some(f => f.id === 'bed_double' && Math.hypot(px - (f.x * 16 + 16), py - (f.y * 16 + 16)) < 32);
      if (hasBed) {
        this.activePrompt = { text: 'Tidur di Ranjang [E] 🛏️', action: () => this.sleepInBed() };
        return;
      }
      this.activePrompt = { text: 'Atur Perabotan [E] 🪑', action: () => this.toggleFurnitureEdit() };
      return;
    }

    if (loc === 'house_budi' || loc === 'house_siti' || loc === 'house_blacksmith') {
      const room = loc === 'house_budi' ? this.farm.houseBudi : (loc === 'house_siti' ? this.farm.houseSiti : this.farm.houseBlacksmith);
      if (Math.hypot(px - (room.door.x * 16 + 8), py - (room.door.y * 16 + 8)) < 24) {
        const exitDoor = loc === 'house_budi' ? { x: 8, y: 25 } : (loc === 'house_siti' ? { x: 17, y: 25 } : { x: 26, y: 25 });
        this.activePrompt = { text: 'Keluar ke Desa [E] 🚪', action: () => this.teleport('farm', exitDoor.x, exitDoor.y) };
        return;
      }
      const npcRole = loc === 'house_budi' ? 'merchant' : (loc === 'house_siti' ? 'rancher' : 'blacksmith');
      const npc = this.farm.npcs.find(n => n.role === npcRole);
      if (npc) {
        this.activePrompt = { text: `Bicara dengan ${npc.name.split(' ')[0]} [E] 💬`, action: () => this.openNPCDialog(npc) };
        return;
      }
    }

    // In Mystic Woods
    if (loc === 'woods') {
      if (Math.hypot(px - (1 * 16 + 8), py - (15 * 16 + 8)) < 24) {
        this.activePrompt = { text: 'Kembali ke Desa Damai [E] 🏡', action: () => this.teleport('farm', 44, 2) };
        return;
      }
      // Check nearest monster to attack
      const nearMonster = this.farm.monsters.find(m => Math.hypot(m.x - px, m.y - py) < 36);
      if (nearMonster) {
        this.activePrompt = { text: `Tebas ${nearMonster.type.toUpperCase()} [Spasi] ⚔️`, action: () => this.performToolAction() };
        return;
      }
      this.activePrompt = null;
      return;
    }

    // Outdoor Farm / Village
    // 1. Gate to Mystic Woods (44..46, 1)
    if (Math.hypot(px - (45 * 16 + 8), py - (1 * 16 + 8)) < 26) {
      this.activePrompt = { text: 'Masuk Hutan Misterius (Monster) [E] 🌲⚔️', action: () => this.teleport('woods', 3, 15) };
      return;
    }

    // 2. Door to MC House (23, 8)
    if (Math.hypot(px - (23 * 16 + 8), py - (8 * 16 + 8)) < 24) {
      this.activePrompt = { text: 'Masuk Rumah Utama [E] 🏡', action: () => this.teleport('house_mc', 8, 10) };
      return;
    }

    // 3. Doors to NPC Buildings
    if (Math.hypot(px - (8 * 16 + 8), py - (24 * 16 + 8)) < 22) {
      this.activePrompt = { text: 'Masuk Toko Pak Budi [E] 🛒', action: () => this.teleport('house_budi', 7, 8) };
      return;
    }
    if (Math.hypot(px - (17 * 16 + 8), py - (24 * 16 + 8)) < 22) {
      this.activePrompt = { text: 'Masuk Peternakan Mak Siti [E] 🐮', action: () => this.teleport('house_siti', 7, 8) };
      return;
    }
    if (Math.hypot(px - (26 * 16 + 8), py - (24 * 16 + 8)) < 22) {
      this.activePrompt = { text: 'Masuk Toko Senjata Borin [E] ⚔️', action: () => this.teleport('house_blacksmith', 7, 8) };
      return;
    }

    // 4. NPCs in village
    const npc = this.farm.npcs.find(n => Math.hypot(n.x * 16 + 8 - px, n.y * 16 + 8 - py) < 32);
    if (npc) {
      this.activePrompt = { text: `Bicara dengan ${npc.name.split(' ')[0]} [E] 💬`, action: () => this.openNPCDialog(npc) };
      return;
    }

    // 5. Chest & Sell Bin
    const targetTile = this.farm.grid[ty] && this.farm.grid[ty][tx];
    if (targetTile && targetTile.type === 'chest') {
      this.activePrompt = { text: 'Buka Peti Bersama [E] 📦', action: () => this.openChestModal() };
      return;
    }
    if (targetTile && targetTile.type === 'sell_bin') {
      this.activePrompt = { text: 'Jual Semua Hasil Panen [E] 🪙', action: () => this.sellProduce() };
      return;
    }

    // 6. Fishing spot
    if (this.player.selectedTool === 'fishing_rod' && targetTile && targetTile.type === 'water') {
      this.activePrompt = { text: 'Mulai Memancing [E] 🎣', action: () => this.startFishing() };
      return;
    }

    // 7. Animal petting
    const animal = this.animalManager.getNearestAnimal(px, py, 32);
    if (animal) {
      this.activePrompt = { text: `Elus ${animal.name} [E] ❤️`, action: () => animal.pet() };
      return;
    }

    // 8. Ripe crop harvest
    if (targetTile && targetTile.crop && targetTile.crop.ready) {
      this.activePrompt = { text: 'Petik Panen [E] 🧺', action: () => this.harvestTile(tx, ty) };
      return;
    }

    // 9. Farmland watering
    if (targetTile && targetTile.type === 'farmland' && !targetTile.watered) {
      this.activePrompt = { text: 'Siram Tanah [Spasi] 💧', action: () => this.waterTile(tx, ty) };
      return;
    }

    this.activePrompt = null;
  }

  teleport(loc, tx, ty) {
    this.farm.currentLocation = loc;
    this.player.x = tx * 16;
    this.player.y = ty * 16;
    this.network.send({ type: 'location_change', location: loc });
    if (loc === 'woods') {
      this.showNotification('Memasuki Hutan Misterius! Waspada terhadap monster! 🌲⚔️');
    } else if (loc === 'farm') {
      this.showNotification('Kembali ke Desa Kebun Cinta yang damai! 🌾☀️');
    }
    this.updateHUD();
  }

  sleepInBed() {
    this.farm.sleepTogether();
    this.showNotification('Kalian berdua tidur nyenyak di ranjang hangat... Selamat pagi! ☀️🛏️');
    this.network.send({ type: 'action_sleep' });
    this.updateHUD();
  }

  toggleFurnitureEdit() {
    document.getElementById('modalFurniturePlacement')?.classList.toggle('hidden');
    this.updateFurnitureUI();
  }

  updateFurnitureUI() {
    const list = document.getElementById('ownedFurnitureList');
    if (!list) return;
    if (this.farm.ownedFurniture.length === 0) {
      list.innerHTML = '<p style="font-size:12px; color:#747d8c;">Kamu belum punya perabotan di tas. Beli di Toko Pak Budi ya! 🛒</p>';
      return;
    }
    list.innerHTML = this.farm.ownedFurniture.map(id => {
      const def = FURNITURE_DEFINITIONS[id];
      return `<button class="btn btn-outline" style="font-size:12px;" onclick="game.selectedFurnToPlace='${id}'; game.furnitureEditMode=true; document.getElementById('modalFurniturePlacement').classList.add('hidden'); game.showNotification('Klik lantai rumah untuk meletakkan ${def.name}!');">${def.icon} Pasang ${def.name}</button>`;
    }).join('');
  }

  // --- Tool / Action Execution ---
  performToolAction() {
    const { tx, ty } = this.getTargetTileCoords();
    const loc = this.farm.currentLocation;

    // In Mystic Woods -> Sword Attack on Monsters!
    if (loc === 'woods' || this.player.selectedTool.startsWith('sword_')) {
      this.player.currentAction = 'action';
      this.player.actionTimer = 0.25;
      this.player.slashTimer = 0.2;
      if (window.soundSystem) window.soundSystem.playSwordSwing();

      const dmg = this.player.selectedTool === 'sword_gold' ? 50 : 25;
      const res = this.farm.attackMonster(this.player.x + 16, this.player.y + 16, dmg);
      if (res) {
        if (res.defeated) {
          this.showDamage(res.monster.x, res.monster.y, `KO! +${res.earned}🪙`, '#f1c40f');
          this.showNotification(`Monster dikalahkan! Mendapatkan +${res.earned} Koin Cinta! ⚔️🎉`);
        } else {
          this.showDamage(res.monster.x, res.monster.y, `-${dmg}💥`, '#e74c3c');
        }
      }
      this.updateHUD();
      return;
    }

    this.performActionOnTile(tx, ty);
  }

  performActionOnTile(tx, ty) {
    if (this.farm.currentLocation !== 'farm') return;

    const tool = this.player.selectedTool;
    this.player.currentAction = 'action';
    this.player.actionTimer = 0.25;

    if (tool === 'hoe') {
      const ok = this.farm.tillSoil(tx, ty);
      if (ok) {
        if (window.soundSystem) window.soundSystem.playTill();
        this.showSparkle(tx * 16 + 8, ty * 16 + 8, '🌾');
        this.network.send({ type: 'action_till', x: tx, y: ty });
      }
    } else if (tool === 'water') {
      this.waterTile(tx, ty);
    } else if (tool.startsWith('seed_')) {
      const cropId = tool.replace('seed_', '');
      if ((this.farm.chest.seeds[cropId] || 0) > 0) {
        const ok = this.farm.plantCrop(tx, ty, cropId);
        if (ok) {
          this.farm.chest.seeds[cropId]--;
          if (window.soundSystem) window.soundSystem.playPlant();
          this.showSparkle(tx * 16 + 8, ty * 16 + 8, '🌱');
          this.network.send({ type: 'action_plant', x: tx, y: ty, cropId });
        } else {
          this.showNotification('Cangkul tanah dulu sebelum menanam! 🌾');
        }
      } else {
        this.showNotification(`Bibit ${cropId} habis! Beli di Pak Budi ya~ 🛒`);
      }
    } else if (tool === 'fishing_rod') {
      this.startFishing();
    } else if (tool === 'flower') {
      this.triggerCoupleKiss(false);
      this.showEmote('🌸');
    }

    this.updateHUD();
  }

  waterTile(tx, ty) {
    const ok = this.farm.waterSoil(tx, ty);
    if (ok) {
      if (window.soundSystem) window.soundSystem.playWater();
      this.showSparkle(tx * 16 + 8, ty * 16 + 8, '💧');
      this.network.send({ type: 'action_water', x: tx, y: ty });
    }
  }

  harvestTile(tx, ty) {
    const def = this.farm.harvestCrop(tx, ty);
    if (def) {
      if (window.soundSystem) window.soundSystem.playHarvest();
      this.showSparkle(tx * 16 + 8, ty * 16 + 8, def.icon);
      this.showNotification(`Memanen ${def.name}! Disimpan di Peti 🧺✨`);
      this.network.send({ type: 'action_harvest', x: tx, y: ty });
      this.updateHUD();
    }
  }

  performInteractAction() {
    if (this.activePrompt && this.activePrompt.action) {
      this.activePrompt.action();
      return;
    }
    const { tx, ty } = this.getTargetTileCoords();
    this.performActionOnTile(tx, ty);
  }

  startFishing() {
    if (this.player.isFishing) {
      if (this.player.fishingBite) {
        const caught = this.farm.catchFish();
        this.showNotification(`Berhasil menangkap ${caught.name}! Dijual untuk koin! 🐟🎉`);
        if (window.soundSystem) window.soundSystem.playCoin();
      } else {
        this.showNotification('Ikan terlepas! Coba lagi ya~');
      }
      this.player.isFishing = false;
      this.player.fishingBite = false;
      this.updateHUD();
      return;
    }

    this.player.isFishing = true;
    this.player.fishingTimer = 2.5 + Math.random() * 2;
    this.player.fishingBite = false;
    this.showNotification('Melempar pancing ke danau... Tunggu ikan menyambar! 🎣');
  }

  // --- NPC Dialog & Shops ---
  openNPCDialog(npc) {
    const modal = document.getElementById('modalNPC');
    document.getElementById('npcName').textContent = npc.name;
    document.getElementById('npcPortrait').src = npc.portrait;
    document.getElementById('npcDialogText').textContent = npc.dialog;

    const actionContainer = document.getElementById('npcActions');
    actionContainer.innerHTML = '';

    if (npc.role === 'merchant') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="game.openStoreModal('seeds')">🌱 Beli Bibit Tanaman</button>
        <button class="btn btn-secondary" onclick="game.openStoreModal('furniture')">🪑 Beli Perabotan Rumah</button>
      `;
    } else if (npc.role === 'rancher') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="game.openStoreModal('animals')">🐮 Beli Hewan Ternak</button>
        <button class="btn btn-secondary" onclick="game.openStoreModal('pets')">🐕 Beli Hewan Peliharaan Pengikut</button>
      `;
    } else if (npc.role === 'blacksmith') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="game.buyWeapon('sword_iron', 80)">⚔️ Beli Pedang Besi (80 🪙)</button>
        <button class="btn btn-secondary" onclick="game.buyWeapon('sword_gold', 160)">🗡️ Beli Pedang Emas Ksatria (160 🪙)</button>
      `;
    } else if (npc.role === 'fisher') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="game.buyFishingRod()">🎣 Beli Alat Pancing Bambu (60 🪙)</button>
        <button class="btn btn-secondary" onclick="game.sellProduce()">🪙 Jual Ikan Hasil Tangkapan</button>
      `;
    } else if (npc.role === 'bot_elder') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="document.getElementById('modalNPC').classList.add('hidden'); document.getElementById('modalBots').classList.remove('hidden');">🤖 Kelola / Sewa Bot Pembantu</button>
      `;
    }

    modal.classList.remove('hidden');
  }

  openStoreModal(tab) {
    document.getElementById('modalNPC').classList.add('hidden');
    const store = document.getElementById('modalStore');
    const container = document.getElementById('storeItemsList');
    container.innerHTML = '';

    if (tab === 'seeds') {
      document.getElementById('storeTitle').textContent = '🌱 Toko Bibit Pak Budi';
      container.innerHTML = Object.entries(CROP_DEFINITIONS).map(([id, def]) => `
        <div class="store-card">
          <span class="store-icon">${def.icon}</span>
          <div class="store-info">
            <strong>${def.name}</strong>
            <p>Panen: ${def.growTime}s | Jual: ${def.sellPrice}🪙</p>
          </div>
          <button class="btn-buy" onclick="game.farm.buySeeds('${id}', 1); game.showNotification('Membeli bibit ${def.name}! 🌱'); game.updateHUD();">Beli (${def.seedPrice}🪙)</button>
        </div>
      `).join('');
    } else if (tab === 'furniture') {
      document.getElementById('storeTitle').textContent = '🪑 Toko Perabot Rumah (Isi Rumah Kosongmu)';
      container.innerHTML = Object.entries(FURNITURE_DEFINITIONS).map(([id, def]) => `
        <div class="store-card">
          <span class="store-icon">${def.icon}</span>
          <div class="store-info">
            <strong>${def.name}</strong>
            <p>${def.desc}</p>
          </div>
          <button class="btn-buy" onclick="game.buyFurnitureItem('${id}')">Beli (${def.price}🪙)</button>
        </div>
      `).join('');
    } else if (tab === 'animals') {
      document.getElementById('storeTitle').textContent = '🐮 Peternakan Mak Siti';
      const animalStore = [
        { type: 'baby_chick', name: 'Anak Ayam Kuning 🐥', price: 40, desc: 'Tumbuh menjadi ayam petelur.' },
        { type: 'chicken', name: 'Ayam Petelur 🐔', price: 80, desc: 'Menghasilkan telur emas.' },
        { type: 'sheep', name: 'Domba Wol 🐑', price: 140, desc: 'Menghasilkan wol lembut.' },
        { type: 'pig', name: 'Babi Lucu 🐷', price: 160, desc: 'Mencari jamur truffle.' },
        { type: 'cow', name: 'Sapi Perah 🐮', price: 220, desc: 'Menghasilkan susu segar.' }
      ];
      container.innerHTML = animalStore.map(a => `
        <div class="store-card">
          <div class="store-info">
            <strong>${a.name}</strong>
            <p>${a.desc}</p>
          </div>
          <button class="btn-buy" onclick="game.buyAnimalItem('${a.type}', '${a.name}', ${a.price})">Beli (${a.price}🪙)</button>
        </div>
      `).join('');
    } else if (tab === 'pets') {
      document.getElementById('storeTitle').textContent = '🐕 Toko Hewan Peliharaan Pengikut';
      const pets = [
        { type: 'pet_chick', name: 'Anak Ayam Pipit 🐥', price: 40, desc: 'Selalu melompat gembira mengikutimu.' },
        { type: 'pet_piggy', name: 'Babi Mini Lucu 🐷', price: 80, desc: 'Peliharaan setia yang berjalan di sampingmu.' },
        { type: 'pet_bunny', name: 'Kelinci Lembut 🐰', price: 100, desc: 'Kelinci manis yang setia menemani petualanganmu.' }
      ];
      container.innerHTML = pets.map(p => `
        <div class="store-card">
          <div class="store-info">
            <strong>${p.name}</strong>
            <p>${p.desc}</p>
          </div>
          <button class="btn-buy" onclick="game.buyPetItem('${p.type}', '${p.name}', ${p.price})">Beli (${p.price}🪙)</button>
        </div>
      `).join('');
    }

    store.classList.remove('hidden');
  }

  buyWeapon(toolId, price) {
    if (this.farm.unlockedTools[toolId]) {
      this.showNotification('Kamu sudah memiliki pedang ini!');
      return;
    }
    const ok = this.farm.buyTool(toolId, price);
    if (ok) {
      this.showNotification('Pedang berhasil dibeli! Siap membasmi monster di Hutan Misterius! ⚔️✨');
      this.updateHUD();
      document.getElementById('modalNPC').classList.add('hidden');
    } else {
      this.showNotification('Koin cinta tidak cukup!');
    }
  }

  buyFishingRod() {
    if (this.farm.unlockedTools.fishing_rod) {
      this.showNotification('Kamu sudah memiliki alat pancing!');
      return;
    }
    const ok = this.farm.buyTool('fishing_rod', 60);
    if (ok) {
      this.showNotification('Berhasil membeli Alat Pancing Bambu! 🎣');
      this.updateHUD();
      document.getElementById('modalNPC').classList.add('hidden');
    } else {
      this.showNotification('Koin tidak cukup! Butuh 60 koin cinta.');
    }
  }

  buyAnimalItem(type, name, price) {
    const ok = this.farm.buyAnimal(type, name, price);
    if (ok) {
      this.animalManager.syncFromFarm();
      this.showNotification(`Selamat! ${name} sekarang ada di padang rumputmu! ❤️`);
      this.updateHUD();
      this.network.send({ type: 'animal_bought' });
    } else {
      this.showNotification('Koin tidak cukup untuk membeli hewan ini!');
    }
  }

  buyPetItem(type, name, price) {
    const ok = this.farm.buyPet(type, name, price);
    if (ok) {
      this.showNotification(`Selamat! ${name} sekarang menjadi hewan peliharaanmu dan mengikutimu! 🐾❤️`);
      this.updateHUD();
      this.network.send({ type: 'pet_bought', pet: this.farm.activePet });
    } else {
      this.showNotification('Koin cinta tidak cukup!');
    }
  }

  buyFurnitureItem(furnId) {
    const ok = this.farm.buyFurniture(furnId);
    if (ok) {
      this.showNotification(`Perabotan tersimpan di tas! Masuk ke rumah MC untuk meletakkannya 🪑✨`);
      this.updateHUD();
    } else {
      this.showNotification('Koin tidak cukup!');
    }
  }

  sellProduce() {
    const earned = this.farm.sellAllProduce();
    if (earned > 0) {
      if (window.soundSystem) window.soundSystem.playCoin();
      this.showNotification(`Semua hasil panen & ikan terjual! Dapat +${earned} Koin Cinta! 🪙🎉`);
      this.network.send({ type: 'action_sell' });
    } else {
      this.showNotification('Belum ada sayur atau ikan untuk dijual~');
    }
    this.updateHUD();
  }

  triggerCoupleKiss(fromPartner = false) {
    if (window.soundSystem) window.soundSystem.playKiss();
    this.farm.addLovePoints(25);
    const midX = (this.player.x + this.partner.x) / 2 + 16;
    const midY = (this.player.y + this.partner.y) / 2 + 8;
    for (let i = 0; i < 6; i++) {
      this.showSparkle(midX + (Math.random() * 20 - 10), midY + (Math.random() * 20 - 10), '❤️');
    }
    this.showEmote('😘');
    if (!fromPartner) {
      this.showNotification(`Kamu mengecup mesra ${this.partner.name}! Poin Cinta bertambah! 💕`);
      this.network.send({ type: 'action_kiss' });
    }
    this.updateHUD();
  }

  showEmote(emote) {
    this.player.emote = emote;
    this.player.emoteTimer = 3.0;
    this.network.send({ type: 'action_emote', emote });
  }

  showSparkle(x, y, char = '✨') {
    this.sparkles.push({ x, y, char, vy: -25, alpha: 1.0, life: 1.2 });
  }

  showDamage(x, y, text, color = '#e74c3c') {
    this.floatingTexts.push({ x, y, text, color, vy: -28, alpha: 1.0, life: 1.2 });
  }

  showNotification(text) {
    this.notifications.push({ text, time: 3.5 });
    if (this.notifications.length > 4) this.notifications.shift();
  }

  // --- Main Update Loop ---
  loop(timestamp) {
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(delta) {
    this.farm.update(delta);

    if (this.farm.currentLocation === 'farm') {
      this.botManager.update(delta);
      this.animalManager.update(delta);
    }

    // Slash animation timer
    if (this.player.slashTimer > 0) this.player.slashTimer -= delta;

    // Fishing timer
    if (this.player.isFishing) {
      this.player.fishingTimer -= delta;
      if (this.player.fishingTimer <= 0 && !this.player.fishingBite) {
        this.player.fishingBite = true;
        this.showSparkle(this.player.x + 16, this.player.y - 10, '❗');
        this.showNotification('Ikan menyambar umpan! Tekan [E] untuk menarik! 🎣');
      }
    }

    // Movement
    let vx = 0;
    let vy = 0;
    if (this.keys['w'] || this.keys['arrowup']) vy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) vy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) vx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) vx += 1;

    if (this.touchJoystick.active) {
      vx += this.touchJoystick.dx;
      vy += this.touchJoystick.dy;
    }

    const dist = Math.hypot(vx, vy);
    if (dist > 0.05 && !this.player.isFishing) {
      this.player.isMoving = true;
      const speed = this.player.speed * delta;
      const nx = this.player.x + (vx / dist) * speed;
      const ny = this.player.y + (vy / dist) * speed;

      if (Math.abs(vx) > Math.abs(vy)) this.player.dir = vx > 0 ? 'right' : 'left';
      else this.player.dir = vy > 0 ? 'down' : 'up';

      const footX = Math.floor((nx + 16) / 16);
      const footY = Math.floor((ny + 24) / 16);

      if (!this.farm.isCollidable(footX, footY, this.farm.currentLocation)) {
        this.player.x = nx;
        this.player.y = ny;
      }

      this.player.animTimer += delta;
      if (this.player.animTimer >= 0.12) {
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % 6;
      }
    } else {
      this.player.isMoving = false;
      this.player.animTimer += delta;
      if (this.player.animTimer >= 0.2) {
        this.player.animTimer = 0;
        this.player.animFrame = (this.player.animFrame + 1) % 6;
      }
    }

    // Active Pet Follow Logic
    if (this.farm.activePet) {
      const targetPetX = this.player.x + (this.player.dir === 'left' ? 22 : -22);
      const targetPetY = this.player.y + (this.player.dir === 'up' ? 18 : -18);
      const pdx = targetPetX - this.pet.x;
      const pdy = targetPetY - this.pet.y;
      const pdist = Math.hypot(pdx, pdy);

      if (pdist > 18) {
        this.pet.isMoving = true;
        const petSpeed = (this.player.speed + 10) * delta;
        this.pet.x += (pdx / pdist) * petSpeed;
        this.pet.y += (pdy / pdist) * petSpeed;
        this.pet.dir = pdx > 0 ? 'right' : 'left';
        this.pet.anim = (this.pet.anim + delta * 6) % 2;
      } else {
        this.pet.isMoving = false;
      }
    }

    if (this.player.actionTimer > 0) {
      this.player.actionTimer -= delta;
      if (this.player.actionTimer <= 0) this.player.currentAction = 'idle';
    }

    if (this.player.emoteTimer > 0) {
      this.player.emoteTimer -= delta;
      if (this.player.emoteTimer <= 0) this.player.emote = null;
    }
    if (this.partner.emoteTimer > 0) {
      this.partner.emoteTimer -= delta;
      if (this.partner.emoteTimer <= 0) this.partner.emote = null;
    }

    // Camera follow
    const targetCamX = this.player.x + 16 - (this.canvas.width / this.camera.scale) / 2;
    const targetCamY = this.player.y + 16 - (this.canvas.height / this.camera.scale) / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;

    const loc = this.farm.currentLocation;
    let maxW = 48 * 16;
    let maxH = 32 * 16;
    if (loc === 'woods') { maxW = 40 * 16; maxH = 30 * 16; }
    else if (loc === 'house_mc') { maxW = 16 * 16; maxH = 12 * 16; }
    else if (loc.startsWith('house_')) { maxW = 14 * 16; maxH = 10 * 16; }

    this.camera.x = Math.max(0, Math.min(maxW - this.canvas.width / this.camera.scale, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxH - this.canvas.height / this.camera.scale, this.camera.y));

    // Particles & Floating Damage
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * delta;
      ft.life -= delta;
      ft.alpha = ft.life;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.y += s.vy * delta;
      s.life -= delta;
      if (s.life <= 0) this.sparkles.splice(i, 1);
    }

    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.time -= delta;
      if (n.time <= 0) this.notifications.splice(i, 1);
    }

    this.updateActivePrompt();
  }

  // --- Rendering ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    const loc = this.farm.currentLocation;
    if (loc === 'farm') {
      this.renderOutdoorVillage();
    } else if (loc === 'house_mc') {
      this.renderMCHouse();
    } else if (loc.startsWith('house_')) {
      this.renderNPCHouse(loc);
    } else if (loc === 'woods') {
      this.renderMysticWoods();
    }

    this.ctx.restore();

    this.renderUIOverlays();
  }

  // --- 1. OUTDOOR VILLAGE ---
  renderOutdoorVillage() {
    const imgGrass = this.assets.grass;
    const imgPath = this.assets.path;
    const imgWater = this.assets.water;
    const imgFarmland = this.assets.farmland;
    const imgFences = this.assets.fences;
    const imgChest = this.assets.chest;
    const imgBridge = this.assets.bridge;
    const imgHouse = this.assets.house;
    const imgPlants = this.assets.plants;

    for (let y = 0; y < this.farm.rows; y++) {
      for (let x = 0; x < this.farm.cols; x++) {
        const px = x * 16;
        const py = y * 16;
        const tile = this.farm.grid[y][x];

        if (imgGrass) this.ctx.drawImage(imgGrass, px, py, 16, 16);
        if (tile.type === 'path' && imgPath) this.ctx.drawImage(imgPath, px, py, 16, 16);
        if (tile.type === 'water' && imgWater) this.ctx.drawImage(imgWater, px, py, 16, 16);
        if (tile.type === 'farmland' || tile.tilled) {
          if (imgFarmland) this.ctx.drawImage(imgFarmland, 16, 16, 16, 16, px, py, 16, 16);
          if (tile.watered) {
            this.ctx.fillStyle = 'rgba(20, 50, 100, 0.35)';
            this.ctx.fillRect(px, py, 16, 16);
          }
        }
      }
    }

    // Bridge over lake
    if (imgBridge) this.ctx.drawImage(imgBridge, 0, 0, 48, 24, 36 * 16, 20 * 16 - 4, 48, 24);

    // Objects
    for (let y = 0; y < this.farm.rows; y++) {
      for (let x = 0; x < this.farm.cols; x++) {
        const tile = this.farm.grid[y][x];
        const px = x * 16;
        const py = y * 16;

        if (tile.type === 'fence' && imgFences) this.ctx.drawImage(imgFences, 16, 16, 16, 16, px, py, 16, 16);
        if (tile.type === 'chest' && imgChest) this.ctx.drawImage(imgChest, px, py, 16, 16);
        if (tile.type === 'sell_bin') {
          this.ctx.fillStyle = '#b33939';
          this.ctx.fillRect(px, py + 4, 16, 12);
          this.ctx.fillStyle = '#ffb142';
          this.ctx.fillRect(px + 2, py + 2, 12, 4);
          this.ctx.fillStyle = '#fff';
          this.ctx.font = '8px sans-serif';
          this.ctx.fillText('🪙', px + 2, py + 12);
        }
        if (tile.type === 'well') {
          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.fillRect(px + 2, py + 2, 12, 12);
          this.ctx.fillStyle = '#3498db';
          this.ctx.fillRect(px + 4, py + 4, 8, 8);
        }

        // Crops
        if (tile.crop && imgPlants) {
          const def = CROP_DEFINITIONS[tile.crop.id];
          if (def) {
            this.ctx.drawImage(imgPlants, Math.min(4, tile.crop.stage) * 16, def.plantRow * 16, 16, 16, px, py, 16, 16);
            if (tile.crop.ready) {
              this.ctx.fillStyle = 'rgba(255, 230, 0, 0.45)';
              this.ctx.beginPath();
              this.ctx.arc(px + 8, py + 8, 5, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }
        }
      }
    }

    // Buildings with Signboards
    if (imgHouse) {
      // 1. MC House
      this.ctx.drawImage(imgHouse, 20 * 16, 3 * 16 - 16, 96, 112);
      this.renderSignboard(23 * 16, 8 * 16 + 18, '🏡 Rumah Utama (MC)');

      // 2. Toko Pak Budi
      this.ctx.drawImage(imgHouse, 6 * 16, 20 * 16 - 20, 80, 96);
      this.renderSignboard(8 * 16, 24 * 16 + 18, '🛒 Toko Tani Pak Budi');

      // 3. Mak Siti Ranch House
      this.ctx.drawImage(imgHouse, 15 * 16, 20 * 16 - 20, 80, 96);
      this.renderSignboard(17 * 16, 24 * 16 + 18, '🐮 Peternakan Mak Siti');

      // 4. Pandai Besi Borin
      this.ctx.drawImage(imgHouse, 24 * 16, 20 * 16 - 20, 80, 96);
      this.renderSignboard(26 * 16, 24 * 16 + 18, '⚔️ Toko Senjata Borin');
    }

    // Portal to Mystic Woods
    this.ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
    this.ctx.fillRect(44 * 16, 1 * 16, 48, 24);
    this.renderSignboard(45 * 16, 1 * 16 + 26, '🌲 Hutan Misterius ➔');

    // Depth Sorted Entities
    const entities = [];

    // Trees
    const trees = [
      [18, 4], [27, 4], [13, 3], [33, 4], [34, 9], [3, 16], [3, 21], [33, 26], [42, 8]
    ];
    trees.forEach(([tx, ty]) => {
      entities.push({
        y: ty * 16 + 16,
        render: () => {
          if (this.assets.tree) this.ctx.drawImage(this.assets.tree, tx * 16 - 24, ty * 16 - 64, 64, 80);
        }
      });
    });

    // NPCs
    this.farm.npcs.forEach(npc => {
      entities.push({
        y: npc.y * 16 + 16,
        render: () => {
          const img = this.assets[npc.role === 'merchant' ? 'npc_merchant' : (npc.role === 'rancher' ? 'npc_rancher' : 'npc_fisher')];
          if (img) this.ctx.drawImage(img, 0, 0, 32, 32, npc.x * 16 - 8, npc.y * 16 - 12, 32, 32);
          this.renderNameTag(npc.x * 16 + 8, npc.y * 16 - 8, npc.name.split(' ')[0], '#34495e');
        }
      });
    });

    // Animals
    this.animalManager.animals.forEach(a => {
      entities.push({
        y: a.y + 16,
        render: () => {
          const img = this.assets[a.type];
          if (img) {
            this.ctx.save();
            if (a.dir === 'left') {
              this.ctx.translate(a.x + 32, a.y);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, a.frame * 32, 0, 32, 32, 0, 0, 32, 32);
            } else {
              this.ctx.drawImage(img, a.frame * 32, 0, 32, 32, a.x, a.y, 32, 32);
            }
            this.ctx.restore();
            a.hearts.forEach(h => { this.ctx.font = '10px sans-serif'; this.ctx.fillText('❤️', h.x, h.y); });
          }
        }
      });
    });

    // Helper Bots
    this.botManager.bots.forEach(b => {
      if (!b.isUnlocked()) return;
      entities.push({
        y: b.y + 24,
        render: () => {
          const img = b.type === 'boni' ? this.assets.bot_boni : this.assets.bot_slime;
          if (img) {
            this.ctx.save();
            let row = b.isMoving ? (b.dir === 'down' ? 3 : (b.dir === 'up' ? 5 : 4)) : (b.dir === 'down' ? 0 : (b.dir === 'up' ? 2 : 1));
            if (b.type === 'slime') row = b.isMoving ? 1 : 0;
            if (b.dir === 'left') {
              this.ctx.translate(b.x + 32, b.y);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, b.frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
            } else {
              this.ctx.drawImage(img, b.frame * 32, row * 32, 32, 32, b.x, b.y, 32, 32);
            }
            this.ctx.restore();
            if (b.bubbleText) this.renderSpeechBubble(b.x + 16, b.y - 8, b.bubbleText, '#2ed573');
          }
        }
      });
    });

    // Pet Companion Follower
    if (this.farm.activePet) {
      entities.push({
        y: this.pet.y + 16,
        render: () => {
          const pImg = this.assets[this.farm.activePet.type] || this.assets.pet_chick;
          if (pImg) {
            this.ctx.save();
            if (this.pet.dir === 'left') {
              this.ctx.translate(this.pet.x + 24, this.pet.y);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(pImg, Math.floor(this.pet.anim) * 16, 0, 16, 16, 0, 0, 16, 16);
            } else {
              this.ctx.drawImage(pImg, Math.floor(this.pet.anim) * 16, 0, 16, 16, this.pet.x, this.pet.y, 16, 16);
            }
            this.ctx.restore();
          }
        }
      });
    }

    // Local Player
    entities.push({
      y: this.player.y + 24,
      render: () => this.renderCharacter(this.player, true)
    });

    // Partner Player
    if (this.partner.active && this.partner.location === 'farm') {
      entities.push({
        y: this.partner.y + 24,
        render: () => this.renderCharacter(this.partner, false)
      });
    }

    entities.sort((a, b) => a.y - b.y);
    entities.forEach(e => e.render());

    this.renderAtmosphere();
  }

  // --- 2. MC HOUSE (EMPTY BY DEFAULT, PLAYER PLACES REAL PIXEL ART FURNITURE!) ---
  renderMCHouse() {
    for (let y = 0; y < this.farm.houseMCHeight; y++) {
      for (let x = 0; x < this.farm.houseMCWidth; x++) {
        const px = x * 16;
        const py = y * 16;
        const cell = this.farm.houseMC[y][x];

        if (cell.type === 'indoor_wall') {
          this.ctx.fillStyle = '#5c3a21';
          this.ctx.fillRect(px, py, 16, 16);
          this.ctx.fillStyle = '#8e5431';
          this.ctx.fillRect(px + 1, py + 1, 14, 14);
        } else {
          this.ctx.fillStyle = '#e5b982';
          this.ctx.fillRect(px, py, 16, 16);
          this.ctx.fillStyle = '#d4a366';
          this.ctx.fillRect(px + 1, py + 1, 14, 14);
        }
      }
    }

    // Doorway carpet
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(8 * 16, 11 * 16, 16, 16);

    // Draw Player's Placed Furniture using REAL PIXEL ART SPRITES!
    this.farm.placedFurnitureMC.forEach(f => {
      const img = this.assets[f.id];
      if (img) {
        this.ctx.drawImage(img, f.x * 16, f.y * 16);
      }
    });

    // Draw Characters
    this.renderCharacter(this.player, true);
    if (this.partner.active && this.partner.location === 'house_mc') {
      this.renderCharacter(this.partner, false);
    }
  }

  // --- 3. NPC HOUSES (ALREADY FULLY FURNISHED!) ---
  renderNPCHouse(loc) {
    const room = loc === 'house_budi' ? this.farm.houseBudi : (loc === 'house_siti' ? this.farm.houseSiti : this.farm.houseBlacksmith);
    for (let y = 0; y < room.h; y++) {
      for (let x = 0; x < room.w; x++) {
        const px = x * 16;
        const py = y * 16;
        const cell = room.grid[y][x];

        if (cell.type === 'indoor_wall') {
          this.ctx.fillStyle = '#5c3a21';
          this.ctx.fillRect(px, py, 16, 16);
          this.ctx.fillStyle = '#8e5431';
          this.ctx.fillRect(px + 1, py + 1, 14, 14);
        } else {
          this.ctx.fillStyle = '#e5b982';
          this.ctx.fillRect(px, py, 16, 16);
          this.ctx.fillStyle = '#d4a366';
          this.ctx.fillRect(px + 1, py + 1, 14, 14);
        }
      }
    }

    // Draw Pre-furnished items
    room.furniture.forEach(f => {
      const img = this.assets[f.id];
      if (img) {
        this.ctx.drawImage(img, f.x * 16, f.y * 16);
      }
    });

    // Doorway
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(room.door.x * 16, room.door.y * 16, 16, 16);

    this.renderCharacter(this.player, true);
    if (this.partner.active && this.partner.location === loc) {
      this.renderCharacter(this.partner, false);
    }
  }

  // --- 4. HUTAN MISTERIUS (COMBAT ZONE WITH SLIMES & SKELETONS) ---
  renderMysticWoods() {
    const imgGrass = this.assets.mystic_grass || this.assets.grass;

    for (let y = 0; y < this.farm.woodsH; y++) {
      for (let x = 0; x < this.farm.woodsW; x++) {
        const px = x * 16;
        const py = y * 16;
        const cell = this.farm.woodsGrid[y][x];

        if (imgGrass) this.ctx.drawImage(imgGrass, 0, 0, 16, 16, px, py, 16, 16);
        if (cell.type === 'tree') {
          if (this.assets.tree) this.ctx.drawImage(this.assets.tree, px - 16, py - 48, 48, 64);
        }
        if (cell.type === 'ruin_stone') {
          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.fillRect(px + 2, py + 2, 12, 12);
        }
        if (cell.type === 'portal_village') {
          this.ctx.fillStyle = '#2ecc71';
          this.ctx.fillRect(px, py, 16, 16);
          this.renderSignboard(px + 8, py + 22, '🏡 Kembali ke Desa');
        }
      }
    }

    // Monsters in woods
    this.farm.monsters.forEach(m => {
      const img = m.type === 'slime' ? this.assets.slime_monster : this.assets.skeleton_monster;
      if (img) {
        const frame = Math.floor(m.anim) % 4;
        let row = m.dir === 'down' ? 0 : (m.dir === 'up' ? 2 : 1);
        this.ctx.save();
        if (m.dir === 'left') {
          this.ctx.translate(m.x + 32, m.y);
          this.ctx.scale(-1, 1);
          this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
        } else {
          this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, m.x, m.y, 32, 32);
        }
        this.ctx.restore();

        // Monster HP Bar
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(m.x + 4, m.y - 6, 24, 4);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(m.x + 4, m.y - 6, Math.max(0, (m.hp / m.maxHp) * 24), 4);
      }
    });

    this.renderCharacter(this.player, true);
    if (this.partner.active && this.partner.location === 'woods') {
      this.renderCharacter(this.partner, false);
    }
  }

  renderCharacter(char, isLocal) {
    const img = char.role === 'girl' ? this.assets.player_girl : this.assets.player_boy;
    if (!img) return;

    this.ctx.save();
    let row = 0;
    if (char.currentAction === 'action') row = char.dir === 'down' ? 6 : (char.dir === 'up' ? 8 : 7);
    else if (char.isMoving) row = char.dir === 'down' ? 3 : (char.dir === 'up' ? 5 : 4);
    else row = char.dir === 'down' ? 0 : (char.dir === 'up' ? 2 : 1);

    const frame = char.animFrame || 0;
    const flip = char.dir === 'left';

    if (flip) {
      this.ctx.translate(char.x + 32, char.y);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
    } else {
      this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, char.x, char.y, 32, 32);
    }
    this.ctx.restore();

    // Sword slash effect
    if (char.slashTimer > 0) {
      this.ctx.strokeStyle = '#f1c40f';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(char.x + 16, char.y + 16, 22, -0.5, 1.5);
      this.ctx.stroke();
    }

    // Name tag
    this.renderNameTag(char.x + 16, char.y + 3, `${char.name} ${char.role === 'girl' ? '🌸' : '🌱'}`, isLocal ? 'rgba(0,0,0,0.55)' : 'rgba(235,77,75,0.75)');

    if (char.emote) {
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText(char.emote, char.x + 16, char.y - 12);
    }
  }

  renderNameTag(x, y, text, bg) {
    this.ctx.save();
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(text).width;
    this.ctx.fillStyle = bg;
    this.ctx.beginPath();
    this.ctx.roundRect(x - tw / 2 - 4, y - 9, tw + 8, 12, 4);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  renderSignboard(x, y, text) {
    this.ctx.save();
    this.ctx.font = 'bold 8px sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(text).width;
    this.ctx.fillStyle = 'rgba(243, 156, 18, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(x - tw / 2 - 4, y - 8, tw + 8, 12, 4);
    this.ctx.fill();
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  renderSpeechBubble(x, y, text, color = '#2ed573') {
    this.ctx.save();
    this.ctx.font = '8px sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(text).width;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(x - tw / 2 - 5, y - 14, tw + 10, 14, 4);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.fillStyle = '#2f3542';
    this.ctx.fillText(text, x, y - 4);
    this.ctx.restore();
  }

  renderAtmosphere() {
    const timeInfo = this.farm.getTimeOfDay();
    if (timeInfo.ambient && timeInfo.ambient !== 'rgba(255, 255, 255, 0)') {
      this.ctx.fillStyle = timeInfo.ambient;
      this.ctx.fillRect(0, 0, this.farm.cols * 16, this.farm.rows * 16);
    }
  }

  renderUIOverlays() {
    // 1. Contextual Action Prompt Banner
    if (this.activePrompt) {
      this.ctx.save();
      this.ctx.font = 'bold 13px sans-serif';
      const text = this.activePrompt.text;
      const tw = this.ctx.measureText(text).width;
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height - (window.innerWidth < 900 ? 175 : 85);

      this.ctx.fillStyle = 'rgba(255, 234, 167, 0.96)';
      this.ctx.strokeStyle = '#ff7675';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.roundRect(cx - tw / 2 - 14, cy - 14, tw + 28, 28, 14);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#2d3436';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(text, cx, cy + 5);
      this.ctx.restore();
    }

    // 2. Floating Damage / Combat Numbers
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.font = 'bold 13px sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });

    // 3. Screen notifications
    let ny = this.canvas.height - 120;
    this.notifications.forEach(n => {
      this.ctx.save();
      this.ctx.font = '12px sans-serif';
      const tw = this.ctx.measureText(n.text).width;
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.beginPath();
      this.ctx.roundRect(16, ny - 16, tw + 16, 22, 6);
      this.ctx.fill();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(n.text, 24, ny);
      this.ctx.restore();
      ny -= 26;
    });
  }

  onPeerConnected(isHost) {
    this.partner.active = true;
    this.showNotification(`Pasangan (${this.partner.name}) berhasil terhubung! Selamat mabar! 🎉❤️`);
    this.updateHUD();
  }

  onPeerDisconnected() {
    this.partner.active = false;
    this.showNotification('Pasangan terputus. Menunggu koneksi kembali... 🟡');
    this.updateHUD();
  }

  updateHUD() {
    const elCoins = document.getElementById('hudCoins');
    if (elCoins) elCoins.textContent = `${this.farm.coins}`;

    const elLove = document.getElementById('hudLove');
    const elLoveTitle = document.getElementById('hudLoveTitle');
    if (elLove) elLove.textContent = `${this.farm.lovePoints} ❤️`;
    if (elLoveTitle) elLoveTitle.textContent = `${this.farm.getLoveTitle()}`;

    const elTime = document.getElementById('hudTime');
    const timeInfo = this.farm.getTimeOfDay();
    const hours = Math.floor(this.farm.timeMinutes / 60).toString().padStart(2, '0');
    const mins = Math.floor(this.farm.timeMinutes % 60).toString().padStart(2, '0');
    if (elTime) elTime.textContent = `Hari ${this.farm.dayCount} - ${hours}:${mins} (${timeInfo.label})`;

    // Check hotbar availability
    const slotFish = document.querySelector('.hotbar-slot[data-tool="fishing_rod"]');
    if (slotFish) slotFish.style.opacity = this.farm.unlockedTools.fishing_rod ? '1' : '0.4';

    const slotSword = document.querySelector('.hotbar-slot[data-tool="sword_iron"]');
    if (slotSword) slotSword.style.opacity = (this.farm.unlockedTools.sword_iron || this.farm.unlockedTools.sword_gold) ? '1' : '0.4';
  }

  setupHUDButtons() {
    document.getElementById('btnToggleSound')?.addEventListener('click', () => {
      window.soundSystem.init();
      const muted = window.soundSystem.toggleMute();
      document.getElementById('btnToggleSound').textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('btnToggleMusic')?.addEventListener('click', () => {
      window.soundSystem.init();
      const on = window.soundSystem.toggleBGM();
      document.getElementById('btnToggleMusic').textContent = on ? '🎵' : '🔇';
    });

    document.getElementById('btnOpenBots')?.addEventListener('click', () => {
      document.getElementById('modalBots').classList.remove('hidden');
    });

    document.getElementById('btnOpenChest')?.addEventListener('click', () => this.openChestModal());
    document.getElementById('btnOpenSave')?.addEventListener('click', () => {
      document.getElementById('modalSave').classList.remove('hidden');
    });

    document.getElementById('btnTakePic')?.addEventListener('click', () => this.capturePolaroid());

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          this.receiveChatMessage(this.player.name, text);
          this.network.send({ type: 'action_chat', sender: this.player.name, text });
          chatInput.value = '';
          chatInput.blur();
        }
      });
    }
  }

  receiveChatMessage(sender, text) {
    const chatLogs = document.getElementById('chatLogs');
    if (chatLogs) {
      const p = document.createElement('div');
      p.className = 'chat-bubble';
      p.innerHTML = `<strong>${sender}:</strong> ${text}`;
      chatLogs.appendChild(p);
      chatLogs.scrollTop = chatLogs.scrollHeight;
    }
  }

  openChestModal() {
    const modal = document.getElementById('modalChest');
    const seedsList = document.getElementById('chestSeedsList');
    const produceList = document.getElementById('chestProduceList');

    if (seedsList) {
      seedsList.innerHTML = Object.entries(this.farm.chest.seeds).map(([id, count]) => {
        const def = CROP_DEFINITIONS[id] || { name: id, icon: '🌱' };
        return `<div class="chest-item"><span>${def.icon} ${def.name}</span><strong>x${count}</strong></div>`;
      }).join('');
    }

    if (produceList) {
      produceList.innerHTML = Object.entries(this.farm.chest.produce).map(([id, count]) => {
        let icon = '🧺';
        if (id === 'fish') icon = '🐟';
        if (id === 'milk') icon = '🥛';
        if (id === 'egg') icon = '🥚';
        if (id === 'wool') icon = '🧶';
        if (id === 'monster_gel') icon = '🟢';
        const name = CROP_DEFINITIONS[id] ? CROP_DEFINITIONS[id].name : id.toUpperCase();
        return `<div class="chest-item"><span>${icon} ${name}</span><strong>x${count}</strong></div>`;
      }).join('');
    }

    modal.classList.remove('hidden');
  }

  capturePolaroid() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 480;
    pCanvas.height = 580;
    const pCtx = pCanvas.getContext('2d');

    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, 480, 580);
    pCtx.drawImage(this.canvas, 20, 20, 440, 440);

    pCtx.fillStyle = '#2c3e50';
    pCtx.font = 'bold 22px cursive, sans-serif';
    pCtx.textAlign = 'center';
    const coupleText = `${this.player.name} ❤️ ${this.partner.active ? this.partner.name : 'Pacar Tercinta'}`;
    pCtx.fillText(coupleText, 240, 495);

    pCtx.font = '15px sans-serif';
    pCtx.fillStyle = '#7f8c8d';
    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    pCtx.fillText(`Kebun Cinta Kita • Hari ke-${this.farm.dayCount} • ${dateStr}`, 240, 530);

    const a = document.createElement('a');
    a.href = pCanvas.toDataURL('image/png');
    a.download = `foto-berdua-${this.player.name}-${this.partner.name}.png`;
    a.click();

    this.showNotification('📷 Foto Polaroid tersimpan ke galeri perangkatmu! ❤️✨');
  }
}

window.Game = Game;
