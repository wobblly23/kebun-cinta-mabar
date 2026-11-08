// js/game.js - Upgraded Engine with Indoor Farmhouse, NPC Shops, Fishing, and Responsive Controls

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
      y: 10 * 16,
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
      fishingBite: false
    };

    // Partner Player (Mabar)
    this.partner = {
      name: 'Aurel',
      role: 'girl',
      x: 24 * 16,
      y: 10 * 16,
      dir: 'down',
      isMoving: false,
      animFrame: 0,
      currentAction: 'idle',
      emote: null,
      emoteTimer: 0,
      active: false,
      location: 'farm'
    };

    // Camera
    this.camera = { x: 0, y: 0, scale: 3 };

    // Input state
    this.keys = {};
    this.touchJoystick = { active: false, dx: 0, dy: 0 };

    // Fireflies particles for romantic night
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

    // Floating UI prompt & notifications
    this.activePrompt = null;
    this.notifications = [];
    this.sparkles = [];

    // Assets
    this.assets = {};
    this.assetsLoaded = false;
    this.lastTime = performance.now();
  }

  // --- Asset Loader ---
  loadAssets(callback) {
    const toLoad = {
      // Characters
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
      // Animals
      cow: 'assets/animals/cow.png',
      chicken: 'assets/animals/chicken.png',
      pig: 'assets/animals/pig.png',
      sheep: 'assets/animals/sheep.png',
      baby_chick: 'assets/animals/baby_chick.png',
      // Crops & Items
      plants: 'assets/crops/plants.png',
      items: 'assets/crops/items.png',
      // Tiles & Furniture
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
      furniture: 'assets/furniture/furniture.png'
    };

    let loadedCount = 0;
    const total = Object.keys(toLoad).length;

    for (const [key, src] of Object.entries(toLoad)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.assets[key] = img;
        loadedCount++;
        if (loadedCount >= total) {
          this.assetsLoaded = true;
          if (callback) callback();
        }
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

      if (window.innerWidth < 600) {
        this.camera.scale = 2.4;
      } else if (window.innerWidth < 1200) {
        this.camera.scale = 3.0;
      } else {
        this.camera.scale = 3.4;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      this.keys[e.key.toLowerCase()] = true;

      // Tool shortcuts (1-7)
      if (e.key === '1') this.selectTool('hoe');
      if (e.key === '2') this.selectTool('water');
      if (e.key === '3') this.selectTool('seed_carrot');
      if (e.key === '4') this.selectTool('seed_strawberry');
      if (e.key === '5') this.selectTool('seed_tomato');
      if (e.key === '6') this.selectTool('fishing_rod');
      if (e.key === '7') this.selectTool('flower');

      // Action / Use Tool (Space or J)
      if (e.key === ' ' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        this.performToolAction();
      }

      // Interact (E or K)
      if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'k') {
        this.performInteractAction();
      }

      // Kiss / Hug partner shortcut (H)
      if (e.key.toLowerCase() === 'h') {
        this.triggerCoupleKiss(false);
      }

      // Open Chat (C)
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
    // Enable direct clicking/tapping on tiles, objects, and NPCs!
    const handleClick = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (clientX - rect.left) / this.camera.scale + this.camera.x;
      const clickY = (clientY - rect.top) / this.camera.scale + this.camera.y;

      const tx = Math.floor(clickX / 16);
      const ty = Math.floor(clickY / 16);

      // Check click on NPC
      const npc = this.farm.npcs.find(n => Math.hypot(n.x - tx, n.y - ty) <= 1.5);
      if (npc && this.farm.currentLocation === 'farm') {
        this.openNPCDialog(npc);
        return;
      }

      // Check click near player -> perform tool/interact on clicked tile
      const playerTx = Math.floor((this.player.x + 16) / 16);
      const playerTy = Math.floor((this.player.y + 24) / 16);
      if (Math.hypot(playerTx - tx, playerTy - ty) <= 2.5) {
        this.performActionOnTile(tx, ty);
      }
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
      center = {
        x: baseRect.left + baseRect.width / 2,
        y: baseRect.top + baseRect.height / 2
      };
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
          const clampedDist = Math.min(dist, maxRadius);
          const stickX = Math.cos(angle) * clampedDist;
          const stickY = Math.sin(angle) * clampedDist;

          joyStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
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

    // Touch Buttons
    const btnAction = document.getElementById('btnAction');
    const btnInteract = document.getElementById('btnInteract');
    const btnEmote = document.getElementById('btnEmote');
    const btnToolCycle = document.getElementById('btnToolCycle');

    if (btnAction) {
      btnAction.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.performToolAction();
      });
    }
    if (btnInteract) {
      btnInteract.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.performInteractAction();
      });
    }
    if (btnEmote) {
      btnEmote.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.showEmote('❤️');
      });
    }
    if (btnToolCycle) {
      btnToolCycle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.cycleNextTool();
      });
    }
  }

  // --- Tool Selection ---
  selectTool(toolId) {
    // Check if tool is unlocked
    if (toolId === 'fishing_rod' && !this.farm.unlockedTools.fishing_rod) {
      this.showNotification('Alat pancing belum dibeli! Beli di Paman Sam di dermaga 🎣');
      return;
    }
    this.player.selectedTool = toolId;
    document.querySelectorAll('.hotbar-slot').forEach(slot => {
      slot.classList.toggle('active', slot.dataset.tool === toolId);
    });
  }

  cycleNextTool() {
    const tools = ['hoe', 'water', 'seed_carrot', 'seed_strawberry', 'seed_tomato', 'fishing_rod', 'flower'];
    const idx = tools.indexOf(this.player.selectedTool);
    const nextTool = tools[(idx + 1) % tools.length];
    this.selectTool(nextTool);
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

  // --- Contextual Prompt Calculation ---
  updateActivePrompt() {
    const { tx, ty } = this.getTargetTileCoords();
    const px = this.player.x + 16;
    const py = this.player.y + 20;

    // 1. Inside House prompts
    if (this.farm.currentLocation === 'house') {
      if (Math.hypot(px - (this.farm.houseExitDoor.x * 16 + 8), py - (this.farm.houseExitDoor.y * 16 + 8)) < 24) {
        this.activePrompt = { text: 'Keluar Rumah [E] 🚪', action: () => this.exitHouse() };
        return;
      }
      if (Math.hypot(px - (3 * 16 + 8), py - (3 * 16 + 8)) < 32) {
        this.activePrompt = { text: 'Tidur Bersama di Ranjang [E] 🛏️', action: () => this.sleepInBed() };
        return;
      }
      this.activePrompt = null;
      return;
    }

    // 2. Outdoor Farm Prompts
    // House Door Entrance (23, 8)
    if (Math.hypot(px - (23 * 16 + 8), py - (8 * 16 + 8)) < 24) {
      this.activePrompt = { text: 'Masuk Rumah [E] 🏡', action: () => this.enterHouse() };
      return;
    }

    // NPC Check
    const nearestNPC = this.farm.npcs.find(n => Math.hypot(n.x * 16 + 8 - px, n.y * 16 + 8 - py) < 32);
    if (nearestNPC) {
      this.activePrompt = { text: `Bicara dengan ${nearestNPC.name.split(' ')[0]} [E] 💬`, action: () => this.openNPCDialog(nearestNPC) };
      return;
    }

    // Chest & Sell Bin
    const targetTile = this.farm.grid[ty] && this.farm.grid[ty][tx];
    if (targetTile && targetTile.type === 'chest') {
      this.activePrompt = { text: 'Buka Peti Bersama [E] 📦', action: () => this.openChestModal() };
      return;
    }
    if (targetTile && targetTile.type === 'sell_bin') {
      this.activePrompt = { text: 'Jual Semua Panen [E] 🪙', action: () => this.sellProduce() };
      return;
    }

    // Fishing spot (near water with rod)
    if (this.player.selectedTool === 'fishing_rod' && targetTile && targetTile.type === 'water') {
      this.activePrompt = { text: 'Mulai Memancing [E] 🎣', action: () => this.startFishing() };
      return;
    }

    // Animal check
    const animal = this.animalManager.getNearestAnimal(px, py, 32);
    if (animal) {
      this.activePrompt = { text: `Elus ${animal.name} [E] ❤️`, action: () => animal.pet() };
      return;
    }

    // Ripe crop harvest
    if (targetTile && targetTile.crop && targetTile.crop.ready) {
      this.activePrompt = { text: 'Petik Panen [E] 🧺', action: () => this.harvestTile(tx, ty) };
      return;
    }

    // Farmland prompt
    if (targetTile && targetTile.type === 'farmland' && !targetTile.watered) {
      this.activePrompt = { text: 'Siram Tanah [Spasi] 💧', action: () => this.waterTile(tx, ty) };
      return;
    }

    this.activePrompt = null;
  }

  // --- House Transitions ---
  enterHouse() {
    this.farm.currentLocation = 'house';
    this.player.x = 9 * 16;
    this.player.y = 12 * 16;
    this.showNotification('Masuk ke dalam rumah bersama... Sangat nyaman! 🏡❤️');
    this.network.send({ type: 'location_change', location: 'house' });
  }

  exitHouse() {
    this.farm.currentLocation = 'farm';
    this.player.x = 23 * 16;
    this.player.y = 9 * 16;
    this.showNotification('Keluar ke kebun yang asri! 🌾☀️');
    this.network.send({ type: 'location_change', location: 'farm' });
  }

  sleepInBed() {
    this.farm.sleepTogether();
    this.showNotification('Kalian tidur berdua dengan nyenyak... Selamat pagi! ☀️🛏️');
    this.network.send({ type: 'action_sleep' });
    this.updateHUD();
  }

  // --- Tool / Action Execution ---
  performToolAction() {
    const { tx, ty } = this.getTargetTileCoords();
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

  // --- Fishing ---
  startFishing() {
    if (this.player.isFishing) {
      // Reeling in!
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
        <button class="btn btn-primary" onclick="game.openStoreModal('seeds')">🌱 Belanja Bibit Tanaman</button>
        <button class="btn btn-secondary" onclick="game.openStoreModal('furniture')">🪑 Belanja Perabotan Rumah</button>
      `;
    } else if (npc.role === 'rancher') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="game.openStoreModal('animals')">🐮 Beli Hewan Ternak</button>
      `;
    } else if (npc.role === 'fisher') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" onclick="game.buyFishingRod()">🎣 Beli Alat Pancing Bambu (60 🪙)</button>
        <button class="btn btn-secondary" onclick="game.sellProduce()">🪙 Jual Hasil Ikan</button>
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
      document.getElementById('storeTitle').textContent = '🪑 Toko Perabot Rumah';
      container.innerHTML = Object.entries(FURNITURE_DEFINITIONS).filter(([id, d]) => d.price > 0).map(([id, def]) => `
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
        { type: 'baby_chick', name: 'Anak Ayam Kuning 🐥', price: 40, desc: 'Tumbuh menjadi ayam penghasil telur.' },
        { type: 'chicken', name: 'Ayam Petelur 🐔', price: 80, desc: 'Menghasilkan telur emas berkilau.' },
        { type: 'sheep', name: 'Domba Wol 🐑', price: 140, desc: 'Menghasilkan wol rajut lembut.' },
        { type: 'pig', name: 'Babi Lucu 🐷', price: 160, desc: 'Mencari jamur truffle berharga.' },
        { type: 'cow', name: 'Sapi Perah 🐮', price: 220, desc: 'Menghasilkan susu segar kaya kalsium.' }
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
    }

    store.classList.remove('hidden');
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

  buyFurnitureItem(furnId) {
    const ok = this.farm.buyFurniture(furnId);
    if (ok) {
      this.showNotification(`Perabotan baru dipasang di dalam rumahmu! 🏡✨`);
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

  // --- Couple Interactions ---
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

  showNotification(text) {
    this.notifications.push({ text, time: 3.5 });
    if (this.notifications.length > 4) this.notifications.shift();
  }

  // --- Game Loop ---
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

    // Fishing bite countdown
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

      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.dir = vx > 0 ? 'right' : 'left';
      } else {
        this.player.dir = vy > 0 ? 'down' : 'up';
      }

      const footTileX = Math.floor((nx + 16) / 16);
      const footTileY = Math.floor((ny + 24) / 16);

      if (!this.farm.isCollidable(footTileX, footTileY, this.farm.currentLocation)) {
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

    // Action timer
    if (this.player.actionTimer > 0) {
      this.player.actionTimer -= delta;
      if (this.player.actionTimer <= 0) this.player.currentAction = 'idle';
    }

    // Emotes timer
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

    const maxW = (this.farm.currentLocation === 'farm' ? this.farm.cols : this.farm.houseWidth) * 16;
    const maxH = (this.farm.currentLocation === 'farm' ? this.farm.rows : this.farm.houseHeight) * 16;
    this.camera.x = Math.max(0, Math.min(maxW - this.canvas.width / this.camera.scale, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxH - this.canvas.height / this.camera.scale, this.camera.y));

    // Update particles
    this.fireflies.forEach(f => {
      f.x += f.vx * delta;
      f.y += f.vy * delta;
      f.alpha += f.da;
      if (f.alpha >= 1 || f.alpha <= 0.1) f.da = -f.da;
      if (f.x < 0) f.x = maxW;
      if (f.x > maxW) f.x = 0;
      if (f.y < 0) f.y = maxH;
      if (f.y > maxH) f.y = 0;
    });

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.y += s.vy * delta;
      s.life -= delta;
      s.alpha = s.life;
      if (s.life <= 0) this.sparkles.splice(i, 1);
    }

    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.time -= delta;
      if (n.time <= 0) this.notifications.splice(i, 1);
    }

    // Update Contextual Action Prompt
    this.updateActivePrompt();
  }

  // --- Rendering ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    if (this.farm.currentLocation === 'house') {
      this.renderHouseInterior();
    } else {
      this.renderOutdoorWorld();
    }

    this.ctx.restore();

    this.renderUIOverlays();
  }

  renderOutdoorWorld() {
    const imgGrass = this.assets.grass;
    const imgPath = this.assets.path;
    const imgWater = this.assets.water;
    const imgFarmland = this.assets.farmland;
    const imgFences = this.assets.fences;
    const imgChest = this.assets.chest;
    const imgBridge = this.assets.bridge;
    const imgHouse = this.assets.house;
    const imgPlants = this.assets.plants;

    // Ground Layer
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

    // Bridge over water
    if (imgBridge) {
      this.ctx.drawImage(imgBridge, 0, 0, 48, 24, 36 * 16, 20 * 16 - 4, 48, 24);
    }

    // Objects Layer
    for (let y = 0; y < this.farm.rows; y++) {
      for (let x = 0; x < this.farm.cols; x++) {
        const tile = this.farm.grid[y][x];
        const px = x * 16;
        const py = y * 16;

        if (tile.type === 'fence' && imgFences) {
          this.ctx.drawImage(imgFences, 16, 16, 16, 16, px, py, 16, 16);
        }
        if (tile.type === 'chest' && imgChest) {
          this.ctx.drawImage(imgChest, px, py, 16, 16);
        }
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
            const cropRow = def.plantRow;
            const stageCol = Math.min(4, tile.crop.stage);
            this.ctx.drawImage(imgPlants, stageCol * 16, cropRow * 16, 16, 16, px, py, 16, 16);
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

    // House exterior
    if (imgHouse) {
      this.ctx.drawImage(imgHouse, 20 * 16, 3 * 16 - 16, 96, 112);
    }

    // Entities (Sorted by Y)
    const entities = [];

    // Trees
    const trees = [
      [18, 4], [27, 4], [13, 3], [14, 10], [33, 4], [34, 9], [34, 15],
      [3, 16], [3, 21], [3, 27], [33, 26], [34, 29]
    ];
    trees.forEach(([tx, ty]) => {
      entities.push({
        y: ty * 16 + 16,
        render: () => {
          if (this.assets.tree) {
            this.ctx.drawImage(this.assets.tree, tx * 16 - 24, ty * 16 - 64, 64, 80);
          }
        }
      });
    });

    // NPCs
    this.farm.npcs.forEach(npc => {
      entities.push({
        y: npc.y * 16 + 16,
        render: () => {
          const img = this.assets[npc.role === 'merchant' ? 'npc_merchant' : (npc.role === 'rancher' ? 'npc_rancher' : 'npc_fisher')];
          if (img) {
            this.ctx.drawImage(img, 0, 0, 32, 32, npc.x * 16 - 8, npc.y * 16 - 12, 32, 32);
          }
          // Name tag
          this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
          this.ctx.beginPath();
          this.ctx.roundRect(npc.x * 16 - 20, npc.y * 16 - 20, 56, 12, 4);
          this.ctx.fill();
          this.ctx.fillStyle = '#fff';
          this.ctx.font = 'bold 8px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(npc.name.split(' ')[0], npc.x * 16 + 8, npc.y * 16 - 11);
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
            a.hearts.forEach(h => {
              this.ctx.font = '10px sans-serif';
              this.ctx.fillText('❤️', h.x, h.y);
            });
          }
        }
      });
    });

    // Bots (Only if hired!)
    this.botManager.bots.forEach(b => {
      if (!b.isUnlocked()) return;
      entities.push({
        y: b.y + 24,
        render: () => {
          const img = b.type === 'boni' ? this.assets.bot_boni : this.assets.bot_slime;
          if (img) {
            this.ctx.save();
            let row = b.isMoving ? 3 : 0;
            if (b.type === 'slime') row = b.isMoving ? 1 : 0;
            this.ctx.drawImage(img, b.frame * 32, row * 32, 32, 32, b.x, b.y, 32, 32);
            this.ctx.restore();
            if (b.bubbleText) {
              this.renderSpeechBubble(b.x + 16, b.y - 8, b.bubbleText, '#2ed573');
            }
          }
        }
      });
    });

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

    // Day / Night Atmosphere
    this.renderAtmosphere();
  }

  // --- Render House Interior ---
  renderHouseInterior() {
    const insideTiles = this.assets.interior_tiles;
    const furnImg = this.assets.furniture;

    // Floor & Walls
    for (let y = 0; y < this.farm.houseHeight; y++) {
      for (let x = 0; x < this.farm.houseWidth; x++) {
        const px = x * 16;
        const py = y * 16;
        const cell = this.farm.houseGrid[y][x];

        if (cell.type === 'indoor_wall') {
          this.ctx.fillStyle = '#5c3a21';
          this.ctx.fillRect(px, py, 16, 16);
          this.ctx.fillStyle = '#8e5431';
          this.ctx.fillRect(px + 1, py + 1, 14, 14);
        } else {
          // Warm wooden floor
          this.ctx.fillStyle = '#e5b982';
          this.ctx.fillRect(px, py, 16, 16);
          this.ctx.fillStyle = '#d4a366';
          this.ctx.fillRect(px + 1, py + 1, 14, 14);
        }

        // Furniture
        if (cell.furniture) {
          if (cell.furniture === 'bed_double') {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(px + 2, py + 2, 28, 24);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(px + 4, py + 4, 10, 8);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '8px sans-serif';
            this.ctx.fillText('🛏️', px + 4, py + 18);
          } else if (cell.furniture === 'fireplace') {
            this.ctx.fillStyle = '#7f8c8d';
            this.ctx.fillRect(px, py, 20, 16);
            this.ctx.fillStyle = '#e67e22';
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText('🔥', px + 4, py + 12);
          } else if (cell.furniture === 'table_dining') {
            this.ctx.fillStyle = '#8e44ad';
            this.ctx.fillRect(px + 2, py + 4, 20, 12);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '9px sans-serif';
            this.ctx.fillText('🪑', px + 6, py + 14);
          } else {
            const def = FURNITURE_DEFINITIONS[cell.furniture];
            if (def) {
              this.ctx.font = '12px sans-serif';
              this.ctx.fillText(def.icon, px + 2, py + 12);
            }
          }
        }
      }
    }

    // Doorway carpet
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(9 * 16, 13 * 16, 16, 16);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '8px sans-serif';
    this.ctx.fillText('🚪 KELUAR', 9 * 16 - 8, 13 * 16 + 12);

    // Characters in house
    this.renderCharacter(this.player, true);
    if (this.partner.active && this.partner.location === 'house') {
      this.renderCharacter(this.partner, false);
    }
  }

  renderCharacter(char, isLocal) {
    const img = char.role === 'girl' ? this.assets.player_girl : this.assets.player_boy;
    if (!img) return;

    this.ctx.save();
    let row = 0;
    if (char.currentAction === 'action') {
      row = char.dir === 'down' ? 6 : (char.dir === 'up' ? 8 : 7);
    } else if (char.isMoving) {
      row = char.dir === 'down' ? 3 : (char.dir === 'up' ? 5 : 4);
    } else {
      row = char.dir === 'down' ? 0 : (char.dir === 'up' ? 2 : 1);
    }

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

    // Fishing line
    if (char.isFishing) {
      this.ctx.strokeStyle = '#ecf0f1';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(char.x + 16, char.y + 16);
      this.ctx.lineTo(char.x + 36, char.y + 28);
      this.ctx.stroke();
    }

    // Name tag
    this.ctx.save();
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.textAlign = 'center';
    const nameText = `${char.name} ${char.role === 'girl' ? '🌸' : '🌱'}`;
    const tw = this.ctx.measureText(nameText).width;
    this.ctx.fillStyle = isLocal ? 'rgba(0, 0, 0, 0.55)' : 'rgba(235, 77, 75, 0.75)';
    this.ctx.beginPath();
    this.ctx.roundRect(char.x + 16 - tw / 2 - 4, char.y - 6, tw + 8, 12, 4);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(nameText, char.x + 16, char.y + 3);

    if (char.emote) {
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText(char.emote, char.x + 16, char.y - 12);
    }
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

    if (timeInfo.phase === 'night') {
      this.fireflies.forEach(f => {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(241, 196, 15, ${f.alpha})`;
        this.ctx.shadowColor = '#f1c40f';
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
    }
  }

  renderUIOverlays() {
    // 1. Contextual Action Prompt Banner at bottom center of screen
    if (this.activePrompt) {
      this.ctx.save();
      this.ctx.font = 'bold 13px sans-serif';
      const text = this.activePrompt.text;
      const tw = this.ctx.measureText(text).width;
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height - (window.innerWidth < 900 ? 175 : 85);

      this.ctx.fillStyle = 'rgba(255, 234, 167, 0.95)';
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

    // 2. Screen notifications
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

  // --- Network Callbacks ---
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

  // --- HUD Updates ---
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

    // Check Fishing rod slot visibility
    const slotFish = document.querySelector('.hotbar-slot[data-tool="fishing_rod"]');
    if (slotFish) {
      if (this.farm.unlockedTools.fishing_rod) {
        slotFish.style.opacity = '1';
        slotFish.title = 'Alat Pancing';
      } else {
        slotFish.style.opacity = '0.4';
        slotFish.title = 'Terkunci! Beli di Paman Sam (60 🪙)';
      }
    }
  }

  setupHUDButtons() {
    const btnSound = document.getElementById('btnToggleSound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        window.soundSystem.init();
        const muted = window.soundSystem.toggleMute();
        btnSound.textContent = muted ? '🔇' : '🔊';
      });
    }

    const btnMusic = document.getElementById('btnToggleMusic');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        window.soundSystem.init();
        const on = window.soundSystem.toggleBGM();
        btnMusic.textContent = on ? '🎵' : '🔇';
      });
    }

    const btnBots = document.getElementById('btnOpenBots');
    if (btnBots) {
      btnBots.addEventListener('click', () => {
        document.getElementById('modalBots').classList.remove('hidden');
      });
    }

    const btnChest = document.getElementById('btnOpenChest');
    if (btnChest) {
      btnChest.addEventListener('click', () => this.openChestModal());
    }

    const btnSave = document.getElementById('btnOpenSave');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        document.getElementById('modalSave').classList.remove('hidden');
      });
    }

    const btnPhoto = document.getElementById('btnTakePic');
    if (btnPhoto) {
      btnPhoto.addEventListener('click', () => this.capturePolaroid());
    }

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
