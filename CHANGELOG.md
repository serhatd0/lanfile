# Değişiklik Günlüğü (Changelog)

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenecektir.

Biçim [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına dayanmaktadır
ve bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kurallarına uymaktadır.

## [1.0.0] - 2026-02-05

### Eklendi
- LAN Dosya Paylaşımı uygulamasının ilk sürümü yayınlandı
- Sürükle ve bırak desteği ile gerçek zamanlı dosya yükleme
- Yüklemeler için çoklu dosya ZIP sıkıştırması
- ZIP arşivi oluşturarak toplu indirme özelliği
- Yüklemeler ve indirmeler için gerçek zamanlı ilerleme takibi
- Cihaz tabanlı dosya kategorizasyonu (Bu Bilgisayar vs Diğer Bilgisayarlar)
- Yapılandırılabilir otomatik dosya temizleme (5 dakikadan 1 haftaya kadar)
- Temizleme yapılandırması için ayarlar modalı
- Mükerrer dosya adları için otomatik çakışma çözümü
- Uygun kodlama ile UTF-8 dosya adı desteği
- IP tabanlı dosya sahipliği takibi
- Mobil uyumlu (responsive) koyu tema arayüzü
- Kullanıcı geri bildirimleri için Toast bildirimleri
- Özel yapılandırma için ortam değişkeni desteği
- Otomatik ağ arayüzü tespiti
- Yol geçişi (Path traversal) koruması
- Dosya boyutu limitleri (Dosya başına 500MB, yükleme başına 50 dosya)

### Teknik Özellikler
- RESTful API ile Express.js backend
- Multipart dosya yönetimi için Multer
- Sunucu taraflı sıkıştırma için ADM-ZIP
- İstemci taraflı sıkıştırma için JSZip
- İlerleme olayları (Progress events) ile XMLHttpRequest
- CSS Grid ve Flexbox düzenleri
- Modern ES6+ JavaScript
- Yerel ağ erişimi için CORS desteği

### Güvenlik
- Dizin geçişini önlemek için yol temizleme (path sanitization)
- Dosya boyutu ve sayısı sınırlandırmaları
- Hem istemci hem de sunucu tarafında girdi doğrulama
- Güvenli dosya adı işleme

## [Planlanan]

### Gelecek Özellikler
- Çoklu kullanıcı ortamları için kullanıcı kimlik doğrulaması
- Hassas veriler için dosya şifreleme
- Transfer geçmişi ve analitik raporlama
- Mobil uygulama desteği
- Kolay cihaz eşleştirme için QR kod
- Yarım kalan transferleri devam ettirebilme
- Klasör yükleme desteği
- Arama ve filtreleme fonksiyonları
- Koyu/Açık tema seçeneği
- Çoklu dil desteği

---

## Sürüm Geçmişi

- **1.0.0** (2026-02-05) - İlk sürüm

## Katkıda Bulunma

Bu projeye nasıl katkıda bulunacağınızla ilgili ayrıntılar için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakınız.
