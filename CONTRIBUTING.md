# LAN Dosya Paylaşımı'na Katkıda Bulunma

Öncelikle, LAN Dosya Paylaşımı projesine katkıda bulunmayı düşündüğünüz için teşekkür ederiz! Sizin gibi insanlar sayesinde bu araç herkes için daha iyi hale geliyor.

## Davranış Kuralları

Bu proje ve projeye katılan herkes, kapsayıcı ve hoşgörülü bir ortam yaratma taahhüdümüze tabidir. Lütfen tüm etkileşimlerde saygılı ve yapıcı olun.

## Nasıl Katkıda Bulunabilirim?

### Hata Bildirimi (Bug Reports)

Hata raporu oluşturmadan önce, mükerrer kayıtları önlemek için lütfen mevcut sorunları (issues) kontrol edin. Bir hata raporu oluştururken mümkün olduğunca çok ayrıntı ekleyin:

- **Açık ve açıklayıcı bir başlık kullanın**
- **Sorunu yeniden oluşturmak için gereken adımları tam olarak açıklayın**
- **Spesifik örnekler verin** (kod parçacıkları, ekran görüntüleri vb.)
- **Gözlemlediğiniz davranışı** ve ne beklediğinizi açıklayın
- **Ortamınızla ilgili ayrıntıları ekleyin** (İşletim sistemi, Node.js sürümü, tarayıcı vb.)

### Geliştirme Önerileri

Geliştirme önerileri GitHub issues üzerinden takip edilir. Bir öneri oluştururken:

- **Açık ve açıklayıcı bir başlık kullanın**
- **Önerilen geliştirmenin ayrıntılı bir açıklamasını** yapın
- **Bu geliştirmenin neden yararlı olacağını** açıklayın
- Varsa diğer uygulamalardaki **benzer özellikleri listeleyin**

### Pull Request (Çekme İsteği) Gönderme

1. **Repository'yi forklayın** ve dalınızı (branch) `main` üzerinden oluşturun
2. Kodlama standartlarımızı takip ederek **değişikliklerinizi yapın**
3. Değişikliklerinizi **kapsamlı bir şekilde test edin**
4. Fonksiyon değişikliği yapıyorsanız **dokümantasyonu güncelleyin**
5. "Conventional Commits" formatına uygun **açık commit mesajları yazın**
6. Kapsamlı bir açıklama ile **pull request gönderin**

## Geliştirme Kurulumu

```bash
# Forkladığınız repo'yu klonlayın
git clone https://github.com/kullaniciadiniz/lan-file-sharer.git
cd lan-file-sharer

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

## Kodlama Standartları

### JavaScript Stil Rehberi

- **ES6+ özelliklerini** kullanın (const/let, arrow functions, async/await)
- Girintileme için **2 boşluk** kullanın
- String ifadeler için **tek tırnak** kullanın
- İfadelerin sonuna **noktalı virgül** ekleyin
- Satırları mümkün olduğunca **100 karakterin altında** tutun
- **Anlamlı değişken isimleri** kullanın (döngüler dışında tek harfli isimlerden kaçının)

### Kod Organizasyonu

- Fonksiyonları **küçük ve odaklı** tutun (tek sorumluluk ilkesi)
- Karmaşık fonksiyonlar için **JSDoc yorumları** ekleyin
- Callback veya ham promise yapıları yerine **async/await** kullanın
- Hataları try/catch blokları ile **uygun şekilde yönetin**
- Hem istemci hem de sunucu tarafında **kullanıcı girdisini doğrulayın**

### Örnek

```javascript
/**
 * Dizin geçişi saldırılarını (path traversal) önlemek için dosya adını doğrular ve temizler
 * @param {string} filename - Orijinal dosya adı
 * @returns {string} Dosya sistemi işlemleri için güvenli dosya adı
 */
function sanitizeFilename(filename) {
  const safeName = path.basename(filename);
  if (!safeName || safeName.includes('..')) {
    throw new Error('Geçersiz dosya adı');
  }
  return safeName;
}
```

## Commit Mesajı Kuralları

[Conventional Commits](https://www.conventionalcommits.org/) spesifikasyonunu takip ediyoruz:

```
<tür>(<kapsam>): <konu>

<gövde>

<footer>
```

### Türler (Types)

- **feat**: Yeni bir özellik
- **fix**: Hata düzeltmesi
- **docs**: Sadece dokümantasyon değişiklikleri
- **style**: Kod stili değişiklikleri (formatting, noktalı virgül vb.)
- **refactor**: Hata düzeltmeyen veya özellik eklemeyen kod değişikliği
- **perf**: Performans iyileştirmesi
- **test**: Test ekleme veya güncelleme
- **chore**: Derleme süreci veya yardımcı araçlardaki değişiklikler

### Örnekler

```
feat(upload): klasörler için sürükle-bırak desteği eklendi

İlerleme takibi ile özyinelemeli klasör yükleme özelliği eklendi.
ZIP arşivlerinde klasör yapısını korur.

Closes #123
```

```
fix(download): büyük dosyalarda ZIP bozulması giderildi

100MB üzeri dosyalar için stream tabanlı işleme yöntemine geçildi.
Bellek taşmasını önler ve veri bütünlüğünü sağlar.

Fixes #456
```

## Test Etme

Bir pull request göndermeden önce:

1. **Manuel Test**
   - Farklı dosya türleri ve boyutları ile yükleme testi yapın
   - İndirme (tekil ve ZIP) testi yapın
   - Temizleme (cleanup) fonksiyonunu test edin
   - Farklı tarayıcılarda test edin (Chrome, Firefox, Safari, Edge)
   - Farklı cihazlarda test edin (masaüstü, mobil)

2. **Sınır Durumları (Edge Cases)**
   - Çok büyük dosyalar (500MB sınırına yakın)
   - Dosya adlarında özel karakterler
   - Ağ kesintileri
   - Eşzamanlı yükleme/indirme işlemleri

3. **Performans**
   - Büyük dosyalarla bellek kullanımını izleyin
   - ZIP işlemleri sırasında CPU kullanımını kontrol edin
   - Temizleme işleminin sunucuyu bloke etmediğini doğrulayın

## Dokümantasyon

- Fonksiyon değişikliği yaptıysanız README.md dosyasını güncelleyin
- Yeni fonksiyonlar için JSDoc yorumları ekleyin
- Uç noktaları (endpoints) değiştirdiyseniz API dokümantasyonunu güncelleyin
- Karmaşık özellikler için kod örnekleri ekleyin

## Sorularınız mı Var?

Yardıma veya açıklamaya ihtiyacınız varsa `question` etiketiyle bir issue açmaktan çekinmeyin.

## Teşekkür

Katkıda bulunanlar proje README dosyasında belirtilecektir. Katkılarınız için teşekkür ederiz!
