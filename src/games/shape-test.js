const { Colors, Game, GameNode, Shapes } = require('squishjs');
const COLORS = Colors.COLORS;

class ShapeTest extends Game {
    static metadata() {
        return {
            aspectRatio: {
                x: 16,
                y: 9
            },
            author: 'Joseph Garcia',
            name: 'Shape Test',
            thumbnail: 'https://d3lgoy70hwd3pc.cloudfront.net/thumbnails/shape-test.png'
        };
    }

    constructor() {
        super();
        this.base = new GameNode.Shape(
            COLORS.PURPLE, 
            Shapes.POLYGON,
            {
                coordinates2d: [
                    [50, 10],
                    [55, 15],
                    [60, 10],
                    [60, 30],
                    [70, 50],
                    [60, 40],
                    [50, 10]
                ],
                fill: COLORS.PURPLE
            },
            null, 
            (player, x, y) => {
                console.log('I have neen clicked');
            });
    }

    getRoot() {
        return this.base;
    }

}

module.exports = ShapeTest;