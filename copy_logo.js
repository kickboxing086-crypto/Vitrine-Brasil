import fs from 'fs';
import path from 'path';

const srcPath = 'src/assets/images/impulsionelink_logo_1782926983990.jpg';
const destDir = 'public';
const destPath = path.join(destDir, 'icon.jpg');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

fs.copyFileSync(srcPath, destPath);
console.log('Copied logo to public/icon.jpg');
