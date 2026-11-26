
export const ANIMATION_CONFIG = Object.freeze({

    // Game simulation timing
    simulationFPS: 60,

    // Character animation states
    states: {
        IDLE: 'idle',
        WALK: 'walk',
        RUN: 'run',
        JUMP: 'jump',
        FALL: 'fall',
        LAND: 'land',
        CROUCH: 'crouch',
        PUNCH: 'punch',
        HEAVY_PUNCH: 'heavyPunch',
        KICK: 'kick',
        UPPERCUT: 'uppercut',
        SLASH: 'slash',
        SHOOT: 'shoot',
        BLOCK: 'block',
        DASH: 'dash',
        HURT: 'hurt',
        ULTIMATE: 'ultimate',
        KO: 'ko',
        VICTORY: 'victory'
    },

    // Sprite playback settings
    playback: {

        idle:       { fps: 6, repeat: -1 },
        walk:       { fps: 10, repeat: -1 },
        run:        { fps: 12, repeat: -1 },
        jump:       { fps: 12, repeat: 0 },
        fall:       { fps: 8, repeat: -1 },
        land:       { fps: 16, repeat: 0 },
        crouch:     { fps: 8, repeat: 0 },

        punch:      { fps: 20, repeat: 0 },
        heavyPunch: { fps: 16, repeat: 0 },
        kick:       { fps: 18, repeat: 0 },
        uppercut:   { fps: 18, repeat: 0 },
        slash:      { fps: 20, repeat: 0 },
        shoot:      { fps: 16, repeat: 0 },

        block:      { fps: 10, repeat: 0 },
        dash:       { fps: 20, repeat: 0 },
        hurt:       { fps: 14, repeat: 0 },
        ultimate:   { fps: 18, repeat: 0 },
        ko:         { fps: 10, repeat: 0 },
        victory:    { fps: 10, repeat: -1 }

    },

    // Attack timing in simulation frames
    attacks: {

        punch: {
            startup: 5,
            active: 3,
            recovery: 9
        },

        heavyPunch: {
            startup: 10,
            active: 5,
            recovery: 18
        },

        kick: {
            startup: 7,
            active: 4,
            recovery: 13
        },

        uppercut: {
            startup: 8,
            active: 5,
            recovery: 16
        },

        slash: {
            startup: 8,
            active: 5,
            recovery: 14
        },

        shoot: {
            startup: 6,
            active: 1,
            recovery: 12
        },

        ultimate: {
            startup: 30,
            active: 18,
            recovery: 36
        }

    },

    // Input responsiveness
    inputBufferMs: 120,
    comboWindowMs: 350,

    // Combat visual feedback
    feedback: {
        lightHitStopMs: 45,
        heavyHitStopMs: 85,
        ultimateHitStopMs: 140,
        lightShakeMs: 70,
        heavyShakeMs: 140,
        ultimateShakeMs: 300
    },

    // Animation priority
    priority: {
        idle: 0,
        movement: 10,
        airborne: 20,
        attack: 30,
        defense: 40,
        hurt: 50,
        ultimate: 60,
        ko: 100
    }

});
