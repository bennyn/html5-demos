// chimera.labs.oreilly.com/books/1234000001552/ch01.html
var contextClass = (window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.oAudioContext ||
        window.msAudioContext);
if (contextClass) {
    // Web Audio API is available.
    var audioContext = new contextClass();


    var soundObject = {
        // Basic properties
        buffer: null,
        hasLoaded: false,
        source: "",
        volume: 1,
        pan: 0,
        loop: false,
        /**
         * Can the sound be played many times simultaneously, like a sound effect, 
         * or is it a single instance sound, like background music, that should have 
         * one instance running? 
         * 
         * If it's background music, set singleInstance to true. Later, in the "play" 
         * function, this object's playSound property will be set as the sound source 
         * buffer, so that it's global to this object.
         */
        singleInstance: false,
        // Use immediate functions to initialze the audio context properties
        volumeConnection: (function() {
            if (audioContext.createGainNode) {
                return audioContext.createGainNode();
            }
        }()),
        panConnection: (function() {
            return audioContext.createPanner();
        }()),
        playSound: (function() {
            return audioContext.createBufferSource();
        }()),
        loadSound: (function() {
            return new XMLHttpRequest();
        }()),
        // An initialization function that accepts a config object as its argument
        initialize: function(config) {
            // Set the source
            if (config.source !== undefined) {
                this.source = config.source;
            }

            // Set the volume
            if (config.volume && this.volumeConnection) {
                this.volumeConnection.gain.value = config.volume;
            }

            // Set the pan
            if (config.pan !== undefined) {
                this.panConnection.setPosition(config.pan, 0, 0);
            }

            // Set looping
            if (config.loop !== undefined) {
                this.loop = config.loop;
            }

            /**
             * Set a single instance of the sound. If this is true, only one instance 
             * of the playSound bufferSource an be created. This prevents more than one 
             * instance of the sound playing at the same time.
             */
            if (config.singleInstance !== undefined) {
                if (config.singleInstance) {
                    this.singleInstance = true;
                    this.playSound = (function() {
                        return audioContext.createBufferSource();
                    }());
                }
            }
        },
        play: function() {
            if (this.hasLoaded) {
                // Create a playSound buffer source and determine whether only 1 or many 
                // instances of the same sound should play at the same time.
                var playSound = (this.singleInstance) ? this.playSound : audioContext.createBufferSource();
                playSound.buffer = this.buffer;
                playSound.connect(this.panConnection);
                this.panConnection.connect(this.volumeConnection);
                this.volumeConnection.connect(audioContext.destination);
                playSound.loop = this.loop;
                /*
                 * Without volume connection:
                 * playSound.connect(audioContext.destination);
                 * Volume should be the final output if you connect other effects)
                 */
                playSound.noteOn(0);
            }
        },
        stop: function() {
            // Disconnect the sound to stop it
            this.volumeConnection.disconnect();
        },
        resume: function() {
            // Reconnect the sound to the panConnection to resume it
            this.volumeConnection.connect(audioContext.destination);
        },
        setVolume: function(value) {
            this.volumeConnection.gain.value = value;
        },
        setPan: function(value) {
            /**
             * Panner objects can accepnt x, y and z coordinates for 3D sound, 
             * but we're only interested in the the x coordinate, 
             * the first one, for left and right panning.
             */
            this.panConnection.setPosition(value, 0, 0);
        }
    };

    function loadSound(soundToLoad) {

        soundToLoad.loadSound.open("GET", soundToLoad.source, true);
        soundToLoad.loadSound.responseType = "arraybuffer";
        soundToLoad.loadSound.addEventListener("load", soundLoadHandler, false);

        // ...will be hoisted
        function soundLoadHandler(event) {
            console.log('Try to load: ' + soundToLoad.source);
            var path = soundToLoad.source;
            var extension = path.substr(path.lastIndexOf('.') + 1);
            var audioType = 'audio/wav';

            switch (extension.toLowerCase()) {
                case 'mp3':
                    audioType = 'audio/mpeg';
                    break;
                case 'm4a':
                case 'mp4':
                    audioType = 'audio/aac';
                case 'ogg':
                    audioType = 'audio/ogg';
                    break;
            }

            if (new Audio().canPlayType(audioType)) {

                audioContext.decodeAudioData(soundToLoad.loadSound.response, function(buffer)
                {
                    soundToLoad.buffer = buffer;
                    soundToLoad.hasLoaded = true;
                    soundToLoad.play();
                });

            } else {
                console.log('MP3 is not supported.');
            }
        }


        soundToLoad.loadSound.send();
    }

    var music = Object.create(soundObject);
    music.initialize({source: "audio/circle_of_life.mp3", volume: 1, pan: 0, loop: true, singleInstance: true});
    loadSound(music);

} else {
    // Web Audio API is not available. Ask the user to use a supported browser.
    alert(':-(');
}

var path = 'audio/scratches/scratch-07-two.wav';
var audio = new Audio(path);
audio.play();