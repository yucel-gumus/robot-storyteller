# 🤖 Robot Hikayecisi

Karmaşık konuları eğlenceli robot hikayeleriyle açıklayan AI destekli interaktif öğrenme aracı.

## 🌟 Özellikler

- 🎭 **Eğlenceli Anlatım**: Karmaşık konuları robot hikayeleriyle açıklar
- 🖼️ **Görsel Hikayeler**: Her açıklama için otomatik illüstrasyon üretimi
- 🎪 **İnteraktif Slideshow**: Hikaye adımlarını slayt slayt takip edin
- 🇹🇷 **Türkçe Destek**: Tamamen Türkçe arayüz ve açıklamalar
- 📱 **Responsive Tasarım**: Tüm cihazlarda mükemmel çalışır
- 🌙 **Dark Mode**: Otomatik tema desteği
- ⌨️ **Klavye Navigasyonu**: Tam klavye desteği
- ♿ **Erişilebilirlik**: ARIA uyumlu ve screen reader desteği

## 🎯 Nasıl Çalışır?

1. **Soru Sorun**: Merak ettiğiniz konuyu yazın
2. **Robot Hikayesi**: AI, konuyu robot karakterlerle açıklar
3. **Görsel Anlatım**: Her adım için otomatik illüstrasyon üretilir
4. **İnteraktif Öğrenme**: Slideshow ile hikayeyi adım adım takip edin

## 🚀 Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- Gemini API Key ([Google AI Studio](https://aistudio.google.com/app/apikey)'dan alın)

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd tiny-cats
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini ayarlayın:**
   - `.env` dosyası oluşturun
   - `GEMINI_API_KEY=your_api_key_here` ekleyin

4. **Uygulamayı çalıştırın:**
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın:**
   http://localhost:5173

## 🎮 Kullanım

### Örnek Sorular
- "Sinir ağları nasıl çalışır?"
- "Kuantum fiziği nedir?"
- "Blockchain nasıl çalışır?"
- "DNA replikasyonu nasıl çalışır?"

### Klavye Kısayolları
- `Enter`: Mesaj gönder
- `←/→`: Slaytlar arası geçiş
- `Home/End`: İlk/son slayta git

## 🛠️ Teknolojiler

- **Frontend**: TypeScript, HTML5, CSS3
- **AI**: Google Gemini 2.0 Flash (Image Generation)
- **Build Tool**: Vite
- **Styling**: Modern CSS with Custom Properties
- **Markdown**: Marked.js

## 🎨 Tasarım Özellikleri

- **Modern UI**: Clean ve minimal tasarım
- **Smooth Animations**: Fluid geçişler ve hover efektleri
- **Color System**: CSS Custom Properties ile tema yönetimi
- **Typography**: Inter, JetBrains Mono, Caveat font'ları
- **Responsive Grid**: Flexible layout sistemi

## 🔧 Geliştirme

### Proje Yapısı
```
tiny-cats/
├── index.html          # Ana HTML dosyası
├── index.tsx          # TypeScript ana dosyası
├── index.css          # Stil dosyası
├── vite.config.ts     # Vite konfigürasyonu
├── package.json       # Bağımlılıklar
└── README.md         # Bu dosya
```

### Scripts
```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Build önizlemesi
```

## 🚀 Deployment

### Vite Build
```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulur.

### Environment Variables
Production'da `GEMINI_API_KEY` environment variable'ının ayarlandığından emin olun.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje Apache 2.0 lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- Google Gemini AI ekibine
- Açık kaynak topluluğuna
- Tüm katkıda bulunanlara

---

**🤖 Robot Hikayecisi ile öğrenmeyi eğlenceli hale getirin!**
