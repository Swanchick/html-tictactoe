const WIDTH = 800;
const HEIGHT = 600;

class PossibleWin {
    #pos1;
    #pos2;
    #pos3;

    constructor(x1, y1, x2, y2, x3, y3) {
        this.#pos1 = [x1, y1];
        this.#pos2 = [x2, y2];
        this.#pos3 = [x3, y3];
    }

    get allPos() {
        return [this.#pos1, this.#pos2, this.#pos3];
    }
}

const ALL_POSSIBLE_WINS = [
    // Horizontal wins
    new PossibleWin(0, 0, 1, 0, 2, 0),
    new PossibleWin(0, 1, 1, 1, 2, 1),
    new PossibleWin(0, 2, 1, 2, 2, 2),

    // Vertical wins
    new PossibleWin(0, 0, 0, 1, 0, 2),
    new PossibleWin(1, 0, 1, 1, 1, 2),
    new PossibleWin(2, 0, 2, 1, 2, 2),

    // Diagonal wins
    new PossibleWin(0, 0, 1, 1, 2, 2),
    new PossibleWin(2, 0, 1, 1, 0, 2),
];

const CURRENT_PLAYER = {
    CROSS: 0,
    CIRCLE: 1,
};

class Figure {
    #type;
    #column;
    #row;

    constructor(type, column, row) {
        this.#type = type;
        this.#column = column;
        this.#row = row; 
    }

    get type() {
        return this.#type;
    }

    get column() {
        return this.#column;
    }

    get row() {
        return this.#row;
    }
}

const GAME_STATE = {
    PlAYING: 0,
    CROSS_WINNER: 1,
    CIRCLE_WINNER: 2,
    DRAW: 3
};

class Game {
    #ctx;
    #currentPlayer;
    #gameState;
    #figures;

    #winnerLine;
    
    constructor() {
        const canvas = document.getElementById("ttt");

        canvas.onclick = (e) => {
            this.#onPress(e.offsetX, e.offsetY);
        };

        this.#ctx = canvas.getContext("2d");
        this.#figures = [];
        this.#currentPlayer = CURRENT_PLAYER.CROSS;
        this.#gameState = GAME_STATE.PlAYING;
        this.#winnerLine = [0, 0, 2, 2];
    }

    clear() {
        this.#gameState = GAME_STATE.PlAYING;
        this.#figures = [];
    }

    #onPress(x, y) {
        if (this.#gameState !== GAME_STATE.PlAYING) {
            return;
        }

        const column =  Math.floor(x / (WIDTH / 3));
        const row = Math.floor(y / (HEIGHT / 3));

        const figureDoesExist = this.#getFigure(column, row) !== undefined;

        if (figureDoesExist) {
            return;
        }

        const figure = (this.#currentPlayer === CURRENT_PLAYER.CIRCLE) ? this.#placeCircle(column, row) : this.#placeCross(column, row);
        this.#figures.push(figure);

        this.#checkWin();
    }

    #placeCross(column, row) {
        const figure = new Figure(CURRENT_PLAYER.CROSS, column, row);

        this.#currentPlayer = CURRENT_PLAYER.CIRCLE;

        return figure;
    }

    #placeCircle(column, row) {
        const figure = new Figure(CURRENT_PLAYER.CIRCLE, column, row);

        this.#currentPlayer = CURRENT_PLAYER.CROSS;

        return figure;
    }

    start() {
        requestAnimationFrame(() => {this.#update()});
    }

    #drawLine(x1, y1, x2, y2) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(x1, y1);
        this.#ctx.lineTo(x2, y2);
        this.#ctx.stroke();
    }


    #drawLines() {
        const tileWidth = WIDTH / 3;
        const tileHeight = HEIGHT / 3;

        this.#drawLine(tileWidth, 0, tileWidth, HEIGHT);
        this.#drawLine(tileWidth * 2, 0, tileWidth * 2, HEIGHT);

        this.#drawLine(0, tileHeight, WIDTH, tileHeight);
        this.#drawLine(0, tileHeight * 2, WIDTH, tileHeight * 2);
    }

    #drawCircle(column, row) {
        this.#ctx.fillStyle = "black";

        const tileWidth = WIDTH / 3;
        const tileHeight = HEIGHT / 3;

        const radius = 50;

        const x = column * tileWidth;
        const y = row * tileHeight;

        this.#ctx.beginPath();
        this.#ctx.arc(x + tileWidth / 2, y + tileHeight / 2, radius, 0, 2 * Math.PI);
        this.#ctx.stroke();
    }

    #drawCrossFigure(x, y, width, height) {
        this.#ctx.lineWidth = 5;

        this.#drawLine(x, y, x + width, y + height);
        this.#drawLine(x + width, y, x, y + height);
    }

    #drawCross(column, row) {
        this.#ctx.fillStyle = "black";

        const tileWidth = WIDTH / 3;
        const tileHeight = HEIGHT / 3;

        const crossSize = 100;

        const x = column * tileWidth + tileWidth / 2 - crossSize / 2;
        const y = row * tileHeight + tileHeight / 2 - crossSize / 2;

        this.#drawCrossFigure(x, y, crossSize, crossSize);
    }

    #drawWinner() {
        const textSize = 22.5;
        let message = "DRAW!";
        if (this.#gameState === GAME_STATE.CROSS_WINNER) {
            message = "Cross Wins!";
        } else if (this.#gameState === GAME_STATE.CIRCLE_WINNER) {
            message = "Circle Wins!";
        }

        const tileWidth = WIDTH / 3;
        const tileHeight = HEIGHT / 3;

        const x = WIDTH / 2 - (message.length * textSize) / 2;
        const y = HEIGHT / 2 + textSize / 2;

        this.#ctx.fillStyle = "red";
        this.#ctx.font = "50px serif";
        this.#ctx.fillText(message, x, y);

        if (this.#gameState === GAME_STATE.DRAW) {
            return;
        }

        const startX = this.#winnerLine[0] * tileWidth + tileWidth / 2;
        const startY = this.#winnerLine[1] * tileHeight + tileHeight / 2;
        const endX = this.#winnerLine[2] * tileWidth + tileWidth / 2;
        const endY = this.#winnerLine[3] * tileHeight + tileHeight / 2;

        this.#ctx.strokeStyle = "red";
        this.#ctx.lineWidth = 10;
        this.#drawLine(startX, startY, endX, endY);
    }

    #getFigure(x, y) {
        for (const figure of this.#figures) {
            if (figure.column === x && figure.row === y) {
                return figure;
            }
        }
    }

    #checkWin() {
        for (const possibleWin of ALL_POSSIBLE_WINS) {
            let firstFigure = null;
            let lastFigure = null;
            let allTheSame = true;

            for (const pos of possibleWin.allPos) {
                let x = pos[0];
                let y = pos[1];

                if (!allTheSame) {
                    continue;
                }

                const currentFigure = this.#getFigure(x, y);
                if (currentFigure === undefined) {
                    allTheSame = false;
                    
                    continue;
                }

                lastFigure = currentFigure;

                if (firstFigure === null) {
                    firstFigure = currentFigure;

                    continue;
                }

                if (firstFigure.type !== currentFigure.type) {
                    allTheSame = false;

                    continue;
                }
            }

            if (allTheSame) {
                this.#winnerLine = [firstFigure.column, firstFigure.row, lastFigure.column, lastFigure.row];
                this.#gameState = firstFigure.type === 0 ? GAME_STATE.CROSS_WINNER : GAME_STATE.CIRCLE_WINNER;
                return;
            }
        }

        if (this.#figures.length === 9 && this.#gameState === GAME_STATE.PlAYING) {
            this.#gameState = GAME_STATE.DRAW;
        }
    }

    #update() {
        this.#ctx.fillStyle = "white";
        this.#ctx.fillRect(0, 0, WIDTH, HEIGHT);
        this.#ctx.lineWidth = 5;
        this.#ctx.strokeStyle = "black";
        this.#drawLines();

        for (const figure of this.#figures) {
            if (figure.type === CURRENT_PLAYER.CIRCLE) {
                this.#drawCircle(figure.column, figure.row);
            } else {
                this.#drawCross(figure.column, figure.row);
            }
        }
        
        requestAnimationFrame(() => {this.#update()});

        if (this.#gameState === GAME_STATE.PlAYING) {
            return;
        }

        this.#ctx.lineWidth = 10;
        this.#drawWinner();

    }
}

window.onload = () => {
    let game = new Game();
    game.start();

    const button = document.getElementById("restart");

    button.onclick = () => {
        game.clear();
    };
};

