// js/game.js - Main Canvas Engine, Rendering, Input, and Couple Interactions
// 60 FPS Pixel Art Engine for "Kebun Cinta Kita"

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Subsystems
    this.farm = new FarmManager(36, 24, 16);
    this.botManager = new BotManager(this.farm);
    this.animalManager = new AnimalManager(this.farm);
    this.network = new NetworkManager(this);

    // Player Data
    this.player = {
      name: 'Zahy',
      role: 'boy', // 'boy' or 'girl'
      x: 18 * 16,
      y: 11 * 16,
      speed: 70, // pixels per sec
      dir: 'down', // 'down', 'right', 'up', 'left'
      isMoving: false,
      animFrame: 0,
      animTimer: 0,
      currentAction: 'idle', // 'idle', 'walk', 'till', 'water', 'plant'
      actionTimer: 0,
      selectedTool: 'hoe', // 'hoe', 'water', 'seed_carrot', 'seed_strawberry', 'seed_tomato', 'harvest', 'flower'
      emote: null,
      emoteTimer: 0
    };

    // Partner Player (Mabar)
    this.partner = {
      name: 'Aurel',
      role: 'girl',
      x: 19 * 16,
      y: 11 * 16,
      dir: 'down',
      isMoving: false,
      animFrame: 0,
      currentAction: 'idle',
      emote: null,
      emoteTimer: 0,
      active: false
    };

    // Camera
    this.camera = {
      x: 0,
      y: 0,
      scale: 3 // Sharp retro pixel zoom
    };

    // Input state
    this.keys = {};
    this.touchJoystick = { active: false, dx: 0, dy: 0 };

    // Fireflies particles for romantic night
    this.fireflies = [];
    for (let i = 0; i < 20; i++) {
      this.fireflies.push({
        x: Math.random() * (this.farm.cols * 16),
        y: Math.random() * (this.farm.rows * 16),
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        alpha: Math.random(),
        da: 0.02
      });
    }

    // Floating UI notifications & sparkles
    this.notifications = [];
    this.sparkles = [];

    // Assets container
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
      decor: 'assets/tiles/decor.png'
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
          console.log('Semua aset grafis berhasil dimuat!');
          if (callback) callback();
        }
      };
      img.onerror = () => {
        console.warn('Gagal memuat aset:', src);
        loadedCount++;
        if (loadedCount >= total) {
          this.assetsLoaded = true;
          if (callback) callback();
        }
      };
    }
  }

  init() {
    this.setupResize();
    this.setupKeyboard();
    this.setupTouchControls();
    this.setupHUDButtons();

    // Start game loop
    requestAnimationFrame((t) => this.loop(t));
  }

  setupResize() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx.imageSmoothingEnabled = false;

      // Adjust camera zoom for screen size (higher scale on big screens, 2.5 on phones)
      if (window.innerWidth < 600) {
        this.camera.scale = 2.4;
      } else if (window.innerWidth < 1200) {
        this.camera.scale = 3.0;
      } else {
        this.camera.scale = 3.5;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  // --- Keyboard & Input ---
  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Ignore key events when typing in chat input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      this.keys[e.key.toLowerCase()] = true;

      // Tool shortcuts (1-7)
      if (e.key === '1') this.selectTool('hoe');
      if (e.key === '2') this.selectTool('water');
      if (e.key === '3') this.selectTool('seed_carrot');
      if (e.key === '4') this.selectTool('seed_strawberry');
      if (e.key === '5') this.selectTool('seed_tomato');
      if (e.key === '6') this.selectTool('harvest');
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

  // --- Touch Controls for Mobile ---
  setupTouchControls() {
    const joyBase = document.getElementById('joystickBase');
    const joyStick = document.getElementById('joystickStick');
    if (!joyBase || !joyStick) return;

    let touchId = null;
    let baseRect = null;
    let center = { x: 0, y: 0 };
    const maxRadius = 40;

    joyBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      baseRect = joyBase.getBoundingClientRect();
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

    // Touch Action Buttons
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
        this.toggleEmoteWheel();
      });
    }
    if (btnToolCycle) {
      btnToolCycle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.cycleNextTool();
      });
    }
  }

  // --- Tool Actions ---
  selectTool(toolId) {
    this.player.selectedTool = toolId;
    document.querySelectorAll('.hotbar-slot').forEach(slot => {
      if (slot.dataset.tool === toolId) {
        slot.classList.add('active');
      } else {
        slot.classList.remove('active');
      }
    });
  }

  cycleNextTool() {
    const tools = ['hoe', 'water', 'seed_carrot', 'seed_strawberry', 'seed_tomato', 'harvest', 'flower'];
    const idx = tools.indexOf(this.player.selectedTool);
    const nextTool = tools[(idx + 1) % tools.length];
    this.selectTool(nextTool);
  }

  getTargetTileCoords() {
    // Determine the tile in front of the player
    let tx = Math.floor((this.player.x + 16) / 16);
    let ty = Math.floor((this.player.y + 24) / 16);

    if (this.player.dir === 'down') ty += 1;
    else if (this.player.dir === 'up') ty -= 1;
    else if (this.player.dir === 'right') tx += 1;
    else if (this.player.dir === 'left') tx -= 1;

    return { tx, ty };
  }

  performToolAction() {
    const { tx, ty } = this.getTargetTileCoords();
    const tool = this.player.selectedTool;

    this.player.currentAction = 'action';
    this.player.actionTimer = 0.3;

    if (tool === 'hoe') {
      const ok = this.farm.tillSoil(tx, ty);
      if (ok) {
        if (window.soundSystem) window.soundSystem.playTill();
        this.showSparkle(tx * 16 + 8, ty * 16 + 8, '🌾');
        this.network.send({ type: 'action_till', x: tx, y: ty });
      }
    } else if (tool === 'water') {
      const ok = this.farm.waterSoil(tx, ty);
      if (ok) {
        if (window.soundSystem) window.soundSystem.playWater();
        this.showSparkle(tx * 16 + 8, ty * 16 + 8, '💧');
        this.network.send({ type: 'action_water', x: tx, y: ty });
      }
    } else if (tool.startsWith('seed_')) {
      const cropId = tool.replace('seed_', '');
      // Check seeds count in chest or pocket
      if ((this.farm.chest.seeds[cropId] || 0) > 0) {
        const ok = this.farm.plantCrop(tx, ty, cropId);
        if (ok) {
          this.farm.chest.seeds[cropId]--;
          if (window.soundSystem) window.soundSystem.playPlant();
          this.showSparkle(tx * 16 + 8, ty * 16 + 8, '🌱');
          this.network.send({ type: 'action_plant', x: tx, y: ty, cropId });
        } else {
          this.showNotification('Cangkul tanah terlebih dahulu sebelum menanam! 🌾');
        }
      } else {
        this.showNotification(`Bibit ${cropId} habis! Beli di Peti/Toko ya~ 📦`);
      }
    } else if (tool === 'harvest') {
      const def = this.farm.harvestCrop(tx, ty);
      if (def) {
        if (window.soundSystem) window.soundSystem.playHarvest();
        this.showSparkle(tx * 16 + 8, ty * 16 + 8, def.icon);
        this.showNotification(`Berhasil memanen ${def.name}! Disimpan di Peti 🧺✨`);
        this.network.send({ type: 'action_harvest', x: tx, y: ty });
      }
    } else if (tool === 'flower') {
      // Give flower to partner
      this.triggerCoupleKiss(false);
      this.showEmote('🌸');
    }

    this.updateHUD();
  }

  performInteractAction() {
    const { tx, ty } = this.getTargetTileCoords();
    const px = this.player.x + 16;
    const py = this.player.y + 16;

    // 1. Check Petting Animals
    const animal = this.animalManager.getNearestAnimal(px, py, 36);
    if (animal) {
      const produce = animal.pet();
      if (produce) {
        this.showNotification(`Mengelus ${animal.name}! Dapat ${produce.name}! ❤️`);
        this.network.send({ type: 'action_pet_animal', animalId: animal.id });
        this.updateHUD();
        return;
      }
    }

    // 2. Check Partner Kiss/Hug if close
    if (this.partner.active) {
      const dist = Math.hypot(this.partner.x - this.player.x, this.partner.y - this.player.y);
      if (dist < 40) {
        this.triggerCoupleKiss(false);
        return;
      }
    }

    // 3. Check Shared Chest
    const targetTile = this.farm.grid[ty] && this.farm.grid[ty][tx];
    if (targetTile && targetTile.type === 'chest') {
      this.openChestModal();
      return;
    }

    // 4. Check Sell Bin
    if (targetTile && targetTile.type === 'sell_bin') {
      const earned = this.farm.sellAllProduce();
      if (earned > 0) {
        if (window.soundSystem) window.soundSystem.playCoin();
        this.showNotification(`Semua hasil panen terjual! Dapat +${earned} Koin Cinta! 🪙🎉`);
        this.network.send({ type: 'action_sell' });
      } else {
        this.showNotification('Peti hasil panen kosong! Belum ada sayur untuk dijual~');
      }
      this.updateHUD();
      return;
    }

    // 5. Check House Bed / Sleep
    if (targetTile && targetTile.type === 'house') {
      this.farm.sleepTogether();
      this.showNotification('Kalian beristirahat bersama dan menyambut pagi yang cerah! ☀️');
      this.network.send({ type: 'action_sleep' });
      this.updateHUD();
      return;
    }

    // 6. Default: try to harvest if ready
    if (targetTile && targetTile.crop && targetTile.crop.ready) {
      const def = this.farm.harvestCrop(tx, ty);
      if (def) {
        if (window.soundSystem) window.soundSystem.playHarvest();
        this.showSparkle(tx * 16 + 8, ty * 16 + 8, def.icon);
        this.showNotification(`Memanen ${def.name}! 🧺✨`);
        this.network.send({ type: 'action_harvest', x: tx, y: ty });
        this.updateHUD();
      }
    }
  }

  // --- Couple Interactions ---
  triggerCoupleKiss(fromPartner = false) {
    if (window.soundSystem) window.soundSystem.playKiss();
    this.farm.addLovePoints(25);

    // Spawn heart particles between players
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

  triggerCoupleHug(fromPartner = false) {
    if (window.soundSystem) window.soundSystem.playHug();
    this.farm.addLovePoints(15);
    this.showEmote('🤗');
    if (!fromPartner) {
      this.showNotification(`Kamu memeluk erat ${this.partner.name}! Sangat hangat~ 💖`);
      this.network.send({ type: 'action_hug' });
    }
    this.updateHUD();
  }

  showEmote(emote) {
    this.player.emote = emote;
    this.player.emoteTimer = 3.0;
    this.network.send({ type: 'action_emote', emote });
  }

  showPartnerEmote(emote) {
    this.partner.emote = emote;
    this.partner.emoteTimer = 3.0;
    if (emote === '😘') {
      if (window.soundSystem) window.soundSystem.playKiss();
    } else if (emote === '🤗') {
      if (window.soundSystem) window.soundSystem.playHug();
    }
  }

  // --- Sparkles & Notifications ---
  showSparkle(x, y, char = '✨') {
    this.sparkles.push({
      x, y,
      char,
      vy: -25,
      alpha: 1.0,
      life: 1.2
    });
  }

  showNotification(text) {
    this.notifications.push({
      text,
      time: 3.5,
      alpha: 1.0
    });
    // Cap notifications
    if (this.notifications.length > 4) {
      this.notifications.shift();
    }
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
    // 1. Update Farm world & crops
    this.farm.update(delta);

    // 2. Update Bots & Animals
    this.botManager.update(delta);
    this.animalManager.update(delta);

    // 3. Update Local Player Movement
    let vx = 0;
    let vy = 0;

    if (this.keys['w'] || this.keys['arrowup']) vy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) vy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) vx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) vx += 1;

    // Add touch joystick input
    if (this.touchJoystick.active) {
      vx += this.touchJoystick.dx;
      vy += this.touchJoystick.dy;
    }

    const dist = Math.hypot(vx, vy);
    if (dist > 0.05) {
      this.player.isMoving = true;
      const speed = this.player.speed * delta;
      const nx = this.player.x + (vx / dist) * speed;
      const ny = this.player.y + (vy / dist) * speed;

      // Update direction
      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.dir = vx > 0 ? 'right' : 'left';
      } else {
        this.player.dir = vy > 0 ? 'down' : 'up';
      }

      // Check collision with tile bounds
      const footTileX = Math.floor((nx + 16) / 16);
      const footTileY = Math.floor((ny + 24) / 16);

      if (!this.farm.isCollidable(footTileX, footTileY)) {
        this.player.x = nx;
        this.player.y = ny;
      } else {
        // Try slide on X
        const slideFootX = Math.floor((nx + 16) / 16);
        const currentFootY = Math.floor((this.player.y + 24) / 16);
        if (!this.farm.isCollidable(slideFootX, currentFootY)) {
          this.player.x = nx;
        } else {
          // Try slide on Y
          const currentFootX = Math.floor((this.player.x + 16) / 16);
          const slideFootY = Math.floor((ny + 24) / 16);
          if (!this.farm.isCollidable(currentFootX, slideFootY)) {
            this.player.y = ny;
          }
        }
      }

      // Update walk animation
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
      if (this.player.actionTimer <= 0) {
        this.player.currentAction = 'idle';
      }
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

    // Camera follow player smoothly
    const targetCamX = this.player.x + 16 - (this.canvas.width / this.camera.scale) / 2;
    const targetCamY = this.player.y + 16 - (this.canvas.height / this.camera.scale) / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;

    // Clamp camera within map bounds
    const maxCamX = (this.farm.cols * 16) - (this.canvas.width / this.camera.scale);
    const maxCamY = (this.farm.rows * 16) - (this.canvas.height / this.camera.scale);
    this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));

    // Update fireflies
    this.fireflies.forEach(f => {
      f.x += f.vx * delta;
      f.y += f.vy * delta;
      f.alpha += f.da;
      if (f.alpha >= 1 || f.alpha <= 0.1) f.da = -f.da;
      if (f.x < 0) f.x = this.farm.cols * 16;
      if (f.x > this.farm.cols * 16) f.x = 0;
      if (f.y < 0) f.y = this.farm.rows * 16;
      if (f.y > this.farm.rows * 16) f.y = 0;
    });

    // Update sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.y += s.vy * delta;
      s.life -= delta;
      s.alpha = s.life;
      if (s.life <= 0) this.sparkles.splice(i, 1);
    }

    // Update notifications
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.time -= delta;
      if (n.time <= 0) this.notifications.splice(i, 1);
    }
  }

  // --- Rendering ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(this.camera.scale, this.camera.scale);
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Draw Ground Tiles (Grass, Paths, Water, Farmland)
    this.renderGroundLayer();

    // 2. Draw Static World Objects (Bridge, Fences, House, Chest, Decor)
    this.renderObjectLayer();

    // 3. Draw Depth-Sorted Entities (Player, Partner, Bots, Animals, Trees)
    this.renderEntities();

    // 4. Draw Atmospheric Day/Night & Weather Lighting Overlay
    this.renderAtmosphere();

    this.ctx.restore();

    // 5. Draw UI Overlays (Notifications, Target Indicator, Emotes)
    this.renderUIOverlays();
  }

  renderGroundLayer() {
    const startCol = Math.max(0, Math.floor(this.camera.x / 16));
    const endCol = Math.min(this.farm.cols, Math.ceil((this.camera.x + this.canvas.width / this.camera.scale) / 16));
    const startRow = Math.max(0, Math.floor(this.camera.y / 16));
    const endRow = Math.min(this.farm.rows, Math.ceil((this.camera.y + this.canvas.height / this.camera.scale) / 16));

    const imgGrass = this.assets.grass;
    const imgPath = this.assets.path;
    const imgWater = this.assets.water;
    const imgFarmland = this.assets.farmland;

    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const px = x * 16;
        const py = y * 16;
        const tile = this.farm.grid[y][x];

        // Default base grass
        if (imgGrass) {
          this.ctx.drawImage(imgGrass, px, py, 16, 16);
        } else {
          this.ctx.fillStyle = '#6ab04c';
          this.ctx.fillRect(px, py, 16, 16);
        }

        // Paths
        if (tile.type === 'path' && imgPath) {
          this.ctx.drawImage(imgPath, px, py, 16, 16);
        }

        // Water
        if (tile.type === 'water' && imgWater) {
          this.ctx.drawImage(imgWater, px, py, 16, 16);
        }

        // Farmland
        if (tile.type === 'farmland' || tile.tilled) {
          if (imgFarmland) {
            // Center farmland tile is at (16, 16) in Farmland_Tile.png
            this.ctx.drawImage(imgFarmland, 16, 16, 16, 16, px, py, 16, 16);
          } else {
            this.ctx.fillStyle = '#8b5a2b';
            this.ctx.fillRect(px, py, 16, 16);
          }

          // Darken if watered
          if (tile.watered) {
            this.ctx.fillStyle = 'rgba(20, 50, 100, 0.35)';
            this.ctx.fillRect(px, py, 16, 16);
          }
        }
      }
    }
  }

  renderObjectLayer() {
    const imgBridge = this.assets.bridge;
    const imgFences = this.assets.fences;
    const imgChest = this.assets.chest;
    const imgHouse = this.assets.house;
    const imgPlants = this.assets.plants;

    // Draw Bridge over water
    if (imgBridge) {
      // 3 tiles bridge at (28, 19)
      this.ctx.drawImage(imgBridge, 0, 0, 48, 24, 28 * 16, 19 * 16 - 4, 48, 24);
    }

    // Draw Fences & Crops
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
          // Draw wooden shipping bin
          this.ctx.fillStyle = '#b33939';
          this.ctx.fillRect(px, py + 4, 16, 12);
          this.ctx.fillStyle = '#ffb142';
          this.ctx.fillRect(px + 2, py + 2, 12, 4);
          this.ctx.fillStyle = '#fff';
          this.ctx.font = '8px sans-serif';
          this.ctx.fillText('🪙', px + 2, py + 12);
        }

        // Draw Crops
        if (tile.crop && imgPlants) {
          const def = CROP_DEFINITIONS[tile.crop.id];
          if (def) {
            const cropRow = def.plantRow;
            const stageCol = Math.min(4, tile.crop.stage);
            // plants.png: 5 cols x 6 rows of 16x16
            this.ctx.drawImage(imgPlants, stageCol * 16, cropRow * 16, 16, 16, px, py, 16, 16);

            // Draw glowing ready indicator if ready
            if (tile.crop.ready) {
              this.ctx.fillStyle = 'rgba(255, 230, 0, 0.4)';
              this.ctx.beginPath();
              this.ctx.arc(px + 8, py + 8, 4, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }
        }
      }
    }

    // Draw House (96x128) at (15*16, 2*16)
    if (imgHouse) {
      this.ctx.drawImage(imgHouse, 15 * 16, 2 * 16 - 16, 96, 112);
    }
  }

  renderEntities() {
    // Collect all renderable entities for Y-depth sorting
    const renderList = [];

    // 1. Trees
    const treeCoords = [
      [14, 3], [21, 3], [1, 14], [2, 19], [34, 4], [32, 8], [33, 12], [23, 10]
    ];
    treeCoords.forEach(([tx, ty]) => {
      renderList.push({
        type: 'tree',
        y: ty * 16 + 16,
        render: () => {
          if (this.assets.tree) {
            // Oak tree is 64x80, centered on tile
            this.ctx.drawImage(this.assets.tree, tx * 16 - 24, ty * 16 - 64, 64, 80);
          }
        }
      });
    });

    // 2. Animals
    this.animalManager.animals.forEach(a => {
      renderList.push({
        type: 'animal',
        y: a.y + 16,
        render: () => {
          const img = this.assets[a.type];
          if (img) {
            this.ctx.save();
            const flip = a.dir === 'left';
            if (flip) {
              this.ctx.translate(a.x + 32, a.y);
              this.ctx.scale(-1, 1);
              this.ctx.drawImage(img, a.frame * 32, 0, 32, 32, 0, 0, 32, 32);
            } else {
              this.ctx.drawImage(img, a.frame * 32, 0, 32, 32, a.x, a.y, 32, 32);
            }
            this.ctx.restore();

            // Animal hearts
            a.hearts.forEach(h => {
              this.ctx.fillStyle = '#ff4757';
              this.ctx.font = '10px sans-serif';
              this.ctx.fillText('❤️', h.x, h.y);
            });
          }
        }
      });
    });

    // 3. Helper Bots
    this.botManager.bots.forEach(b => {
      if (!b.enabled) return;
      renderList.push({
        type: 'bot',
        y: b.y + 24,
        render: () => {
          const img = b.type === 'boni' ? this.assets.bot_boni : this.assets.bot_slime;
          if (img) {
            this.ctx.save();
            let row = 0;
            if (b.type === 'boni') {
              // Row 0: Idle down, Row 1: Idle right, Row 2: Idle up
              // Row 3: Walk down, Row 4: Walk right, Row 5: Walk up
              if (b.isMoving) {
                row = b.dir === 'down' ? 3 : (b.dir === 'up' ? 5 : 4);
              } else {
                row = b.dir === 'down' ? 0 : (b.dir === 'up' ? 2 : 1);
              }
              const flip = b.dir === 'left';
              if (flip) {
                this.ctx.translate(b.x + 32, b.y);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(img, b.frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
              } else {
                this.ctx.drawImage(img, b.frame * 32, row * 32, 32, 32, b.x, b.y, 32, 32);
              }
            } else {
              // Slime
              row = b.isMoving ? 1 : 0;
              this.ctx.drawImage(img, b.frame * 32, row * 32, 32, 32, b.x, b.y, 32, 32);
            }
            this.ctx.restore();

            // Bot speech bubble
            if (b.bubbleText) {
              this.renderSpeechBubble(b.x + 16, b.y - 8, b.bubbleText, '#2ed573');
            }
          }
        }
      });
    });

    // 4. Local Player
    renderList.push({
      type: 'player',
      y: this.player.y + 24,
      render: () => {
        this.renderCharacter(this.player, true);
      }
    });

    // 5. Partner Player (Mabar)
    if (this.partner.active) {
      renderList.push({
        type: 'partner',
        y: this.partner.y + 24,
        render: () => {
          this.renderCharacter(this.partner, false);
        }
      });
    }

    // Sort by Y for correct top-to-bottom depth sorting
    renderList.sort((a, b) => a.y - b.y);
    renderList.forEach(item => item.render());

    // Sparkles
    this.sparkles.forEach(s => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText(s.char, s.x, s.y);
      this.ctx.restore();
    });
  }

  renderCharacter(char, isLocal) {
    const img = char.role === 'girl' ? this.assets.player_girl : this.assets.player_boy;
    if (!img) return;

    this.ctx.save();
    let row = 0;
    // Cute Fantasy rows:
    // 0: Idle down, 1: Idle right, 2: Idle up
    // 3: Walk down, 4: Walk right, 5: Walk up
    // 6: Action down, 7: Action right, 8: Action up
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

    // Draw Name Tag & Emotes above head
    this.ctx.save();
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.textAlign = 'center';

    // Name background pill
    const nameText = `${char.name} ${char.role === 'girl' ? '🌸' : '🌱'}`;
    const tw = this.ctx.measureText(nameText).width;
    this.ctx.fillStyle = isLocal ? 'rgba(0, 0, 0, 0.55)' : 'rgba(235, 77, 75, 0.75)';
    this.ctx.beginPath();
    this.ctx.roundRect(char.x + 16 - tw / 2 - 4, char.y - 6, tw + 8, 12, 4);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(nameText, char.x + 16, char.y + 3);

    // Floating Emote
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

    // Ambient Lighting Overlay
    if (timeInfo.ambient && timeInfo.ambient !== 'rgba(255, 255, 255, 0)') {
      this.ctx.fillStyle = timeInfo.ambient;
      this.ctx.fillRect(0, 0, this.farm.cols * 16, this.farm.rows * 16);
    }

    // Fireflies at night
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
    // Screen notifications at bottom-left
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

  // --- Network Connection Callbacks ---
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

  // --- HUD Updates ---
  updateHUD() {
    // Coins
    const elCoins = document.getElementById('hudCoins');
    if (elCoins) elCoins.textContent = `${this.farm.coins}`;

    // Love Meter
    const elLove = document.getElementById('hudLove');
    const elLoveTitle = document.getElementById('hudLoveTitle');
    if (elLove) elLove.textContent = `${this.farm.lovePoints} ❤️`;
    if (elLoveTitle) elLoveTitle.textContent = `${this.farm.getLoveTitle()}`;

    // Time & Day
    const elTime = document.getElementById('hudTime');
    const timeInfo = this.farm.getTimeOfDay();
    const hours = Math.floor(this.farm.timeMinutes / 60).toString().padStart(2, '0');
    const mins = Math.floor(this.farm.timeMinutes % 60).toString().padStart(2, '0');
    if (elTime) elTime.textContent = `Hari ${this.farm.dayCount} - ${hours}:${mins} (${timeInfo.label})`;

    // Connection badge
    const badge = document.getElementById('netBadge');
    if (badge) {
      if (this.network.isConnected) {
        badge.className = 'badge-connected';
        badge.textContent = `🟢 Terhubung Mabar (${this.partner.name})`;
      } else if (this.network.isHost) {
        badge.className = 'badge-waiting';
        badge.textContent = `🟡 Menunggu Pacar... (Kode: ${this.network.roomCode})`;
      } else {
        badge.className = 'badge-solo';
        badge.textContent = `⚪ Mode Sendiri / Offline`;
      }
    }

    // Update portraits
    const localPortrait = document.getElementById('localPortrait');
    if (localPortrait) {
      localPortrait.src = this.player.role === 'girl' ? 'assets/characters/portrait_girl.png' : 'assets/characters/portrait_boy.png';
    }
    const partnerPortrait = document.getElementById('partnerPortrait');
    if (partnerPortrait) {
      partnerPortrait.src = this.partner.role === 'girl' ? 'assets/characters/portrait_girl.png' : 'assets/characters/portrait_boy.png';
    }
  }

  setupHUDButtons() {
    // Sound Toggle
    const btnSound = document.getElementById('btnToggleSound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        window.soundSystem.init();
        const muted = window.soundSystem.toggleMute();
        btnSound.textContent = muted ? '🔇 Suara: Mati' : '🔊 Suara: Nyala';
      });
    }

    // Music Toggle
    const btnMusic = document.getElementById('btnToggleMusic');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        window.soundSystem.init();
        const bgmOn = window.soundSystem.toggleBGM();
        btnMusic.textContent = bgmOn ? '🎵 BGM: Nyala' : '🎵 BGM: Mati';
      });
    }

    // Bots Modal
    const btnBots = document.getElementById('btnOpenBots');
    if (btnBots) {
      btnBots.addEventListener('click', () => {
        document.getElementById('modalBots').classList.remove('hidden');
      });
    }

    // Chest Modal
    const btnChest = document.getElementById('btnOpenChest');
    if (btnChest) {
      btnChest.addEventListener('click', () => this.openChestModal());
    }

    // Backup & Save Modal
    const btnSave = document.getElementById('btnOpenSave');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        document.getElementById('modalSave').classList.remove('hidden');
      });
    }

    // Polaroid Photo Selfie
    const btnPhoto = document.getElementById('btnTakePic');
    if (btnPhoto) {
      btnPhoto.addEventListener('click', () => this.capturePolaroid());
    }

    // Chat submit
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

  openChestModal() {
    const modal = document.getElementById('modalChest');
    const seedsList = document.getElementById('chestSeedsList');
    const produceList = document.getElementById('chestProduceList');

    if (seedsList) {
      seedsList.innerHTML = Object.entries(this.farm.chest.seeds).map(([id, count]) => {
        const def = CROP_DEFINITIONS[id] || { name: id, icon: '🌱' };
        return `<div class="chest-item"><span>${def.icon} ${def.name}</span><strong>x${count}</strong><button class="btn-buy" onclick="game.farm.buySeeds('${id}', 1); game.openChestModal(); game.updateHUD();">Beli (+5🪙)</button></div>`;
      }).join('');
    }

    if (produceList) {
      produceList.innerHTML = Object.entries(this.farm.chest.produce).map(([id, count]) => {
        const def = CROP_DEFINITIONS[id] || { name: id, icon: '🧺' };
        return `<div class="chest-item"><span>${def.icon} ${def.name}</span><strong>x${count}</strong></div>`;
      }).join('');
    }

    modal.classList.remove('hidden');
  }

  // --- Couple Polaroid Camera ---
  capturePolaroid() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 480;
    pCanvas.height = 580;
    const pCtx = pCanvas.getContext('2d');

    // White Polaroid frame
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, 480, 580);

    // Draw game canvas snapshot into photo window (440x440)
    pCtx.drawImage(this.canvas, 20, 20, 440, 440);

    // Cute handwritten text
    pCtx.fillStyle = '#2c3e50';
    pCtx.font = 'bold 22px cursive, sans-serif';
    pCtx.textAlign = 'center';
    const coupleText = `${this.player.name} ❤️ ${this.partner.active ? this.partner.name : 'Pacar Tercinta'}`;
    pCtx.fillText(coupleText, 240, 495);

    pCtx.font = '15px sans-serif';
    pCtx.fillStyle = '#7f8c8d';
    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    pCtx.fillText(`Kebun Cinta Kita • Hari ke-${this.farm.dayCount} • ${dateStr}`, 240, 530);

    // Download Polaroid
    const a = document.createElement('a');
    a.href = pCanvas.toDataURL('image/png');
    a.download = `foto-berdua-${this.player.name}-${this.partner.name}.png`;
    a.click();

    this.showNotification('📷 Foto Polaroid tersimpan ke galeri perangkatmu! ❤️✨');
  }
}

window.Game = Game;
