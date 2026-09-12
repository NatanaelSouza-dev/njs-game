const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const { FightRoom } = require('./rooms/FightRoom');

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Permite conexões locais e qualquer IP da rede (útil para testes entre PCs/celulares)
    callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// Registrar as Rooms
gameServer.define('fight', FightRoom)
  .filterBy(['isPrivate']);

gameServer.define('ranked_fight', FightRoom);

// Colyseus Monitor (para ver estatísticas na aba /colyseus)
app.use('/colyseus', monitor());

gameServer.listen(port);
console.log(`[🚀] Servidor Colyseus rodando em ws://localhost:${port}`);
