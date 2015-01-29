var KEYS = { BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, PAUSE: 19, CAPS_LOCK: 20, ESCAPE: 27, SPACE: 32, PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT_ARROW: 37, UP_ARROW: 38, RIGHT_ARROW: 39, DOWN_ARROW: 40, INSERT: 45, DELETE: 46, KEY_0: 48, KEY_1: 49, KEY_2: 50, KEY_3: 51, KEY_4: 52, KEY_5: 53, KEY_6: 54, KEY_7: 55, KEY_8: 56, KEY_9: 57, KEY_A: 65, KEY_B: 66, KEY_C: 67, KEY_D: 68, KEY_E: 69, KEY_F: 70, KEY_G: 71, KEY_H: 72, KEY_I: 73, KEY_J: 74, KEY_K: 75, KEY_L: 76, KEY_M: 77, KEY_N: 78, KEY_O: 79, KEY_P: 80, KEY_Q: 81, KEY_R: 82, KEY_S: 83, KEY_T: 84, KEY_U: 85, KEY_V: 86, KEY_W: 87, KEY_X: 88, KEY_Y: 89, KEY_Z: 90, LEFT_META: 91, RIGHT_META: 92, SELECT: 93, NUMPAD_0: 96, NUMPAD_1: 97, NUMPAD_2: 98, NUMPAD_3: 99, NUMPAD_4: 100, NUMPAD_5: 101, NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104, NUMPAD_9: 105, MULTIPLY: 106, ADD: 107, SUBTRACT: 109, DECIMAL: 110, DIVIDE: 111, F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, NUM_LOCK: 144, SCROLL_LOCK: 145, SEMICOLON: 186, EQUALS: 187, COMMA: 188, DASH: 189, PERIOD: 190, FORWARD_SLASH: 191, GRAVE_ACCENT: 192, OPEN_BRACKET: 219, BACK_SLASH: 220, CLOSE_BRACKET: 221, SINGLE_QUOTE: 222 };
var KEYDOWN = [];

document.addEventListener("keydown", function (event) {
    KEYDOWN[event.which] = true;
});

document.addEventListener("keyup", function (event) {
    KEYDOWN[event.which] = false;
});

// Track mouse all the time.
document.addEventListener('mousemove', function storeMouse(event) {
    currentMousePos = [event.clientX, event.clientY];
});

// TODO: temp helper, should get better versions in util.js
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

// Euclidean modulo.
function mod(x, value) { 
    return x >= 0 ? x % value : value + x % value;
}

//$(document).on("contextmenu", function (event) {
//    //event.preventDefault();
//    //var target = event.target;
//    //alert("context: " + target.id);
//});

// Call save.
//$(window).on('unload', function () {
//    //saveGame();
//});

window.alert = function (message, type, duration) {
    duration = duration || 1500;
    // TODO
    var elem = $('<div/>', {
        class: 'alert popup',
        //title: 'Become a Googler',
        text: message
    }).appendTo('body');

    elem.delay(duration).fadeOut(300);
    setTimeout(function () {
        elem.remove();
    }, duration + 300);
};

function warn(message, duration) {
}

window.onerror = function errorHandler(errorMsg, url, lineNumber) {
    return alert(errorMsg, url, 4000);
};


// Object.extend helper method.
if (typeof Object.extend !== 'function') {
    Object.extend = function (d, s) {
        for (var k in s) {
            if (s.hasOwnProperty(k)) {
                var v = s[k];
                if (d.hasOwnProperty(k) && typeof d[k] === "object" && typeof v === "object") {
                    Object.extend(d[k], v);
                } else {
                    d[k] = v;
                }
            }
        }
        return d;
    };
}