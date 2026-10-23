# Yâren — Her fincanda ortak bir hikâye.

Geleneksel Türk kahvesini espresso ve modern demleme kültürüyle buluşturan hayali kahve markası **Yâren** için hazırlanmış, mobil uyumlu tek sayfalık web sitesi.

**Canlı site:** https://sukrucvll.github.io/yaren-kahve/

## Çalıştırma

Kurulum veya derleme adımı yoktur; saf HTML, CSS ve JavaScript ile yazıldı.

1. Depoyu klonlayın ya da klasörü indirin.
2. `index.html` dosyasını tarayıcıda açın.

İsterseniz yerel bir sunucuyla da çalıştırabilirsiniz:

```bash
npx serve .
# veya
python -m http.server 8000   # → http://localhost:8000
```

> Yazı tipleri Google Fonts'tan yüklendiği için ilk açılışta internet bağlantısı gerekir; bağlantı yoksa sistem yazı tiplerine geri dönülür.

## Neler yaptım?

Yâren için framework ya da kütüphane kullanmadan; semantik HTML, CSS (değişkenler, Grid, Flexbox) ve vanilla JavaScript ile mobil uyumlu, tek sayfalık bir site geliştirdim. Kırık beyaz, koyu kahve ve zeytin yeşili paleti, Fraunces + DM Sans tipografisi, CSS ile üretilen ahşap dokusu ve Unsplash kahve fotoğraflarıyla geleneksel ama çağdaş bir atmosfer kurdum; her kahve kartından açılan ve aşağı kaydırdıkça demlemeyi SVG illüstrasyonla adım adım gösteren rehberler ekledim. İletişim formu boş alanları ve e-posta biçimini anlık kontrol ediyor, geçerli gönderimde sunucu bağlantısı olmadan başarı mesajı gösteriyor. Geliştirmede yapay zekâ asistanı olarak Claude Code'u kullandım, etkileşimleri Puppeteer ile masaüstü ve mobilde otomatik test ettim ve siteyi GitHub Pages'te yayınladım.

## Özellikler

- **Hero:** bento ızgara düzeni; marka adı, slogan ve ürün bölümüne yumuşak kaydırmalı **“Kahveleri Keşfet”** butonu
- **Kahveler:** Türk Kahvesi, Espresso ve Filtre Kahve için görsel, açıklama, tat notaları, yoğunluk göstergesi ve örnek fiyat; mobilde oklu, noktalı ve sürüklenebilir karusel
- **Demleme rehberleri:** her kahve kartına tıklayınca açılan tam ekran rehber; aşağı kaydırdıkça SVG illüstrasyon adım adım ilerler (kaydırmaya bağlı animasyon, kütüphanesiz)
  - *Türk kahvesi:* cezveye su dolar, kahve ve şeker eklenir, köpük kabarır, kahve fincana dökülür
  - *Espresso:* öğütme, tamp, portafiltreyi kilitleme, 9 bar basınç ve 28 sn sayaçla çekim, krema
  - *Filtre kahve:* 93 °C'ye ısınan kettle, terazide gram gram tartım, bloom, spiral döküş, süzülme
- **İletişim formu:** ad, e-posta, mesaj; boş alan / e-posta biçimi / minimum uzunluk kontrolü, başarı ekranı ve “yeni mesaj” ile sıfırlama
- **Mobil uyum:** akışkan tipografi, yüzen kapsül menü ve açılır mobil menü (Esc veya dışarı tıklayınca kapanır)
- **Modern etkileşimler:** oturum başına bir kez gösterilen açılış perdesi, harf harf beliren başlık, kaydırdıkça kelime kelime koyulaşan manifesto, maskenin altından yükselen başlıklar, sayarak artan istatistikler, kaydırma hızına göre hızlanıp yön değiştiren bant, sayfa ilerleme çubuğu
- **Masaüstüne özel:** mıknatıslı butonlar, 3B eğilen ve parlayan ürün kartları, değişken font ile kalınlaşan harfler
- **Detaylar:** misafir yorumları (iki sıra, zıt yönlere kayar), metin içi kapsül fotoğraflar, maskeyle açılan ritüel kartı, aktif menü vurgusu, dönen “Gelenek · Zanaat · Paylaşım” mührü, buharı tüten logo
- **Erişilebilirlik:** içeriğe geç bağlantısı, klavye odak stilleri, alt metinler, `prefers-reduced-motion` desteği

## Klasör yapısı

```
yaren_kahve/
├── index.html
├── css/style.css
├── js/main.js       # menü, form, rehber pencereleri
├── js/recipes.js    # rehber illüstrasyonlarının animasyonları
└── assets/
    ├── favicon.svg
    └── img/          # Unsplash fotoğrafları
```

## Görseller

Tüm fotoğraflar [Unsplash](https://unsplash.com) lisansıyla ücretsiz kullanılabilen görsellerdir.
