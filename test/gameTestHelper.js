const assert = require('assert');
const squishMap = require('../src/common/squish-map');
const Player = require('../src/Player');

let { GameNode } = squishMap['0633'];

const testMetaData = (game) => {
    const metaData = game.metadata();
    assert(metaData.aspectRatio);
    assert(metaData.aspectRatio.x);
    assert(metaData.aspectRatio.y);
    assert(metaData.author);
};

const testGetRoot = (game) => {
    const res = game.getRoot();
    const metadata = game.constructor.metadata();
    const squishVersion = metadata.squishVersion;
    const squishLib = squishMap[squishVersion];
    GameNode = squishLib.GameNode;
    assert((res instanceof GameNode.Shape) || (res instanceof GameNode.Text) || (res instanceof GameNode.Asset));
};

const testHandleNewPlayer = (game) => {
    let succeeded;
    try {
        game.handleNewPlayer && game.handleNewPlayer({ id: 1, info: { name: 'test' } });
        succeeded = true;
    } catch (err) {
        succeeded = false;
    }
    assert(succeeded);
};

const testHandlePlayerDisconnect = (game) => {
    let succeeded;
    try {
        game.handlePlayerDisconnect && game.handlePlayerDisconnect(1);
        succeeded = true;
    } catch (err) {
        succeeded = false;
    }
    assert(succeeded);
};

const runBasicTests = (gameClass) => {
    global.test(`Run basic game tests for ${gameClass.name}`, () => {
        const gameInstance = new gameClass();
        testMetaData(gameClass);
        testGetRoot(gameInstance);
        testHandleNewPlayer(gameInstance);
        testHandlePlayerDisconnect(gameInstance);
        gameInstance.close();
    });
};

module.exports = {
    testMetaData,
    testGetRoot,
    testHandleNewPlayer,
    testHandlePlayerDisconnect,
    runBasicTests
};
