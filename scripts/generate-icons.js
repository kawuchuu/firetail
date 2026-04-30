const fs = require("fs");
const path = require("path");
const { Jimp } = require("jimp");

const sizes = [16, 24, 32, 48, 64, 128, 256, 512];

const input = path.resolve("../src/assets/firetail.png");
const outputDir = path.resolve("../build/icons");

fs.mkdirSync(outputDir, { recursive: true });

(async () => {
    const image = await Jimp.read(input);

    for (const size of sizes) {
        const output = path.join(outputDir, `${size}x${size}.png`);

        const resized = image.clone().resize({
            w: size,
            h: size
        });

        await resized.write(output);

        console.log(`Generated ${size}x${size}`);
    }
})();