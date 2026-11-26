
export const UI_CONFIG = Object.freeze({

    typography: {

        title: {
            family: '"Press Start 2P", monospace',
            size: 42
        },

        heading: {
            family: '"Rajdhani", sans-serif',
            size: 32
        },

        body: {
            family: '"Inter", sans-serif',
            size: 18
        },

        dialogue: {
            family: '"Inter", sans-serif',
            size: 22
        },

        hud: {
            family: '"Rajdhani", monospace',
            size: 24
        }

    },

    menu: {

        title: 'MONKEY MIND III',
        subtitle: 'THE RESCUE',

        items: [
            'New Game',
            'Continue',
            'Controls',
            'Settings',
            'Credits'
        ],

        transitionDuration: 350

    },

    hud: {

        padding: 24,
        portraitSize: 96,

        healthBar: {
            width: 350,
            height: 22
        },

        ultimateBar: {
            width: 350,
            height: 10
        },

        showScore: true,
        showCombo: true,
        showAmmo: true,
        showBossPhase: true

    },

    controller: {

        enabled: true,
        alwaysVisible: true,
        multiTouch: true,

        opacity: 0.85,
        pressedOpacity: 1,

        buttonSize: 64,
        minimumButtonSize: 44,
        ultimateButtonSize: 76,

        spacing: 12,

        movement: [
            'left',
            'right',
            'up',
            'down'
        ],

        actions: [
            'jump',
            'punch',
            'kick',
            'slash',
            'shoot',
            'block',
            'dash',
            'ultimate',
            'pause'
        ]

    },

    keyboard: {

        left: ['A', 'LEFT'],
        right: ['D', 'RIGHT'],
        jump: ['SPACE', 'W', 'UP'],
        crouch: ['S', 'DOWN'],

        punch: ['J'],
        kick: ['K'],
        slash: ['L'],
        shoot: ['U'],
        block: ['I'],
        dash: ['SHIFT'],
        ultimate: ['O'],
        pause: ['ESC']

    },

    dialogue: {

        charactersPerSecond: 35,
        backgroundOpacity: 0.92,
        showSpeakerName: true,
        showPortrait: true,
        allowSkip: true

    },

    transitions: {

        fadeIn: 450,
        fadeOut: 350,
        chapterTransition: 900,
        bossIntroduction: 1800,
        victoryTransition: 1500

    },

    accessibility: {

        reducedMotion: false,
        screenShake: true,
        subtitles: true,
        soundEnabled: true,
        musicEnabled: true

    }

});
