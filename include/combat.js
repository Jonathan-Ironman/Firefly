"use strict";
function fireMissile(p1, p2) {
    var targetX = p2.x,
        targetY = p2.y,
        missileStartX = p1.x,
        missileStartY = p1.y,
        missile = document.createElement("div");

    missile.style.top = missileStartY + "px";
    missile.style.left = missileStartX + "px";
    missile.className = "missile";

    $(document.body).append(missile);

    // Delay or it will travel instant.
    window.setTimeout(function () {
        missile.style.top = targetY + "px";
        missile.style.left = targetX + "px";
    }, 10);
}

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