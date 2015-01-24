/**
 * A region within the game board.
 * @typedef {Object} Bounds
 * @property {number} row - the row within the game, starting from zero at the bottom of the screen.
 * @property {number} xMin - the left-most x-value.
 * @property {number} xMax - the right-most x-value.
 */

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
    this.x = this.y = 0;
};

/**
 * Update the enemy's position, required method for game.
 * @method Enemy#update
 * @param {double} dt - the time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    "use strict";
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > ctx.canvas.width) {
        this.reset('init');
    }
};

/**
 * Resets the enemy characteristics, depending on reason.
 * @method Enemy#reset
 * @param {string} reason - the reason for the reset being performed
 */
Enemy.prototype.reset = function(reason) {
    "use strict";
    var img = Resources.get(this.sprite);
    this.yOffset = Math.floor(img.height * 0.6);

    /**
     * Generate a random number in the range [from, to].
     * @function Enemy.generate
     * @param {number} from - lower bounds for random number
     * @param {number} to - upper bounds for random number
     * @returns {number} A random number in the range [from, t0].
     */
    function generate(from, to) {
        return from + Math.floor(Math.random() * (to - from + 1));
    }

    if (this.y === 0 || reason === 'init') {
        // Randomly choose start position to reduce overlapping enemies
        this.x = generate(-img.width, 0);
        // Randomly choose row
        this.row = generate(2, Engine.rowCount() - 2);
        this.y = Engine.calcY(this.row) - this.yOffset;
    }

    // speedFactor increased as more crossings are made
    if (reason === 'crossing') {
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
 * Checks if the enemy is positiioned within the specified bounds.
 * @method Enemy#checkCollision
 * @param {Bounds} bounds - the player's region within the game
 * @return {Boolean} Whether this enemy has collided with the player.
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
 * @param {string} reason - the reason for the reset being performed.
 */
Player.prototype.reset = function(reason) {
    "use strict";
    var img = Resources.get(this.sprites[this.spriteNum]);
    this.yOffset = Math.floor(img.height * 0.6);
    this.pos.col = Math.floor(Engine.columnCount() / 2);
    this.pos.row = 0;
    this.x = this.y = 0;

    if (reason === 'collision') {
        this.lives -= 1;
    } else if (reason === 'crossing') {
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
 * Returns the position of the player in the game board.
 * @method Player#getBounds
 * @returns {Bounds} The position of the player in the game board.
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
 * @returns {Boolean} Whether the player has crossed yet.
 */
Player.prototype.hasCrossed = function() {
    "use strict";
    return (this.pos.row === Engine.rowCount() - 1);
};

/**
 * Persists the player's information into local storage.
 * @method Player#persist
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
    this.x = Engine.calcX(this.pos.col);
    this.y = Engine.calcY(this.pos.row) - this.yOffset;
    ctx.drawImage(Resources.get(this.sprites[this.spriteNum]), this.x, this.y);
};

/**
 * Responds to user key input.
 * @method Player#handleInput
 * @listens keyup
 * @param {string} key - the name of the key pressed.
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
var allEnemies = [];

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
