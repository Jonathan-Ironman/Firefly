// Globals.
var Firefly;
var currentMousePos = [0, 0];

// Initialize game.
$(document).ready(function () {
    //Firefly = document.getElementById('firefly');
    //Firefly.width = Firefly.elem.offsetWidth;
    //Firefly.height = Firefly.elem.offsetHeight;
    //Firefly.speed = 8;

    //Firefly.x = Firefly.elem.offsetLeft;
    //Firefly.y = Firefly.elem.offsetTop;
    //Firefly.CENTER = {
    //    X: Firefly.x + Firefly.width / 2,
    //    Y: Firefly.y + Firefly.height / 2,
    //};
    //Firefly.angle = 0;

    //// Test
    //testShip = new Ship({
    //    speed: 12
    //});

    Firefly = new Ship({
        speed: 12
    });

    // Delay start till ship ready.
    window.setTimeout(render, 50);
});

function render() {
    requestAnimationFrame(render);

    // Update ship.
    Firefly.x = Firefly.elem.offsetLeft;
    Firefly.y = Firefly.elem.offsetTop;

    // Do with need this every cycle?
    Firefly.center.x = Firefly.x + Firefly.width / 2;
    Firefly.center.y = Firefly.y + Firefly.height / 2;

    // Find ship angle.
    var mouseAngle = getAngle(Firefly.center.x, Firefly.center.y, currentMousePos[0], currentMousePos[1]);
    var turnDegrees = mod(mouseAngle - Firefly.angle + 180, 360) - 180;

    if (turnDegrees > -5 && turnDegrees < 5) {
        Firefly.angle = mouseAngle;
    }
    else if (turnDegrees < 0) {
        Firefly.angle -= 5;
    }
    else {
        Firefly.angle += 5;
    }

    // Set ship direction.
    Firefly.elem.style.transform = 'rotate(' + (Firefly.angle + 90) + 'deg)';

    var movement = false;

    var left = KEYDOWN[KEYS.LEFT_ARROW] || KEYDOWN[KEYS.KEY_A];
    var right = KEYDOWN[KEYS.RIGHT_ARROW] || KEYDOWN[KEYS.KEY_D];
    var up = KEYDOWN[KEYS.UP_ARROW] || KEYDOWN[KEYS.KEY_W];
    var down = KEYDOWN[KEYS.DOWN_ARROW] || KEYDOWN[KEYS.KEY_S];

    if (left) { move('left'); movement = true; }
    if (right) { move('right'); movement = true; }
    if (up) { move('up'); movement = true; }
    if (down) { move('down'); movement = true; }

    if (KEYDOWN[KEYS.SPACE]) fireMissile();

    if (!movement) Firefly.elem.classList.remove("moving");
}

function move(dir) {
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
        console.log("Firefly: " + event.type + " " + new Date().getTime());
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

function lineDistance(point1, point2) { // TODO implement speed
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}

function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}


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

// Ship constructor.
function Ship(options) {
    this.elem = document.createElement("div");
    this.elem.className = "ship";
    this.elem.style.visibility = "hidden";

    this.speed = 8;

    this.x = 100;
    this.y = 100;
    this.angle = 0;

    this.update = function () {

    };

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
        that.elem.style.cssText = "top: 50%; left: 50%;";
    }, 10);
}