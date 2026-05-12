import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = '/Users/nagee/git/nynHome/frontend/public/branding/crochub-logo.svg';
const assetsDir = '/Users/nagee/git/nynHome/frontend/assets';

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function run() {
  try {
    // SVG 파일로부터 임베딩된 고화질 base64 PNG 버퍼 추출
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const base64Match = svgContent.match(/href="data:image\/png;base64,([^"]+)"/);
    
    if (!base64Match) {
      throw new Error('Failed to extract embedded base64 PNG image from SVG!');
    }
    
    const pngBuffer = Buffer.from(base64Match[1], 'base64');
    console.log('Successfully extracted embedded transparent PNG from SVG!');

    // 1. icon-only.png 생성 (1024x1024)
    await sharp(pngBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'icon-only.png'));
    console.log('icon-only.png created successfully!');

    // 2. splash.png 생성 (2732x2732) - #0f0f1a 뒷배경에 중앙 로고 배치
    const logoBuffer = await sharp(pngBuffer).resize(512, 512).toBuffer();
    await sharp({
      create: {
        width: 2732,
        height: 2732,
        channels: 4,
        background: { r: 247, g: 247, b: 247, alpha: 1 }
      }
    })
      .composite([{
        input: logoBuffer,
        gravity: 'center'
      }])
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('splash.png created successfully!');

  } catch (err) {
    console.error('Transformation failed:', err);
  }
}

run();
