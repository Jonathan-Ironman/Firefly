// Globals.
var Firefly;
var enemies = new Array(20);
var explosions = [];
var game = true;
var laserSound = new SoundPool("sound/effects/laser.wav", 0.05, 300);
var explosionSound = new SoundPool("sound/effects/explosion4.wav", 0.1, 300);
var playlist = [
    "sound/music/ambientmain_0.ogg",
    "sound/music/dark_fallout.ogg",
    "sound/music/last_stand_in_space.ogg",
    "sound/music/dust.mp3"
];
var backgroundAudio = new Playlist(playlist, 0.2, true);
var canvas;

// Initialize game.
$(document).ready(function () {
    //backgroundAudio.play();

    //disableKeys([KEYS.F1, KEYS.F5]);

    canvas = document.getElementById("canvas");
    canvas.ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.onresize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    canvas.bg = new Image();
    canvas.bg.src = "images/bg.jpg";

    Firefly = Player(canvas);

    for (var i = 0; i < enemies.length; i++) {
        enemies[i] = Enemy(canvas);
        //enemies[i].init();
    }

    // Delay start till ship ready.
    window.setTimeout(render, 50);
});

function render() {
    if (!game) return;
    requestAnimationFrame(render);

    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.ctx.drawImage(canvas.bg, 0, 0);

    // Check ships vs explosions.
    for (var e = 0; e < explosions.length; e++) {
        for (var j = 0; j < enemies.length; j++) {
            if (isColliding(explosions[e], enemies[j]))
                enemies[j].health--;
        }
        // Check player.
        if (isColliding(explosions[e], Firefly))
            Firefly.health--;
    }
    // Reset explosions.
    explosions = [];

    Firefly.update();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

// **isColliding()** returns true if two passed bodies are colliding.
// The approach is to test for five situations.  If any are true,
// the bodies are definitely not colliding.  If none of them
// are true, the bodies are colliding.
// 1. b1 is the same body as b2.
// 2. Right of `b1` is to the left of the left of `b2`.
// 3. Bottom of `b1` is above the top of `b2`.
// 4. Left of `b1` is to the right of the right of `b2`.
// 5. Top of `b1` is below the bottom of `b2`.
function isColliding(b1, b2) {
    return !(
      b1 === b2 ||
        b1.x + b1.width < b2.x - b2.width ||
        b1.y + b1.height < b2.y - b2.height ||
        b1.x - b1.width > b2.x + b2.width ||
        b1.y - b1.height > b2.y + b2.height
    );
}

// Ship constructor.
function Ship(canvas, options) {
    var that = this;

    this.health = 30;
    //this.damage = 10;

    this.status = {};

    this.speedX = 0;
    this.speedY = 0;

    this.acceleration = 0.3;
    this.turnSpeed = 3;
    this.cooldownTime = 20;
    this.inaccuracy = 100;

    // Can fire.
    this.cooldown = 0;
    this.x = window.innerWidth / 2 - 40;
    this.y = window.innerHeight / 2 - 40;
    this.angle = 0;

    this.width = 50;
    this.height = 50;

    var fireImg = new Image();
    fireImg.src = "images/objects/GunFlare.png";

    // Customize properties.
    Object.extend(this, options);

    this.center = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
    };

    // Set ship image.
    var img = new Image();
    img.src = this.imageSrc;

    // Measure it.
    img.onload = function () {
        that.width = img.width;
        that.height = img.height;
        that.center = {
            x: that.x + that.width / 2,
            y: that.y + that.height / 2
        };
    };

    this.draw = function draw() {
        this.drawRotated(canvas, img);

        if (this.status.isFiring) {
            this.drawRotated(canvas, fireImg);
        }
    };

    this.drawRotated = function drawRotated(canvas, image) {
        var x = this.center.x;
        var y = this.center.y;
        var context = canvas.ctx;
        var degrees = this.angle + 90;
        var angleInRadians = degrees * Math.PI / 180;

        context.translate(x, y);
        //context.rotate(angleInRadians);
        context.rotate(angleInRadians);
        context.drawImage(image, -this.width / 2, -this.height / 2);
        context.rotate(-angleInRadians);
        //context.rotate(-angleInRadians);
        context.translate(-x, -y);
    };

    // Set center.
    this.updateCenter = function updateCenter() {
        this.center.x = this.x + this.width / 2;
        this.center.y = this.y + this.height / 2;
    };

    // Set the ships angle.
    this.turn = function turn(point) {
        // Find ship angle.
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
    };

    // TODO only hit first target.
    this.fireGun = function fireGun() {
        // Long gun range.
        var endpoint = pointFromAngle(this.center, this.angle, 10000);

        for (var i = 0; i < enemies.length; i++) {
            // Check if bullet line intersects the enemy outline.
            if (lineIntersectsShip(this.center, endpoint, enemies[i])) {
                enemies[i].status.takingFire = true;
                //enemies[i].elem.style.backgroundColor = "red";
                enemies[i].health--;
            }
                // todo: only is cleared when firing!
            else
                //enemies[i].elem.style.backgroundColor = "";
                enemies[i].status.takingFire = false;
        }

        laserSound.play();
    };

    this.shipMove = function shipMove(directions) {
        // Angle 0 is X-axis, direction is in radians.
        var angle = this.angle * (Math.PI / 180);

        var forward = directions.forward ? 1 : 0;
        var back = directions.back ? -0.4 : 0;
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
    };
}

// Uh?
function Player(canvas) {
    var player = new Ship(canvas, {
        acceleration: 0.8,
        turnSpeed: 4,
        health: 1000,
        // Explosions baby!
        cooldownTime: 0,
        imageSrc: "images/objects/Firefly.png",

        update: function () {
            if (this.health <= 0)
                return this.destroy();

            this.turn(mousePosition);

            // Find the direction modifiers for player. 
            var directions = {
                forward: keyDown[KEYS.UP_ARROW] || keyDown[KEYS.KEY_W],
                back: keyDown[KEYS.DOWN_ARROW] || keyDown[KEYS.KEY_S],
                left: keyDown[KEYS.LEFT_ARROW] || keyDown[KEYS.KEY_A],
                right: keyDown[KEYS.RIGHT_ARROW] || keyDown[KEYS.KEY_D]
            };

            this.shipMove(directions);
            //if (!movement) this.elem.classList.remove("moving");

            // Firing.
            if (this.cooldown < 1) {
                if (keyDown[KEYS.SPACE]) {
                    var offset = this.width / 2.4;
                    var p1 = pointFromAngle(this.center, this.angle - 90, offset);
                    var p2 = pointFromAngle(this.center, this.angle - 90, -offset);

                    var t1 = pointFromAngle(mousePosition, this.angle - 90, offset * 0.5);
                    var t2 = pointFromAngle(mousePosition, this.angle - 90, -offset * 0.5);

                    fireMissile(p1, t1);
                    fireMissile(p2, t2);
                    this.cooldown = this.cooldownTime;
                    laserSound.play();
                }
            }
            else
                this.cooldown--;

            // Lasers!
            if (mouseDown[BUTTONS.LEFT]) {
                this.fireGun();
                this.status.isFiring = true;
            }
            else {
                this.status.isFiring = false;
            }

            // Do paint madness.
            //paintMadness();

            this.draw();
        },

        destroy: function () {
            explode(this.center.x, this.center.y, 5);
            //this.elem.parentElement.removeChild(this.elem);

            //game.remove(this);
            //Firefly = "game over";
            game = false;
            alert("Game over!");
        }

    });

    return player;
}

// Uh?
function Enemy(canvas) {
    var enemy = new Ship(canvas, {
        speed: 5,
        x: chance(50) ? getRandomInt(50, 300) : getRandomInt(canvas.width - 250, canvas.width - 400),
        y: chance(50) ? getRandomInt(50, 300) : getRandomInt(canvas.height - 250, canvas.height - 400),
        imageSrc: "images/objects/enemy1.png",

        //init: function () {
        //    enemy.elem.classList.add("enemy")
        //},

        update: function () {
            if (this.health <= 0)
                return this.destroy();

            this.turn(Firefly.center);

            // Move out of player range
            var facing = isFacing(Firefly, this);
            if (facing) {
                var directions = {
                    forward: true,
                    left: facing > 0,
                    right: facing < 0
                };

                this.shipMove(directions);
            }
                // Move closer.
            else if (lineDistance(this.center, Firefly.center) < 300) {
                var directions = {
                    back: true
                };

                this.shipMove(directions);
            }

            // Fire.
            if (this.cooldown < 1) {
                if (chance(1)) {
                    var target = {
                        x: Firefly.center.x + getRandomInt(-this.inaccuracy, this.inaccuracy),
                        y: Firefly.center.y + getRandomInt(-this.inaccuracy, this.inaccuracy)
                    };
                    fireMissile(this.center, target);
                    this.cooldown = this.cooldownTime;
                    // hardly visible, needs to be more frames.
                    this.status.isFiring = true;
                    laserSound.play();
                }
            }
            else {
                this.status.isFiring = false;
                this.cooldown--;
            }

            this.draw();
        },

        destroy: function () {
            explode(this.center.x, this.center.y, 2.5);

            //this.elem.parentNode.removeChild(this.elem);
            // Remove this from enemies list.
            //game.remove(this);
            enemies = enemies.filter(function notMe(el) { return el !== this; }, this);

            // Lame check.
            if (!enemies.length) alert("Win!");
        }

    });

    return enemy;
}