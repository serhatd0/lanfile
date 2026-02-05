# 🚀 LAN Dosya Paylaşımı (LAN File Sharer)

Aynı ağdaki (Wi-Fi/LAN) bilgisayarlar ve **mobil cihazlar** arasında hızlı dosya paylaşımı sağlayan basit ve güçlü bir araç. Kurulum gerektirmez, tarayıcı üzerinden çalışır.

[![Lisans: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Özellikler

- **📱 Tam Mobil Uyum**: Telefondan QR kod okutarak saniyeler içinde bağlanın.
- **🖥️ Çapraz Platform**: Windows, macOS, Linux, Android ve iOS ile uyumlu.
- **⚡ Hızlı Paylaşım**: dosyaları sürükle-bırak yöntemiyle yükleyin.
- **📦 Toplu İndirme**: Seçili dosyaları tek tıkla ZIP olarak indirin.
- **🧹 Otomatik Temizlik**: Dosyaları belirlediğiniz süreden sonra (5 dk - 1 hafta) otomatik siler.

## 🚀 Nasıl Çalıştırılır?

Bu projeyi çalıştırmak için bilgisayarınızda **Node.js** yüklü olmalıdır.

### 1. Kurulum

```bash
# Projeyi indirin veya klonlayın
git clone https://github.com/serhatd0/lanfile.git
cd lanfile

# Gerekli paketleri yükleyin
npm install
```

### 2. Başlatma

```bash
npm start
```

### 3. Kullanım

1. Terminalde çıkan adresi (örn: `http://192.168.1.8:3000`) görün.
2. Bu adresi **diğer bilgisayarlarda** tarayıcıya yazarak, **telefonda** ise QR kodu okutarak bağlanın.
3. Dosyaları sürükleyip bırakarak paylaşın!

---

**Not:** Bu uygulama sadece **yerel ağ (Local Network)** içinde çalışır. İnternet bağlantısı gerektirmez ancak cihazların aynı modeme bağlı olması gerekir.
