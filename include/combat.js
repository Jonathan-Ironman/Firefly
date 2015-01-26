function fireMissile() {
    var mouseX = currentMousePos[0],
        mouseY = currentMousePos[1],
        missileStartX = FIREFLY.CENTER.X,
        missileStartY = FIREFLY.CENTER.Y,
        missile = document.createElement("div");

    missile.style.top = missileStartY + "px";
    missile.style.left = missileStartX + "px";
    missile.className = "missile";

    $(document.body).append(missile);

    // Delay or it will travel instant.
    window.setTimeout(function () {
        missile.style.top = mouseY + "px";
        missile.style.left = mouseX + "px";
    }, 10);

    // Logging.
    $('.log1').html('Cursor X: ' + mouseX + ' | Cursor Y: ' + mouseY + '<br>Missile start X: ' + missileStartX + ' | Missile start Y: ' + missileStartY);
}

function explode(x, y) {
    var explosion = document.createElement("div");
    var width;
    var height;

    explosion.className = "explosion explosion" + getRandomInt(1, 5);

    $(document.body).append(explosion);

    width = explosion.offsetWidth;
    height = explosion.offsetHeight;

    explosion.style.top = y - height / 2 + "px";
    explosion.style.left = x - width / 2 + "px";
}

// Bind end to explosion.    
$(document).on('transitionend',
function (event) {
    var $target = $(event.target);
    // Missile.
    if ($target.hasClass("missile") && event.originalEvent.propertyName === 'top') { // Keep from firing for each attr.
        console.log("Missile: " + event.type + " " + event.timeStamp);
        //alert("KILL KILL!");
        explode(
         $target.offset().left - $target.width() / 2,
         $target.offset().top - $target.height() / 2
            );
        $target.remove();
    }
});

// Track mouse all the time.

document.addEventListener('mousemove', function storeMouse(event) {
    currentMousePos = [event.clientX, event.clientY];
});

// TODO: temp helper, should get better versions in util.js
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

// TODO: move to xxx.js
$(document).on('animationend webkitAnimationEnd',
function (event) {
    var $target = $(event.target);
    // Explosion.
    if ($target.hasClass("explosion")) {
        console.log("Explosion: type'" + event.target.className + "' " + event.type + " " + event.timeStamp);
        $target.remove();
        //alert("Boom!");
    }
});