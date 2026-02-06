const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Önbellek klasörünü proje içine ayarla
const cacheDir = path.join(__dirname, '.cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

process.env.ELECTRON_BUILDER_CACHE = cacheDir;

console.log('Build işlemi başlatılıyor...');
console.log('Önbellek klasörü:', cacheDir);

try {
  // winCodeSign indirmesini engellemek için ortam değişkenleri
  process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
  
  execSync('npx electron-builder', { stdio: 'inherit' });
  console.log('\nBAŞARILI! .exe dosyası "dist" klasöründe hazır.');
} catch (e) {
  console.error('\nBuild işlemi başarısız oldu.');
  process.exit(1);
}
