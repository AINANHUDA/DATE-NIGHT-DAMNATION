
export const WORLD_CONFIG = Object.freeze({

    viewport: {
        width: 1280,
        height: 720
    },

    parallax: {
        sky: 0,
        distant: 0.15,
        midground: 0.40,
        terrain: 1,
        foreground: 1.20
    },

    levels: {

        prologue: {
            name: 'The Last Sunset',
            width: 1280,
            height: 720,
            type: 'cinematic',
            environment: 'sunset'
        },

        chase: {
            name: 'The Chase',
            width: 7680,
            height: 720,
            type: 'platformer',
            environment: 'forest',
            requiredBananas: 12,
            checkpoints: true
        },

        industrial: {
            name: 'Industrial Encounter',
            width: 5120,
            height: 720,
            type: 'platformer',
            environment: 'industrial',
            checkpoints: true
        },

        miniBoss: {
            name: 'Mini Maliha',
            width: 1920,
            height: 720,
            type: 'arena',
            environment: 'industrial'
        },

        finalBoss: {
            name: 'The Final Showdown',
            width: 1920,
            height: 720,
            type: 'arena',
            environment: 'boss-arena',
            phases: 3
        },

        ending: {
            name: 'Together Again',
            width: 1280,
            height: 720,
            type: 'cinematic',
            environment: 'ending'
        }

    },

    camera: {
        followLerpX: 0.10,
        followLerpY: 0.08,
        zoom: 1,
        roundPixels: true
    }

});
