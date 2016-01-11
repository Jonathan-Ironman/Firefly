"use strict";
function explode(x, y, scale) {
    var explosion = document.createElement("div");
    var width;
    var height;

    explosion.className = "explosion explosion" + getRandomInt(1, 5);

    $(document.body).append(explosion);

    width = explosion.offsetWidth;
    height = explosion.offsetHeight;

    explosion.style.top = y - height / 2 + "px";
    explosion.style.left = x - width / 2 + "px";
    if (scale)
        explosion.style.transform = "scale(" + scale + ")";
    //explosion.style.transform = "rotate(" + getRandomInt(0, 359) + "deg) scale(" + (scale || getRandomArbitary(0.8, 1.2)) + ")";

    // For collision detection.
    explosion.x = x;
    explosion.y = y;
    explosion.width = width / 2;
    explosion.height = height / 2;
    explosions.push(explosion);

    explosionSound.play();
}

// Bind end to explosion.
document.addEventListener('transitionend',
function (event) {
    var $target = $(event.target);
    // Missile.
    if ($target.hasClass("missile") && event.propertyName === 'top') { // Keep from firing for each attr.
        //console.log("Missile: " + event.type + " " + event.timeStamp);
        //alert("KILL KILL!");
        explode(
          $target.offset().left - $target.width() / 2,
          $target.offset().top - $target.height() / 2
        );
        $target.remove();
    }
});

// TODO: add webkit prefix (multi listener: http://stackoverflow.com/a/8797106/2407212)
document.addEventListener('animationend',
function (event) {
    var $target = $(event.target);
    // Explosion.
    if ($target.hasClass("explosion")) {
        //console.log("Explosion: type'" + event.target.className + "' " + event.type + " " + event.timeStamp);
        $target.remove();
        //alert("Boom!");
    }
});


/*
var paint = [];
function paintMadness() {
    // PAINT MADNESS.
    // Record.
    if (keyDown[KEYS.KEY_Q]) {
        paint.push(mousePosition);
    }
    // Shoot path.
    if (keyDown[KEYS.KEY_E]) {
        if (paint.length) {
            fireMissile(player.center, paint[0]);
            fireMissile(player.center, paint[~~(paint.length / 5)]);
            fireMissile(player.center, paint[~~(paint.length / 5 * 2)]);
            fireMissile(player.center, paint[~~(paint.length / 5 * 3)]);
            fireMissile(player.center, paint[~~(paint.length / 5 * 4)]);
            laserSound.play();
            //paint = paint.splice(1);
            paint.push(paint.shift());
        }
    }
    // Full Kamikaze.
    if (keyDown[KEYS.KEY_F]) {
        for (var i = 0; i < paint.length; i++) {
            fireMissile(player.center, paint[i]);
            laserSound.play();
        }
    }
    // Clear last. (Doesn't work well with Array.shift)
    if (keyDown[KEYS.KEY_V]) {
        paint.pop();
    }
    // Clear all.
    if (keyDown[KEYS.KEY_R]) {
        paint = [];
    }
}
*/

// TODO use inheritance to share methods with other entities.
function Projectile(options) {
    var that = this;

    this.owner = options.owner;
    this.target = options.target;
    this.type = options.type;

    this.health = options.health || 1;
    this.damage = options.damage || 10;
    this.ctx = options.ctx;
    //this.status = {};
    //this.lastStatusChange = Infinity;

    this.speedX = options.speedX || 0;
    this.speedY = options.speedY || 0;

    this.acceleration = options.acceleration || 1;
    this.turnSpeed = options.turnSpeed || 0;

    //this.inaccuracy = 100;

    this.angle = options.angle;

    // Temp, see img.onload!
    this.width = options.width || 6;
    this.height = options.height || 12;
    this.x = options.x - this.width / 2;
    this.y = options.y - this.height / 2;
    this.center = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
    };

    // Set projectile image.
    this.image = new Image();
    this.image.src = "images/objects/bolt1.png";

    // TODO this needs to be smarter, better measure once per image.
    // Measure it.
    this.image.onload = function () {
        that.width = that.image.width;
        that.height = that.image.height;

        that.x = options.x - that.width / 2;
        that.y = options.y - that.height / 2;

        that.center = {
            x: that.x + that.width / 2,
            y: that.y + that.height / 2
        };
    };
}

Projectile.prototype = {
    draw: function draw() {
        this.drawRotated();
    },

    drawRotated: function drawRotated(image) {
        image || (image = this.image);
        var x = this.center.x;
        var y = this.center.y;
        var context = this.ctx;
        var degrees = this.angle + 90;
        var angleInRadians = degrees * Math.PI / 180;

        context.translate(x, y);
        context.rotate(angleInRadians);
        context.drawImage(image, -this.width / 2, -this.height / 2);
        context.rotate(-angleInRadians);
        context.translate(-x, -y);
    },

    updateCenter: function updateCenter() {
        this.center.x = this.x + this.width / 2;
        this.center.y = this.y + this.height / 2;
    },

    turn: function turn(point) {
        // Find projectile angle.
        var targetAngle = getAngle(this.center, point);
        var turnDegrees = mod(targetAngle - this.angle + 180, 360) - 180;

        if (turnDegrees > -4 && turnDegrees < 4) {
            this.angle = targetAngle;
        }
        else if (turnDegrees < 0) {
            this.angle -= this.turnSpeed;
        }
        else {
            this.angle += this.turnSpeed;
        }
    },

    move: function move(directions) {
        // Angle 0 is X-axis, direction is in radians.
        var angle = this.angle * (Math.PI / 180);

        var forward = directions.forward ? 1 : 0;
        var back = directions.back ? -0.3 : 0;
        var left = directions.left ? 0.4 : 0;
        var right = directions.right ? -0.4 : 0;

        // Forward and backward.
        this.speedX = this.speedX + (forward + back) * this.acceleration * Math.cos(angle);
        this.speedY = this.speedY + (forward + back) * this.acceleration * Math.sin(angle);

        // Left and right.
        this.speedX = this.speedX + (left + right) * this.acceleration * Math.cos(angle - Math.PI / 2);
        this.speedY = this.speedY + (left + right) * this.acceleration * Math.sin(angle - Math.PI / 2);

        // Friction.
        this.speedX *= 0.985;
        this.speedY *= 0.985;

        this.x = this.x + this.speedX;
        this.y = this.y + this.speedY;

        this.updateCenter();
    },

    update: function () {
        if (this.health <= 0)
            return this.destroy();
        else if (this.x < 0 || this.y < 0 || this.x > this.ctx.canvas.width || this.y > this.ctx.canvas.height)
            return this.remove();

        //this.turn(this.target);

        // Direction modifiers.
        var directions = {
            forward: true
        };

        this.move(directions);

        this.draw();
    },

    destroy: function () {
        explode(this.center.x, this.center.y);
        projectiles = projectiles.filter(function notMe(el) { return el !== this; }, this);
    },

    remove: function () {
        projectiles = projectiles.filter(function notMe(el) { return el !== this; }, this);
    }
};
