const fs = require('fs');
const path = require('path');

// Create a simple canvas-based PNG generator
const canvas = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Icon Generator</title>
</head>
<body>
  <canvas id="canvas192" width="192" height="192"></canvas>
  <canvas id="canvas512" width="512" height="512"></canvas>
  <script>
    function drawIcon(canvas, size) {
      const ctx = canvas.getContext('2d');
      const cornerRadius = size * 0.125; // 64/512 = 0.125

      // Draw rounded rectangle background
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(size - cornerRadius, 0);
      ctx.quadraticCurveTo(size, 0, size, cornerRadius);
      ctx.lineTo(size, size - cornerRadius);
      ctx.quadraticCurveTo(size, size, size - cornerRadius, size);
      ctx.lineTo(cornerRadius, size);
      ctx.quadraticCurveTo(0, size, 0, size - cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
      ctx.closePath();
      ctx.fill();

      // Draw emoji
      ctx.font = \`\${size * 0.47}px Arial\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText('🍽', size / 2, size / 2 + size * 0.05);
    }

    drawIcon(document.getElementById('canvas192'), 192);
    drawIcon(document.getElementById('canvas512'), 512);

    console.log('Icons generated in browser');
  </script>
</body>
</html>
`;

// Write HTML generator
const htmlPath = path.join(__dirname, '..', 'public', 'icon-generator.html');
fs.writeFileSync(htmlPath, canvas);

console.log('Icon generator HTML created at:', htmlPath);
console.log('');
console.log('To generate PNG icons:');
console.log('1. Open public/icon-generator.html in Chrome/Firefox');
console.log('2. Right-click each canvas and "Save image as..."');
console.log('3. Save as icon-192x192.png and icon-512x512.png in public/icons/');
console.log('');
console.log('Or run: npm install sharp && node scripts/generate-icons-sharp.js');
