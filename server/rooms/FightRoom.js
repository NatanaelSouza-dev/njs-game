const { Room, Client } = require('colyseus');
const { Schema, type, MapSchema } = require('@colyseus/schema');
const { nanoid } = require('nanoid');
const { db } = require('../firebaseAdmin'); // Conectanto admin auth

class Player extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotY = 0;
    this.health = 100;
    this.isBlocking = false;
    this.punchState = 0; // 0=idle, 1=left, 2=right
    this.uid = "";
    this.displayName = "Lutador";
    this.photoURL = "";
    this.trophies = 0;
  }
}

type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "z");
type("number")(Player.prototype, "rotY");
type("number")(Player.prototype, "health");
type("boolean")(Player.prototype, "isBlocking");
type("number")(Player.prototype, "punchState");
type("string")(Player.prototype, "uid");
type("string")(Player.prototype, "displayName");
type("string")(Player.prototype, "photoURL");
type("number")(Player.prototype, "trophies");

class FightState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.status = "waiting"; // waiting, playing, finished
  }
}
type({ map: Player })(FightState.prototype, "players");
type("string")(FightState.prototype, "status");

class FightRoom extends Room {
  onCreate(options) {
    this.maxClients = 2;
    this.setState(new FightState());
    this.isRanked = options.isRanked || !options.isPrivate;

    this.lastHitAt = new Map();
    
    // Gerar um código simples se for sala privada
    if (options.isPrivate) {
      this.roomId = nanoid(5).toUpperCase();
    }

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
        player.rotY = data.rotY;
        player.isBlocking = data.isBlocking;
      }
    });

    this.onMessage("punch", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.punchState = data.side; // 1=left, 2=right
        this.broadcast("player_punch", {
          sessionId: client.sessionId,
          side: data.side
        }, { except: client });
        
        this.clock.setTimeout(() => {
          if (player) player.punchState = 0;
        }, 250);
      }
    });

    this.onMessage("hit_landed", (client, data) => {
      if (this.state.status !== "playing") return;
      if (!data || typeof data.targetId !== "string") return;

      const attacker = this.state.players.get(client.sessionId);
      if (!attacker) return;
      if (data.targetId === client.sessionId) return;

      if (!attacker.punchState || attacker.punchState === 0) return;

      const now = this.clock.elapsedTime;
      const lastHit = this.lastHitAt.get(client.sessionId) || 0;
      if (now - lastHit < 0.15) return;
      this.lastHitAt.set(client.sessionId, now);

      const targetPlayer = this.state.players.get(data.targetId);
      if (!targetPlayer || targetPlayer.health <= 0) return;

      let rawDamage = Math.floor(Number(data.damage));
      if (!Number.isFinite(rawDamage) || rawDamage < 1) rawDamage = 10;
      rawDamage = Math.min(18, rawDamage);

      const blocked = targetPlayer.isBlocking === true;
      const damage = blocked ? Math.max(1, Math.round(rawDamage * 0.3)) : rawDamage;

      targetPlayer.health = Math.max(0, targetPlayer.health - damage);

      this.broadcast("hit_confirmed", {
        attackerId: client.sessionId,
        targetId: data.targetId,
        damage,
        blocked,
        targetHealth: targetPlayer.health
      });

      if (targetPlayer.health <= 0) {
        targetPlayer.health = 0;
        this.state.status = "finished";

        const winner = client.sessionId;
        const trophiesWin = 1;
        const coinsWin = 50;
        const coinsLoss = 10;

        this.broadcast("match_end", {
          winner,
          loser: data.targetId,
          isRanked: this.isRanked,
          trophiesWin,
          coinsWin,
          coinsLoss
        });

        this.rewardPlayers(winner, data.targetId, trophiesWin, coinsWin, coinsLoss);
      }
    });
  }

  onJoin(client, options) {
    console.log(client.sessionId, "entrou na sala", this.roomId, options.displayName || "");
    const player = new Player();
    player.uid = options.uid || "GUEST_" + client.sessionId;
    player.displayName = options.displayName || ("Lutador " + client.sessionId.substr(0, 4));
    player.photoURL = options.photoURL || "";
    player.trophies = Number(options.trophies) || 0;
    
    // Posições Iniciais
    if (this.state.players.size === 0) {
      player.x = 0; player.z = -5; // Player 1
    } else {
      player.x = 0; player.z = 5;  // Player 2
    }
    
    this.state.players.set(client.sessionId, player);

    if (this.state.players.size === 2) {
      this.state.status = "playing";
      this.lock(); // Sala cheia, não recebe mais conexões

      const playerList = [];
      this.state.players.forEach((p, sId) => {
        playerList.push({
          sessionId: sId,
          uid: p.uid,
          displayName: p.displayName,
          photoURL: p.photoURL,
          trophies: p.trophies
        });
      });

      console.log(`[⚔️] Partida iniciando na sala ${this.roomId} entre ${playerList[0].displayName} e ${playerList[1].displayName}`);
      this.broadcast("start_fight", {
        players: playerList,
        isRanked: this.isRanked,
        roomId: this.roomId
      });
    }
  }

  onLeave(client, consented) {
    this.state.players.delete(client.sessionId);
    this.lastHitAt.delete(client.sessionId);
    if (this.state.status === "playing") {
      this.broadcast("opponent_left", { leftSessionId: client.sessionId });
      this.disconnect();
    }
  }

  onDispose() {
    console.log("Sala", this.roomId, "descartada");
  }
  
  async rewardPlayers(winnerId, loserId, trophiesWin, coinsWin, coinsLoss) {
    console.log(`[Recompensa] Finalizando: Ganhador ${winnerId} | Perdedor ${loserId}`);
    if (!db) {
      console.warn('[!] Firebase Admin não conectado no servidor. Recompensa será salva pelo cliente autenticado.');
      return;
    }

    const winnerPlayer = this.state.players.get(winnerId);
    const loserPlayer = this.state.players.get(loserId);

    try {
      if (winnerPlayer && winnerPlayer.uid && !winnerPlayer.uid.startsWith("GUEST_")) {
        const winnerRef = db.collection('users').doc(winnerPlayer.uid);
        const winnerDoc = await winnerRef.get();
        if (winnerDoc.exists) {
          const currentTrophies = winnerDoc.data().trophies || 0;
          await winnerRef.update({
            coins: (winnerDoc.data().coins || 0) + coinsWin,
            wins: (winnerDoc.data().wins || 0) + 1,
            trophies: currentTrophies + trophiesWin
          });
        }
      }

      if (loserPlayer && loserPlayer.uid && !loserPlayer.uid.startsWith("GUEST_")) {
        const loserRef = db.collection('users').doc(loserPlayer.uid);
        const loserDoc = await loserRef.get();
        if (loserDoc.exists) {
          await loserRef.update({
            coins: (loserDoc.data().coins || 0) + coinsLoss,
            losses: (loserDoc.data().losses || 0) + 1
          });
        }
      }
    } catch (err) {
      console.error('Erro ao recompensar jogadores via Firebase Admin:', err);
    }
  }
}

module.exports = { FightRoom };

