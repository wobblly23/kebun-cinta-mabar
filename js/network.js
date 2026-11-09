// js/network.js - WebRTC Peer-to-Peer (P2P) Multiplayer Engine using PeerJS
// 100% Client-Side, Zero Server Required, Runs perfectly on Netlify & GitHub Pages!

class NetworkManager {
  constructor(game) {
    this.game = game;
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.isConnected = false;
    this.myPeerId = '';
    this.partnerPeerId = '';
    this.roomCode = '';
    this.syncInterval = null;

    this.APP_PREFIX = 'kebun-mabar-';
  }

  hostRoom(customCode = '', onReady = null, onConnect = null) {
    this.isHost = true;
    const cleanCode = (customCode || this.generateRoomCode()).toLowerCase().trim();
    this.roomCode = cleanCode;
    const fullPeerId = `${this.APP_PREFIX}${cleanCode}`;

    try {
      this.peer = new Peer(fullPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });
    } catch (e) {
      console.error('Peer creation failed:', e);
      return;
    }

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      if (onReady) onReady(this.roomCode);
    });

    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this.setupConnectionEvents(onConnect);
    });

    this.peer.on('error', (err) => {
      console.warn('Peer error:', err);
      if (err.type === 'unavailable-id') {
        const fallback = this.generateRoomCode();
        this.hostRoom(fallback, onReady, onConnect);
      }
    });
  }

  joinRoom(code, onConnect = null, onError = null) {
    this.isHost = false;
    const cleanCode = code.toLowerCase().trim();
    this.roomCode = cleanCode;
    const targetPeerId = `${this.APP_PREFIX}${cleanCode}`;

    try {
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });
    } catch (e) {
      if (onError) onError(e);
      return;
    }

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      this.conn = this.peer.connect(targetPeerId, { reliable: true });
      this.setupConnectionEvents(onConnect);
    });

    this.peer.on('error', (err) => {
      if (onError) onError(err);
    });
  }

  setupConnectionEvents(onConnect) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.isConnected = true;
      this.partnerPeerId = this.conn.peer;

      this.game.onPeerConnected(this.isHost);
      if (onConnect) onConnect();

      if (this.isHost) {
        this.sendWorldSnapshot();
      }

      this.sendPlayerInfo();
      this.startSyncLoop();
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      this.isConnected = false;
      this.stopSyncLoop();
      this.game.onPeerDisconnected();
    });

    this.conn.on('error', (err) => {
      console.error('Koneksi P2P error:', err);
    });
  }

  startSyncLoop() {
    this.stopSyncLoop();
    this.syncInterval = setInterval(() => {
      if (this.isConnected && this.conn && this.conn.open) {
        const p = this.game.player;
        this.send({
          type: 'player_move',
          x: Math.round(p.x),
          y: Math.round(p.y),
          dir: p.dir,
          isMoving: p.isMoving,
          animFrame: p.animFrame,
          action: p.currentAction,
          location: this.game.farm.currentLocation,
          isFishing: p.isFishing
        });

        if (this.isHost) {
          this.send({
            type: 'world_sync',
            timeMinutes: this.game.farm.timeMinutes,
            dayCount: this.game.farm.dayCount,
            coins: this.game.farm.coins,
            lovePoints: this.game.farm.lovePoints,
            loveLevel: this.game.farm.loveLevel,
            unlockedTools: this.game.farm.unlockedTools,
            unlockedBots: this.game.farm.unlockedBots,
            ownedAnimals: this.game.farm.ownedAnimals,
            ownedFurniture: this.game.farm.ownedFurniture,
            bots: this.game.botManager ? this.game.botManager.getBotsData() : []
          });
        }
      }
    }, 40);
  }

  stopSyncLoop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  send(messageObj) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(messageObj);
      } catch (e) {
        console.warn('Failed to send P2P message:', e);
      }
    }
  }

  sendWorldSnapshot() {
    this.send({
      type: 'initial_snapshot',
      snapshot: this.game.farm.getSnapshot(),
      bots: this.game.botManager ? this.game.botManager.getBotsData() : []
    });
  }

  sendPlayerInfo() {
    this.send({
      type: 'player_info',
      name: this.game.player.name,
      role: this.game.player.role
    });
  }

  handleIncomingData(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'initial_snapshot':
        this.game.farm.applySnapshot(data.snapshot);
        this.game.animalManager.syncFromFarm();
        if (this.game.botManager && data.bots) {
          this.game.botManager.applyBotsData(data.bots);
        }
        break;

      case 'player_info':
        this.game.partner.name = data.name || 'Pasangan';
        this.game.partner.role = data.role || (this.game.player.role === 'boy' ? 'girl' : 'boy');
        this.game.updateHUD();
        break;

      case 'player_move':
        this.game.partner.x = data.x;
        this.game.partner.y = data.y;
        this.game.partner.dir = data.dir;
        this.game.partner.isMoving = data.isMoving;
        this.game.partner.animFrame = data.animFrame;
        this.game.partner.currentAction = data.action;
        this.game.partner.location = data.location || 'farm';
        this.game.partner.isFishing = !!data.isFishing;
        break;

      case 'world_sync':
        this.game.farm.timeMinutes = data.timeMinutes;
        this.game.farm.dayCount = data.dayCount;
        this.game.farm.coins = data.coins;
        this.game.farm.lovePoints = data.lovePoints;
        this.game.farm.loveLevel = data.loveLevel;
        if (data.unlockedTools) this.game.farm.unlockedTools = data.unlockedTools;
        if (data.unlockedBots) this.game.farm.unlockedBots = data.unlockedBots;
        if (data.ownedAnimals) {
          this.game.farm.ownedAnimals = data.ownedAnimals;
          this.game.animalManager.syncFromFarm();
        }
        if (data.ownedFurniture) this.game.farm.ownedFurniture = data.ownedFurniture;
        if (this.game.botManager && data.bots) {
          this.game.botManager.applyBotsData(data.bots);
        }
        this.game.updateHUD();
        break;

      case 'location_change':
        this.game.partner.location = data.location;
        break;

      case 'animal_bought':
        this.game.animalManager.syncFromFarm();
        break;

      case 'action_till':
        this.game.farm.tillSoil(data.x, data.y);
        if (window.soundSystem) window.soundSystem.playTill();
        break;

      case 'action_water':
        this.game.farm.waterSoil(data.x, data.y);
        if (window.soundSystem) window.soundSystem.playWater();
        break;

      case 'action_plant':
        this.game.farm.plantCrop(data.x, data.y, data.cropId);
        if (window.soundSystem) window.soundSystem.playPlant();
        break;

      case 'action_harvest':
        this.game.farm.harvestCrop(data.x, data.y);
        if (window.soundSystem) window.soundSystem.playHarvest();
        break;

      case 'action_chop':
        this.game.farm.chopWood(data.x, data.y);
        if (window.soundSystem) window.soundSystem.playSwordSwing();
        break;

      case 'action_mine':
        this.game.farm.mineRock(data.x, data.y);
        if (window.soundSystem) window.soundSystem.playTill();
        break;

      case 'action_sell':
        this.game.farm.sellAllProduce();
        if (window.soundSystem) window.soundSystem.playCoin();
        break;

      case 'action_emote':
      case 'emote':
        this.game.partner.emote = data.emote;
        this.game.partner.emoteTimer = 2.5;
        break;

      case 'action_chat':
      case 'chat':
        this.game.appendChat(data.sender, data.text, false);
        break;

      case 'action_kiss':
      case 'kiss':
        this.game.triggerCoupleKiss(true);
        break;

      case 'action_sleep':
      case 'sleep_sync':
        this.game.farm.sleepTogether();
        this.game.showNotification('Kalian berdua tidur bersama dan menyambut pagi! ☀️🛏️');
        this.game.updateHUD();
        break;

      case 'teleport':
        this.game.partner.location = data.location;
        this.game.partner.x = data.x;
        this.game.partner.y = data.y;
        break;

      case 'action_pet_animal':
        const animal = this.game.animalManager.animals.find(a => a.id === data.animalId);
        if (animal) animal.pet();
        break;
    }
  }

  generateRoomCode() {
    const chars = '23456789abcdefghjkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  disconnect() {
    this.stopSyncLoop();
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isConnected = false;
  }
}

window.NetworkManager = NetworkManager;
