const { fork } = require('child_process');

const { Asset, gameNode, Colors, Deck } = require('./common');

const games = require('./games');

const WebSocket = require("ws");

const GameSession = require("./GameSession");
const Player = require("./Player");
const http = require("http");

const HOMEGAMES_PORT_RANGE_MIN = 7001;
const HOMEGAMES_PORT_RANGE_MAX = 7100;

const players = {};

for (let i = 1; i < 256; i++) {
    players[i] = false;
}

const generatePlayerId = () => {
    for (let k in players) {
        if (!players[k]) {
            return Number(k);
        }
    }

    throw new Error("no player IDs left in pool");
};

const PORTS = new Array();

for (let i = 7001; i < 7100; i++) {
    PORTS.push(i);
}

let portIndex = 0;

let sessionIdCounter = 1;

class HomegamesDashboard {
    constructor() {
        this.base = gameNode(Colors.RED, (player, x, y) => {
        }, {x: 0, y: 0}, {x: 100, y: 100});
        this.sessions = {};
        this.gameIds = {};
        this.requestCallbacks = {};
        this.requestIdCounter = 1;
        setInterval(this.heartbeat.bind(this), 2000);
        setInterval(this.renderGameList.bind(this), 5000);

        this.renderGameList();

    }

    heartbeat() {
        Object.values(this.sessions).forEach(session => {
            session.sendHeartbeat();
        });
    }
    
    renderGameList() {
        let xIndex = 5;
        let sessionYIndex = 20;
        this.base.clearChildren();
        for (let key in games) {
            let gameOption = gameNode(Colors.BLACK, (player, x, y) => {

                let sessionId = sessionIdCounter++;
                let port = PORTS[portIndex++];

                const childSession = fork('game_server2.js');

                childSession.on('message', (msg) => {
                    player.receiveUpdate([5, Math.floor(port / 100), Math.floor(port % 100)]);
                });

                childSession.send(JSON.stringify({
                    key,
                    port
                }));


                childSession.on('message', (thang) => {
                    let jsonMessage = JSON.parse(thang);
                    if (jsonMessage.requestId) {
                        this.requestCallbacks[jsonMessage.requestId] && this.requestCallbacks[jsonMessage.requestId](jsonMessage.payload);
                    }
                });

                childSession.on('close', () => {
                    console.log("My mans kill himself");
                    delete this.sessions[sessionId];
                });
                
                console.log('spawned dat boi');

                this.sessions[sessionId] = {
                    game: key,
                    port: port,
                    sendMessage: (msg) => {
                    },
                    getPlayers: (cb) => {
                        let requestId = this.requestIdCounter++;
                        if (cb) {
                            this.requestCallbacks[requestId] = cb;
                        }
                        childSession.send(JSON.stringify({
                            'api': 'getPlayers',
                            'requestId': requestId
                        }));
                    },
                    sendHeartbeat: () => {
                        childSession.send(JSON.stringify({
                            "type": "heartbeat"
                        }))
                    }
                };
                 
                this.renderGameList();

            }, {x: xIndex, y: 0}, {x: 4, y: 4}, {'text': key, x: xIndex, y: 10});

            let activeSessions = Object.values(this.sessions).filter(s => {
                return s.game === key;
            });

            let gameInfoNode = gameNode(Colors.BLUE, null, {x: xIndex, y: 15}, {x: 4, y: 4}, {'text': activeSessions.length + ' sessions', x: xIndex, y: 15});

            this.base.addChild(gameInfoNode);

            for (let sessionIndex in activeSessions) {
                const session = activeSessions[sessionIndex];
                let sessionNode = gameNode(Colors.BLUE, (player, x, y) => {
                    console.log("DAT BOI CLICKK");
                    console.log(session);
                    player.receiveUpdate([5, Math.floor(session.port / 100), Math.floor(session.port % 100)]);
                }, {x: xIndex, y: 20 + (sessionIndex * 6)}, {x: 5, y: 5}, {'text': 'session', x: xIndex, y: 25 + (sessionIndex * 6)});
                this.base.addChild(sessionNode);
            }

            xIndex += 8;
            this.base.addChild(gameOption);
        }
    }

    handleNewPlayer(player) {
    }

    handlePlayerDisconnect(player) {
    }

    getRoot() {
        return this.base;
    }
}

module.exports = HomegamesDashboard;
