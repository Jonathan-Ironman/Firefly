// Globals.
var FIREFLY;
var currentMousePos = [0, 0];

// Initialize game.
$(document).ready(function () {
    FIREFLY = document.getElementById('firefly');
    FIREFLY.WIDTH = FIREFLY.offsetWidth;
    FIREFLY.HEIGHT = FIREFLY.offsetHeight;
    FIREFLY.SPEED = 8;

    FIREFLY.X = FIREFLY.offsetLeft;
    FIREFLY.Y = FIREFLY.offsetTop;
    FIREFLY.CENTER = {
        X: FIREFLY.X + FIREFLY.WIDTH / 2,
        Y: FIREFLY.Y + FIREFLY.HEIGHT / 2,
    };
    FIREFLY.ANGLE = 0;

    requestAnimationFrame(render);
});

function render() {
    requestAnimationFrame(render);

    // Update ship.
    FIREFLY.X = FIREFLY.offsetLeft;
    FIREFLY.Y = FIREFLY.offsetTop;
    FIREFLY.CENTER.X = FIREFLY.X + FIREFLY.WIDTH / 2;
    FIREFLY.CENTER.Y = FIREFLY.Y + FIREFLY.HEIGHT / 2;

    // Find ship angle.
    var mouseAngle = getAngle(FIREFLY.CENTER.X, FIREFLY.CENTER.Y, currentMousePos[0], currentMousePos[1]);

    

    var turnDegrees = mouseAngle - FIREFLY.ANGLE;
    var maxDegrees = 5;

    console.log(mouseAngle + " " + FIREFLY.ANGLE);

    if (turnDegrees > -5 && turnDegrees < 5) {
        // Do nothing.
    }
    else if (turnDegrees < 0) {
        FIREFLY.ANGLE -= 5;
    }
    else {
        FIREFLY.ANGLE += 5;
    }

    // Set ship direction.
    FIREFLY.style.transform = 'rotate(' + (FIREFLY.ANGLE + 90) + 'deg)';

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

    if (!movement) FIREFLY.classList.remove("moving");
}

function move(dir) {
    var movingSpeed = FIREFLY.SPEED;
    var hor = dir == 'left' || dir == 'right' ? true : false;
    var inverse = dir == 'down' || dir == 'right' ? -1 : 1;

    FIREFLY.classList.add('moving');

    if (hor) {
        FIREFLY.style.left = FIREFLY.offsetLeft - movingSpeed * inverse + "px";
    }
    else {
        FIREFLY.style.top = FIREFLY.offsetTop - movingSpeed * inverse + "px";
    }
}

$(document).on('transitionend',
function (event) {
    var $target = $(event.target);

    // Firefly.
    if ($target.is(FIREFLY) && event.originalEvent.propertyName === 'top') { // Keep from firing for each attr.
        console.log("Firefly: " + event.type + " " + new Date().getTime());
        FIREFLY.classList.remove('transitions');
    }
});

function fireflyMouseMove(e) {
    var newX = e.clientX - FIREFLY.WIDTH / 2;
    newY = e.clientY - FIREFLY.HEIGHT / 2;

    FIREFLY.style.top = newY + "px";
    FIREFLY.style.left = newX + "px";

    FIREFLY.classList.add('transitions');
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