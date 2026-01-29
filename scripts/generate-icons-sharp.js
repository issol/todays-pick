const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  if (!fs.existsSync(svgPath)) {
    console.error('SVG file not found:', svgPath);
    process.exit(1);
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
