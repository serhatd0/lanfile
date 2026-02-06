/**
 * LAN File Sharer - Express-based file sharing server for local networks
 * 
 * Features:
 * - Multi-file upload with automatic conflict resolution
 * - Configurable automatic cleanup based on file age
 * - ZIP archive creation for bulk downloads
 * - Real-time progress tracking
 * - Device-based file categorization
 * 
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - LANFILE_UPLOADS or UPLOADS_DIR: Custom upload directory path
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const AdmZip = require('adm-zip');
const internalIp = require('internal-ip');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOADS_DIR = process.env.LANFILE_UPLOADS
  ? path.resolve(process.env.LANFILE_UPLOADS)
  : (process.env.LANFILE_USER_DATA
      ? path.join(process.env.LANFILE_USER_DATA, 'uploads')
      : path.join(__dirname, 'uploads'));
const METADATA_PATH = path.join(UPLOADS_DIR, 'metadata.json');
const CONFIG_PATH = path.join(UPLOADS_DIR, 'config.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('Yükleme klasörü oluşturuldu:', UPLOADS_DIR);
}

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      const minutes = parseInt(data.cleanupAfterMinutes, 10);
      if (!isNaN(minutes) && minutes >= 0 && minutes <= 525600) {
        return { cleanupAfterMinutes: minutes };
      }
    }
  } catch (err) {
    console.error('Config read error:', err);
  }
  return { cleanupAfterMinutes: 1440 }; // 24 saat = 1440 dakika
}

function writeConfig(obj) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error('Config write error:', err);
    throw err;
  }
}

function normalizeIp(req) {
  let ip = req.ip || req.connection?.remoteAddress || '';
  if (ip && ip.startsWith('::ffff:')) ip = ip.slice(7);
  return ip || null;
}

function readMetadata() {
  try {
    if (fs.existsSync(METADATA_PATH)) {
      return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('Metadata read error:', err);
  }
  return {};
}

function writeMetadata(meta) {
  try {
    fs.writeFileSync(METADATA_PATH, JSON.stringify(meta, null, 2), 'utf8');
  } catch (err) {
    console.error('Metadata write error:', err);
  }
}

function runCleanup() {
  const { cleanupAfterMinutes } = readConfig();
  if (cleanupAfterMinutes <= 0) return;
  const maxAgeMs = cleanupAfterMinutes * 60 * 1000;
  const now = Date.now();
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return;
    const names = fs.readdirSync(UPLOADS_DIR);
    const meta = readMetadata();
    let changed = false;
    for (const name of names) {
      if (name === 'metadata.json' || name === 'config.json') continue;
      const full = path.join(UPLOADS_DIR, name);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch (_) {
        continue;
      }
      if (!stat.isFile()) continue;
      const age = now - (stat.mtime.getTime ? stat.mtime.getTime() : stat.mtime);
      if (age > maxAgeMs) {
        try {
          fs.unlinkSync(full);
          delete meta[name];
          changed = true;
        } catch (err) {
          console.error('Failed to delete:', name, err.message);
        }
      }
    }
    if (changed) writeMetadata(meta);
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

// Multer configuration: save files to uploads directory with automatic conflict resolution
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = Buffer.from(file.originalname, 'latin1').toString('utf8') || file.originalname;
    const base = path.parse(safeName).name;
    const ext = path.parse(safeName).ext || path.extname(file.originalname);
    let finalName = `${base}${ext}`;
    let counter = 0;
    while (fs.existsSync(path.join(UPLOADS_DIR, finalName))) {
      counter++;
      finalName = `${base}_${counter}${ext}`;
    }
    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

app.use(cors());
app.use(express.json());

// API and file routes (before static middleware to prevent 404)
let serverDisplayUrl = null;

// ZIP download endpoint - POST only (triggered by button). GET returns info message.
app.get('/zip-download', (req, res) => {
  res.status(400).send('This is not a page. Use the "Download Selected (ZIP)" button from the application.');
});
app.post('/zip-download', (req, res) => {
  try {
    const names = req.body && req.body.filenames;
    if (!Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'En az bir dosya seçin.' });
    }
    const safe = [];
    for (const n of names) {
      const name = path.basename(String(n));
      if (!name || name.includes('..')) continue;
      const full = path.join(UPLOADS_DIR, name);
      try {
        if (fs.existsSync(full) && fs.statSync(full).isFile()) safe.push({ full, name });
      } catch (_) {}
    }
    if (safe.length === 0) {
      return res.status(400).json({ error: 'Geçerli dosya bulunamadı.' });
    }
    const zip = new AdmZip();
    for (const { full, name } of safe) {
      try {
        zip.addFile(name, fs.readFileSync(full));
      } catch (err) {
        console.error('Failed to add file to ZIP:', name, err.message);
      }
    }
    const zipBuf = zip.toBuffer();
    const zipName = 'indirme_' + new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '-') + '.zip';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="' + zipName + '"');
    res.setHeader('Content-Length', zipBuf.length);
    res.send(zipBuf);
  } catch (err) {
    console.error('ZIP creation error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Zip oluşturulamadı: ' + err.message });
  }
});

app.get('/api/server-info', (req, res) => {
  const host = req.get('host') || req.hostname;
  const protocol = req.protocol || 'http';
  const currentUrl = `${protocol}://${host}`;
  res.json({
    url: serverDisplayUrl || currentUrl,
    host,
    protocol,
  });
});

app.get('/api/my-ip', (req, res) => {
  res.json({ ip: normalizeIp(req) });
});

app.get('/api/settings', (req, res) => {
  try {
    res.json(readConfig());
  } catch (err) {
    res.status(500).json({ error: 'Ayarlar okunamadı.' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    let minutes = parseInt(req.body && req.body.cleanupAfterMinutes, 10);
    if (isNaN(minutes) || minutes < 0 || minutes > 525600) {
      return res.status(400).json({ error: 'Geçersiz değer (0–525600 dakika).' });
    }
    writeConfig({ cleanupAfterMinutes: minutes });
    res.json({ cleanupAfterMinutes: minutes });
  } catch (err) {
    res.status(500).json({ error: 'Ayarlar kaydedilemedi.' });
  }
});

app.get('/files', (req, res) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json([]);
    }
    const meta = readMetadata();
    const names = fs.readdirSync(UPLOADS_DIR);
    const files = names
      .filter((name) => {
        if (name === 'metadata.json' || name === 'config.json') return false;
        const full = path.join(UPLOADS_DIR, name);
        return fs.statSync(full).isFile();
      })
      .map((name) => {
        const full = path.join(UPLOADS_DIR, name);
        const stat = fs.statSync(full);
        const info = meta[name] || {};
        return {
          name,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          uploadedBy: info.uploadedBy || null,
          uploadedAt: info.uploadedAt || stat.mtime.toISOString(),
        };
      });
    res.json(files);
  } catch (err) {
    console.error('File list error:', err);
    res.status(500).json({ error: 'Dosya listesi alınamadı.' });
  }
});

app.get('/download/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    if (!filename || filename.includes('..')) {
      return res.status(400).send('Geçersiz dosya adı.');
    }
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).send('Dosya bulunamadı.');
    }
    res.download(filePath, filename);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).send('İndirme sırasında hata oluştu.');
  }
});

app.post('/upload', upload.array('files', 50), (req, res) => {
  try {
    const clientIp = normalizeIp(req);
    const meta = readMetadata();
    const now = new Date().toISOString();
    (req.files || []).forEach((f) => {
      meta[f.filename] = {
        uploadedBy: clientIp,
        uploadedAt: now,
        size: f.size,
      };
    });
    writeMetadata(meta);
    const files = (req.files || []).map((f) => ({
      name: f.filename,
      size: f.size,
    }));
    res.status(201).json({ success: true, files });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Yükleme sırasında hata oluştu.' });
  }
});

// Static file serving (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler
app.use((req, res) => {
  res.status(404).send('Sayfa bulunamadı.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Dosya boyutu çok büyük (max 500MB).' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ error: 'Çok fazla dosya (max 50).' });
    }
  }
  res.status(500).json({ error: 'Sunucu hatası.' });
});

async function start() {
  const ip = await internalIp.v4();
  const displayUrl = ip ? `http://${ip}:${PORT}` : `http://localhost:${PORT}`;
  serverDisplayUrl = displayUrl;

  runCleanup();
  setInterval(runCleanup, 60 * 1000); // Check cleanup every minute

  return new Promise((resolve) => {
    const cfg = readConfig();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n  LAN File Sharer çalışıyor.\n');
      console.log('  Yükleme klasörü: ' + UPLOADS_DIR);
      if (cfg.cleanupAfterMinutes > 0) {
        const hours = Math.floor(cfg.cleanupAfterMinutes / 60);
        const mins = cfg.cleanupAfterMinutes % 60;
        const timeStr = hours > 0 ? `${hours} saat ${mins} dakika` : `${mins} dakika`;
        console.log('  Eski dosya silme: ' + timeStr + ' sonra (ayarlardan değiştirilebilir)\n');
      } else {
        console.log('  Eski dosya silme: kapalı\n');
      }
      console.log('  Bu bilgisayarın yerel IP adresi: ' + displayUrl + '\n');
      if (process.stdout.isTTY) {
        try {
          const { execSync } = require('child_process');
          if (process.platform === 'win32') {
            execSync(`echo ${displayUrl} | clip`, { stdio: 'ignore' });
          }
        } catch (_) {}
      }
      resolve(PORT);
    });
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Sunucu başlatılamadı:', err);
    process.exit(1);
  });
}

module.exports = start;
