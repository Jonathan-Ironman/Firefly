//function Sprite(options) {
//    var path = options.path;
//    var width = options.width;
//    var height = options.height;
//    var frames = options.frames;
//    var duration = options.duration;

//    var frame = 0;

//    function draw(point) {

//    }
//}

function drawRotated(canvas, image, ship) {
    var x = ship.center.x;
    var y = ship.center.y;
    var context = canvas.ctx;
    var degrees = ship.angle + 90;
    var angleInRadians = degrees * Math.PI / 180;

    context.translate(x, y);
    //context.rotate(angleInRadians);
    context.rotate(angleInRadians);
    context.drawImage(image, -ship.width / 2, -ship.height / 2);
    context.rotate(-angleInRadians);
    //context.rotate(-angleInRadians);
    context.translate(-x, -y);

    // console.log("draw" + image.src + " at " + degrees);
}