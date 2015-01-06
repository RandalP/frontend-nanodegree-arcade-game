// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.speedFactor = 50;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > ctx.canvas.width) {
        this.reset();
    }
};

Enemy.prototype.reset = function(type) {
    var img = Resources.get(this.sprite);
    this.yOffset = Math.floor(img.height * 0.6);

    this.x = 0;

    // generate a random number in the range [from, to]
    function generate(from, to) {
        return from + Math.floor(Math.random() * (to - from + 1));
    }

    // Randomly choose row from 2-4
    this.row = generate(2, 4);
    this.y = Engine.calcRow(this.row) - this.yOffset;

    // speedFactor increased as more crossings are made
    if (type == 'crossing') {
        this.speedFactor += 5;
    }
    // Generate speed
    this.speed = generate(1, 3) * this.speedFactor;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.checkCollision = function(bounds) {
    // Check if we are in the same row or x min/max overlaps
    return !(bounds.row != this.row || this.x + 5 > bounds.xMax || this.x + Engine.columnSize() - 5 < bounds.xMin);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprites = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];
    this.spriteNum = 0;
    this.pos = { col: 0, row: 0 };
    this.move_vec = { col: 0, row: 0 };
    this.lives = 3;
    this.score = 0;
};

/*
    Set starting values as well as handle both collisions and successful crossings.
*/
Player.prototype.reset = function(type) {
    var img = Resources.get(this.sprites[this.spriteNum]);
    this.yOffset = Math.floor(img.height * 0.6);
    this.pos.col = Math.floor(Engine.columnCount() / 2);
    this.pos.row = 0;
    this.x = this.y = 0;

    if (type === 'collision') {
        this.lives -= 1;
    } else if (type == 'crossing') {
        this.score += 1;
    }
};

/*
    Applies moves to player position.
*/
Player.prototype.update = function() {
    this.pos.col += this.move_vec.col;
    this.pos.row += this.move_vec.row;
    this.move_vec.col = this.move_vec.row = 0;
};

/*
    Returns true if player has reached the water.
*/
Player.prototype.hasCrossed = function() {
    return (this.pos.row === Engine.rowCount() - 1);
};

/*
    Returns the x bounds and row.
*/
Player.prototype.getBounds = function() {
    // Total image width is 101px
    // Actual image width is 66px, approximately 17px from left.
    return {
        xMin: this.x + 17,
        xMax: this.x + 83,
        row: this.pos.row
    };
};

Player.prototype.render = function() {
    this.x = Engine.calcColumn(this.pos.col);
    this.y = Engine.calcRow(this.pos.row) - this.yOffset;
    ctx.drawImage(Resources.get(this.sprites[this.spriteNum]), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
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
        if (this.pos.row > 0 && this.pos.row != Engine.rowCount() - 1) {
            this.move_vec.row -= 1;
        }
        break;
    case 'space':
        if (this.pos.row === 0) { // Change player's sprite
            this.spriteNum = (this.spriteNum + 1) % this.sprites.length;
        }
        break;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
