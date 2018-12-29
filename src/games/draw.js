const gameNode = require('../GameNode');
const colors = require('../Colors');
const colorKeys = Object.keys(colors);

class Draw {
    constructor() {
        const board = gameNode(colors.PURPLE, this.handleBoardClick.bind(this), {'x': 0, 'y': 0}, {'x': 1, 'y': 1});
        const randomizeButton = gameNode(colors.RED, this.randomizeBoardColor.bind(this), {'x': .8, 'y': 0}, {'x': .15, 'y': .15});
        const resetButton = gameNode(colors.BLUE, this.resetBoard.bind(this), {x: .6, y: 0}, {x: .15, y: .15});

        board.addChild(randomizeButton);
        board.addChild(resetButton);
        this.board = board;

        this.playerColorMap = {};
    }

    resetBoard() {
        const randomizeButton = gameNode(colors.RED, this.randomizeBoardColor.bind(this), {'x': .8, 'y': 0}, {'x': .15, 'y': .15});
        const resetButton = gameNode(colors.BLUE, this.resetBoard.bind(this), {x: .6, y: 0}, {x: .15, y: .15});

        this.board.clearChildren();

        this.board.addChild(randomizeButton);
        this.board.addChild(resetButton);
    }

    handleNewPlayer(player) {
        this.playerColorMap[player.id] = colors.GREEN;
    }

    handleBoardClick(player, x, y) {
        const playerColor = this.playerColorMap[player.id];
        const coloredPixel = gameNode(playerColor, () => {}, {'x': x, 'y': y}, {'x': .0016, 'y': .0009});
        this.board.addChild(coloredPixel);
    }

    randomizeBoardColor() {
        const colorIndex = Math.floor(Math.random() * colorKeys.length);
	    this.board.color = colors[colorKeys[colorIndex]];
    }

    getRoot() {
        return this.board;
    }
}

module.exports = Draw;
