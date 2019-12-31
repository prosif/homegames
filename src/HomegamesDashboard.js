const { fork } = require("child_process");
const path = require("path");

const { Asset, gameNode, Colors } = require("./common");

const games = require("./games");

const config = require("../config");

const sessions = {};

for (let i = config.GAME_SERVER_PORT_RANGE_MIN; i < config.GAME_SERVER_PORT_RANGE_MAX; i++) {
    sessions[i] = null;
}

const getServerPort = () => {
    for (const p in sessions) {
        if (!sessions[p]) {
            return Number(p);
        }
    }
};

let sessionIdCounter = 1;

class HomegamesDashboard {
    static metadata() {
        return {
            res: {
                width: 1280,
                height: 720
            },
            author: "Joseph Garcia"
        };
    }

    constructor() {
        this.assets = {};
        this.playerNodes = {};
        this.playerEditStates = {};
        this.keyCoolDowns = {};
        Object.keys(games).forEach(key => {
            this.assets[key] = new Asset("url", {
                "location": games[key].metadata && games[key].metadata().thumbnail || config.DEFAULT_GAME_THUMBNAIL,
                "type": "image"
            });
        });

        this.base = gameNode(Colors.CREAM, null, {x: 0, y: 0}, {x: 100, y: 100});
        this.sessions = {};
        this.gameIds = {};
        this.requestCallbacks = {};
        this.requestIdCounter = 1;
        setInterval(this.heartbeat.bind(this), config.CHILD_SESSION_HEARTBEAT_INTERVAL);

        this.renderGameList();
    }

    heartbeat() {
        Object.values(this.sessions).forEach(session => {
            session.sendHeartbeat();
        });
    }
    
    renderGameList() {
        let xIndex = 5;
        let yIndex = 10;
        this.base.clearChildren();
        for (const key in games) {
            const activeSessions = Object.values(this.sessions).filter(s => s.game === key);

            const gameOption = gameNode(Colors.CREAM, (player) => {

                const sessionId = sessionIdCounter++;
                const port = getServerPort();

                const childSession = fork(path.join(__dirname, "child_game_server.js"));

                sessions[port] = childSession;

                childSession.send(JSON.stringify({
                    key,
                    port,
                    player: {
                        id: player.id,
                        name: player.name
                    }
                }));

                childSession.on("message", (thang) => {
                    const jsonMessage = JSON.parse(thang);
                    if (jsonMessage.success) {
                        player.receiveUpdate([5, Math.floor(port / 100), Math.floor(port % 100)]);
                    }
                    else if (jsonMessage.requestId) {
                        this.requestCallbacks[jsonMessage.requestId] && this.requestCallbacks[jsonMessage.requestId](jsonMessage.payload);
                    }
                });

                childSession.on("close", () => {
                    sessions[port] = null;
                    delete this.sessions[sessionId];
//                    this.renderGameList();  
                });
                
                this.sessions[sessionId] = {
                    game: key,
                    port: port,
                    sendMessage: () => {
                    },
                    getPlayers: (cb) => {
                        const requestId = this.requestIdCounter++;
                        if (cb) {
                            this.requestCallbacks[requestId] = cb;
                        }
                        childSession.send(JSON.stringify({
                            "api": "getPlayers",
                            "requestId": requestId
                        }));
                    },
                    sendHeartbeat: () => {
                        childSession.send(JSON.stringify({
                            "type": "heartbeat"
                        }));
                    }
                };
                 
                this.renderGameList();

            }, {x: xIndex, y: yIndex}, {x: 10, y: 10}, {"text": (games[key].metadata && games[key].metadata().name || key) + "", x: xIndex + 5, y: yIndex + 12}, {
                [key]: {
                    pos: {x: xIndex, y: yIndex},
                    size: {x: 10, y: 10}
                }
            });

            const authorInfoNode = gameNode(Colors.CREAM, null, {
                x: xIndex + 5, 
                y: yIndex + 15
            },
            {
                x: 10,
                y: 10
            },
            {
                text: "by " + (games[key].metadata && games[key].metadata()["author"] || "Unknown Author"),
                x: xIndex + 5,
                y: yIndex + 15
            });

            for (const sessionIndex in activeSessions) {
                const session = activeSessions[sessionIndex];
                const sessionNode = gameNode(Colors.BLUE, (player) => {
                    player.receiveUpdate([5, Math.floor(session.port / 100), Math.floor(session.port % 100)]);
                }, {x: xIndex + 3, y: 25 + (sessionIndex * 6)}, {x: 5, y: 5}, {"text": "session", x: xIndex + 3, y: 25 + (sessionIndex * 6)});
                this.base.addChild(sessionNode);
            }

            xIndex += 15;

            if (xIndex + 10 >= 100) {
                yIndex += 25;
                xIndex = 5;
            }

            this.base.addChild(gameOption);
            this.base.addChild(authorInfoNode);
        }
    }

    isText(key) {
        return key.length == 1 && (key >= "A" && key <= "Z") || (key >= "a" && key <= "z") || key === " " || key === "Backspace";
    }

    handleKeyDown(player, key) {
        if (!this.playerEditStates[player.id] || !this.isText(key)) {
            return;
        }

        if (!this.keyCoolDowns[player.id] || !this.keyCoolDowns[player.id][key]) {
            const newText = this.playerNodes[player.id].text;
            if (newText.text.length > 0 && key === "Backspace") {
                newText.text = newText.text.substring(0, newText.text.length - 1); 
            } else if(key !== "Backspace") {
                newText.text = newText.text + key;
            }
            this.playerNodes[player.id].text = newText;
            this.keyCoolDowns[player.id][key] = setTimeout(() => {
                clearTimeout(this.keyCoolDowns[player.id][key]);
                delete this.keyCoolDowns[player.id][key];
            }, 200);
        }
    }

    handleKeyUp(player, key) {
        if (this.keyCoolDowns[player.id][key]) {
            clearTimeout(this.keyCoolDowns[player.id][key]);
            delete this.keyCoolDowns[player.id][key];
        }
    }

    handleNewPlayer(player) {
        this.keyCoolDowns[player.id] = {};
        // hacks on hacks on hacks maybachs on backs on backs
        this.session.knownPlayerIds[player.id] = {
            id: player.id,
            name: player.name
        };
        const playerNameNode = gameNode(Colors.CREAM, (player) => {
            this.playerEditStates[player.id] = !this.playerEditStates[player.id];
            playerNameNode.color = this.playerEditStates[player.id] ? Colors.WHITE : Colors.CREAM;
            if (!this.playerEditStates[player.id]) {
                player.name = this.playerNodes[player.id].text.text;
                this.session.knownPlayerIds[player.id].name = player.name;
            }
        }, {x: 2, y: 2}, {x: 5, y: 5}, {text: player.name, x: 5, y: 5}, null, player.id);
        this.playerNodes[player.id] = playerNameNode;
        this.base.addChild(playerNameNode);
    }

    handlePlayerDisconnect(playerId) {
        delete this.keyCoolDowns[playerId];

        if (this.playerNodes[playerId]) {
            this.base.removeChild(this.playerNodes[playerId].id);
            delete this.playerNodes[playerId];
        }
    }

    getRoot() {
        return this.base;
    }

    getAssets() {
        return this.assets;
    }
}

module.exports = HomegamesDashboard;
