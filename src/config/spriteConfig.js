
export const SPRITE_CONFIG = Object.freeze({

    frameWidth: 128,
    frameHeight: 128,

    displayScale: 2,

    origin: {
        x: 0.5,
        y: 0.875
    },

    terrain: {
        tileWidth: 32,
        tileHeight: 32,
        scale: 2
    },

    characters: {

        ainan: {
            height: 96,
            scale: 2,
            bodyWidth: 34,
            bodyHeight: 88
        },

        jennifer: {
            height: 88,
            scale: 2,
            bodyWidth: 30,
            bodyHeight: 80
        },

        maliha: {
            height: 94,
            scale: 2,
            bodyWidth: 46,
            bodyHeight: 86
        },

        miniMaliha: {
            height: 48,
            scale: 2,
            bodyWidth: 28,
            bodyHeight: 44
        }

    },

    animation: {
        idleFPS: 6,
        walkFPS: 10,
        runFPS: 12,
        jumpFPS: 10,
        attackFPS: 16,
        hurtFPS: 12,
        koFPS: 8
    }

});
