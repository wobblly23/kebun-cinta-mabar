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

    // Room ID prefix to avoid collisions on public PeerJS server
    this.APP_PREFIX = 'kebun-mabar-';
  }

  // --- Host Mode: Create Room ---
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
      console.log('Room Host Terbuka! ID:', id, 'Kode Kamar:', this.roomCode);
      if (onReady) onReady(this.roomCode);
    });

    this.peer.on('connection', (conn) => {
      console.log('Pasangan sedang mencoba terhubung...');
      this.conn = conn;
      this.setupConnectionEvents(onConnect);
    });

    this.peer.on('error', (err) => {
      console.warn('Peer error:', err);
      if (err.type === 'unavailable-id') {
        // Room ID is taken, generate new one
        const fallback = this.generateRoomCode();
        this.hostRoom(fallback, onReady, onConnect);
      }
    });
  }

  // --- Guest Mode: Join Room ---
  joinRoom(code, onConnect = null, onError = null) {
    this.isHost = false;
    const cleanCode = code.toLowerCase().trim();
    this.roomCode = cleanCode;
    const targetPeerId = `${this.APP_PREFIX}${cleanCode}`;

    try {
      // Connect as an ephemeral client peer
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
      console.error('Peer creation failed:', e);
      if (onError) onError(e);
      return;
    }

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      console.log('Client Peer Aktif! Menghubungkan ke:', targetPeerId);
      this.conn = this.peer.connect(targetPeerId, {
        reliable: true
      });
      this.setupConnectionEvents(onConnect);
    });

    this.peer.on('error', (err) => {
      console.warn('Peer join error:', err);
      if (onError) onError(err);
    });
  }

  setupConnectionEvents(onConnect) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.isConnected = true;
      this.partnerPeerId = this.conn.peer;
      console.log('🎉 P2P BERHASIL TERHUBUNG! Main Berdua Aktif! 🎉');

      this.game.onPeerConnected(this.isHost);
      if (onConnect) onConnect();

      // If Host, send initial World Snapshot to Guest immediately!
      if (this.isHost) {
        this.sendWorldSnapshot();
      }

      // Send our player info
      this.sendPlayerInfo();

      // Start high-frequency player position sync
      this.startSyncLoop();
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      console.warn('Koneksi P2P ditutup oleh pasangan');
      this.isConnected = false;
      this.stopSyncLoop();
      this.game.onPeerDisconnected();
    });

    this.conn.on('error', (err) => {
      console.error('Koneksi P2P error:', err);
    });
  }

  // --- Sync Loops ---
  startSyncLoop() {
    this.stopSyncLoop();
    // 30 Hz position sync
    this.syncInterval = setInterval(() => {
      if (this.isConnected && this.conn && this.conn.open) {
        // Send local player state
        const p = this.game.player;
        this.send({
          type: 'player_move',
          x: Math.round(p.x),
          y: Math.round(p.y),
          dir: p.dir,
          isMoving: p.isMoving,
          animFrame: p.animFrame,
          action: p.currentAction
        });

        // Host periodically syncs world state and bots
        if (this.isHost) {
          this.send({
            type: 'world_sync',
            timeMinutes: this.game.farm.timeMinutes,
            dayCount: this.game.farm.dayCount,
            coins: this.game.farm.coins,
            lovePoints: this.game.farm.lovePoints,
            loveLevel: this.game.farm.loveLevel,
            bots: this.game.botManager ? this.game.botManager.getBotsData() : []
          });
        }
      }
    }, 40); // 25 times per second
  }

  stopSyncLoop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // --- Send Helper ---
  send(messageObj) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(messageObj);
      } catch (e) {
        console.warn('Failed to send P2P message:', e);
      }
    }
  }

  // Send full snapshot
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
      role: this.game.player.role // 'boy' or 'girl'
    });
  }

  // --- Handle Received Messages ---
  handleIncomingData(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'initial_snapshot':
        console.log('Menerima snapshot kebun dari Host!');
        this.game.farm.applySnapshot(data.snapshot);
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
        break;

      case 'world_sync':
        this.game.farm.timeMinutes = data.timeMinutes;
        this.game.farm.dayCount = data.dayCount;
        this.game.farm.coins = data.coins;
        this.game.farm.lovePoints = data.lovePoints;
        this.game.farm.loveLevel = data.loveLevel;
        if (this.game.botManager && data.bots) {
          this.game.botManager.applyBotsData(data.bots);
        }
        this.game.updateHUD();
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

      case 'action_sell':
        this.game.farm.sellAllProduce();
        if (window.soundSystem) window.soundSystem.playCoin();
        break;

      case 'action_emote':
        this.game.showPartnerEmote(data.emote);
        break;

      case 'action_chat':
        this.game.receiveChatMessage(data.sender, data.text);
        break;

      case 'action_kiss':
        this.game.triggerCoupleKiss(true);
        break;

      case 'action_hug':
        this.game.triggerCoupleHug(true);
        break;

      case 'action_sleep':
        this.game.farm.sleepTogether();
        this.game.showNotification('Kalian tidur bersama dan bangun di pagi yang cerah! ☀️');
        break;

      case 'action_pet_animal':
        const animal = this.game.animalManager.animals.find(a => a.id === data.animalId);
        if (animal) animal.pet();
        break;
    }
  }

  // Generate cute 5-digit room code
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

