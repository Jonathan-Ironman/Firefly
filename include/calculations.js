"use strict";
// Find angle between two points.
function getAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

// Euclidean modulo.
function mod(x, value) {
    return x >= 0 ? x % value : value + x % value;
}

// Distance between two points.
function lineDistance(point1, point2) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}

// Point from distance and angle
function pointFromAngle(point, angle, distance) {
    var radians = angle * (Math.PI / 180);

    var x = Math.cos(radians) * distance;
    var y = Math.sin(radians) * distance;

    x = point.x + x;
    y = point.y + y;

    return { x: x, y: y };
}

//function Point(x, y) {
//    return { x: x, y: y }
//}


// Returns a random number between min and max.
function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns a random integer between min and max.
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Return true x percent of the time.
function chance(percentage) {
    return Math.random() * 100 < percentage;
}

// Returns the angle if ship1 is facing ship2.
function isFacing(ship1, ship2) {
    var result = false;
    var diff = getAngle(ship1.center, ship2.center) - ship1.angle;
    if (Math.abs(diff) < 100)
        result = diff;

    return result;
}

// http://gamedev.stackexchange.com/a/26022/36040
function isIntersecting1(Point1, Point2, Point3, Point4) {
    var denominator = ((Point2.x - Point1.x) * (Point4.y - Point3.y)) - ((Point2.y - Point1.y) * (Point4.x - Point3.x));
    var numerator1 = ((Point1.y - Point3.y) * (Point4.x - Point3.x)) - ((Point1.x - Point3.x) * (Point4.y - Point3.y));
    var numerator2 = ((Point1.y - Point3.y) * (Point2.x - Point1.x)) - ((Point1.x - Point3.x) * (Point2.y - Point1.y));

    // Detect coincident lines (has a problem, read below)
    if (denominator == 0)
        return numerator1 == 0 && numerator2 == 0;

    var r = numerator1 / denominator;
    var s = numerator2 / denominator;

    return (r >= 0 && r <= 1) && (s >= 0 && s <= 1);
}

// Adapted from: http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        // Collision detected
        return 1;
    }

    return 0; // No collision
}

// http://stackoverflow.com/a/16725715/2407212
function CCW(p1, p2, p3) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
}

function isIntersecting(p1, p2, p3, p4) {
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
}

function lineIntersectsShip(startpoint, endpoint, ship) {
    // Corners.
    var p1 = { x: ship.x, y: ship.y };
    var p2 = { x: ship.x + ship.width, y: ship.y };
    var p3 = { x: ship.x + ship.width, y: ship.y + ship.height };
    var p4 = { x: ship.x, y: ship.y + ship.height };

    // Check if bullet line intersects the ship outline.
    return isIntersecting(startpoint, endpoint, p1, p2) ||
        isIntersecting(startpoint, endpoint, p2, p3) ||
        isIntersecting(startpoint, endpoint, p3, p4) ||
        isIntersecting(startpoint, endpoint, p4, p1);
}