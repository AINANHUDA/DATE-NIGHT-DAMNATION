
import sharp from 'sharp';

const input =
    'public/assets/characters/ainan/sprites/ainan-walk-raw.png';

const output =
    'public/assets/characters/ainan/sprites/ainan-walk.png';

const FRAME_SIZE = 128;
const FRAME_COUNT = 8;
const TARGET_HEIGHT = 96;

const ANCHOR_X = 64;
const ANCHOR_Y = 112;

async function processSpriteSheet() {

    const metadata = await sharp(input).metadata();

    const frames = [];

    // Extract each character pose
    for (let i = 0; i < FRAME_COUNT; i++) {

        const left = Math.round(
            i * metadata.width / FRAME_COUNT
        );

        const right = Math.round(
            (i + 1) * metadata.width / FRAME_COUNT
        );

        const cropped = await sharp(input)
            .extract({
                left: left,
                top: 0,
                width: right - left,
                height: metadata.height
            })
            .ensureAlpha()
            .png()
            .toBuffer();

        // Remove surrounding transparent space
        const trimmed = await sharp(cropped)
            .trim({
                background: '#00000000',
                threshold: 10
            })
            .png()
            .toBuffer();

        const dimensions = await sharp(trimmed).metadata();

        frames.push({
            buffer: trimmed,
            width: dimensions.width,
            height: dimensions.height
        });

    }

    // Use a shared scale to preserve character proportions
    const maxHeight = Math.max(
        ...frames.map(frame => frame.height)
    );

    const maxWidth = Math.max(
        ...frames.map(frame => frame.width)
    );

    const scale = Math.min(
        TARGET_HEIGHT / maxHeight,
        120 / maxWidth
    );

    const composites = [];

    for (let i = 0; i < frames.length; i++) {

        const frame = frames[i];

        const width = Math.max(
            1,
            Math.round(frame.width * scale)
        );

        const height = Math.max(
            1,
            Math.round(frame.height * scale)
        );

        const resized = await sharp(frame.buffer)
            .resize(width, height, {
                kernel: sharp.kernel.nearest,
                fit: 'fill'
            })
            .png()
            .toBuffer();

        composites.push({

            input: resized,

            left:
                i * FRAME_SIZE +
                ANCHOR_X -
                Math.floor(width / 2),

            top: ANCHOR_Y - height

        });

        console.log(
            `Frame ${i + 1}: ${width} x ${height}`
        );

    }

    // Assemble final transparent sprite sheet
    await sharp({
        create: {
            width: FRAME_SIZE * FRAME_COUNT,
            height: FRAME_SIZE,
            channels: 4,
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0
            }
        }
    })
    .composite(composites)
    .png()
    .toFile(output);

    const result = await sharp(output).metadata();

    console.log('\nSPRITE PROCESSING COMPLETE');
    console.log(`Output: ${output}`);
    console.log(`Width: ${result.width}`);
    console.log(`Height: ${result.height}`);
    console.log(`Frames: ${FRAME_COUNT}`);
    console.log(`Transparency: ${result.hasAlpha}`);

}

processSpriteSheet().catch(error => {

    console.error('PROCESSING FAILED:', error);

    process.exitCode = 1;

});
