var ui = {
    showHealth: function (ctx, entity) {
        var width = ctx.canvas.width * entity.health / entity.maxHealth;
        // Small bar on top of canvas.
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, 4);
        ctx.fillStyle = "red";
        ctx.fillRect(0, 1, width, 2);
    }
};

function newGame() {
    window.location.reload();
}

function continueGame() {
    game = true;
    render();
    $('.menu').hide();
}

function pauseGame() {
    game = false;
    $('.menu').show();
}

// Hotkeys.
document.addEventListener("keyup", function hotkeys(event) {
    // Get key by value
    var key = Object.keys(KEYS).filter(function (key) {
        return KEYS[key] === event.which;
    })[0];

    switch (key) {
        case 'ESCAPE':
        case 'PAUSE':
            if (game)
                pauseGame();
            else
                continueGame();
            break;
        default:
            break;
    }
});
