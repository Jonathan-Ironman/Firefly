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

var paint = [];

// Initialize game.
$(document).ready(function () {
    //backgroundAudio.play();

    //disableKeys([KEYS.F1, KEYS.F5]);
    Firefly = Player();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i] = Enemy();
        enemies[i].init();
    }

    // Delay start till ship ready.
    window.setTimeout(render, 50);
});

function render() {
    if (!game) return;
    requestAnimationFrame(render);

    // Check ships vs explosions.
    for (var e = 0; e < explosions.length; e++) {
        for (var j = 0; j < enemies.length; j++) {
            if (colliding(explosions[e], enemies[j]))
                enemies[j].health--;
        }
        // Check player.
        if (colliding(explosions[e], Firefly))
            Firefly.health--;
    }
    // Reset explosions.
    explosions = [];

    // Lasers!
    if (mouseDown[BUTTONS.LEFT]) {
        for (var j = 0; j < enemies.length; j++) {
            var p1 = { x: enemies[j].x, y: enemies[j].y };
            var p2 = { x: enemies[j].x + enemies[j].width, y: enemies[j].y };
            var p3 = { x: enemies[j].x + enemies[j].width, y: enemies[j].y + enemies[j].height };
            var p4 = { x: enemies[j].x, y: enemies[j].y + enemies[j].height };

            if (isIntersecting(Firefly.center, mousePosition, p1, p2) ||
                isIntersecting(Firefly.center, mousePosition, p2, p3) ||
                isIntersecting(Firefly.center, mousePosition, p3, p4) ||
                isIntersecting(Firefly.center, mousePosition, p4, p1)
                ) {
                enemies[j].elem.style.backgroundColor = "red";
            } else
                enemies[j].elem.style.backgroundColor = "";
        }
    }

    Firefly.update();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

$(document).on('transitionend',
function (event) {
    var $target = $(event.target);

    // Firefly.
    if ($target.is(Firefly.elem) && event.originalEvent.propertyName === 'top') { // Keep from firing for each attr.
        //console.log("Firefly: " + event.type + " " + new Date().getTime());
        Firefly.elem.classList.remove('transitions');
    }
});

//function fireflyMouseMove(e) {
//    var newX = e.clientX - Firefly.width / 2;
//    newY = e.clientY - Firefly.height / 2;

//    Firefly.elem.style.top = newY + "px";
//    Firefly.elem.style.left = newX + "px";

//    Firefly.elem.classList.add('transitions');
//}
//$(document).on('click', fireflyMouseMove);

// **colliding()** returns true if two passed bodies are colliding.
// The approach is to test for five situations.  If any are true,
// the bodies are definitely not colliding.  If none of them
// are true, the bodies are colliding.
// 1. b1 is the same body as b2.
// 2. Right of `b1` is to the left of the left of `b2`.
// 3. Bottom of `b1` is above the top of `b2`.
// 4. Left of `b1` is to the right of the right of `b2`.
// 5. Top of `b1` is below the bottom of `b2`.
function colliding(b1, b2) {
    return !(
      b1 === b2 ||
        b1.x + b1.width < b2.x - b2.width ||
        b1.y + b1.height < b2.y - b2.height ||
        b1.x - b1.width > b2.x + b2.width ||
        b1.y - b1.height > b2.y + b2.height
    );
}


// Set coords.
function updateCoords(obj) {
    obj.x = obj.elem.offsetLeft;
    obj.y = obj.elem.offsetTop;
}

// Set center.
function updateCenter(obj) {
    obj.center.x = obj.x + obj.width / 2;
    obj.center.y = obj.y + obj.height / 2;
}

function turn(ship, point) {
    // Find ship angle.
    var targetAngle = getAngle(ship.center, point);
    var turnDegrees = mod(targetAngle - ship.angle + 180, 360) - 180;

    if (turnDegrees > -4 && turnDegrees < 4) {
        ship.angle = targetAngle;
    }
    else if (turnDegrees < 0) {
        ship.angle -= ship.turnSpeed;
    }
    else {
        ship.angle += ship.turnSpeed;
    }

    // Set ship direction.
    ship.elem.style.transform = 'rotate(' + (ship.angle + 90) + 'deg)';
}

// Ship constructor.
function Ship(options) {
    this.elem = document.createElement("div");
    this.elem.className = "ship";
    this.elem.style.visibility = "hidden";

    this.health = 30;
    //this.damage = 10;

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

    // Customize properties.
    Object.extend(this, options);

    // Add to document and measure it.
    var that = this;
    document.body.appendChild(this.elem);
    window.setTimeout(function () {
        that.width = that.elem.offsetWidth;
        that.height = that.elem.offsetHeight;
        that.center = {
            x: that.x + that.width / 2,
            y: that.y + that.height / 2
        };
        // Position and remove visibility: hidden.
        that.elem.style.cssText = "left: " + that.x + "px; top: " + that.y + "px;";
    }, 10);
}

// Uh?
function Player() {
    var player = new Ship({
        acceleration: 0.8,
        turnSpeed: 4,
        health: 1000,
        // Explosions baby!
        cooldownTime: 0,

        update: function () {
            if (player.health <= 0)
                return player.destroy();

            updateCoords(player);
            updateCenter(player);
            turn(player, mousePosition);

            // Find the direction modifiers for player. 
            var directions = {
                forward: keyDown[KEYS.UP_ARROW] || keyDown[KEYS.KEY_W],
                back: keyDown[KEYS.DOWN_ARROW] || keyDown[KEYS.KEY_S],
                left: keyDown[KEYS.LEFT_ARROW] || keyDown[KEYS.KEY_A],
                right: keyDown[KEYS.RIGHT_ARROW] || keyDown[KEYS.KEY_D]
            };

            shipMove(player, directions);
            //if (!movement) player.elem.classList.remove("moving");

            // Firing.
            if (player.cooldown < 1) {
                if (keyDown[KEYS.SPACE] || mouseDown[BUTTONS.LEFT]) {
                    var offset = player.width / 2.4;
                    var p1 = pointFromAngle(player.center, player.angle - 90, offset);
                    var p2 = pointFromAngle(player.center, player.angle - 90, -offset);

                    var t1 = pointFromAngle(mousePosition, player.angle - 90, offset * 0.5);
                    var t2 = pointFromAngle(mousePosition, player.angle - 90, -offset * 0.5);

                    fireMissile(p1, t1);
                    fireMissile(p2, t2);
                    player.cooldown = player.cooldownTime;
                    laserSound.play();
                }
            }
            else
                player.cooldown--;

            // PAINT MADNESS.
            // Record.
            if (keyDown[KEYS.KEY_Q]) {
                paint.push(mousePosition);
            }
            // Shoot triple path.
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
            // Clear last. (Don't work well with Array.shift)
            if (keyDown[KEYS.KEY_V]) {
                paint.pop();
            }
            // Clear all.
            if (keyDown[KEYS.KEY_R]) {
                paint = [];
            }

        },

        destroy: function () {
            explode(player.center.x, player.center.y, 5);
            player.elem.parentElement.removeChild(player.elem);
            //Firefly = "game over";
            game = false;
            alert("Game over!");
        }

    });

    return player;
}

// Uh?
function Enemy() {
    var enemy = new Ship({
        speed: 5,
        x: chance(50) ? getRandomInt(50, 300) : getRandomInt(window.innerWidth - 250, window.innerWidth - 400),
        y: chance(50) ? getRandomInt(50, 300) : getRandomInt(window.innerHeight - 250, window.innerHeight - 400),

        init: function () {
            enemy.elem.classList.add("enemy")
        },

        update: function () {
            if (enemy.health <= 0)
                return enemy.destroy();

            updateCoords(enemy);
            updateCenter(enemy);
            turn(enemy, Firefly.center);

            // Move out of player range
            var facing = isFacing(Firefly, enemy);
            if (facing) {
                var directions = {
                    forward: true,
                    left: facing > 0,
                    right: facing < 0
                };

                shipMove(enemy, directions);
            }
            else if (lineDistance(enemy.center, Firefly.center) < 300) {
                var directions = {
                    back: true
                };

                shipMove(enemy, directions);
            }

            // Fire.
            if (enemy.cooldown < 1) {
                if (chance(1)) {
                    var target = {
                        x: Firefly.center.x + getRandomInt(-enemy.inaccuracy, enemy.inaccuracy),
                        y: Firefly.center.y + getRandomInt(-enemy.inaccuracy, enemy.inaccuracy)
                    };
                    fireMissile(enemy.center, target);
                    enemy.cooldown = enemy.cooldownTime;
                    laserSound.play();
                }
            }
            else enemy.cooldown--;
        },

        destroy: function () {
            explode(enemy.center.x, enemy.center.y, 2.5);
            enemy.elem.parentElement.removeChild(enemy.elem);
            enemies = enemies.filter(function notMe(el) { return el !== enemy; }, enemy);

            // Lame check.
            if (!enemies.length) alert("Win!");
        }

    });

    return enemy;
}

function shipMove(ship, directions) {
    // Angle 0 is X-axis, direction is in radians.
    var angle = ship.angle * (Math.PI / 180);

    var forward = directions.forward ? 1 : 0;
    var back = directions.back ? -0.4 : 0;
    var left = directions.left ? 0.4 : 0;
    var right = directions.right ? -0.4 : 0;

    // Forward and backward.
    ship.speedX = ship.speedX + (forward + back) * ship.acceleration * Math.cos(angle);
    ship.speedY = ship.speedY + (forward + back) * ship.acceleration * Math.sin(angle);

    // Left and right.
    ship.speedX = ship.speedX + (left + right) * ship.acceleration * Math.cos(angle - Math.PI / 2);
    ship.speedY = ship.speedY + (left + right) * ship.acceleration * Math.sin(angle - Math.PI / 2);

    // Friction.
    ship.speedX *= 0.985;
    ship.speedY *= 0.985;

    //console.log(ship.speedX.toFixed(2), ship.speedY.toFixed(2), ship.angle.toFixed(2), direction.toFixed(2));

    ship.elem.style.left = ship.x + ship.speedX + "px";
    ship.elem.style.top = ship.y + ship.speedY + "px";

    //updateCenter(ship);
}