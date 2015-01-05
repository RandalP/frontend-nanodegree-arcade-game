// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speedFactor * dt;
    if (this.x > ctx.canvas.width) {
        this.reset();
    }
};

Enemy.prototype.reset = function() {
    var img = Resources.get(this.sprite);
    this.yOffset = Math.floor(img.height * 0.4);

    this.x = 0;

    // generate a random number in the range [from, to]
    function generate(from, to) {
        return from + Math.floor(Math.random() * (to - from + 1));
    }

    // Randomly choose row from 2-4
    this.row = generate(2, 4);
    this.y = Engine.calcRowCenter(this.row) - this.yOffset;

    // speedFactor can be increased over time or level
    // Generate base speed factor
    this.speedFactor = generate(50, 150);
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.checkCollision = function(bounds) {
    // Check if we are in the same row or x min/max overlaps
    return !(bounds.row != this.row || this.x + 4 > bounds.xMax || this.x + Engine.columnSize() - 4 < bounds.xMin);
}

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
};

Player.prototype.reset = function() {
    var img = Resources.get(this.sprites[this.spriteNum]);
    this.yOffset = Math.floor(img.height * 0.4);
    this.pos.col = Math.floor(Engine.columnCount() / 2);
    this.pos.row = 0;
    this.x = this.y = 0;
};

Player.prototype.update = function() {
    this.pos.col += this.move_vec.col;
    this.pos.row += this.move_vec.row;
    this.move_vec.col = this.move_vec.row = 0;
    return (this.pos.row == Engine.rowCount() - 1);
};


Player.prototype.getBounds = function() {
    // Total image width is 101px
    // Actual image width is 66px, approximately 17px from left.
    return {
        xMin: this.x + 17,
        xMax: this.x + 83,
        row: this.pos.row
    };
}

Player.prototype.render = function() {
    this.x = Engine.calcColumnCenter(this.pos.col);
    this.y = Engine.calcRowCenter(this.pos.row) - this.yOffset;
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
        if (this.pos.row == 0) {
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
