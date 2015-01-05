// Enemies our player must avoid
var Enemy = function(row) {
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
    this.x += this.speedFactor;
    if (this.x > ctx.canvas.width) {
        this.reset();
    }
};

Enemy.prototype.reset = function() {
    var img = Resources.get(this.sprite);
    this.height = Math.floor(img.height * 0.4);

    this.x = 0;

    function generate(from, to) {
        return from + Math.floor(Math.random() * (to - from + 1));
    }

    // Randomly choose row from 2-4
    this.row = generate(2, 4);

    // speedFactor can be increased over time or level
    // Generate base speed factor of 1-4
    this.speedFactor = generate(1, 4);
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    var y = Engine.calcRowCenter(this.row) - this.height;
    ctx.drawImage(Resources.get(this.sprite), this.x, y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.pos = { col: 0, row: 0 };
    this.move_vec = { col: 0, row: 0 };
};

Player.prototype.reset = function() {
    var img = Resources.get(this.sprite);
    this.height = Math.floor(img.height * 0.4);
    this.pos.col = Math.floor(Engine.columnCount() / 2);
    this.pos.row = 0;
};

Player.prototype.update = function() {
    this.pos.col += this.move_vec.col;
    this.pos.row += this.move_vec.row;
    this.move_vec.col = this.move_vec.row = 0;
    return (this.pos.row == Engine.rowCount() - 1);
};

Player.prototype.render = function() {
    var x = Engine.calcColumnCenter(this.pos.col); // - Math.floor(this.width / 2);
    var y = Engine.calcRowCenter(this.pos.row) - this.height; //  Math.floor(this.height / 2);
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

Player.prototype.handleInput = function(key) {
    if (key == 'left') {
        if (this.pos.col > 0) {
            this.move_vec.col -= 1;
        }
    } else if (key == 'right') {
        if (this.pos.col < Engine.columnCount() - 1) {
            this.move_vec.col += 1;
        }
    } else if (key == 'up') {
        if (this.pos.row < Engine.rowCount() - 1) {
            this.move_vec.row += 1;
        }
    } else { // key == 'down'
        if (this.pos.row > 0 && this.pos.row != Engine.rowCount() - 1) {
            this.move_vec.row -= 1;
        }
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
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
