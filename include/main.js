"use strict";
// Globals.
var Firefly;
var enemies = new Array(8);
var projectiles = [];
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
document.addEventListener("DOMContentLoaded", function () {
    //backgroundAudio.play();
    laserSound.mute(true);
    explosionSound.mute(true);

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

    Firefly = createPlayer(canvas);

    for (var i = 0; i < enemies.length; i++) {
        enemies[i] = createEnemy(canvas);
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

    // Check ships vs projectiles.
    for (var p = 0; p < projectiles.length; p++) {
        for (var j = 0; j < enemies.length; j++) {
            // Check for friendly fire as well.
            if (projectiles[p].owner === Firefly && isColliding(projectiles[p], enemies[j])) {
                enemies[j].health -= projectiles[p].damage;
                projectiles[p].health = 0;
            }
        }
        // Check player.
        if (projectiles[p].owner !== Firefly && isColliding(projectiles[p], Firefly)) {
            Firefly.health -= projectiles[p].damage;
            projectiles[p].health = 0;
        }
    }

    Firefly.update();

    for (var i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
    }

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    // HP bar.
    ui.showHealth(canvas.ctx, Firefly);
}

// Returns true if two passed bodies are colliding.
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

    this.health = 50;

    //this.damage = 10;
    this.ctx = canvas.ctx;
    this.status = {};
    this.lastStatusChange = Infinity;

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

    this.fireImg = new Image();
    this.fireImg.src = "images/objects/GunFlare.png";

    this.takingFireImg = new Image();
    this.takingFireImg.src = "images/objects/BulletImpact.png";

    // Customize properties.
    Object.extend(this, options);

    this.maxHealth = this.health;

    this.center = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2
    };

    // Set ship image.
    this.image = new Image();
    this.image.src = this.imageSrc;

    // Measure it.
    this.image.onload = function () {
        that.width = that.image.width;
        that.height = that.image.height;
        that.center = {
            x: that.x + that.width / 2,
            y: that.y + that.height / 2
        };
    };
}

Ship.prototype = {
    draw: function draw() {
        this.drawRotated();

        if (this.status.firing)
            this.drawRotated(this.fireImg);

        if (this.status.takingFire)
            this.drawRotated(this.takingFireImg);
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

    // Set center.
    updateCenter: function updateCenter() {
        this.center.x = this.x + this.width / 2;
        this.center.y = this.y + this.height / 2;
    },

    // Set the ships angle.
    turn: function turn(point) {
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
    },

    // TODO Only works for player.
    fireGun: function fireGun() {
        // This was redundant
        //if (this.cooldown > 0)
        //    return;

        this.status.firing = true;

        // Long gun range.
        var endpoint = pointFromAngle(this.center, this.angle, 10000);
        var intersecting = [];

        for (var i = 0; i < enemies.length; i++) {
            if (lineIntersectsShip(this.center, endpoint, enemies[i]))
                intersecting.push(enemies[i]);
        }

        // todo: only is cleared when firing! Status should be maintained per ship update.
        //enemies[i].status.takingFire = false;

        var target;
        var distance1 = Infinity;
        var distance2;

        // Only hit closest target.
        for (var i = 0; i < intersecting.length; i++) {
            distance2 = lineDistance(this.center, intersecting[i].center);
            if (distance2 < distance1) {
                distance1 = distance2;
                target = intersecting[i];
            }
        }

        if (target) {
            target.status.takingFire = true;
            target.lastStatusChange = 0;
            target.health--;
            endpoint = pointFromAngle(this.center, this.angle, distance1);
        }

        // Draw double laser.
        var offset = 12;
        var p1 = pointFromAngle(this.center, this.angle - 90, offset);
        var p2 = pointFromAngle(this.center, this.angle - 90, -offset);
        var t1 = pointFromAngle(endpoint, this.angle - 90, offset);
        var t2 = pointFromAngle(endpoint, this.angle - 90, -offset);

        var context = this.ctx;
        context.beginPath();

        context.moveTo(p1.x, p1.y);
        context.lineTo(t1.x, t1.y);
        context.moveTo(p2.x, p2.y);
        context.lineTo(t2.x, t2.y);

        context.lineWidth = 0.8;
        //context.setLineDash([1]);
        context.strokeStyle = 'orange';
        context.stroke();

        this.cooldown = this.cooldownTime;
        laserSound.play();
    },

    fireMissile: function fireMissile(launchPoint, target) {
        var missileOptions = {
            owner: this,
            // TODO: target doesn't have use for dumbfire
            //target: target,
            x: launchPoint.x,
            y: launchPoint.y,
            type: 'dumbfire',
            ctx: this.ctx,
            angle: this.angle,
            speedX: this.speedX,
            speedY: this.speedY
        };

        projectiles.push(new Projectile(missileOptions));
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
    }
};

function createPlayer(canvas) {
    var player = new Ship(canvas, {
        acceleration: 0.8,
        turnSpeed: 6,
        health: 500,
        // Explosions baby!
        cooldownTime: 5,
        imageSrc: "images/objects/Firefly.png",

        update: function () {
            if (this.health <= 0)
                return this.destroy();

            // Reset stati.
            this.status = {};

            this.turn(mousePosition);

            // Find the direction modifiers for player.
            var directions = {
                forward: keyDown[KEYS.UP_ARROW] || keyDown[KEYS.KEY_W],
                back: keyDown[KEYS.DOWN_ARROW] || keyDown[KEYS.KEY_S],
                left: keyDown[KEYS.LEFT_ARROW] || keyDown[KEYS.KEY_A],
                right: keyDown[KEYS.RIGHT_ARROW] || keyDown[KEYS.KEY_D]
            };

            this.move(directions);
            //if (!movement) this.elem.classList.remove("moving");

            // Firing.
            if (this.cooldown < 1) {
                if (keyDown[KEYS.SPACE]) {
                    var offset = this.width / 2.4;
                    var p1 = pointFromAngle(this.center, this.angle - 90, offset);
                    var p2 = pointFromAngle(this.center, this.angle - 90, -offset);

                    var t1 = pointFromAngle(mousePosition, this.angle - 90, offset * 0.5);
                    var t2 = pointFromAngle(mousePosition, this.angle - 90, -offset * 0.5);

                    this.fireMissile(p1, t1);
                    this.fireMissile(p2, t2);
                    this.cooldown = this.cooldownTime;
                    laserSound.play();
                }

                // Lasers!
                if (mouseDown[BUTTONS.LEFT]) {
                    this.fireGun();
                }
            }
            else
                this.cooldown--;

            // Do paint madness.
            //paintMadness();

            this.draw();
        },

        destroy: function () {
            // TODO: mad loop with game state...
            explode(this.center.x, this.center.y, 5);
            //this.elem.parentElement.removeChild(this.elem);

            //game.remove(this);
            //Firefly = "game over";
            //game = false;
            //pauseGame();
            alert("Game over!");
            // Make enemies go mad? :)
        }
    });

    return player;
}

function createEnemy(canvas) {
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

            // Reset status if it was set long ago. TODO: this is fubar, some getter setter maybe?
            if (this.lastStatusChange > 1) {
                this.status = {};
                this.lastStatusChange = 0;
            }
            else
                this.lastStatusChange++;

            this.turn(Firefly.center);

            // Move out of player range
            var facing = isFacing(Firefly, this);
            var directions = {};
            if (facing) {
                directions = {
                    forward: true,
                    left: facing > 0,
                    right: facing < 0
                };
            }
                // Back away.
            else if (lineDistance(this.center, Firefly.center) < 300) {
                directions = {
                    back: true
                };
            }

            this.move(directions);

            // Fire.
            if (this.cooldown < 1) {
                if (chance(1)) {
                    var target = {
                        x: Firefly.center.x + getRandomInt(-this.inaccuracy, this.inaccuracy),
                        y: Firefly.center.y + getRandomInt(-this.inaccuracy, this.inaccuracy)
                    };
                    this.fireMissile(this.center, target);
                    this.cooldown = this.cooldownTime;
                    // hardly visible, needs to be more frames.
                    this.status.firing = true;
                    laserSound.play();
                }
            }
            else {
                this.status.firing = false;
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