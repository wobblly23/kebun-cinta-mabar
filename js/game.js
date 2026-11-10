// js/game.js - Complete Romantic Farming Engine with Sunnyside Crops, Rich Particles, Smooth Housing & Combat

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.farm = new FarmManager(48, 32, 16);
    this.botManager = new BotManager(this.farm);
    this.animalManager = new AnimalManager(this.farm);
    this.network = new NetworkManager(this);

    this.camera = { x: 0, y: 0, scale: 2.4 };

    // Local Player State
    this.player = {
      name: 'Zahy',
      role: 'boy',
      x: 24 * 16,
      y: 10 * 16,
      dir: 'down',
      speed: 84,
      isMoving: false,
      currentAction: 'idle',
      actionTimer: 0,
      slashTimer: 0,
      animTimer: 0,
      animFrame: 0,
      selectedTool: 'hoe',
      emote: null,
      emoteTimer: 0,
      isFishing: false,
      fishingTimer: 0,
      fishingBite: false,
      fishingRipples: []
    };

    // Pet Follower
    this.pet = {
      x: 24 * 16 - 20,
      y: 10 * 16,
      dir: 'right',
      anim: 0,
      isMoving: false
    };

    // Remote Partner State
    this.partner = {
      active: false,
      name: 'Aurel',
      role: 'girl',
      x: 25 * 16,
      y: 10 * 16,
      dir: 'down',
      isMoving: false,
      currentAction: 'idle',
      animFrame: 0,
      emote: null,
      emoteTimer: 0,
      location: 'farm',
      isFishing: false
    };

    this.assets = {};
    this.keys = {};
    this.touchJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

    // Rich Particle & Visual Effects Engine
    this.particles = [];
    this.floatingTexts = [];
    this.notifications = [];
    this.activePrompt = null;
    this.furnitureEditMode = false;
    this.selectedFurnToPlace = null;
    this.screenFlashRed = 0;
    this.screenFlashGreen = 0;
    this.screenFadeBlack = 0;
    this.chatMinimized = false;

    // Romantic Night Fireflies
    this.fireflies = [];
    for (let i = 0; i < 30; i++) {
      this.fireflies.push({
        x: Math.random() * 48 * 16,
        y: Math.random() * 32 * 16,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.lastTime = 0;
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
      pet_duck: 'assets/pets/pet_duck.png',
      pet_bird: 'assets/pets/pet_bird.png',
      pet_piggy: 'assets/pets/pet_piggy.png',
      pet_sheep: 'assets/pets/pet_sheep.png',
      pet_bunny: 'assets/pets/pet_bunny.png',
      pet_slime: 'assets/pets/pet_slime.png',
      // Monsters
      slime_monster: 'assets/monsters/slime_monster.png',
      skeleton_monster: 'assets/monsters/skeleton_monster.png',
      // Woods Environment & Resources
      woods_tree_big: 'assets/woods/tree_big.png',
      woods_tree_small: 'assets/woods/tree_small.png',
      woods_rock: 'assets/woods/rock_large.png',
      woods_rock_small: 'assets/woods/rock_mossy.png',
      woods_crystal_ore: 'assets/woods/crystal_ore.png',
      woods_log: 'assets/woods/log_fallen.png',
      woods_stump: 'assets/woods/stump.png',
      woods_shroom_blue: 'assets/woods/shroom_blue_strip4.png',
      woods_shroom_red: 'assets/woods/shroom_red_strip4.png',
      woods_ancient_altar: 'assets/woods/ancient_altar.png',
      // Terrain & Buildings
      grass: 'assets/tiles/grass.png',
      farmland: 'assets/tiles/farmland.png',
      path: 'assets/tiles/path.png',
      water: 'assets/tiles/water.png',
      house_blue: 'assets/buildings/house_blue.png',
      house_red: 'assets/buildings/house_red.png',
      tree: 'assets/tiles/tree.png',
      fences: 'assets/tiles/fences.png',
      bridge_horizontal: 'assets/decor/bridge_horizontal.png',
      boat: 'assets/decor/boat.png',
      chest: 'assets/tiles/chest.png',
      floor_wood: 'assets/tiles/floor_wood.png',
      wall_wood: 'assets/tiles/wall_wood.png',
      mystic_grass: 'assets/tiles/mystic_grass.png',
      // Clean Transparent Environment Decor & Resources
      rock_node: 'assets/decor/rock_node.png',
      log_wood: 'assets/decor/log_wood.png',
      stump: 'assets/decor/stump.png',
      well: 'assets/decor/well.png',
      scarecrow: 'assets/decor/scarecrow.png',
      hay_bale: 'assets/decor/hay_bale.png',
      trough: 'assets/decor/trough.png',
      water_lilies: 'assets/decor/water_lilies.png',
      water_rocks: 'assets/decor/water_rocks.png',
      bush_flowers: 'assets/decor/bush_flowers.png',
      // Real Furniture
      bed_double: 'assets/furniture/bed_double.png',
      dining_table: 'assets/furniture/dining_table.png',
      fireplace: 'assets/furniture/fireplace.png',
      sofa: 'assets/furniture/sofa.png',
      bookshelf: 'assets/furniture/bookshelf.png',
      cabinet: 'assets/furniture/cabinet.png',
      plant: 'assets/furniture/plant.png',
      rug: 'assets/furniture/rug.png',
      anvil: 'assets/furniture/anvil.png',
      barrel_swords: 'assets/furniture/barrel_swords.png',
      crate_merchant: 'assets/furniture/crate_merchant.png',
      wall_wood_top: 'assets/tiles/wall_wood_top.png',
      // Authentic Pixel Tools In-Hand
      tool_hoe: 'assets/tools/tool_hoe.png',
      tool_water: 'assets/tools/tool_water.png',
      tool_axe: 'assets/tools/tool_axe.png',
      tool_pickaxe: 'assets/tools/tool_pickaxe.png',
      tool_sword: 'assets/tools/tool_sword.png',
      tool_rod: 'assets/tools/tool_rod.png'
    };

    // Load Sunnyside Individual Stage Sprites for 8 Crops (00 to 05)
    const cropTypes = ['carrot', 'potato', 'cabbage', 'beetroot', 'cauliflower', 'pumpkin', 'radish', 'wheat'];
    cropTypes.forEach(c => {
      for (let s = 0; s <= 5; s++) {
        toLoad[`crop_${c}_${s}`] = `assets/crops_sunnyside/${c}_0${s}.png`;
      }
    });

    let loadedCount = 0;
    const total = Object.keys(toLoad).length;

    for (const [key, src] of Object.entries(toLoad)) {
      const img = new Image();
      img.src = `${src}?v=20261109_8`;
      img.onload = () => {
        this.assets[key] = img;
        loadedCount++;
        if (loadedCount >= total && callback) callback();
      };
      img.onerror = () => {
        console.warn('Gagal memuat asset:', src);
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
    this.renderHotbar(); // Render dynamic 5 slots hotbar on startup!

    requestAnimationFrame((t) => this.loop(t));
  }

  setupResize() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.camera.scale = window.innerWidth < 768 ? 2.0 : 2.5;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

      this.keys[e.key.toLowerCase()] = true;

      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 5) {
        this.selectHotbarIndex(keyNum - 1);
      }

      if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i') {
        this.toggleInventoryModal();
      }

      if (e.key === ' ' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        this.performToolAction();
      }

      if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
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
          } else {
            this.showNotification('Tidak bisa meletakkan di sini (menghalangi pintu/dinding)!');
          }
        } else {
          const ok = this.farm.removeFurnitureMC(tx, ty);
          if (ok) {
            this.showNotification('Perabotan disimpan kembali ke tas! 📦');
            this.updateFurnitureUI();
          }
        }
        return;
      }

      const ptx = Math.floor((this.player.x + 16) / 16);
      const pty = Math.floor((this.player.y + 24) / 16);
      if (Math.abs(ptx - tx) <= 2 && Math.abs(pty - ty) <= 2) {
        const activeTool = this.farm.hotbar[this.farm.activeHotbarIndex] || this.player.selectedTool;
        this.performActionOnTile(tx, ty, activeTool);
      }
    };

    this.canvas.addEventListener('click', (e) => handleClick(e.clientX, e.clientY));
  }

  setupTouchControls() {
    const joyBase = document.getElementById('joystickBase');
    const joyStick = document.getElementById('joystickStick');
    if (!joyBase || !joyStick) return;

    let touchId = null;

    joyBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = joyBase.getBoundingClientRect();
      this.touchJoystick.active = true;
      this.touchJoystick.startX = rect.left + rect.width / 2;
      this.touchJoystick.startY = rect.top + rect.height / 2;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.touchJoystick.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - this.touchJoystick.startX;
          const dy = touch.clientY - this.touchJoystick.startY;
          const dist = Math.hypot(dx, dy);
          const maxDist = 38;
          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxDist);

          const sx = Math.cos(angle) * clampedDist;
          const sy = Math.sin(angle) * clampedDist;
          joyStick.style.transform = `translate(${sx}px, ${sy}px)`;

          this.touchJoystick.dx = sx / maxDist;
          this.touchJoystick.dy = sy / maxDist;
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
          joyStick.style.transform = `translate(0px, 0px)`;
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

  // --- EXACTLY 5-SLOT HOTBAR & INVENTORY BAG SYSTEM ---
  renderHotbar() {
    const container = document.getElementById('hotbarSlots');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 5; i++) {
      const itemId = this.farm.hotbar[i];
      const itemDef = itemId ? (window.ITEM_CATALOG[itemId] || { name: itemId, icon: '📦' }) : null;
      const count = itemId ? (this.farm.inventory[itemId] || 0) : 0;
      const isActive = i === this.farm.activeHotbarIndex;

      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${isActive ? 'active' : ''}`;
      slot.dataset.slotIndex = i;
      slot.dataset.itemId = itemId || '';
      slot.title = itemDef ? `${itemDef.name} [${i + 1}]` : `Slot ${i + 1} (Kosong - Pasang lewat Tas [B])`;

      // Allow dragging between hotbar slots
      slot.draggable = !!itemId;
      slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'hotbar', fromIndex: i, itemId }));
      });
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.source === 'hotbar') {
            this.farm.swapHotbarSlots(data.fromIndex, i);
          } else if (data.source === 'inventory') {
            this.farm.equipHotbarSlot(i, data.itemId);
          }
          this.renderHotbar();
          if (this.isInventoryOpen) this.renderInventoryModal();
        } catch (err) {}
      });

      slot.onclick = () => this.selectHotbarIndex(i);

      slot.innerHTML = `
        <span class="key-hint">${i + 1}</span>
        <span class="slot-icon">${itemDef ? itemDef.icon : '➕'}</span>
        <span class="slot-name">${itemDef ? itemDef.name.split(' ')[0] : 'Kosong'}</span>
        ${count > 1 ? `<span class="slot-badge">${count}</span>` : ''}
      `;
      container.appendChild(slot);
    }

    const activeItem = this.farm.hotbar[this.farm.activeHotbarIndex];
    this.player.selectedTool = activeItem || '';
  }

  selectHotbarIndex(idx) {
    if (idx < 0 || idx >= 5) return;
    this.farm.activeHotbarIndex = idx;
    const item = this.farm.hotbar[idx];
    this.player.selectedTool = item || '';
    this.renderHotbar();
    if (this.isInventoryOpen) this.renderInventoryModal();

    if (item && window.ITEM_CATALOG[item]) {
      const def = window.ITEM_CATALOG[item];
      this.showNotification(`Memegang: ${def.icon} ${def.name}`);
    }
  }

  cycleNextTool() {
    const nextIdx = (this.farm.activeHotbarIndex + 1) % 5;
    this.selectHotbarIndex(nextIdx);
  }

  toggleInventoryModal() {
    const modal = document.getElementById('modalInventory');
    if (!modal) return;
    this.isInventoryOpen = modal.classList.toggle('hidden') ? false : true;
    if (this.isInventoryOpen) {
      this.currentInvTab = this.currentInvTab || 'all';
      this.renderInventoryModal();
    }
  }

  switchInvTab(tabName) {
    this.currentInvTab = tabName;
    document.querySelectorAll('.inv-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    this.renderInventoryModal();
  }

  renderInventoryModal() {
    const previewContainer = document.getElementById('invHotbarPreview');
    const itemsList = document.getElementById('inventoryItemsList');
    if (!previewContainer || !itemsList) return;

    // 1. Render 5 Quick Hotbar Preview Slots (Drag & Drop Target / Click to unequip)
    previewContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const itemId = this.farm.hotbar[i];
      const itemDef = itemId ? (window.ITEM_CATALOG[itemId] || { name: itemId, icon: '📦' }) : null;
      const count = itemId ? (this.farm.inventory[itemId] || 0) : 0;
      const isActive = i === this.farm.activeHotbarIndex;

      const pSlot = document.createElement('div');
      pSlot.className = `inv-preview-slot ${isActive ? 'active-slot' : ''}`;
      pSlot.title = itemDef ? `${itemDef.name} - Klik untuk lepas dari slot sabuk` : `Slot ${i + 1} Kosong (Drag item ke sini)`;

      pSlot.addEventListener('dragover', (e) => { e.preventDefault(); pSlot.classList.add('drag-over'); });
      pSlot.addEventListener('dragleave', () => pSlot.classList.remove('drag-over'));
      pSlot.addEventListener('drop', (e) => {
        e.preventDefault();
        pSlot.classList.remove('drag-over');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.source === 'inventory') {
            this.farm.equipHotbarSlot(i, data.itemId);
          } else if (data.source === 'hotbar') {
            this.farm.swapHotbarSlots(data.fromIndex, i);
          }
          this.renderHotbar();
          this.renderInventoryModal();
        } catch (err) {}
      });

      pSlot.onclick = () => {
        if (itemId) {
          this.farm.hotbar[i] = null;
          this.renderHotbar();
          this.renderInventoryModal();
        } else {
          this.selectHotbarIndex(i);
        }
      };

      pSlot.innerHTML = `
        <span class="key-hint">${i + 1}</span>
        <span style="font-size:22px;">${itemDef ? itemDef.icon : '➕'}</span>
        <span style="font-size:9.5px; font-weight:700; color:#2f3542; margin-top:2px;">${itemDef ? itemDef.name.split(' ')[0] : 'Kosong'}</span>
        ${count > 1 ? `<span class="slot-badge">${count}</span>` : ''}
      `;
      previewContainer.appendChild(pSlot);
    }

    // 2. Render Bag Grid based on active Tab
    itemsList.innerHTML = '';
    const tab = this.currentInvTab || 'all';
    const entries = Object.entries(this.farm.inventory).filter(([k, v]) => v > 0);

    if (entries.length === 0) {
      itemsList.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#747d8c; padding:20px;">Tas masih kosong! Beli bibit di Toko Pak Budi atau mancing di dermaga ya~ 🎒</div>';
      return;
    }

    entries.forEach(([itemId, count]) => {
      const def = window.ITEM_CATALOG[itemId] || { id: itemId, name: itemId, icon: '📦', category: 'tools', desc: '' };

      if (tab !== 'all' && def.category !== tab) return;

      const isEquipped = this.farm.hotbar.includes(itemId);
      const card = document.createElement('div');
      card.className = 'inv-item-card';
      card.draggable = true;

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'inventory', itemId }));
      });

      let actionButtons = '';
      if (def.type === 'food' && def.heal) {
        actionButtons += `<button class="btn-eat-food" onclick="game.eatFoodAction('${itemId}')">Makan (+${def.heal} HP)</button>`;
      }
      actionButtons += `<button class="btn-equip-slot" onclick="game.equipItemToHotbar('${itemId}')">${isEquipped ? '✓ Terpasang' : '+ Pasang ke Sabuk'}</button>`;

      card.innerHTML = `
        <div class="inv-card-top">
          <span class="inv-card-icon">${def.icon}</span>
          <div class="inv-card-info">
            <span class="inv-card-name" title="${def.name}">${def.name}</span>
            <span class="inv-card-count">x${count}</span>
          </div>
        </div>
        <p class="inv-card-desc">${def.desc || ''}</p>
        <div class="inv-card-actions">
          ${actionButtons}
        </div>
      `;
      itemsList.appendChild(card);
    });
  }

  equipItemToHotbar(itemId) {
    const existingIdx = this.farm.hotbar.indexOf(itemId);
    if (existingIdx !== -1) {
      this.selectHotbarIndex(existingIdx);
      this.showNotification(`${window.ITEM_CATALOG[itemId]?.name || itemId} dipilih di Slot ${existingIdx + 1}!`);
      this.renderHotbar();
      this.renderInventoryModal();
      return;
    }

    let targetIdx = this.farm.activeHotbarIndex;
    if (this.farm.hotbar[targetIdx]) {
      const emptyIdx = this.farm.hotbar.findIndex(s => !s);
      if (emptyIdx !== -1) targetIdx = emptyIdx;
    }

    this.farm.equipHotbarSlot(targetIdx, itemId);
    this.selectHotbarIndex(targetIdx);
    this.renderHotbar();
    this.renderInventoryModal();
    this.showNotification(`${window.ITEM_CATALOG[itemId]?.name || itemId} dipasang ke Slot ${targetIdx + 1}! ✨`);
  }

  eatFoodAction(itemId) {
    const res = this.farm.eatFood(itemId);
    if (res) {
      if (window.soundSystem) window.soundSystem.playHarvest();
      this.screenFlashGreen = 0.25;
      this.showDamage(this.player.x + 16, this.player.y - 12, `+${res.healed} HP ❤️`, '#2ed573');
      this.showNotification(`Memakan ${res.name}! Memulihkan +${res.healed} HP! 😋❤️`);
      this.renderHotbar();
      if (this.isInventoryOpen) this.renderInventoryModal();
      this.updateHUD();
    }
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
    const py = this.player.y + 16;
    const loc = this.farm.currentLocation;

    if (loc === 'house_mc') {
      if (Math.hypot(px - (8 * 16 + 8), py - (11 * 16 + 8)) < 24) {
        this.activePrompt = { text: 'Keluar ke Desa [E] 🚪', action: () => this.teleport('farm', 24, 9) };
        return;
      }

      // Check contextual interaction with placed furniture pieces
      const nearFurn = this.farm.placedFurnitureMC.find(f => {
        const def = window.FURNITURE_DEFINITIONS[f.id] || { w: 2, h: 2 };
        const fcx = f.x * 16 + (def.w * 16) / 2;
        const fcy = f.y * 16 + (def.h * 16) / 2;
        return Math.hypot(px - fcx, py - fcy) < 28;
      });

      if (nearFurn) {
        if (nearFurn.id === 'bed_double') {
          this.activePrompt = { text: 'Tidur Berdua Menyambut Pagi [E] 🛏️❤️', action: () => this.sleepInBed() };
          return;
        }
        if (nearFurn.id === 'fireplace') {
          this.activePrompt = {
            text: `${nearFurn.lit === false ? 'Nyalakan' : 'Padamkan'} Perapian [E] 🔥`,
            action: () => {
              nearFurn.lit = nearFurn.lit === false ? true : false;
              this.showNotification(nearFurn.lit !== false ? '🔥 Perapian menyala hangat merekah!' : '💨 Perapian dipadamkan.');
              this.farm.autoSave();
            }
          };
          return;
        }
        if (nearFurn.id === 'sofa') {
          this.activePrompt = {
            text: 'Duduk Santai di Sofa [E] 🛋️',
            action: () => {
              this.player.emote = '💖';
              this.player.emoteTimer = 3.0;
              this.farm.playerHp = Math.min(this.farm.playerMaxHp, this.farm.playerHp + 15);
              this.showNotification('Duduk santai di sofa empuk... tenaga & cinta bertambah! (+15 HP) 🛋️✨');
              this.updateHUD();
            }
          };
          return;
        }
        if (nearFurn.id === 'dining_table' || nearFurn.id === 'table_small') {
          this.activePrompt = {
            text: 'Santap Makanan di Meja [E] 🍽️',
            action: () => {
              const currentItem = this.farm.hotbar[this.farm.activeHotbarIndex];
              const itemDef = window.ITEM_CATALOG[currentItem];
              if (itemDef && itemDef.type === 'food') {
                const res = this.farm.eatCrop(currentItem);
                if (res && !res.full) {
                  this.farm.playerHp = Math.min(this.farm.playerMaxHp, this.farm.playerHp + 10);
                  this.farm.lovePoints += 5;
                  this.showNotification(`Santap lezat ${res.def.name} di meja makan! Bonus (+${res.percent}% + 10 HP & +5 Cinta) 🍽️💖`);
                  this.floatingTexts.push({ x: px, y: py - 12, text: `+${res.percent}% HP & +5 Cinta 💖`, color: '#ff4757', life: 1.5 });
                  this.updateHUD();
                } else if (res && res.full) {
                  this.showNotification('Darahmu sudah penuh! 🍽️❤️');
                }
              } else {
                this.showNotification('Pilih makanan dari hotbar (wortel/ikan/telur/susu) untuk disantap di meja makan! 🥕🍲');
              }
            }
          };
          return;
        }
        if (nearFurn.id === 'bookshelf') {
          this.activePrompt = {
            text: 'Baca Buku Panduan Desa [E] 📚',
            action: () => this.openHandbookModal()
          };
          return;
        }
        if (nearFurn.id === 'cabinet') {
          this.activePrompt = {
            text: 'Buka Lemari Penyimpanan [E] 🗄️',
            action: () => this.openChestModal()
          };
          return;
        }
        if (nearFurn.id === 'plant') {
          this.activePrompt = {
            text: 'Siram Tanaman Hias [E] 🪴',
            action: () => {
              this.showNotification('🪴 Daun monstera disiram segar... rumah semakin asri!');
              this.floatingTexts.push({ x: px, y: py - 10, text: '🪴 +1 Cinta', color: '#2ed573', life: 1.2 });
              this.farm.lovePoints += 1;
              this.updateHUD();
            }
          };
          return;
        }
      }

      this.activePrompt = { text: 'Atur / Beli Perabotan Rumah [E] 🪑🛒', action: () => this.toggleFurnitureEdit() };
      return;
    }

    if (loc.startsWith('house_')) {
      const room = loc === 'house_budi' ? this.farm.houseBudi : (loc === 'house_siti' ? this.farm.houseSiti : this.farm.houseBlacksmith);
      const exitDoor = loc === 'house_budi' ? { x: 9, y: 25 } : (loc === 'house_siti' ? { x: 18, y: 25 } : { x: 27, y: 25 });
      if (Math.hypot(px - (room.door.x * 16 + 8), py - (room.door.y * 16 + 8)) < 24) {
        this.activePrompt = { text: 'Keluar ke Desa [E] 🚪', action: () => this.teleport('farm', exitDoor.x, exitDoor.y) };
        return;
      }
      this.activePrompt = null;
      return;
    }

    if (loc === 'woods') {
      if (Math.hypot(px - (2 * 16 + 8), py - (15 * 16 + 8)) < 28) {
        this.activePrompt = { text: 'Kembali ke Desa Damai [E] 🏡', action: () => this.teleport('farm', 44, 2) };
        return;
      }
      const nearMonster = this.farm.monsters.find(m => Math.hypot(m.x - px, m.y - py) < 38);
      if (nearMonster) {
        this.activePrompt = { text: `Tebas ${nearMonster.type.toUpperCase()} [Spasi] ⚔️`, action: () => this.performToolAction() };
        return;
      }
      this.activePrompt = null;
      return;
    }

    // Outdoor Village
    if (Math.hypot(px - (45 * 16 + 8), py - (1 * 16 + 8)) < 26) {
      this.activePrompt = { text: 'Masuk Hutan Misterius (Monster) [E] 🌲⚔️', action: () => this.teleport('woods', 3, 15) };
      return;
    }
    if (Math.hypot(px - (24 * 16 + 8), py - (8 * 16 + 8)) < 24) {
      this.activePrompt = { text: 'Masuk Rumah Utama [E] 🏡', action: () => this.teleport('house_mc', 8, 10) };
      return;
    }
    if (Math.hypot(px - (9 * 16 + 8), py - (24 * 16 + 8)) < 22) {
      this.activePrompt = { text: 'Masuk Toko Pak Budi [E] 🛒', action: () => this.teleport('house_budi', 7, 8) };
      return;
    }
    if (Math.hypot(px - (18 * 16 + 8), py - (24 * 16 + 8)) < 22) {
      this.activePrompt = { text: 'Masuk Peternakan Mak Siti [E] 🐮', action: () => this.teleport('house_siti', 7, 8) };
      return;
    }
    if (Math.hypot(px - (27 * 16 + 8), py - (24 * 16 + 8)) < 22) {
      this.activePrompt = { text: 'Masuk Toko Senjata Borin [E] ⚔️', action: () => this.teleport('house_blacksmith', 7, 8) };
      return;
    }

    const npc = this.farm.npcs.find(n => Math.hypot(n.x + 8 - px, n.y + 8 - py) < 34);
    if (npc) {
      this.activePrompt = { text: `Bicara dengan ${npc.name.split(' ')[0]} [E] 💬`, action: () => this.openNPCDialog(npc) };
      return;
    }

    if (Math.hypot(px - (23 * 16 + 8), py - (8 * 16 + 8)) < 24) {
      this.activePrompt = { text: 'Buka Peti Bersama [E] 📦', action: () => this.openChestModal() };
      return;
    }
    if (Math.hypot(px - (25 * 16 + 8), py - (8 * 16 + 8)) < 24) {
      this.activePrompt = { text: 'Jual Semua Hasil Panen & Monster [E] 🪙', action: () => this.sellProduce() };
      return;
    }

    const facingNode = this.farm.resourceNodes.find(n => n.hp > 0 && n.x === tx && n.y === ty);
    if (facingNode) {
      if (facingNode.type === 'rock' || facingNode.type === 'ore') {
        this.activePrompt = { text: 'Tambang Batu / Bijih [Spasi] ⛏️', action: () => this.mineResource(tx, ty) };
        return;
      } else {
        this.activePrompt = { text: 'Tebas Batang Kayu [Spasi] 🪓', action: () => this.chopResource(tx, ty) };
        return;
      }
    }

    if (tx >= 0 && tx < this.farm.cols && ty >= 0 && ty < this.farm.rows && this.farm.grid[ty][tx].type === 'water') {
      this.activePrompt = { text: 'Mulai Memancing Ikan [Spasi/E] 🎣', action: () => this.startFishing() };
      return;
    }

    const animal = this.animalManager.animals.find(a => Math.hypot(a.x - px, a.y - py) < 28);
    if (animal) {
      this.activePrompt = { text: `Elus & Beri Makan ${animal.name} [E] ❤️`, action: () => animal.pet() };
      return;
    }

    if (tx >= 0 && tx < this.farm.cols && ty >= 0 && ty < this.farm.rows && this.farm.grid[ty][tx].crop?.ready) {
      this.activePrompt = { text: 'Petik Panen [E] 🧺', action: () => this.harvestTile(tx, ty) };
      return;
    }

    if (tx >= 0 && tx < this.farm.cols && ty >= 0 && ty < this.farm.rows && this.farm.grid[ty][tx].tilled && !this.farm.grid[ty][tx].watered) {
      this.activePrompt = { text: 'Siram Air Tanah [Spasi] 💧', action: () => this.waterTile(tx, ty) };
      return;
    }

    this.activePrompt = null;
  }

  teleport(newLoc, tx, ty) {
    this.farm.currentLocation = newLoc;
    this.player.x = tx * 16;
    this.player.y = ty * 16;

    const viewW = this.canvas.width / this.camera.scale;
    const viewH = this.canvas.height / this.camera.scale;

    if (newLoc.startsWith('house_')) {
      const roomW = newLoc === 'house_mc' ? 16 * 16 : 14 * 16;
      const roomH = newLoc === 'house_mc' ? 12 * 16 : 10 * 16;
      this.camera.x = Math.round((roomW - viewW) / 2);
      this.camera.y = Math.round((roomH - viewH) / 2);
    } else {
      this.camera.x = this.player.x + 16 - viewW / 2;
      this.camera.y = this.player.y + 16 - viewH / 2;
    }

    this.network.send({
      type: 'teleport',
      location: newLoc,
      x: this.player.x,
      y: this.player.y
    });

    const locNames = {
      farm: 'Desa Kebun Cinta 🌾',
      house_mc: 'Rumah Utama Pasangan 🏡',
      house_budi: 'Toko Tani Pak Budi 🛒',
      house_siti: 'Peternakan Mak Siti 🐮',
      house_blacksmith: 'Pandai Besi Borin ⚔️',
      woods: 'Hutan Misterius (Waspada Monster!) 🌲⚔️'
    };
    this.showNotification(`Memasuki ${locNames[newLoc] || newLoc}`);
  }

  sleepInBed() {
    this.farm.sleepTogether();
    this.screenFadeBlack = 1.0;
    this.showNotification('Tidur lelap berdua... Selamat pagi kekasihku! ☀️💖');
    this.network.send({ type: 'sleep_sync', day: this.farm.dayCount, time: this.farm.timeMinutes });
    this.updateHUD();
  }

  toggleFurnitureEdit() {
    this.furnitureEditMode = !this.furnitureEditMode;
    const modal = document.getElementById('modalFurniturePlacement');
    if (this.furnitureEditMode) {
      this.toggleFurnitureTab('owned');
      this.updateFurnitureUI();
      modal?.classList.remove('hidden');
    } else {
      modal?.classList.add('hidden');
      this.selectedFurnToPlace = null;
    }
  }

  toggleFurnitureTab(tab) {
    const tabOwned = document.getElementById('tabFurnOwned');
    const tabShop = document.getElementById('tabFurnShop');
    const secOwned = document.getElementById('ownedFurnitureSection');
    const secShop = document.getElementById('shopFurnitureSection');

    if (tab === 'owned') {
      if (tabOwned) { tabOwned.style.background = '#2ed573'; tabOwned.style.color = '#ffffff'; }
      if (tabShop) { tabShop.style.background = '#dfe4ea'; tabShop.style.color = '#2f3542'; }
      secOwned?.classList.remove('hidden');
      secShop?.classList.add('hidden');
    } else {
      if (tabOwned) { tabOwned.style.background = '#dfe4ea'; tabOwned.style.color = '#2f3542'; }
      if (tabShop) { tabShop.style.background = '#2ed573'; tabShop.style.color = '#ffffff'; }
      secOwned?.classList.add('hidden');
      secShop?.classList.remove('hidden');
    }
  }

  updateFurnitureUI() {
    const listOwned = document.getElementById('ownedFurnitureList');
    const listShop = document.getElementById('shopFurnitureList');
    const countSpan = document.getElementById('furnOwnedCount');
    if (countSpan) countSpan.textContent = this.farm.ownedFurniture.length;

    // 1. Owned furniture list
    if (listOwned) {
      listOwned.innerHTML = '';
      if (this.farm.ownedFurniture.length === 0) {
        listOwned.innerHTML = '<p style="color:#747d8c; font-size:12px; padding:12px 0;">Belum ada perabotan di tas. Buka tab <b>🛒 Katalog Beli Baru</b> di atas untuk membeli perabotan impianmu! ✨</p>';
      } else {
        this.farm.ownedFurniture.forEach((furnId, idx) => {
          const def = window.FURNITURE_DEFINITIONS[furnId];
          if (!def) return;
          const item = document.createElement('div');
          item.className = 'store-item-card';
          item.innerHTML = `
            <div style="font-size:24px;">${def.icon}</div>
            <div style="flex:1;">
              <strong>${def.name}</strong>
              <p style="font-size:11px; color:#57606f;">${def.desc} (Ukuran: ${def.w}x${def.h})</p>
            </div>
            <button class="btn-buy" style="background:#2ed573; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">Pasang 🪑</button>
          `;
          item.querySelector('button').onclick = () => {
            this.selectedFurnToPlace = furnId;
            this.farm.ownedFurniture.splice(idx, 1);
            document.getElementById('modalFurniturePlacement').classList.add('hidden');
            this.showNotification(`Klik petak lantai rumah untuk meletakkan ${def.name}! ✨`);
          };
          listOwned.appendChild(item);
        });
      }
    }

    // 2. In-House Furniture Shop Catalog
    if (listShop) {
      listShop.innerHTML = '';
      Object.values(window.FURNITURE_DEFINITIONS).forEach(def => {
        const card = document.createElement('div');
        card.className = 'store-item-card';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '10px';
        card.style.padding = '8px';
        card.style.background = '#f8f9fa';
        card.style.borderRadius = '8px';
        card.style.border = '1px solid #dfe4ea';

        card.innerHTML = `
          <div style="font-size:26px;">${def.icon}</div>
          <div style="flex:1;">
            <strong style="font-size:13px; color:#2c3e50;">${def.name}</strong>
            <p style="font-size:11px; color:#7f8c8d; margin:2px 0;">${def.desc}</p>
            <span style="font-weight:bold; color:#f39c12; font-size:12px;">💰 ${def.price} Koin</span>
          </div>
          <button class="btn-buy" style="background:#f39c12; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:bold;">Beli 🛒</button>
        `;

        card.querySelector('.btn-buy').onclick = () => {
          if (this.farm.coins < def.price) {
            this.showNotification(`Koin tidak mencukupi! Butuh ${def.price} koin. 💰`);
            return;
          }
          this.farm.coins -= def.price;
          this.farm.ownedFurniture.push(def.id);
          this.farm.autoSave();
          this.updateHUD();
          this.updateFurnitureUI();
          this.showNotification(`Berhasil membeli ${def.name}! Ditambahkan ke perabotanmu. 🪑✨`);
        };
        listShop.appendChild(card);
      });
    }
  }

  openHandbookModal() {
    document.getElementById('modalHandbook')?.classList.remove('hidden');
  }

  performToolAction() {
    const currentItem = this.farm.hotbar[this.farm.activeHotbarIndex];
    if (!currentItem) {
      this.showNotification('Slot kosong! Tekan [B] untuk membuka tas dan pilih alat/bibit.');
      return;
    }

    // 1. Food Consumption (Crops, Fish, Milk, Egg)
    const itemDef = window.ITEM_CATALOG[currentItem];
    if (itemDef && itemDef.type === 'food') {
      const res = this.farm.eatCrop(currentItem);
      if (res) {
        if (res.full) {
          this.showNotification('Darahmu sudah penuh! (100/100 HP) ❤️');
        } else {
          if (window.soundSystem) window.soundSystem.playTill();
          this.showDamage(this.player.x + 8, this.player.y - 10, `+${res.percent}% HP ❤️`, '#2ed573');
          this.showNotification(`Memakan ${res.def.name}! Memulihkan +${res.percent}% HP (+${res.heal} ❤️)`);
          this.renderHotbar();
          this.updateHUD();
        }
      } else {
        this.showNotification(itemDef.name + ' habis di tas!');
      }
      return;
    }

    // 2. Gift Flower
    if (currentItem === 'flower') {
      this.triggerCoupleKiss(false);
      this.showEmote('🌸');
      this.showNotification('Menebar bunga mawar cinta harum untuk Aurel! 💖🌸');
      return;
    }

    const { tx, ty } = this.getTargetTileCoords();
    const loc = this.farm.currentLocation;

    // 3. Combat with Weapon or in Mystic Woods
    if (currentItem.startsWith('sword_') || loc === 'woods') {
      if (loc !== 'woods') {
        this.showNotification('Pedang hanya bisa digunakan untuk berburu monster di Hutan Misterius! 🌲⚔️');
        return;
      }
      // Check if monster in melee range (< 48px)
      const nearMonster = this.farm.monsters.find(m => m.hp > 0 && Math.hypot(m.x + 16 - (this.player.x + 16), m.y + 16 - (this.player.y + 16)) < 48);
      if (!nearMonster) {
        this.showNotification('Dekati monster terlebih dahulu untuk menebasnya! ⚔️');
        return;
      }

      this.player.currentAction = 'action';
      this.player.actionType = 'sword';
      this.player.actionTimer = 0.35;
      this.player.slashTimer = 0.3;
      if (window.soundSystem) window.soundSystem.playSwordSwing();

      const dmg = currentItem === 'sword_gold' ? 50 : 25;
      const res = this.farm.attackMonster(this.player.x + 16, this.player.y + 16, dmg);
      if (res) {
        if (res.defeated) {
          this.createMonsterDeathPoof(res.monster.x + 16, res.monster.y + 16);
          this.showDamage(res.monster.x, res.monster.y, 'KO! +' + res.earned + '🪙', '#f1c40f');
          this.showNotification('Monster dikalahkan! +' + res.earned + ' Koin Cinta! ⚔️🎉');
        } else {
          this.showDamage(res.monster.x, res.monster.y, '-' + dmg + '💥', '#e74c3c');
        }
      }
      this.updateHUD();
      return;
    }

    // 4. Validate and perform action on tile
    this.performActionOnTile(tx, ty, currentItem);
  }

  performActionOnTile(tx, ty, tool) {
    const loc = this.farm.currentLocation;
    if (loc !== 'farm' && loc !== 'woods') {
      this.showNotification('Alat hanya bisa digunakan di luar ruangan atau di hutan! 🏡');
      return;
    }

    if (!tool) {
      tool = this.farm.hotbar[this.farm.activeHotbarIndex] || this.player.selectedTool;
    }
    if (!tool) {
      this.showNotification('Pilih alat atau bibit di hotbar/tas terlebih dahulu! 🎒');
      return;
    }

    // Smart targeting coordinates helper
    let targetX = tx;
    let targetY = ty;
    const ptx = Math.floor((this.player.x + 16) / 16);
    const pty = Math.floor((this.player.y + 24) / 16);

    // --- STRICT TOOL & ITEM FUNCTIONALITY VALIDATION ---
    if (tool === 'hoe') {
      if (loc !== 'farm') {
        this.showNotification('Cangkul hanya bisa digunakan di kebun desa! 🌾');
        return;
      }
      if (!this.farm.grid[targetY] || this.farm.grid[targetY][targetX]?.tilled || this.farm.grid[targetY][targetX]?.collidable || this.farm.grid[targetY][targetX]?.type === 'path' || this.farm.grid[targetY][targetX]?.type === 'water') {
        if (this.farm.grid[pty] && !this.farm.grid[pty][ptx]?.tilled && !this.farm.grid[pty][ptx]?.collidable && this.farm.grid[pty][ptx]?.type !== 'path' && this.farm.grid[pty][ptx]?.type !== 'water') {
          targetX = ptx;
          targetY = pty;
        } else {
          this.showNotification('Cangkul hanya bisa digunakan pada tanah/rumput kosong yang belum dicangkul! 🌾');
          return;
        }
      }

      const ok = this.farm.tillSoil(targetX, targetY);
      if (ok) {
        this.player.currentAction = 'action';
        this.player.actionType = 'hoe';
        this.player.actionTimer = 0.35;
        if (window.soundSystem) window.soundSystem.playTill();
        this.createDirtParticles(targetX * 16 + 8, targetY * 16 + 8);
        this.network.send({ type: 'action_till', x: targetX, y: targetY });
      }
    } else if (tool === 'water') {
      if (loc !== 'farm') {
        this.showNotification('Penyiram air hanya untuk menyiram petak ladang di kebun! 💧');
        return;
      }
      if (!this.farm.grid[targetY] || !this.farm.grid[targetY][targetX]?.tilled || this.farm.grid[targetY][targetX]?.watered) {
        if (this.farm.grid[pty] && this.farm.grid[pty][ptx]?.tilled && !this.farm.grid[pty][ptx]?.watered) {
          targetX = ptx;
          targetY = pty;
        } else {
          this.showNotification('Penyiram air hanya bisa menyiram petak ladang yang masih kering! 💧');
          return;
        }
      }

      this.player.currentAction = 'action';
      this.player.actionType = 'water';
      this.player.actionTimer = 0.35;
      this.waterTile(targetX, targetY);
    } else if (tool === 'axe') {
      const list = loc === 'woods' ? (this.farm.woodsNodes || []) : this.farm.resourceNodes;
      const targetNode = list.find(n => n.hp > 0 && (n.type === 'tree' || n.type === 'log' || n.type === 'woods_log' || n.type === 'woods_stump' || n.type === 'stump') &&
        (Math.hypot(n.x - targetX, n.y - targetY) <= 1.8 || Math.hypot(n.x - ptx, n.y - pty) <= 1.8));

      if (!targetNode) {
        this.showNotification('Kapak hanya bisa menebang pohon, batang kayu, atau tunggul! 🪓');
        return;
      }

      this.player.currentAction = 'action';
      this.player.actionType = 'axe';
      this.player.actionTimer = 0.35;
      this.chopResource(targetNode.x, targetNode.y);
    } else if (tool === 'pickaxe') {
      const list = loc === 'woods' ? (this.farm.woodsNodes || []) : this.farm.resourceNodes;
      const targetNode = list.find(n => n.hp > 0 && (n.type === 'rock' || n.type === 'ore' || n.type === 'woods_rock' || n.type === 'woods_ore') &&
        (Math.hypot(n.x - targetX, n.y - targetY) <= 1.8 || Math.hypot(n.x - ptx, n.y - pty) <= 1.8));

      if (!targetNode) {
        this.showNotification('Beliung hanya bisa menambang batu atau bongkahan bijih emas/kristal! ⛏️');
        return;
      }

      this.player.currentAction = 'action';
      this.player.actionType = 'pickaxe';
      this.player.actionTimer = 0.35;
      this.mineResource(targetNode.x, targetNode.y);
    } else if (tool && tool.startsWith('seed_')) {
      if (loc !== 'farm') {
        this.showNotification('Bibit hanya bisa ditanam di petak ladang kebun desa! 🌱');
        return;
      }
      const cropId = tool.replace('seed_', '');
      const seedCount = this.farm.inventory[tool] || 0;
      if (seedCount <= 0) {
        this.showNotification('Bibit ' + cropId + ' habis di tas! Beli di Toko Pak Budi ya~ 🛒');
        return;
      }

      if (!this.farm.grid[targetY] || !this.farm.grid[targetY][targetX]?.tilled || this.farm.grid[targetY][targetX]?.crop) {
        if (this.farm.grid[pty] && this.farm.grid[pty][ptx]?.tilled && !this.farm.grid[pty][ptx]?.crop) {
          targetX = ptx;
          targetY = pty;
        } else {
          this.showNotification('Bibit hanya bisa ditanam di tanah gembur yang belum ada tanamannya! 🌱');
          return;
        }
      }

      const ok = this.farm.plantCrop(targetX, targetY, cropId);
      if (ok) {
        this.player.currentAction = 'action';
        this.player.actionType = tool;
        this.player.actionTimer = 0.35;
        this.farm.removeFromInventory(tool, 1);
        if (this.farm.chest.seeds[cropId] > 0) this.farm.chest.seeds[cropId]--;
        if (window.soundSystem) window.soundSystem.playPlant();
        this.createPlantParticles(targetX * 16 + 8, targetY * 16 + 8);
        this.showNotification('Berhasil menanam bibit ' + (window.ITEM_CATALOG[tool] ? window.ITEM_CATALOG[tool].name : cropId) + '! 🌱');
        this.network.send({ type: 'action_plant', x: targetX, y: targetY, cropId });
        this.renderHotbar();
      }
    } else if (tool === 'fishing_rod') {
      if (loc !== 'farm') {
        this.showNotification('Pancing hanya bisa digunakan di dermaga danau desa! 🎣');
        return;
      }
      const isNearWater = (this.farm.grid[targetY] && this.farm.grid[targetY][targetX]?.type === 'water') ||
                          (targetX >= 35 && targetX <= 46 && targetY >= 14 && targetY <= 26);
      if (!isNearWater) {
        this.showNotification('Arahkan pancing ke air danau untuk mulai memancing ikan! 🌊🎣');
        return;
      }
      this.player.currentAction = 'action';
      this.player.actionType = 'fishing_rod';
      this.player.actionTimer = 0.35;
      this.startFishing();
    } else {
      this.showNotification('Barang ini tidak memiliki fungsi aksi di sini. 🎒');
    }

    this.updateHUD();
  }

    chopResource(tx, ty) {
    const res = this.farm.chopWood(tx, ty);
    if (res) {
      if (window.soundSystem) window.soundSystem.playSwordSwing();
      this.createWoodChips(tx * 16 + 8, ty * 16 + 8);
      if (res.destroyed) {
        this.showNotification(`Mendapatkan +${res.yield} Kayu! Disimpan di Tas 🪵✨`);
        this.showDamage(tx * 16, ty * 16 - 8, `+${res.yield}🪵`, '#2ed573');
      } else {
        this.showDamage(tx * 16, ty * 16 - 8, `Tebas! (${res.hp} sisa)`, '#ffa502');
      }
      this.network.send({ type: 'action_chop', x: tx, y: ty });
      this.renderHotbar();
      this.updateHUD();
    } else {
      this.showNotification('Arahkan kapak ke pohon atau batang kayu! 🪓');
    }
  }

  mineResource(tx, ty) {
    const res = this.farm.mineRock(tx, ty);
    if (res) {
      if (window.soundSystem) window.soundSystem.playTill();
      this.createStoneGlints(tx * 16 + 8, ty * 16 + 8);
      if (res.destroyed) {
        const bonusOre = res.oreYield > 0 ? ` & +${res.oreYield} Emas 💎` : '';
        this.showNotification(`Mendapatkan +${res.yield} Batu${bonusOre}! Disimpan di Tas 🪨✨`);
        this.showDamage(tx * 16, ty * 16 - 8, `+${res.yield}🪨`, '#70a1ff');
      } else {
        this.showDamage(tx * 16, ty * 16 - 8, `Tambang! (${res.hp} sisa)`, '#ffa502');
      }
      this.network.send({ type: 'action_mine', x: tx, y: ty });
      this.renderHotbar();
      this.updateHUD();
    } else {
      this.showNotification('Arahkan beliung ke batu alam atau urat bijih! ⛏️');
    }
  }

  waterTile(tx, ty) {
    const ok = this.farm.waterSoil(tx, ty);
    if (ok) {
      if (window.soundSystem) window.soundSystem.playWater();
      this.createWaterSplashes(tx * 16 + 8, ty * 16 + 8);
      this.network.send({ type: 'action_water', x: tx, y: ty });
    }
  }

  harvestTile(tx, ty) {
    const def = this.farm.harvestCrop(tx, ty);
    if (def) {
      if (window.soundSystem) window.soundSystem.playHarvest();
      this.createHarvestLeafs(tx * 16 + 8, ty * 16 + 8);
      this.showDamage(tx * 16, ty * 16 - 8, `+1 ${def.icon}`, '#2ed573');
      this.showNotification(`Memanen ${def.name}! Disimpan di Tas 🧺✨`);
      this.network.send({ type: 'action_harvest', x: tx, y: ty });
      this.renderHotbar();
      this.updateHUD();
    }
  }

  performInteractAction() {
    if (this.activePrompt && this.activePrompt.action) {
      this.activePrompt.action();
      return;
    }
    const { tx, ty } = this.getTargetTileCoords();
    if (this.farm.currentLocation === 'farm' && this.farm.grid[ty] && this.farm.grid[ty][tx]?.crop?.ready) {
      this.harvestTile(tx, ty);
    }
  }

  // --- MONSTER ATTACK & PLAYER DAMAGE ---
  playerTakeDamage(dmg) {
    this.farm.playerHp = Math.max(0, this.farm.playerHp - dmg);
    this.screenFlashRed = 0.35;
    this.showDamage(this.player.x + 16, this.player.y - 6, `-${dmg}💔`, '#ff4757');

    if (this.farm.playerHp <= 0) {
      this.playerFaintAndRespawn();
    }
    this.updateHUD();
  }

  playerFaintAndRespawn() {
    this.screenFadeBlack = 1.2;
    this.showNotification('Kamu pingsan akibat serangan monster! Diselamatkan ke ranjang rumah... 🛏️❤️');
    this.farm.playerHp = this.farm.playerMaxHp;
    this.teleport('house_mc', 8, 8);
    this.updateHUD();
  }

  // --- NPCS & DIALOGS ---
  openNPCDialog(npc) {
    const modal = document.getElementById('modalNPC');
    document.getElementById('npcName').textContent = npc.name;
    document.getElementById('npcPortrait').src = npc.portrait;
    document.getElementById('npcDialogText').textContent = npc.dialog;

    const actionsContainer = document.getElementById('npcActions');
    actionsContainer.innerHTML = '';

    if (npc.role === 'merchant') {
      const btnSeeds = document.createElement('button');
      btnSeeds.className = 'btn-buy';
      btnSeeds.textContent = '🌱 Beli Bibit Sayur & Bunga';
      btnSeeds.onclick = () => { modal.classList.add('hidden'); this.openStoreModal('seeds'); };
      actionsContainer.appendChild(btnSeeds);

      const btnFurn = document.createElement('button');
      btnFurn.className = 'btn-buy';
      btnFurn.textContent = '🪑 Beli Perabotan Rumah MC';
      btnFurn.onclick = () => { modal.classList.add('hidden'); this.openStoreModal('furniture'); };
      actionsContainer.appendChild(btnFurn);
    } else if (npc.role === 'rancher') {
      const btnAnimals = document.createElement('button');
      btnAnimals.className = 'btn-buy';
      btnAnimals.textContent = '🐮 Beli Hewan Ternak';
      btnAnimals.onclick = () => { modal.classList.add('hidden'); this.openStoreModal('animals'); };
      actionsContainer.appendChild(btnAnimals);

      const btnPets = document.createElement('button');
      btnPets.className = 'btn-buy';
      btnPets.textContent = '🐾 Beli Peliharaan (Mengikuti MC)';
      btnPets.onclick = () => { modal.classList.add('hidden'); this.openStoreModal('pets'); };
      actionsContainer.appendChild(btnPets);
    } else if (npc.role === 'blacksmith') {
      const btnSword = document.createElement('button');
      btnSword.className = 'btn-buy';
      btnSword.textContent = '⚔️ Beli Pedang Besi (80 🪙)';
      btnSword.onclick = () => {
        if (this.farm.buyTool('sword_iron', 80)) {
          this.showNotification('Pedang Besi Tajam dimasukkan ke Tas Petani! ⚔️✨');
          modal.classList.add('hidden');
          this.renderHotbar();
          this.updateHUD();
        } else {
          this.showNotification('Koin tidak cukup atau pedang sudah dimiliki! 🪙');
        }
      };
      actionsContainer.appendChild(btnSword);
    } else if (npc.role === 'fisher') {
      const btnRod = document.createElement('button');
      btnRod.className = 'btn-buy';
      btnRod.textContent = '🎣 Beli Alat Pancing Bambu (45 🪙)';
      btnRod.onclick = () => {
        if (this.farm.buyTool('fishing_rod', 45)) {
          this.showNotification('Alat Pancing Bambu dimasukkan ke Tas Petani! 🎣✨');
          modal.classList.add('hidden');
          this.renderHotbar();
          this.updateHUD();
        } else {
          this.showNotification('Koin tidak cukup atau pancing sudah dibeli! 🪙');
        }
      };
      actionsContainer.appendChild(btnRod);
    } else if (npc.role === 'bot_elder') {
      const btnBots = document.createElement('button');
      btnBots.className = 'btn-buy';
      btnBots.textContent = '🤖 Sewa Pembantu Bot';
      btnBots.onclick = () => { modal.classList.add('hidden'); document.getElementById('modalBots').classList.remove('hidden'); };
      actionsContainer.appendChild(btnBots);
    }

    modal.classList.remove('hidden');
  }

  openStoreModal(category) {
    const modal = document.getElementById('modalStore');
    const title = document.getElementById('storeTitle');
    const list = document.getElementById('storeItemsList');
    list.innerHTML = '';

    if (category === 'seeds') {
      title.textContent = '🌱 Toko Bibit Unggul (Pak Budi)';
      for (const [id, def] of Object.entries(CROP_DEFINITIONS)) {
        const item = document.createElement('div');
        item.className = 'store-item-card';
        item.innerHTML = `
          <div style="font-size:28px;">${def.icon}</div>
          <div style="flex:1;">
            <strong>${def.name}</strong>
            <p style="font-size:11px; color:#57606f;">Tumbuh ${def.growTime} detik • Jual ${def.sellPrice}🪙 • ${def.desc}</p>
          </div>
          <button class="btn-buy">${def.seedPrice} 🪙</button>
        `;
        item.querySelector('button').onclick = () => {
          if (this.farm.buySeed(id)) {
            this.showNotification(`Membeli 1 bibit ${def.name}! Disimpan di Tas Petani 🎒🌱`);
            this.renderHotbar();
            this.updateHUD();
          } else {
            this.showNotification('Koin tidak mencukupi! 🪙');
          }
        };
        list.appendChild(item);
      }
    } else if (category === 'furniture') {
      title.textContent = '🪑 Toko Perabotan Rumah MC (Pak Budi)';
      for (const [id, def] of Object.entries(FURNITURE_DEFINITIONS)) {
        const item = document.createElement('div');
        item.className = 'store-item-card';
        item.innerHTML = `
          <div style="font-size:28px;">${def.icon}</div>
          <div style="flex:1;">
            <strong>${def.name}</strong>
            <p style="font-size:11px; color:#57606f;">${def.desc}</p>
          </div>
          <button class="btn-buy">${def.price} 🪙</button>
        `;
        item.querySelector('button').onclick = () => {
          if (this.farm.buyFurniture(id)) {
            this.showNotification(`Membeli ${def.name}! Atur letaknya di dalam Rumah MC 🏡✨`);
            this.updateHUD();
          } else {
            this.showNotification('Koin tidak mencukupi! 🪙');
          }
        };
        list.appendChild(item);
      }
    } else if (category === 'animals') {
      title.textContent = '🐮 Peternakan Mak Siti';
      const animals = [
        { type: 'chicken', name: 'Ayam Petelur', price: 60, icon: '🐔', desc: 'Menghasilkan telur segar secara berkala.' },
        { type: 'cow', name: 'Sapi Perah', price: 120, icon: '🐮', desc: 'Menghasilkan susu lezat bernilai jual tinggi.' },
        { type: 'sheep', name: 'Domba Wol', price: 100, icon: '🐑', desc: 'Menghasilkan wol hangat untuk selimut.' }
      ];
      animals.forEach(a => {
        const item = document.createElement('div');
        item.className = 'store-item-card';
        item.innerHTML = `
          <div style="font-size:28px;">${a.icon}</div>
          <div style="flex:1;">
            <strong>${a.name}</strong>
            <p style="font-size:11px; color:#57606f;">${a.desc}</p>
          </div>
          <button class="btn-buy">${a.price} 🪙</button>
        `;
        item.querySelector('button').onclick = () => {
          if (this.farm.buyAnimal(a.type, a.name, a.price)) {
            this.showNotification(`Membeli ${a.name}! Berada di padang rumput Mak Siti ❤️`);
            this.updateHUD();
          } else {
            this.showNotification('Koin tidak mencukupi! 🪙');
          }
        };
        list.appendChild(item);
      });
    } else if (category === 'pets') {
      title.textContent = '🐾 Hewan Peliharaan Setia & Petarung (Mak Siti)';
      const pets = [
        { type: 'pet_bunny', name: 'Kelinci Salju 🐰', price: 75, icon: '🐰', desc: 'Kelinci putih manis berbulu salju yang setia menemanimu dan membantu bertarung melawan monster!' },
        { type: 'pet_duck', name: 'Anak Bebek Kuning 🦆', price: 50, icon: '🦆', desc: 'Bebek kecil menggemaskan yang lincah mematuk monster kemana pun kamu pergi.' },
        { type: 'pet_bird', name: 'Burung Pipit Biru 🐦', price: 60, icon: '🐦', desc: 'Terbang lincah berkicau merdu dan sigap menyambar monster di hutan misterius.' },
        { type: 'pet_sheep', name: 'Domba Salju 🐑', price: 70, icon: '🐑', desc: 'Domba putih berbulu selembut kapas yang setia menanduk monster berbahaya.' },
        { type: 'pet_piggy', name: 'Babi Mungil 🐷', price: 65, icon: '🐷', desc: 'Babi kecil lucu yang suka mendengus gembira dan menyeruduk musuh.' },
        { type: 'pet_slime', name: 'Slime Jinak 🧪', price: 80, icon: '🧪', desc: 'Slime biru imut nan elastis yang setia memantul menyerang monster.' }
      ];
      pets.forEach(p => {
        const item = document.createElement('div');
        item.className = 'store-item-card';
        item.innerHTML = `
          <div style="font-size:28px;">${p.icon}</div>
          <div style="flex:1;">
            <strong>${p.name}</strong>
            <p style="font-size:11px; color:#57606f;">${p.desc}</p>
          </div>
          <button class="btn-buy">${p.price} 🪙</button>
        `;
        item.querySelector('button').onclick = () => {
          if (this.farm.buyPet(p.type, p.name, p.price)) {
            this.showNotification(`Memilih ${p.name} sebagai teman setia dan petarungmu! 🐾❤️`);
            this.updateHUD();
          } else {
            this.showNotification('Koin tidak mencukupi! 🪙');
          }
        };
        list.appendChild(item);
      });
    }

    modal.classList.remove('hidden');
  }

  openChestModal() {
    const modal = document.getElementById('modalChest');
    const seedsList = document.getElementById('chestSeedsList');
    const produceList = document.getElementById('chestProduceList');
    seedsList.innerHTML = '';
    produceList.innerHTML = '';

    for (const [cropId, count] of Object.entries(this.farm.chest.seeds)) {
      const def = CROP_DEFINITIONS[cropId];
      if (def) {
        seedsList.innerHTML += `<div class="chest-item"><span>${def.icon} ${def.name}:</span> <strong>${count}</strong></div>`;
      }
    }

    for (const [prodId, count] of Object.entries(this.farm.chest.produce)) {
      if (count > 0) {
        let name = prodId;
        let icon = '📦';
        if (CROP_DEFINITIONS[prodId]) { name = CROP_DEFINITIONS[prodId].name; icon = CROP_DEFINITIONS[prodId].icon; }
        else if (prodId === 'wood') { name = 'Batang Kayu'; icon = '🪵'; }
        else if (prodId === 'stone') { name = 'Batu Alam'; icon = '🪨'; }
        else if (prodId === 'ore') { name = 'Bijih Emas'; icon = '💎'; }
        else if (prodId === 'fish') { name = 'Ikan Segar'; icon = '🐟'; }
        else if (prodId === 'egg') { name = 'Telur Segar'; icon = '🥚'; }
        else if (prodId === 'milk') { name = 'Susu Sapi'; icon = '🥛'; }
        else if (prodId === 'wool') { name = 'Wol Lembut'; icon = '🧶'; }
        else if (prodId === 'monster_gel') { name = 'Gel Monster'; icon = '🧪'; }

        const canEat = (CROP_DEFINITIONS[prodId] || prodId === 'fish') ? `<button class="btn-eat" style="margin-left:6px; font-size:10px; padding:2px 6px; background:#2ed573; border:none; border-radius:6px; color:#fff; cursor:pointer;" onclick="game.eatProduceItem('${prodId}')">Makan ❤️</button>` : '';

        produceList.innerHTML += `<div class="chest-item"><span>${icon} ${name}:</span> <div><strong>${count}</strong>${canEat}</div></div>`;
      }
    }

    if (produceList.innerHTML === '') {
      produceList.innerHTML = '<p style="color:#747d8c; font-size:12px;">Peti hasil panen masih kosong. Tanam sayur atau tambang batu dulu ya!</p>';
    }

    modal.classList.remove('hidden');
  }

  eatProduceItem(cropId) {
    const res = this.farm.eatCrop(cropId);
    if (res) {
      if (window.soundSystem) window.soundSystem.playHarvest();
      this.screenFlashGreen = 0.3;
      this.createHealParticles(this.player.x + 16, this.player.y);
      this.showNotification(`Memakan ${res.def.name}! Nyawa bertambah +${res.heal} ❤️`);
      this.openChestModal();
      this.updateHUD();
    }
  }

  sellProduce() {
    const earned = this.farm.sellAllProduce();
    if (earned > 0) {
      if (window.soundSystem) window.soundSystem.playCoin();
      this.showDamage(this.player.x + 16, this.player.y - 12, `+${earned}🪙`, '#f1c40f');
      this.showNotification(`Berhasil menjual semua hasil! Mendapatkan +${earned} Koin Cinta! 🪙✨`);
      this.updateHUD();
    } else {
      this.showNotification('Tidak ada hasil panen atau barang monster untuk dijual di peti!');
    }
  }

  startFishing() {
    if (!this.farm.unlockedTools.fishing_rod) {
      this.showNotification('Beli alat pancing bambu dulu di Paman Sam (Dermaga) 🎣');
      return;
    }
    if (this.player.isFishing) {
      if (this.player.fishingBite) {
        if (window.soundSystem) window.soundSystem.playHarvest();
        this.createWaterSplashes(this.player.x + 28, this.player.y + 16);
        this.farm.chest.produce.fish = (this.farm.chest.produce.fish || 0) + 1;
        this.farm.addToInventory('fish', 1);
        this.farm.addLovePoints(12);
        this.showNotification('Berhasil menangkap Ikan Danau Segar! Disimpan di Tas 🐟🎉');
        this.showDamage(this.player.x + 16, this.player.y - 12, '+1 🐟', '#00cec9');
        this.renderHotbar();
      } else {
        this.showNotification('Ikan terlepas karena kamu menarik terlalu cepat!');
      }
      this.player.isFishing = false;
      this.player.fishingBite = false;
      this.updateHUD();
      return;
    }

    this.player.isFishing = true;
    this.player.fishingTimer = 2.5 + Math.random() * 3.5;
    this.player.fishingBite = false;
    this.createWaterSplashes(this.player.x + 28, this.player.y + 16);
    this.showNotification('Melempar kail ke danau... Tunggu sampai tanda [!] muncul! 🎣');
  }

  // --- RICH VISUAL PARTICLES ENGINE ---
  createWoodChips(x, y) {
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 50,
        vy: -20 - Math.random() * 40,
        gravity: 120,
        color: '#8e5431',
        size: 3 + Math.random() * 2,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  createStoneGlints(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 40,
        gravity: 140,
        color: Math.random() < 0.4 ? '#f1c40f' : '#b2bec3',
        size: 2.5 + Math.random() * 2.5,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  createWaterSplashes(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 45,
        vy: -25 - Math.random() * 35,
        gravity: 90,
        color: '#74b9ff',
        size: 3,
        life: 0.45,
        maxLife: 0.45
      });
    }
  }

  createPlantParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 35,
        vy: -15 - Math.random() * 25,
        gravity: 60,
        color: '#2ed573',
        size: 3,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  createDirtParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 35,
        vy: -20 - Math.random() * 25,
        gravity: 100,
        color: '#795548',
        size: 3.5,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  createHarvestLeafs(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 40,
        vy: -30 - Math.random() * 30,
        gravity: 50,
        color: Math.random() < 0.5 ? '#2ed573' : '#ffd32a',
        size: 3.5,
        life: 0.6,
        maxLife: 0.6
      });
    }
  }

  createMonsterDeathPoof(x, y) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 70,
        vy: (Math.random() - 0.5) * 70,
        gravity: 0,
        color: '#ffffff',
        size: 4 + Math.random() * 4,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  createHealParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 20,
        gravity: -10,
        color: '#ff4757',
        size: 3,
        life: 0.7,
        maxLife: 0.7
      });
    }
  }

  showEmote(emoji) {
    this.player.emote = emoji;
    this.player.emoteTimer = 2.5;
    this.network.send({ type: 'emote', emote: emoji });
  }

  triggerCoupleKiss(isPartnerInitiated = false) {
    if (window.soundSystem) window.soundSystem.playKiss();
    this.showEmote('😘');
    this.farm.addLovePoints(10);
    this.createHealParticles(this.player.x + 16, this.player.y + 10);
    this.updateHUD();

    if (!isPartnerInitiated) {
      this.network.send({ type: 'kiss' });
    }
  }

  toggleChatMinimize() {
    this.chatMinimized = !this.chatMinimized;
    const widget = document.getElementById('chatWidget');
    const btn = document.getElementById('btnToggleChat');
    if (widget && btn) {
      widget.classList.toggle('minimized', this.chatMinimized);
      btn.textContent = this.chatMinimized ? '💬' : '➖';
    }
  }

  showNotification(text) {
    this.notifications.unshift({ text, time: 3.2 });
    if (this.notifications.length > 3) this.notifications.pop();
  }

  showDamage(x, y, text, color = '#ff4757') {
    this.floatingTexts.push({ x, y, text, color, vy: -20, life: 1.2 });
  }

  updateHUD() {
    const coinsEl = document.getElementById('hudCoins');
    if (coinsEl) coinsEl.textContent = this.farm.coins;

    const loveEl = document.getElementById('hudLove');
    if (loveEl) loveEl.textContent = `${this.farm.lovePoints} ❤️`;

    const loveTitleEl = document.getElementById('hudLoveTitle');
    if (loveTitleEl) loveTitleEl.textContent = this.farm.getLoveTitle();

    const hpFill = document.getElementById('hudHpFill');
    const hpText = document.getElementById('hudHpText');
    if (hpFill && hpText) {
      const pct = Math.max(0, Math.min(100, (this.farm.playerHp / this.farm.playerMaxHp) * 100));
      hpFill.style.width = `${pct}%`;
      hpText.textContent = `${this.farm.playerHp}/${this.farm.playerMaxHp}`;
    }

    const timeInfo = this.farm.getTimeOfDay();
    const hours = Math.floor(this.farm.timeMinutes / 60);
    const mins = Math.floor(this.farm.timeMinutes % 60);
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    const timeEl = document.getElementById('hudTime');
    if (timeEl) timeEl.textContent = `Hari ${this.farm.dayCount} - ${timeStr} (${timeInfo.label})`;
  }

  // --- MAIN LOOP ---
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(delta) {
    const monsterHitDamage = this.farm.update(delta, this.player.x + 16, this.player.y + 16);
    if (monsterHitDamage && monsterHitDamage > 0) {
      this.playerTakeDamage(monsterHitDamage);
    }

    if (this.farm.currentLocation === 'farm') {
      this.botManager.update(delta);
      this.animalManager.update(delta);
    }

    if (this.screenFlashRed > 0) this.screenFlashRed -= delta;
    if (this.screenFlashGreen > 0) this.screenFlashGreen -= delta;
    if (this.screenFadeBlack > 0) this.screenFadeBlack -= delta * 0.8;

    if (this.player.slashTimer > 0) this.player.slashTimer -= delta;

    // Fishing Timer
    if (this.player.isFishing) {
      this.player.fishingTimer -= delta;
      if (this.player.fishingTimer <= 0 && !this.player.fishingBite) {
        this.player.fishingBite = true;
        this.createWaterSplashes(this.player.x + 28, this.player.y + 16);
        this.showNotification('Ikan menyambar umpan! Tekan [Spasi/E] untuk menarik! 🎣');
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

    // Pet Follower & Combat AI
    if (this.farm.activePet) {
      const loc = this.farm.currentLocation;
      let targetPetX = this.player.x + (this.player.dir === 'left' ? 20 : -20);
      let targetPetY = this.player.y + (this.player.dir === 'up' ? 16 : -16);

      // In Mystic Woods: Pet actively hunts & attacks nearby hostile monsters!
      if (loc === 'woods') {
        const nearMonster = this.farm.monsters.find(m => m.hp > 0 && Math.hypot(m.x + 16 - this.player.x, m.y + 16 - this.player.y) < 75);
        if (nearMonster) {
          targetPetX = nearMonster.x + (nearMonster.dir === 'left' ? 14 : -14);
          targetPetY = nearMonster.y + (nearMonster.dir === 'up' ? 10 : -10);
        }

        // Active Pet Combat Strike
        const petAtkRes = this.farm.petAttackWoods(delta, this.pet.x + 8, this.pet.y + 8);
        if (petAtkRes) {
          this.pet.attackTimer = 0.25;
          if (window.soundSystem) window.soundSystem.playTill();
          this.showDamage(petAtkRes.monster.x + 8, petAtkRes.monster.y - 4, '-' + petAtkRes.damage + '🐾', '#3498db');
          if (petAtkRes.defeated) {
            this.createMonsterDeathPoof(petAtkRes.monster.x + 16, petAtkRes.monster.y + 16);
            this.showDamage(petAtkRes.monster.x, petAtkRes.monster.y - 8, 'KO! +' + petAtkRes.earned + '🪙', '#f1c40f');
            this.showNotification('Pet ' + this.farm.activePet.name + ' mengalahkan monster! +' + petAtkRes.earned + ' Koin Cinta! 🐾🎉');
          }
        }
      }

      if (this.pet.attackTimer > 0) this.pet.attackTimer -= delta;

      const pdx = targetPetX - this.pet.x;
      const pdy = targetPetY - this.pet.y;
      const pdist = Math.hypot(pdx, pdy);

      if (pdist > 14) {
        this.pet.isMoving = true;
        const petSpeed = (this.player.speed + 16) * delta;
        this.pet.x += (pdx / pdist) * petSpeed;
        this.pet.y += (pdy / pdist) * petSpeed;
        this.pet.dir = pdx > 0 ? 'right' : 'left';
        this.pet.anim = (this.pet.anim + delta * 6) % 4;
      } else {
        this.pet.isMoving = false;
        this.pet.anim = (this.pet.anim + delta * 2) % 4;
      }
    }

    // Active Hostile Monster AI (Wander & Aggressive Combat Chase in Mystic Woods)
    if (this.farm.currentLocation === 'woods') {
      this.farm.monsters.forEach(m => {
        if (m.hp <= 0) return;
        m.anim = (m.anim + delta * 4) % 4;

        const mdx = (this.player.x + 16) - (m.x + 16);
        const mdy = (this.player.y + 16) - (m.y + 16);
        const dist = Math.hypot(mdx, mdy);

        // Aggro distance: 110px (~7 tiles)
        if (dist < 110) {
          m.dir = Math.abs(mdx) > Math.abs(mdy) ? (mdx > 0 ? 'right' : 'left') : (mdy > 0 ? 'down' : 'up');
          const moveSpeed = (m.speed || 28) * delta;
          m.x += (mdx / dist) * moveSpeed;
          m.y += (mdy / dist) * moveSpeed;

          // Attack player if in melee reach (< 22px)
          if (dist < 22) {
            m.atkCooldown = (m.atkCooldown || 0) - delta;
            if (m.atkCooldown <= 0) {
              m.atkCooldown = 1.2; // 1.2s cooldown between attacks
              const dmg = m.atk || 10;
              this.farm.playerHp = Math.max(0, this.farm.playerHp - dmg);
              this.screenFlashRed = 0.35;
              this.showDamage(this.player.x + 8, this.player.y - 8, `-${dmg} HP 💔`, '#ff4757');
              if (window.soundSystem) window.soundSystem.playTill();

              if (this.farm.playerHp <= 0) {
                this.playerFaintAndRespawn();
              }
              this.updateHUD();
            }
          }
        } else {
          if (m.atkCooldown > 0) m.atkCooldown -= delta;
        }
      });
    }

    if (this.player.actionTimer > 0) {
      this.player.actionTimer -= delta;
      const progress = 1 - Math.max(0, this.player.actionTimer / 0.35);
      this.player.animFrame = Math.min(3, Math.floor(progress * 4));
      if (this.player.actionTimer <= 0) {
        this.player.currentAction = 'idle';
        this.player.animFrame = 0;
      }
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

    const viewW = this.canvas.width / this.camera.scale;
    const viewH = this.canvas.height / this.camera.scale;

    if (loc.startsWith('house_')) {
      // In house interiors, center the room completely in canvas center
      this.camera.x = Math.round((maxW - viewW) / 2);
      this.camera.y = Math.round((maxH - viewH) / 2);
    } else {
      if (maxW <= viewW) {
        this.camera.x = Math.round((maxW - viewW) / 2);
      } else {
        this.camera.x = Math.max(0, Math.min(maxW - viewW, this.camera.x));
      }
      if (maxH <= viewH) {
        this.camera.y = Math.round((maxH - viewH) / 2);
      } else {
        this.camera.y = Math.max(0, Math.min(maxH - viewH, this.camera.y));
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += p.gravity * delta;
      p.life -= delta;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * delta;
      ft.life -= delta;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.time -= delta;
      if (n.time <= 0) this.notifications.splice(i, 1);
    }

    // Fireflies in night/sunset
    const timeInfo = this.farm.getTimeOfDay();
    if (timeInfo.phase === 'night' || timeInfo.phase === 'sunset') {
      this.fireflies.forEach(f => {
        f.x += f.vx * delta;
        f.y += f.vy * delta;
        f.phase += delta * 2;
        if (f.x < 0) f.x = 48 * 16;
        if (f.x > 48 * 16) f.x = 0;
        if (f.y < 0) f.y = 32 * 16;
        if (f.y > 32 * 16) f.y = 0;
      });
    }

    this.updateActivePrompt();
    this.updateHUD();
  }

  // --- RENDERING ---
  render() {
    const loc = this.farm.currentLocation;
    if (loc.startsWith('house_')) {
      this.ctx.fillStyle = '#0d1117';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.save();
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    if (loc === 'farm') {
      this.renderOutdoorVillage();
    } else if (loc === 'house_mc') {
      this.renderMCHouse();
    } else if (loc.startsWith('house_')) {
      this.renderNPCHouse(loc);
    } else if (loc === 'woods') {
      this.renderMysticWoods();
    }

    // In-world Particle Rendering
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
      this.ctx.globalAlpha = 1.0;
    });

    this.ctx.restore();

    this.renderUIOverlays();
  }

  // --- 1. OUTDOOR VILLAGE & SUNNYSIDE CROPS ---
  renderOutdoorVillage() {
    const imgGrass = this.assets.grass;
    const imgPath = this.assets.path;
    const imgWater = this.assets.water;
    const imgFarmland = this.assets.farmland;
    const imgFences = this.assets.fences;
    const imgChest = this.assets.chest;

    // Base Terrain
    for (let y = 0; y < this.farm.rows; y++) {
      for (let x = 0; x < this.farm.cols; x++) {
        const px = x * 16;
        const py = y * 16;
        const tile = this.farm.grid[y][x];

        if (imgGrass) this.ctx.drawImage(imgGrass, px, py, 16, 16);
        if (tile.type === 'path' && imgPath) this.ctx.drawImage(imgPath, px, py, 16, 16);
        if (tile.type === 'water' && imgWater) this.ctx.drawImage(imgWater, px, py, 16, 16);
        if (tile.type === 'farmland' || tile.tilled) {
          if (imgFarmland) {
            const hasTop = y > 0 && (this.farm.grid[y - 1][x].type === 'farmland' || this.farm.grid[y - 1][x].tilled);
            const hasBot = y < this.farm.rows - 1 && (this.farm.grid[y + 1][x].type === 'farmland' || this.farm.grid[y + 1][x].tilled);
            const hasLeft = x > 0 && (this.farm.grid[y][x - 1].type === 'farmland' || this.farm.grid[y][x - 1].tilled);
            const hasRight = x < this.farm.cols - 1 && (this.farm.grid[y][x + 1].type === 'farmland' || this.farm.grid[y][x + 1].tilled);

            const sx = (!hasLeft ? 0 : (!hasRight ? 32 : 16));
            const sy = (!hasTop ? 0 : (!hasBot ? 32 : 16));
            this.ctx.drawImage(imgFarmland, sx, sy, 16, 16, px, py, 16, 16);
          }
          if (tile.watered) {
            this.ctx.fillStyle = 'rgba(20, 50, 100, 0.35)';
            this.ctx.fillRect(px, py, 16, 16);
          }
        }
      }
    }

    // Clean Transparent Lake Decorations (NO BLACK BOXES!)
    if (this.assets.water_lilies) {
      this.ctx.drawImage(this.assets.water_lilies, 38 * 16, 14 * 16);
      this.ctx.drawImage(this.assets.water_lilies, 42 * 16, 22 * 16);
      this.ctx.drawImage(this.assets.water_lilies, 37 * 16, 25 * 16);
    }
    if (this.assets.water_rocks) {
      this.ctx.drawImage(this.assets.water_rocks, 40 * 16, 17 * 16);
      this.ctx.drawImage(this.assets.water_rocks, 43 * 16, 26 * 16);
    }

    // Smooth Horizontal Wooden Bridge to Pier
    if (this.assets.bridge_horizontal) {
      this.ctx.drawImage(this.assets.bridge_horizontal, 36 * 16, 19 * 16 - 16, 80, 48);
    }

    // Wooden Boat Moored at Lake Dock
    if (this.assets.boat) {
      this.ctx.drawImage(this.assets.boat, 41 * 16, 15 * 16, 48, 32);
    }

    // Grid Objects (Fences, Chest, Sell Bin, Well)
    for (let y = 0; y < this.farm.rows; y++) {
      for (let x = 0; x < this.farm.cols; x++) {
        const tile = this.farm.grid[y][x];
        const px = x * 16;
        const py = y * 16;

        if (tile.type === 'fence' && imgFences) {
          const up = (y > 0 && this.farm.grid[y - 1][x]?.type === 'fence') ? 1 : 0;
          const right = (x < this.farm.cols - 1 && this.farm.grid[y][x + 1]?.type === 'fence') ? 1 : 0;
          const down = (y < this.farm.rows - 1 && this.farm.grid[y + 1][x]?.type === 'fence') ? 1 : 0;
          const left = (x > 0 && this.farm.grid[y][x - 1]?.type === 'fence') ? 1 : 0;

          let col = 0, row = 0;
          if (!up && !right && !down && !left) { col = 0; row = 3; } // isolated post
          else if (!up && right && !down && !left) { col = 1; row = 0; } // left end horizontal
          else if (!up && !right && !down && left) { col = 3; row = 0; } // right end horizontal
          else if (!up && right && !down && left) { col = 2; row = 0; } // horizontal middle
          else if (up && !right && !down && !left) { col = 0; row = 2; } // bottom post vertical
          else if (!up && !right && down && !left) { col = 0; row = 0; } // top post vertical
          else if (up && !right && down && !left) { col = 0; row = 1; } // vertical middle
          else if (!up && right && down && !left) { col = 1; row = 1; } // corner top-left
          else if (!up && !right && down && left) { col = 3; row = 1; } // corner top-right
          else if (up && right && !down && !left) { col = 1; row = 3; } // corner bottom-left
          else if (up && !right && !down && left) { col = 3; row = 3; } // corner bottom-right
          else if (!up && right && down && left) { col = 2; row = 1; } // T-junction down
          else if (up && right && !down && left) { col = 2; row = 3; } // T-junction up
          else if (up && right && down && !left) { col = 1; row = 2; } // T-junction right
          else if (up && !right && down && left) { col = 3; row = 2; } // T-junction left
          else if (up && right && down && left) { col = 2; row = 2; } // 4-way cross

          this.ctx.drawImage(imgFences, col * 16, row * 16, 16, 16, px, py, 16, 16);
        }
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
        if (tile.type === 'well' && this.assets.well) {
          this.ctx.drawImage(this.assets.well, px - 2, py - 24, 20, 40);
        }

        // --- SUNNYSIDE CROPS WITH REAL GROWTH STAGES (NO MORE PUMPKIN-ONLY GLITCH!) ---
        if (tile.crop) {
          const cropSprite = this.assets[`crop_${tile.crop.id}_${tile.crop.stage}`];
          if (cropSprite) {
            const ox = Math.floor(px + (16 - cropSprite.width) / 2);
            const oy = Math.floor(py + (16 - cropSprite.height));
            this.ctx.drawImage(cropSprite, ox, oy);

            // Harvestable Glow Shimmer
            if (tile.crop.ready) {
              const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);
              this.ctx.fillStyle = `rgba(241, 196, 15, ${pulse * 0.4})`;
              this.ctx.beginPath();
              this.ctx.arc(px + 8, py + 8, 7, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }
        }
      }
    }

    // Clean Flower Borders (Away from bridge entrance & road)
    if (this.assets.bush_flowers) {
      this.ctx.drawImage(this.assets.bush_flowers, 13 * 16, 9 * 16, 32, 16);
      this.ctx.drawImage(this.assets.bush_flowers, 27 * 16, 9 * 16, 32, 16);
      this.ctx.drawImage(this.assets.bush_flowers, 14 * 16, 17 * 16, 32, 16);
      this.ctx.drawImage(this.assets.bush_flowers, 28 * 16, 17 * 16, 32, 16);
    }

    // --- CLEAN COMPLETE BUILDINGS (NO LOOSE WINDOWS/DOORS ON GRASS!) ---
    // 1. MC House (House Blue)
    if (this.assets.house_blue) {
      this.ctx.drawImage(this.assets.house_blue, 21 * 16, 3 * 16 - 16, 96, 112);
      this.renderSignboard(24 * 16, 8 * 16 + 18, '🏡 Rumah Utama (MC)');
    }

    // 2. Toko Pak Budi (House Blue style)
    if (this.assets.house_blue) {
      this.ctx.drawImage(this.assets.house_blue, 7 * 16, 20 * 16 - 20, 80, 96);
      this.renderSignboard(9 * 16, 24 * 16 + 18, '🛒 Toko Tani Pak Budi');
    }

    // 3. Mak Siti Ranch (House Red Farmhouse - FRONT FACING WITH ARCHED DOOR & WINDOWS!)
    if (this.assets.house_red) {
      this.ctx.drawImage(this.assets.house_red, 16 * 16, 20 * 16 - 20, 80, 96);
      this.renderSignboard(18 * 16, 24 * 16 + 18, '🐮 Peternakan Mak Siti');
    }

    // 4. Pandai Besi Borin (House Blue)
    if (this.assets.house_blue) {
      this.ctx.drawImage(this.assets.house_blue, 25 * 16, 20 * 16 - 20, 80, 96);
      this.renderSignboard(27 * 16, 24 * 16 + 18, '⚔️ Toko Senjata Borin');
    }

    // Portal to Mystic Woods
    this.ctx.fillStyle = 'rgba(155, 89, 182, 0.45)';
    this.ctx.fillRect(44 * 16, 1 * 16, 48, 24);
    this.renderSignboard(45 * 16, 1 * 16 + 26, '🌲 Hutan Misterius ➔');

    // Depth Sorted Entities
    const entities = [];

    // Trees
    const trees = [
      [18, 4], [28, 4], [13, 3], [34, 4], [34, 9], [3, 16], [3, 21], [33, 26], [42, 8]
    ];
    trees.forEach(([tx, ty]) => {
      entities.push({
        y: ty * 16 + 16,
        render: () => {
          if (this.assets.tree) this.ctx.drawImage(this.assets.tree, tx * 16 - 24, ty * 16 - 64, 64, 80);
        }
      });
    });

    // Clean Natural Resource Nodes (Mineable Rocks & Choppable Logs/Stumps)
    this.farm.resourceNodes.forEach(node => {
      if (node.hp <= 0) return;
      entities.push({
        y: node.y * 16 + 16,
        render: () => {
          if (node.type === 'rock' && this.assets.rock_node) {
            this.ctx.drawImage(this.assets.rock_node, node.x * 16 - 8, node.y * 16 - 8, 32, 32);
          } else if (node.type === 'ore' && this.assets.rock_node) {
            this.ctx.drawImage(this.assets.rock_node, node.x * 16 - 8, node.y * 16 - 8, 32, 32);
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.beginPath();
            this.ctx.arc(node.x * 16 + 8, node.y * 16 + 8, 4, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (node.type === 'log' && this.assets.log_wood) {
            this.ctx.drawImage(this.assets.log_wood, node.x * 16 - 8, node.y * 16 - 8, 32, 32);
          } else if (node.type === 'stump' && this.assets.stump) {
            this.ctx.drawImage(this.assets.stump, node.x * 16 - 8, node.y * 16 - 8, 32, 32);
          }

          if (node.hp < node.maxHp) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(node.x * 16, node.y * 16 - 4, 16, 3);
            this.ctx.fillStyle = '#2ed573';
            this.ctx.fillRect(node.x * 16, node.y * 16 - 4, (node.hp / node.maxHp) * 16, 3);
          }
        }
      });
    });

    // NPCs with Walking Animation and Flip
    this.farm.npcs.forEach(npc => {
      entities.push({
        y: npc.y + 16,
        render: () => {
          const img = this.assets[npc.role === 'merchant' ? 'npc_merchant' : (npc.role === 'rancher' ? 'npc_rancher' : (npc.role === 'fisher' ? 'npc_fisher' : 'player_boy'))];
          if (img) {
            const frame = Math.floor(npc.anim) % 6;
            let row = npc.isMoving ? (npc.dir === 'down' ? 3 : (npc.dir === 'up' ? 5 : 4)) : (npc.dir === 'down' ? 0 : (npc.dir === 'up' ? 2 : 1));

            this.ctx.save();
            if (npc.dir === 'left') {
              this.ctx.translate(npc.x + 24, npc.y - 12);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
            } else {
              this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, npc.x - 8, npc.y - 12, 32, 32);
            }
            this.ctx.restore();
          }
          this.renderNameTag(npc.x + 8, npc.y - 14, npc.name.split(' ')[0], '#34495e');
        }
      });
    });

    // Animals & Bots
    this.animalManager.animals.forEach(a => {
      entities.push({
        y: a.y,
        render: () => {
          const img = this.assets[a.type];
          if (img) {
            const frame = Math.floor(a.frame || 0) % 4;
            const isSmall = (a.type === 'baby_chick' || a.type === 'duck');
            const fw = isSmall ? 16 : 32;
            const fh = isSmall ? 16 : 32;
            const dw = isSmall ? 16 : 28;
            const dh = isSmall ? 16 : 28;

            this.ctx.save();
            if (a.dir === 'left') {
              this.ctx.translate(a.x + dw, a.y - 8);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, frame * fw, 0, fw, fh, 0, 0, dw, dh);
            } else {
              this.ctx.drawImage(img, frame * fw, 0, fw, fh, a.x, a.y - 8, dw, dh);
            }
            this.ctx.restore();
            a.hearts.forEach(h => { this.ctx.font = '10px sans-serif'; this.ctx.fillText('❤️', h.x, h.y); });
          }
        }
      });
    });

    this.botManager.bots.forEach(b => {
      if (b.isUnlocked()) {
        entities.push({
          y: b.y,
          render: () => {
            const img = this.assets[b.type === 'boni' ? 'bot_boni' : 'bot_slime'];
            if (img) {
              const frame = Math.floor(b.frame || 0) % 4;
              let row = b.dir === 'down' ? 0 : (b.dir === 'up' ? 2 : 1);
              this.ctx.save();
              if (b.dir === 'left') {
                this.ctx.translate(b.x + 32, b.y - 16);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
              } else {
                this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, b.x, b.y - 16, 32, 32);
              }
              this.ctx.restore();
            }
            if (b.bubbleText) this.renderSpeechBubble(b.x + 16, b.y - 8, b.bubbleText, '#2ed573');
          }
        });
      }
    });

    // Pet Follower
    if (this.farm.activePet) {
      entities.push({
        y: this.pet.y + 16,
        render: () => {
          const img = this.assets[this.farm.activePet.type];
          if (img) {
            const frame = Math.floor(this.pet.anim || 0) % 4;
            const isBig = (this.farm.activePet.type === 'pet_piggy' || this.farm.activePet.type === 'pet_sheep');
            const fw = isBig ? 32 : 16;
            const fh = isBig ? 32 : 16;
            const dw = isBig ? 24 : 18;
            const dh = isBig ? 24 : 18;

            this.ctx.save();
            if (this.pet.dir === 'left') {
              this.ctx.translate(this.pet.x + dw, this.pet.y);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, frame * fw, 0, fw, fh, 0, 0, dw, dh);
            } else {
              this.ctx.drawImage(img, frame * fw, 0, fw, fh, this.pet.x, this.pet.y, dw, dh);
            }
            this.ctx.restore();

            if (this.pet.attackTimer > 0) {
              this.ctx.fillStyle = '#f1c40f';
              this.ctx.font = '10px sans-serif';
              this.ctx.fillText('🐾', this.pet.x + 4, this.pet.y - 4);
            }
          }
        }
      });
    }

    // Players
    entities.push({
      y: this.player.y + 24,
      render: () => this.renderCharacter(this.player, true)
    });

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

  // --- 2. UNIFIED COZY INTERIOR ROOM RENDERER ---
  renderInteriorRoom(roomWidth, roomHeight, roomGrid, furnitureList, door, isMC) {
    const imgFloor = this.assets.floor_wood;
    const imgWallTop = this.assets.wall_wood_top || this.assets.wall_wood;
    const imgWallMid = this.assets.wall_wood;

    // 1. Render Floor & Wall Tiles
    for (let y = 0; y < roomHeight; y++) {
      for (let x = 0; x < roomWidth; x++) {
        const px = x * 16;
        const py = y * 16;
        const cell = roomGrid[y][x];

        if (cell.type === 'indoor_wall') {
          // Top 2 wall rows
          if (y <= 1) {
            if (imgWallTop) this.ctx.drawImage(imgWallTop, px, py, 16, 16);
            else { this.ctx.fillStyle = '#5c3a21'; this.ctx.fillRect(px, py, 16, 16); }
          } else {
            // Lower wall with baseboard
            if (imgWallMid) this.ctx.drawImage(imgWallMid, px, py, 16, 16);
            else { this.ctx.fillStyle = '#7a4e2d'; this.ctx.fillRect(px, py, 16, 16); }
          }
        } else {
          // Warm honey-oak wooden plank floor
          if (imgFloor) this.ctx.drawImage(imgFloor, px, py, 16, 16);
          else { this.ctx.fillStyle = '#d7a15c'; this.ctx.fillRect(px, py, 16, 16); }
        }
      }
    }

    // Top Wall Shadow onto floor
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    this.ctx.fillRect(16, 3 * 16, (roomWidth - 2) * 16, 6);

    // Doorway / Welcome Mat at entrance
    if (door) {
      const doorX = door.x * 16;
      const doorY = door.y * 16;
      this.ctx.fillStyle = '#8e44ad';
      this.ctx.fillRect(doorX, doorY, 16, 16);
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.font = '8px sans-serif';
      this.ctx.fillText('🚪', doorX + 4, doorY + 12);
    }

    // 2. Render Furniture (Rugs first so they lay under tables/chairs)
    const sortedFurn = [...(furnitureList || [])].sort((a, b) => {
      if (a.id === 'rug') return -1;
      if (b.id === 'rug') return 1;
      return a.y - b.y;
    });

    sortedFurn.forEach(f => {
      const img = this.assets[f.id];
      const fx = f.x * 16;
      const fy = f.y * 16;

      if (img) {
        this.ctx.drawImage(img, fx, fy);

        // Animated warm fireplace embers if fireplace
        if (f.id === 'fireplace') {
          const flicker = 0.5 + 0.5 * Math.sin(Date.now() / 150);
          this.ctx.fillStyle = `rgba(230, 126, 34, ${0.15 + flicker * 0.1})`;
          this.ctx.beginPath();
          this.ctx.arc(fx + 16, fy + 18, 28, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });

    // 3. Render Players
    this.renderCharacter(this.player, true);
    if (this.partner.active && this.partner.location === (isMC ? 'house_mc' : this.farm.currentLocation)) {
      this.renderCharacter(this.partner, false);
    }
  }

  // --- 2. MC HOUSE (WOODEN PLANK FLOOR & EMPTY SO PLAYERS DECORATE!) ---
  renderMCHouse() {
    this.renderInteriorRoom(this.farm.houseMCWidth, this.farm.houseMCHeight, this.farm.houseMC, this.farm.placedFurnitureMC, this.farm.doorMCHouse, true);
  }

  // --- 3. NPC HOUSES (FULLY FURNISHED!) ---
  renderNPCHouse(loc) {
    const room = loc === 'house_budi' ? this.farm.houseBudi : (loc === 'house_siti' ? this.farm.houseSiti : this.farm.houseBlacksmith);
    if (room) {
      this.renderInteriorRoom(room.w, room.h, room.grid, room.furniture, room.door, false);
    }
  }

  // --- 4. MYSTIC WOODS (RICH ATMOSPHERIC ENCHANTED FOREST) ---
  renderMysticWoods() {
    const imgMystic = this.assets.mystic_grass || this.assets.grass;
    const imgPath = this.assets.path;

    // 1. Base Terrain: Forest Moss Grass & Winding Earthy Dirt Trail
    for (let y = 0; y < this.farm.woodsRows; y++) {
      for (let x = 0; x < this.farm.woodsCols; x++) {
        const px = x * 16;
        const py = y * 16;
        const cell = this.farm.mysticWoodsGrid[y][x];

        // Deep enchanted moss grass tile
        if (imgMystic) {
          this.ctx.drawImage(imgMystic, px, py, 16, 16);
        } else {
          this.ctx.fillStyle = '#225533';
          this.ctx.fillRect(px, py, 16, 16);
        }

        // Earthy forest trail
        if (cell.type === 'woods_path') {
          if (imgPath) {
            this.ctx.drawImage(imgPath, px, py, 16, 16);
          } else {
            this.ctx.fillStyle = '#6b4c35';
            this.ctx.fillRect(px, py, 16, 16);
          }
          this.ctx.fillStyle = 'rgba(34, 85, 51, 0.22)';
          this.ctx.fillRect(px, py, 16, 16);
        }

        // Scattered lush grass tufts & forest clovers
        if (cell.type === 'woods_grass' && (x * 7 + y * 13) % 9 === 0) {
          this.ctx.fillStyle = '#3ca05a';
          this.ctx.fillRect(px + 4, py + 8, 2, 4);
          this.ctx.fillRect(px + 8, py + 6, 2, 6);
          this.ctx.fillRect(px + 11, py + 9, 2, 3);
        }

        // Ancient Runic Portal to Village at (2, 15)
        if (cell.type === 'portal_village') {
          const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);
          // Stone runic portal circle
          this.ctx.fillStyle = 'rgba(26, 188, 156, 0.25)';
          this.ctx.beginPath();
          this.ctx.arc(px + 8, py + 8, 20 + pulse * 4, 0, Math.PI * 2);
          this.ctx.fill();

          // Swirling emerald vortex core
          this.ctx.fillStyle = `rgba(46, 204, 113, ${0.4 + pulse * 0.3})`;
          this.ctx.beginPath();
          this.ctx.arc(px + 8, py + 8, 12, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.strokeStyle = '#2ecc71';
          this.ctx.lineWidth = 2.5;
          this.ctx.stroke();

          this.renderSignboard(px + 8, py + 26, '🏡 Portal ke Desa');
        }
      }
    }

    // 2. Y-Sorted Entities: Trees, Ancient Altar, Rocks, Crystal Ores, Stumps, Logs, Mushrooms, Monsters, Pet & Players
    const entities = [];

    // Dense Forest Trees (Oak & Maple with Clean 100% Transparency - No Watermarks!)
    if (this.farm.woodsTrees) {
      this.farm.woodsTrees.forEach(t => {
        const px = t.x * 16;
        const py = t.y * 16;
        entities.push({
          y: py + 16,
          render: () => {
            if (t.type === 'small') {
              const img = this.assets.woods_tree_small || this.assets.tree;
              if (img) this.ctx.drawImage(img, px - 8, py - 36, 32, 48);
            } else {
              const img = this.assets.woods_tree_big || this.assets.tree;
              if (img) this.ctx.drawImage(img, px - 24, py - 64, 64, 80);
            }
          }
        });
      });
    }

    // Rich Interactive Woods Nodes
    if (this.farm.woodsNodes) {
      this.farm.woodsNodes.forEach(node => {
        if (node.hp <= 0 && node.type !== 'ancient_altar') return;
        const nx = node.x * 16;
        const ny = node.y * 16;

        entities.push({
          y: ny + 14,
          render: () => {
            if (node.type === 'ancient_altar') {
              // Glowing runic circle on stone floor
              const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 250);
              this.ctx.fillStyle = `rgba(0, 210, 211, ${0.15 + pulse * 0.15})`;
              this.ctx.beginPath();
              this.ctx.arc(nx + 16, ny + 16, 32, 0, Math.PI * 2);
              this.ctx.fill();

              this.ctx.strokeStyle = `rgba(72, 219, 251, ${0.4 + pulse * 0.4})`;
              this.ctx.lineWidth = 2;
              this.ctx.stroke();

              // Ancient Altar Sprite
              const altarImg = this.assets.woods_ancient_altar;
              if (altarImg) this.ctx.drawImage(altarImg, nx, ny, 32, 32);

              // Floating magical blue flame beacon
              this.ctx.fillStyle = '#00d2d3';
              this.ctx.beginPath();
              this.ctx.arc(nx + 16, ny + 4, 3 + pulse * 2, 0, Math.PI * 2);
              this.ctx.fill();

              this.renderSignboard(nx + 16, ny + 36, '✨ Altar Purba');
            } else if (node.type === 'woods_ore') {
              const oreImg = this.assets.woods_crystal_ore;
              if (oreImg) this.ctx.drawImage(oreImg, nx, ny, 16, 16);
              // Purple sparkle glint
              const shimmer = 0.5 + 0.5 * Math.sin((Date.now() + nx * 10) / 200);
              this.ctx.fillStyle = `rgba(165, 94, 234, ${shimmer * 0.4})`;
              this.ctx.fillRect(nx + 4, ny + 4, 8, 8);
            } else if (node.type === 'woods_rock') {
              const rImg = this.assets.woods_rock || this.assets.rock_node;
              if (rImg) this.ctx.drawImage(rImg, nx - 4, ny - 4, 24, 24);
            } else if (node.type === 'woods_log') {
              const logImg = this.assets.woods_log || this.assets.log_wood;
              if (logImg) this.ctx.drawImage(logImg, nx - 4, ny, 32, 16);
            } else if (node.type === 'woods_stump') {
              const sImg = this.assets.woods_stump || this.assets.stump;
              if (sImg) this.ctx.drawImage(sImg, nx, ny, 16, 16);
            } else if (node.type === 'shroom_blue') {
              const mImg = this.assets.woods_shroom_blue;
              const f = Math.floor(Date.now() / 200) % 4;
              if (mImg) this.ctx.drawImage(mImg, f * 16, 0, 16, 16, nx, ny, 16, 16);
              this.ctx.fillStyle = 'rgba(72, 219, 251, 0.25)';
              this.ctx.beginPath();
              this.ctx.arc(nx + 8, ny + 8, 7, 0, Math.PI * 2);
              this.ctx.fill();
            } else if (node.type === 'shroom_red') {
              const mImg = this.assets.woods_shroom_red;
              const f = Math.floor(Date.now() / 200) % 4;
              if (mImg) this.ctx.drawImage(mImg, f * 16, 0, 16, 16, nx, ny, 16, 16);
              this.ctx.fillStyle = 'rgba(255, 107, 129, 0.25)';
              this.ctx.beginPath();
              this.ctx.arc(nx + 8, ny + 8, 7, 0, Math.PI * 2);
              this.ctx.fill();
            }

            // Health bar if node is damaged
            if (node.hp < node.maxHp) {
              this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
              this.ctx.fillRect(nx, ny - 4, 16, 3);
              this.ctx.fillStyle = '#2ed573';
              this.ctx.fillRect(nx, ny - 4, (node.hp / node.maxHp) * 16, 3);
            }
          }
        });
      });
    }

    // Hostile Monsters with Clean Health Bars & Smooth Animations
    this.farm.monsters.forEach(m => {
      if (m.hp <= 0) return;
      entities.push({
        y: m.y + 16,
        render: () => {
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

            // Clean, Compact Monster Health Bar anchored right above monster head
            const barW = 20;
            const barH = 3;
            const barX = m.x + 6;
            const barY = m.y - 6;

            this.ctx.fillStyle = 'rgba(15, 20, 25, 0.85)';
            this.ctx.beginPath();
            this.ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2);
            this.ctx.fill();

            const hpRatio = Math.max(0, m.hp / m.maxHp);
            const fillCol = hpRatio > 0.5 ? '#2ed573' : (hpRatio > 0.25 ? '#ffa502' : '#ff4757');
            this.ctx.fillStyle = fillCol;
            this.ctx.fillRect(barX, barY, Math.round(barW * hpRatio), barH);

            // Level & Name Tag
            this.ctx.font = 'bold 8px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
            this.ctx.shadowBlur = 2;
            const monsterLabel = m.type === 'slime' ? `Slime Lv.${m.level || 1}` : `Tengkorak Lv.${m.level || 2}`;
            this.ctx.fillText(monsterLabel, m.x + 16, m.y - 8);
            this.ctx.shadowBlur = 0;
          }
        }
      });
    });

    // Companion Pet Follower & Combat Assistant
    if (this.farm.activePet) {
      entities.push({
        y: this.pet.y + 16,
        render: () => {
          const img = this.assets[this.farm.activePet.type];
          if (img) {
            const frame = Math.floor(this.pet.anim || 0) % 4;
            const isBig = (this.farm.activePet.type === 'pet_piggy' || this.farm.activePet.type === 'pet_sheep');
            const fw = isBig ? 32 : 16;
            const fh = isBig ? 32 : 16;
            const dw = isBig ? 24 : 18;
            const dh = isBig ? 24 : 18;

            this.ctx.save();
            if (this.pet.dir === 'left') {
              this.ctx.translate(this.pet.x + dw, this.pet.y);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, frame * fw, 0, fw, fh, 0, 0, dw, dh);
            } else {
              this.ctx.drawImage(img, frame * fw, 0, fw, fh, this.pet.x, this.pet.y, dw, dh);
            }
            this.ctx.restore();

            // Combat Lunge indicator
            if (this.pet.attackTimer > 0) {
              this.ctx.fillStyle = '#f1c40f';
              this.ctx.font = 'bold 9px sans-serif';
              this.ctx.fillText('🐾 Cakar!', this.pet.x + 2, this.pet.y - 6);
            }
          }
        }
      });
    }

    // Players
    entities.push({
      y: this.player.y + 24,
      render: () => this.renderCharacter(this.player, true)
    });

    if (this.partner.active && this.partner.location === 'woods') {
      entities.push({
        y: this.partner.y + 24,
        render: () => this.renderCharacter(this.partner, false)
      });
    }

    // Render sorted entities from top to bottom
    entities.sort((a, b) => a.y - b.y).forEach(e => e.render());

    // 3. Mystic Atmospheric Lighting & Enchanted Spores
    const time = Date.now() / 1000;
    // Ambient forest tint (cool emerald mist)
    this.ctx.fillStyle = 'rgba(12, 38, 28, 0.12)';
    this.ctx.fillRect(0, 0, this.farm.woodsCols * 16, this.farm.woodsRows * 16);

    // Floating Enchanted Forest Wisps & Spores
    for (let i = 0; i < 18; i++) {
      const fx = ((i * 41 + time * 14) % (this.farm.woodsCols * 16));
      const fy = ((i * 29 + Math.sin(time * 1.5 + i) * 18 + 20) % (this.farm.woodsRows * 16));
      const alpha = 0.3 + 0.45 * Math.sin(time * 2 + i);
      this.ctx.fillStyle = i % 2 === 0 ? `rgba(46, 213, 115, ${alpha})` : `rgba(165, 94, 234, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

    // --- CHARACTER SPRITES WITH 4-FRAME ATTACK CLAMP ---
  renderCharacter(char, isLocal) {
    const img = char.role === 'girl' ? this.assets.player_girl : this.assets.player_boy;
    if (!img) return;

    this.ctx.save();
    let row = 0;
    if (char.currentAction === 'action') row = char.dir === 'down' ? 6 : (char.dir === 'up' ? 8 : 7);
    else if (char.isMoving) row = char.dir === 'down' ? 3 : (char.dir === 'up' ? 5 : 4);
    else row = char.dir === 'down' ? 0 : (char.dir === 'up' ? 2 : 1);

    const maxFrames = char.currentAction === 'action' ? 4 : 6;
    const frame = Math.floor(char.animFrame % maxFrames);
    const flip = char.dir === 'left';

    if (flip) {
      this.ctx.translate(char.x + 32, char.y);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
    } else {
      this.ctx.drawImage(img, frame * 32, row * 32, 32, 32, char.x, char.y, 32, 32);
    }
    this.ctx.restore();

    // --- REAL ACTION SWING ANIMATIONS (MINING, WOODCUTTING, TILLING, WATERING, SWORD) ---
    if (char.currentAction === 'action') {
      const toolType = char.actionType || (isLocal ? this.farm.hotbar[this.farm.activeHotbarIndex] : 'sword');
      const cx = char.x + 16;
      const cy = char.y + 18;
      const dir = char.dir || 'down';

      let forwardX = dir === 'right' ? 14 : (dir === 'left' ? -14 : 0);
      let forwardY = dir === 'down' ? 14 : (dir === 'up' ? -14 : 0);

      this.ctx.save();

      if (toolType === 'pickaxe') {
        // Mining: Overhead downward pickaxe swing arc with bright white spark & stone glints
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        const startAngle = dir === 'left' ? Math.PI * 0.8 : (dir === 'right' ? -Math.PI * 0.3 : 0);
        this.ctx.arc(cx + forwardX, cy + forwardY, 18, startAngle, startAngle + 1.8);
        this.ctx.stroke();

        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText('⛏️', cx + forwardX * 0.8, cy + forwardY * 0.8);
      } else if (toolType === 'axe') {
        // Woodcutting: Sweeping white blade swoosh trail + flying woodchips
        this.ctx.strokeStyle = '#e0f7fa';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.arc(cx + forwardX, cy + forwardY, 20, -0.6, 1.6);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffb142';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText('🪓', cx + forwardX * 0.8, cy + forwardY * 0.8);
      } else if (toolType === 'hoe') {
        // Tilling: Hoe arc digging downward into soil
        this.ctx.strokeStyle = '#d7a15c';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(cx + forwardX, cy + forwardY, 16, 0.2, 2.2);
        this.ctx.stroke();

        this.ctx.font = '12px sans-serif';
        this.ctx.fillText('🌾', cx + forwardX * 0.8, cy + forwardY * 0.8);
      } else if (toolType === 'water') {
        // Watering: Water can tilted + cascading water droplet stream
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText('💧', cx + forwardX, cy + forwardY);
        this.ctx.strokeStyle = '#00d2d3';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx + forwardX * 0.5, cy + forwardY * 0.5);
        this.ctx.lineTo(cx + forwardX, cy + forwardY + 8);
        this.ctx.stroke();
      } else {
        // Combat Sword Slash Crescent
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 22, -0.5, 1.5);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    // --- FISHING ANIMATION: BAMBOO ROD, CURVED LINE, FLOATING BOBBER & BITE ALERT ---
    if (char.isFishing) {
      this.ctx.save();
      const cx = char.x + 16;
      const cy = char.y + 16;
      const rodEndX = cx + (char.dir === 'left' ? -22 : 22);
      const rodEndY = cy - 8;

      // 1. Bamboo Fishing Rod
      this.ctx.strokeStyle = '#d35400';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(cx + (char.dir === 'left' ? -4 : 4), cy + 2);
      this.ctx.lineTo(rodEndX, rodEndY);
      this.ctx.stroke();

      // 2. High-Tensile Curved Fishing Line into Water
      const bobberX = rodEndX + (char.dir === 'left' ? -28 : 28);
      const bobberY = cy + 12;

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(rodEndX, rodEndY);
      this.ctx.quadraticCurveTo((rodEndX + bobberX) / 2, rodEndY - 10, bobberX, bobberY);
      this.ctx.stroke();

      // 3. Floating Red & White Bobber with Water Ripples
      const wave = Math.sin(Date.now() / 200) * 1.5;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.ellipse(bobberX, bobberY + wave, 6, 3, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Bobber float
      this.ctx.fillStyle = '#ff4757';
      this.ctx.beginPath();
      this.ctx.arc(bobberX, bobberY - 2 + wave, 3, Math.PI, 0);
      this.ctx.fill();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(bobberX, bobberY - 2 + wave, 3, 0, Math.PI);
      this.ctx.fill();

      // 4. Fish Bite Alert Bubble
      if (char.fishingBite) {
        const pulse = 1 + 0.15 * Math.sin(Date.now() / 100);
        this.ctx.save();
        this.ctx.translate(cx, cy - 24);
        this.ctx.scale(pulse, pulse);
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.fillStyle = '#ff4757';
        this.ctx.fillText('❗ TARIK!', 0, 0);
        this.ctx.restore();
      }

      this.ctx.restore();
    }

    // --- REAL HAND-HELD EQUIPMENT (PIXEL ART IN HAND, NOT A FLOATING STICKER!) ---
    if (!char.isFishing && char.currentAction !== 'action') {
      const heldId = isLocal ? this.farm.hotbar[this.farm.activeHotbarIndex] : (char.heldItem || null);
      if (heldId && window.ITEM_CATALOG && window.ITEM_CATALOG[heldId]) {
        const itemDef = window.ITEM_CATALOG[heldId];
        const bobY = char.isMoving ? Math.sin((char.animFrame || 0) * Math.PI) * 1.5 : 0;
        const dir = char.dir || 'down';

        this.ctx.save();

        // 1. Tool / Weapon Pixel Sprites
        let toolSprite = null;
        if (heldId === 'axe') toolSprite = this.assets.tool_axe;
        else if (heldId === 'pickaxe') toolSprite = this.assets.tool_pickaxe;
        else if (heldId === 'hoe') toolSprite = this.assets.tool_hoe;
        else if (heldId === 'water') toolSprite = this.assets.tool_water;
        else if (heldId === 'sword_iron' || heldId === 'sword') toolSprite = this.assets.tool_sword;
        else if (heldId === 'fishing_rod' || heldId === 'rod') toolSprite = this.assets.tool_rod;

        if (toolSprite) {
          let gripX = char.x + 20;
          let gripY = char.y + 19 + bobY;
          let angle = 0;
          let flipH = false;

          if (dir === 'down') {
            gripX = char.x + 21;
            gripY = char.y + 19 + bobY;
            angle = -0.25; // Tilted slightly outward
          } else if (dir === 'up') {
            gripX = char.x + 10;
            gripY = char.y + 18 + bobY;
            angle = 0.35;
          } else if (dir === 'right') {
            gripX = char.x + 21;
            gripY = char.y + 18 + bobY;
            angle = 0.35;
          } else if (dir === 'left') {
            gripX = char.x + 11;
            gripY = char.y + 18 + bobY;
            angle = -0.35;
            flipH = true;
          }

          this.ctx.translate(gripX, gripY);
          if (flipH) this.ctx.scale(-1, 1);
          this.ctx.rotate(angle);

          // Draw tool sprite with handle firmly gripped
          this.ctx.drawImage(toolSprite, -3, -11, 14, 14);

          // Draw pixel hand fingers grasping around the handle
          this.ctx.fillStyle = char.role === 'girl' ? '#ffd8c2' : '#f5c6a5';
          this.ctx.fillRect(-2, -3, 3, 3);
          this.ctx.fillStyle = '#d39e82';
          this.ctx.fillRect(-1, -2, 2, 1);
        } else {
          // 2. Crop / Food / Seed Held in Both Hands in front of chest
          const holdX = char.x + 16;
          const holdY = char.y + 18 + bobY;
          const cropSprite = this.assets[`crop_${itemDef.cropId || heldId}_5`];

          if (cropSprite) {
            this.ctx.drawImage(cropSprite, holdX - 6, holdY - 8, 12, 12);
          } else {
            this.ctx.font = '11px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(itemDef.icon, holdX, holdY + 2);
          }

          // Hands holding item
          this.ctx.fillStyle = char.role === 'girl' ? '#ffd8c2' : '#f5c6a5';
          this.ctx.fillRect(holdX - 7, holdY - 2, 3, 2);
          this.ctx.fillRect(holdX + 4, holdY - 2, 3, 2);
        }

        this.ctx.restore();
      }
    }

    this.renderNameTag(char.x + 16, char.y + 3, `${char.name} ${char.role === 'girl' ? '🌸' : '🌱'}`, isLocal ? 'rgba(0,0,0,0.55)' : 'rgba(235,77,75,0.75)');

    if (isLocal && this.activePrompt) {
      this.ctx.save();
      this.ctx.font = 'bold 8px sans-serif';
      this.ctx.fillStyle = '#fffa65';
      this.ctx.strokeStyle = '#222f3e';
      this.ctx.lineWidth = 2;
      this.ctx.strokeText('[E]', char.x + 16, char.y - 12);
      this.ctx.fillText('[E]', char.x + 16, char.y - 12);
      this.ctx.restore();
    }

    if (char.emote) {
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText(char.emote, char.x + 16, char.y - 14);
    }
  }

  renderNameTag(x, y, text, bg) {
    this.ctx.save();
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(text).width;

    this.ctx.fillStyle = bg;
    this.ctx.beginPath();
    this.ctx.roundRect(x - tw / 2 - 4, y - 9, tw + 8, 12, 6);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  renderSignboard(x, y, text) {
    this.ctx.save();
    this.ctx.font = 'bold 8.5px sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(text).width;

    this.ctx.fillStyle = 'rgba(44, 62, 80, 0.82)';
    this.ctx.beginPath();
    this.ctx.roundRect(x - tw / 2 - 4, y - 9, tw + 8, 12, 4);
    this.ctx.fill();

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  renderSpeechBubble(x, y, text, color = '#2ed573') {
    this.ctx.save();
    this.ctx.font = 'bold 8px sans-serif';
    this.ctx.textAlign = 'center';
    const tw = this.ctx.measureText(text).width;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(x - tw / 2 - 4, y - 12, tw + 8, 14, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#2f3542';
    this.ctx.fillText(text, x, y - 2);
    this.ctx.restore();
  }

  renderAtmosphere() {
    const timeInfo = this.farm.getTimeOfDay();
    if (timeInfo.ambient && timeInfo.ambient !== 'rgba(255, 255, 255, 0)') {
      this.ctx.fillStyle = timeInfo.ambient;
      this.ctx.fillRect(0, 0, this.farm.cols * 16, this.farm.rows * 16);
    }

    if (timeInfo.phase === 'night' || timeInfo.phase === 'sunset') {
      this.ctx.save();
      this.fireflies.forEach(f => {
        const glow = 0.4 + 0.4 * Math.sin(f.phase);
        this.ctx.fillStyle = `rgba(241, 196, 15, ${glow.toFixed(2)})`;
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
        this.ctx.fill();
      });
      this.ctx.restore();
    }
  }

  renderUIOverlays() {
    // 1. Contextual Action Prompt Banner (Cleanly on top center, never blocks hotbar!)
    if (this.activePrompt) {
      this.ctx.save();
      this.ctx.font = 'bold 13px sans-serif';
      const text = this.activePrompt.text;
      const tw = this.ctx.measureText(text).width;
      const cx = this.canvas.width / 2;
      const cy = 76;

      this.ctx.fillStyle = 'rgba(255, 240, 243, 0.96)';
      this.ctx.strokeStyle = '#ff4757';
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

    // 2. Floating Damage / Numbers
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.font = 'bold 13px sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });

    // 3. Screen Flash Red (Damage), Green (Heal) & Black (Faint Sleep)
    if (this.screenFlashRed > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(231, 76, 60, ${Math.min(0.4, this.screenFlashRed).toFixed(2)})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    if (this.screenFlashGreen > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(46, 213, 115, ${Math.min(0.3, this.screenFlashGreen).toFixed(2)})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    if (this.screenFadeBlack > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, this.screenFadeBlack).toFixed(2)})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }

    // 4. Notifications
    let ny = this.canvas.height - 120;
    this.notifications.forEach(n => {
      this.ctx.save();
      this.ctx.font = '12px sans-serif';
      const tw = this.ctx.measureText(n.text).width;
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      this.ctx.beginPath();
      this.ctx.roundRect(16, ny - 14, tw + 16, 22, 6);
      this.ctx.fill();
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(n.text, 24, ny);
      this.ctx.restore();
      ny -= 26;
    });
  }

  setupHUDButtons() {
    document.getElementById('btnToggleSound')?.addEventListener('click', () => {
      if (window.soundSystem) {
        const on = window.soundSystem.toggleSound();
        document.getElementById('btnToggleSound').textContent = on ? '🔊' : '🔇';
      }
    });

    document.getElementById('btnToggleMusic')?.addEventListener('click', () => {
      if (window.soundSystem) {
        const on = window.soundSystem.toggleMusic();
        document.getElementById('btnToggleMusic').textContent = on ? '🎵' : '💤';
      }
    });

    document.getElementById('btnOpenBag')?.addEventListener('click', () => this.toggleInventoryModal());
    document.getElementById('btnOpenChest')?.addEventListener('click', () => this.openChestModal());
    document.getElementById('btnOpenBots')?.addEventListener('click', () => {
      this.updateBotModalUI();
      document.getElementById('modalBots')?.classList.remove('hidden');
    });
    document.getElementById('btnOpenSave')?.addEventListener('click', () => {
      document.getElementById('modalSave')?.classList.remove('hidden');
    });
    document.getElementById('btnTakePic')?.addEventListener('click', () => this.takeRomanticPhoto());

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      this.network.sendChat(text);
      this.appendChat(this.player.name, text, true);
    });
  }

  appendChat(sender, message, isSelf = false) {
    const logs = document.getElementById('chatLogs');
    if (!logs) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isSelf ? 'self' : 'partner'}`;
    bubble.innerHTML = `<strong>${sender}:</strong> ${message}`;
    logs.appendChild(bubble);
    logs.scrollTop = logs.scrollHeight;
  }

  takeRomanticPhoto() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 480;
    pCanvas.height = 580;
    const pCtx = pCanvas.getContext('2d');

    pCtx.fillStyle = '#ffeff2';
    pCtx.fillRect(0, 0, 480, 580);

    const snapW = 440;
    const snapH = 440;
    pCtx.drawImage(this.canvas, this.canvas.width / 2 - snapW / 2, this.canvas.height / 2 - snapH / 2, snapW, snapH, 20, 20, snapW, snapH);

    pCtx.strokeStyle = '#ff4757';
    pCtx.lineWidth = 6;
    pCtx.strokeRect(20, 20, snapW, snapH);

    pCtx.fillStyle = '#ff4757';
    pCtx.font = 'bold 20px sans-serif';
    pCtx.textAlign = 'center';
    const coupleText = `${this.player.name} ❤️ ${this.partner.active ? this.partner.name : 'Pacar Tercinta'}`;
    pCtx.fillText(coupleText, 240, 495);

    pCtx.fillStyle = '#747d8c';
    pCtx.font = '12px sans-serif';
    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    pCtx.fillText(`Kebun Cinta Kita • Hari ke-${this.farm.dayCount} • ${dateStr}`, 240, 530);

    const dataUrl = pCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `foto-kebun-cinta-${this.player.name}-${Date.now()}.png`;
    a.click();
    this.showNotification('Foto kenangan berdua berhasil disimpan ke galeri! 📷💖');
  }

  // --- BOT ASSISTANTS MANAGEMENT ---
  hireBot(botId, price) {
    if (this.farm.unlockedBots && this.farm.unlockedBots[botId]) {
      this.showNotification('Pembantu bot ini sudah kamu sewa dan aktif bekerja di kebun! 🤖✨');
      return;
    }
    if (this.farm.coins >= price) {
      this.farm.coins -= price;
      if (!this.farm.unlockedBots) this.farm.unlockedBots = {};
      this.farm.unlockedBots[botId] = true;
      this.farm.addLovePoints(25);
      this.farm.autoSave();

      const bot = this.botManager.bots.find(b => b.id === botId);
      if (bot) {
        bot.say('Halo Boss! Saya siap membantu di kebun! 🤖✨', 4);
      }

      const botName = botId === 'slime' ? 'Slimey Si Air 💦' : (botId === 'boni' ? 'Boni Si Panen 🧺' : 'Bot Pekerja 🤖');
      this.showNotification(`Berhasil menyewa ${botName}! Langsung aktif bekerja di kebun! 🎉`);
      if (window.soundSystem) window.soundSystem.playPurchase();
      this.updateHUD();
      this.updateBotModalUI();
    } else {
      this.showNotification(`Koin tidak mencukupi! Koinmu: ${this.farm.coins} 🪙 (Butuh: ${price} 🪙).`);
      alert(`Koin tidak mencukupi!\nKoin kamu saat ini: ${this.farm.coins} 🪙\nBiaya sewa: ${price} 🪙\n\nTips: Panen tanaman atau jual hasil kebun ke Pak Budi di desa untuk mengumpulkan koin! 🌾🪙`);
    }
  }

  updateBotModalUI() {
    const coinEl = document.getElementById('botModalCoins');
    if (coinEl && this.farm) {
      coinEl.textContent = this.farm.coins || 0;
    }
    const slimeBtn = document.querySelector('#botStatus_slime');
    if (slimeBtn) {
      if (this.farm.unlockedBots?.slime) {
        slimeBtn.innerHTML = '<span style="color:#2ed573; font-weight:700;">✅ Sedang Aktif Bekerja Menyiram Ladang 💦</span>';
      } else {
        slimeBtn.innerHTML = '<button class="btn-buy" onclick="hireBotAction(\'slime\', 50)">Sewa Slimey (50 🪙)</button>';
      }
    }
    const boniBtn = document.querySelector('#botStatus_boni');
    if (boniBtn) {
      if (this.farm.unlockedBots?.boni) {
        boniBtn.innerHTML = '<span style="color:#2ed573; font-weight:700;">✅ Sedang Aktif Bekerja Memetik Panen 🧺</span>';
      } else {
        boniBtn.innerHTML = '<button class="btn-buy" onclick="hireBotAction(\'boni\', 80)">Sewa Boni (80 🪙)</button>';
      }
    }
  }
}

window.Game = Game;
window.hireBotAction = function(botId, price) {
  if (window.game) {
    window.game.hireBot(botId, price);
  }
};
