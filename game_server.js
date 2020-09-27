//const HomegamesDashboard = require('./src/HomegamesDashboard');
const GameSession = require("./src/GameSession");
const { socketServer } = require('./src/util/socket');
const config = require('./config');
const Homenames = require('./src/Homenames');
const TestObjectify = require('./src/games/test-obj');

//const dashboard = new HomegamesDashboard();
const dashboard = new TestObjectify();

const session = new GameSession(dashboard);

const homeNames = new Homenames(config.HOMENAMES_PORT);

session.initialize(() => {
    socketServer(session, config.GAME_SERVER_HOME_PORT);
});
