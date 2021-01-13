const GameSession = require('./GameSession');
const { socketServer } = require('./util/socket');
const games = require('./games');

let lastMessage;
let gameSession;

const sendProcessMessage = (msg) => {
    process.send(JSON.stringify(msg));
};

const startServer = (sessionInfo) => {
    const gameInstance = new games[sessionInfo.key]();
    
    gameSession = new GameSession(gameInstance);
 
    gameSession.initialize(() => {
        socketServer(gameSession, sessionInfo.port, () => {
            sendProcessMessage({
                'success': true
            });
        });
    });
};

process.on('message', (msg) => {
    lastMessage = new Date();
    const message = JSON.parse(msg);
    if (message.key) {
        startServer(message);
    } else {
        if (message.api) {
            if (message.api === 'getPlayers') {
                process.send(JSON.stringify({
                    'payload': Object.values(gameSession.game.players).map(p => { return {'id': p.id, 'name': p.name}; }),
                    'requestId': message.requestId
                }));
            }
        }
    }
});

const checkPulse = () => {
    if (!gameSession || Object.values(gameSession.game.players).length == 0 || !lastMessage || new Date() - lastMessage > 5000) {
        process.exit(0);
    }
};

setInterval(checkPulse, 5000);