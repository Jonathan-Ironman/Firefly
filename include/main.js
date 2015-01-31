 // Globals.
var Firefly;
var enemies = new Array(3);
var currentMousePos = { x: 0, y: 0 };

// Initialize game.
$(document).ready(function () {
    Firefly = Player();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i] = Enemy();
        enemies[i].init();
    }

    // Delay start till ship ready.
    window.setTimeout(render, 50);
});

function render() {
    requestAnimationFrame(render);

    Firefly.update();

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

function playerMove(dir) {
    var movingSpeed = Firefly.speed;
    var hor = dir == 'left' || dir == 'right' ? true : false;
    var inverse = dir == 'down' || dir == 'right' ? -1 : 1;

    Firefly.elem.classList.add('moving');

    if (hor) {
        Firefly.elem.style.left = Firefly.elem.offsetLeft - movingSpeed * inverse + "px";
    }
    else {
        Firefly.elem.style.top = Firefly.elem.offsetTop - movingSpeed * inverse + "px";
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

function fireflyMouseMove(e) {
    var newX = e.clientX - Firefly.width / 2;
    newY = e.clientY - Firefly.height / 2;

    Firefly.elem.style.top = newY + "px";
    Firefly.elem.style.left = newX + "px";

    Firefly.elem.classList.add('transitions');
}

$(document).on('click', fireflyMouseMove);

// **colliding()** returns true if two passed bodies are colliding.
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

    this.health = 100;
    this.damage = 10;
    this.speed = 8;
    this.turnSpeed = 4;
    this.cooldownTime = 20;
    this.inaccuracy = 100;

    // Can fire.
    this.cooldown = 0;
    this.x = 100;
    this.y = 100;
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
        speed: 12,
        turnSpeed: 6,
        // Explosions baby!
        cooldownTime: 0,
        update: function () {
            updateCoords(player);
            updateCenter(player);
            turn(player, currentMousePos);

            var movement = false;

            var left = KEYDOWN[KEYS.LEFT_ARROW] || KEYDOWN[KEYS.KEY_A];
            var right = KEYDOWN[KEYS.RIGHT_ARROW] || KEYDOWN[KEYS.KEY_D];
            var up = KEYDOWN[KEYS.UP_ARROW] || KEYDOWN[KEYS.KEY_W];
            var down = KEYDOWN[KEYS.DOWN_ARROW] || KEYDOWN[KEYS.KEY_S];

            if (left) { playerMove('left'); movement = true; }
            if (right) { playerMove('right'); movement = true; }
            if (up) { playerMove('up'); movement = true; }
            if (down) { playerMove('down'); movement = true; }

            // Firing.
            if (player.cooldown < 1) {
                if (KEYDOWN[KEYS.SPACE]) {
                    var offset = player.width / 2.4;
                    var p1 = pointFromAngle(player.center, player.angle - 90, offset);
                    var p2 = pointFromAngle(player.center, player.angle - 90, -offset);

                    var t1 = pointFromAngle(currentMousePos, player.angle - 90, offset * 0.5);
                    var t2 = pointFromAngle(currentMousePos, player.angle - 90, -offset * 0.5);

                    fireMissile(p1, t1);
                    fireMissile(p2, t2);
                    player.cooldown = player.cooldownTime;
                }
            }
            else player.cooldown--;

            if (!movement) player.elem.classList.remove("moving");
        }
    });

    return player;
}

// Uh?
function Enemy() {
    var enemy = new Ship({
        speed: 5,
        x: getRandomInt(50, 400),
        y: getRandomInt(50, 400),

        init: function () {
            enemy.elem.classList.add("enemy")
        },

        update: function () {
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
        }
    });

    return enemy;
}