// Globals.
var Firefly;
var enemies = new Array(13);
var explosions = [];
var game = true;

// Initialize game.
$(document).ready(function () {
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
    //if (!enemies.length) return alert("Win!");
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
    this.damage = 10;

    this.speedX = 0;
    this.speedY = 0;

    this.acceleration = 1;
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
        turnSpeed: 6,
        health: 300,
        // Explosions baby!
        cooldownTime: 0,
        update: function () {
            if (player.health <= 0)
                return player.destroy();

            updateCoords(player);
            updateCenter(player);
            turn(player, mousePosition);

            shipMove(player);
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
                }
            }
            else player.cooldown--;
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

            // Fire.
            if (enemy.cooldown < 1) {
                if (chance(1)) {
                    var target = {
                        x: Firefly.center.x + getRandomInt(-enemy.inaccuracy, enemy.inaccuracy),
                        y: Firefly.center.y + getRandomInt(-enemy.inaccuracy, enemy.inaccuracy)
                    };
                    fireMissile(enemy.center, target);
                    enemy.cooldown = enemy.cooldownTime;
                }
            }
            else enemy.cooldown--;
        },

        destroy: function () {
            explode(enemy.center.x, enemy.center.y, 2.5);
            enemy.elem.parentElement.removeChild(enemy.elem);
            enemies = enemies.filter(function notMe(el) { return el !== enemy; }, enemy);
        }

    });

    return enemy;
}

function shipMove(ship) {
    // Angle 0 is X-axis, direction is in radians.
    var direction = ship.angle * (Math.PI / 180);

    // Find the direction modifiers. 
    var forward = keyDown[KEYS.UP_ARROW] || keyDown[KEYS.KEY_W];
    var back = keyDown[KEYS.DOWN_ARROW] || keyDown[KEYS.KEY_S];
    var left = keyDown[KEYS.LEFT_ARROW] || keyDown[KEYS.KEY_A];
    var right = keyDown[KEYS.RIGHT_ARROW] || keyDown[KEYS.KEY_D];

    forward = forward ? 1 : 0;
    back = back ? -0.4 : 0;
    left = left ? 0.3 : 0;
    right = right ? -0.3 : 0;

    // Forward and backward.
    ship.speedX = ship.speedX + (forward + back) * ship.acceleration * Math.cos(direction);
    ship.speedY = ship.speedY + (forward + back) * ship.acceleration * Math.sin(direction);

    // Left and right.
    ship.speedX = ship.speedX + (left + right) * ship.acceleration * Math.cos(direction - Math.PI / 2);
    ship.speedY = ship.speedY + (left + right) * ship.acceleration * Math.sin(direction - Math.PI / 2);

    // Friction.
    ship.speedX *= 0.99;
    ship.speedY *= 0.99;

    //console.log(ship.speedX.toFixed(2), ship.speedY.toFixed(2), ship.angle.toFixed(2), direction.toFixed(2));

    ship.elem.style.left = ship.x + ship.speedX + "px";
    ship.elem.style.top = ship.y + ship.speedY + "px";
}