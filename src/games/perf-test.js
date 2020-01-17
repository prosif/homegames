const { gameNode, Colors } = require("../common");
const Game = require("./Game");

class PerfTest extends Game {
    static metadata() {
        return {
            res: {
                width: 1920,
                height: 1080
            },
            author: "Joseph Garcia"
        };
    }

    constructor() {
        super();
        this.base = gameNode(Colors.WHITE, (player) => {
        }, {"x": 0, "y": 0}, {"x": 100, "y": 100});

        let xCounter = 0;
        let yCounter = 0;

        const filler = setInterval(() => {
            let dot = gameNode(Colors.randomColor(), null, {x: xCounter, y: yCounter}, {x: 1, y: 1});
            this.base.addChild(dot);
            xCounter += 1;
            if (xCounter >= 100) {
                xCounter = 0;
                yCounter++;
            }

            if (yCounter == 100 && xCounter == 100) {
                clearInterval(filler);
            }

        }, 2);
    }

    getRoot() {
        return this.base;
    }

}

module.exports = PerfTest;
