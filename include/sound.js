//var musicPlayer, speechPlayer, effectsPlayer;

var deleteMeAudio = { // TODO: replace
    togglePlayers: function (player) {
        var players;
        player ? players = [player] : players = [musicPlayer, speechPlayer, effectsPlayer];
        for (var i = 0; i < players.length; i++) {
            players[i].muted = !players[i].muted;
            settings[players[i].id] = settings[players[i].id] || {};
            settings[players[i].id].muted = players[i].muted;
        }
    },
    volumeDown: function (player) {
        var players;
        player ? players = [player] : players = [musicPlayer, speechPlayer, effectsPlayer];
        for (var i = 0; i < players.length; i++) {
            if (players[i].volume > 0)
                players[i].volume = (Math.round((players[i].volume - 0.1) * 10) / 10); // JS math error fix
            alert("Volume: " + players[i].volume * 10);
            settings[players[i].id] = settings[players[i].id] || {};
            settings[players[i].id].volume = players[i].volume;
            console.log(settings[players[i].id] + " " + players[i].id + " " + players[i].volume + " " + settings[players[i].id].volume);
        }
    },
    volumeUp: function (player) {
        var players;
        player ? players = [player] : players = [musicPlayer, speechPlayer, effectsPlayer];
        for (var i = 0; i < players.length; i++) {
            if (players[i].volume < 1)
                players[i].volume = (Math.round((players[i].volume + 0.1) * 10) / 10); // JS math error fix
            alert("Volume: " + players[i].volume * 10);
            settings[players[i].id] = settings[players[i].id] || {};
            settings[players[i].id].volume = players[i].volume;
            console.log(settings[players[i].id] + " " + players[i].id + " " + players[i].volume + " " + settings[players[i].id].volume);
        }
    },
    setVolume: function (volume, player) {
        var players;
        player ? players = [player] : players = [musicPlayer, speechPlayer, effectsPlayer];
        for (var i = 0; i < players.length; i++) {
            players[i].volume = volume;
            alert("Volume set: " + players[i].volume * 10);
        }
    },
    nextTrack: function () {
        var player = musicPlayer;
        !player.paused ? player.pause() : player.play();
    }
};

// A sound pool to use for the sound effects.
// http://blog.sklambert.com/html5-canvas-game-html5-audio-and-finishing-touches/#adding-html-audio
function SoundPool(filename, volume, maxSize) {
    var pool = [];
    this.pool = pool;
    var currSound = 0;
    var that = this;

    // Populates the pool array with the given sound.
    for (var i = 0; i < maxSize; i++) {
        var sound = new Audio(filename);
        sound.volume = volume;
        pool[i] = sound;
    }

    this.setVolume = function setVolume(volume) {
        for (var i = 0; i < that.pool.length; i++) {
            that.pool[i].volume = volume;
        }
    };

    this.mute = function mute(state) {
        for (var i = 0; i < that.pool.length; i++) {
            // State: toggle, true or false.
            if (typeof state == "undefined")
                that.pool[i].muted = !that.pool[i].muted;
            else
                that.pool[i].muted = state;
        }
    };

    // Plays a sound.
    this.play = function () {
        if (pool[currSound].currentTime == 0 || pool[currSound].ended) {
            pool[currSound].play();
        }
        currSound = (currSound + 1) % maxSize;
    };
}

// Audio playlist. Takes an array of filenames.
function Playlist(playlist, volume, random) {
    var that = this;
    var currentTrack = random ? getRandomInt(0, playlist.length - 1) : 0;
    var player = new Audio();
    player.volume = volume || 0.5;
    player.src = playlist[currentTrack];

    this.setVolume = function setVolume(volume) {
        player.volume = volume;
    };

    this.mute = function mute(state) {
        // State: toggle, true or false.
        if (typeof state == "undefined")
            player.muted = !player.muted;
        else
            player.muted = state;
    };

    this.play = function play() {
        player.play();
    };
    this.pause = function pause() { player.pause(); };

    // Next track.
    this.next = function next() {
        if (random)
            currentTrack = getRandomInt(0, playlist.length - 1);
        else
            currentTrack = (currentTrack + 1) % playlist.length;
        player.src = playlist[currentTrack];
        //console.log(playlist[currentTrack]);
        player.play();
    };

    this.isPlaying = function isPlaying() { return !player.paused; };

    player.addEventListener("ended", that.next);
}