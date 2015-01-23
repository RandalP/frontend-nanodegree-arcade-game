/**
 * Represents an enemy our player must avoid.
 * @constructor Enemy
 */
var Enemy = function() {
    "use strict";
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.speedFactor = 25;
};

/**
 * Update the enemy's position, required method for game.
 * @method Enemy#update
 * @param { double} dt - a time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
    "use strict";
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > ctx.canvas.width) {
        this.reset();
    }
};

/**
 * @param { String } type - the type of reset being performed.
 * @method Enemy#reset
 */
Enemy.prototype.reset = function(type) {
    "use strict";
    var img = Resources.get(this.sprite);
    this.yOffset = Math.floor(img.height * 0.6);

    this.x = 0;

    /**
     * @function
     * Generate a random number in the range [from, to].
     * @param { int } from - lower bounds for random number.
     * @param { int } to - upper bounds for random number.
     */
    function generate(from, to) {
        return from + Math.floor(Math.random() * (to - from + 1));
    }

    // Randomly choose row from 2-4
    this.row = generate(2, 4);
    this.y = Engine.calcRow(this.row) - this.yOffset;

    // speedFactor increased as more crossings are made
    if (type === 'crossing') {
        this.speedFactor += 5;
    }
    // Generate speed
    this.speed = generate(1, 3) * this.speedFactor;
};

/**
 * Draw the enemy on the screen, required method for game.
 * @method Enemy#render
 */
Enemy.prototype.render = function() {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Checks if we are within the specified bounds.
 * @method Enemy#checkCollision
 * @param { Object } bounds - the region in the game.
 * @param { int } bounds.row - the row within the game, starting from zero at the bottom of the screen.
 * @param { int } bounds.xMin - the left-most x-value.
 * @param { int } bounds.xMax - the right-most x-value.
 */
Enemy.prototype.checkCollision = function(bounds) {
    "use strict";
    // Check if we are in the same row or x min/max overlaps
    return !(bounds.row !== this.row || this.x + 5 > bounds.xMax || this.x + Engine.columnSize() - 5 < bounds.xMin);
};

/**
 * The character attempting to cross the road.
 * @constructor Player
 */
var Player = function() {
    "use strict";
    this.sprites = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];

    this.spriteNum = 0;
    if (localStorage.spriteNum) {
        this.spriteNum = Number(localStorage.spriteNum);
    }
    this.highScore = 0;

    if (localStorage.highScore) {
        this.highScore = Number(localStorage.highScore);
    }

    this.pos = { col: 0, row: 0 };
    this.move_vec = { col: 0, row: 0 };
    this.lives = 3;
    this.score = 0;
};

/**
 * Set starting values as well as handle both collisions and successful crossings.
 * @method Player#reset
 * @param { String } type - the type of reset being performed.
 */
Player.prototype.reset = function(type) {
    "use strict";
    var img = Resources.get(this.sprites[this.spriteNum]);
    this.yOffset = Math.floor(img.height * 0.6);
    this.pos.col = Math.floor(Engine.columnCount() / 2);
    this.pos.row = 0;
    this.x = this.y = 0;

    if (type === 'collision') {
        this.lives -= 1;
    } else if (type === 'crossing') {
        this.score += 1;
        if (this.score % 10 === 0) {
            this.lives += 1;
        }
    }
};

/**
 * Updates the position after applying moves.
 * @method Player#update
 */
Player.prototype.update = function() {
    "use strict";
    this.pos.col += this.move_vec.col;
    this.pos.row += this.move_vec.row;
    this.move_vec.col = this.move_vec.row = 0;
};

/**
 * Returns the x bounds and row.
 * @method Player#getBounds
 * @returns { Bounds }
 */
Player.prototype.getBounds = function() {
    "use strict";
    // Total image width is 101px
    // Actual image width is 66px, approximately 17px from left.
    return {
        xMin: this.x + 17,
        xMax: this.x + 83,
        row: this.pos.row
    };
};

/**
 * Returns true if player has crossed the road and reached the water.
 * @method Player#hasCrossed
 * @returns { Boolean }
 */
Player.prototype.hasCrossed = function() {
    "use strict";
    return (this.pos.row === Engine.rowCount() - 1);
};

/**
 * Persists the player's information into local storage.
 * @ method Player.persist
*/
Player.prototype.persist = function() {
    "use strict";
    if (this.score > this.highScore) {
        localStorage.highScore = this.score;
    }
    localStorage.spriteNum = this.spriteNum;
}

/**
 * Draws the player's image.
 * @method Player#render
 */
Player.prototype.render = function() {
    "use strict";
    this.x = Engine.calcColumn(this.pos.col);
    this.y = Engine.calcRow(this.pos.row) - this.yOffset;
    ctx.drawImage(Resources.get(this.sprites[this.spriteNum]), this.x, this.y);
};

/**
 * Responds to user key input.
 * @method Player#handleInput
 * @listens keyup
 * @param { String } key - the name of the key pressed.
 */
Player.prototype.handleInput = function(key) {
    "use strict";
    switch (key) {
    case'left':
        if (this.pos.col > 0) {
            this.move_vec.col -= 1;
        }
        break;
    case 'right':
        if (this.pos.col < Engine.columnCount() - 1) {
            this.move_vec.col += 1;
        }
        break;
    case 'up':
        if (this.pos.row < Engine.rowCount() - 1) {
            this.move_vec.row += 1;
        }
        break;
    case 'down':
        if (this.pos.row > 0 && this.pos.row !== Engine.rowCount() - 1) {
            this.move_vec.row -= 1;
        }
        break;
    case 'space':
        if (this.pos.row < 2) { // Change player's sprite
            this.spriteNum = (this.spriteNum + 1) % this.sprites.length;
        }
        break;
    }
};

/**
 * The list of enemies objects.
 * @global
 */
var allEnemies = [new Enemy(), new Enemy(), new Enemy()];

/**
 * The player object.
 * @global
 */
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    "use strict";
    var allowedKeys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
