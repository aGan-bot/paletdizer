# PalletForge / Paletdizer

Palet üzerine farklı ölçü, adet ve ağırlıktaki kutuları yerleştirmek için geliştirilen tarayıcı tabanlı bir 3B paletleme prototipi. Yerleşim; palet sınırı, 3B çakışma ve taban desteği kurallarını dikkate alır. Uygulama, ileride çok amaçlı genetik optimizasyon ve paletleme robotu entegrasyonuna temel oluşturur.

## Özellikler

- En fazla 30 SKU içeren düzenlenebilir kutu listesi
- SKU, adet, en, boy, yükseklik ve ağırlık (kg) girişi
- Pozitif tam sayı doğrulaması
- CSV ve JSON içe aktarma
- Seçili çözümü robot yerleştirme sırası ve koordinatlarıyla JSON dışa aktarma
- Hazır rastgele örnek set üretimi
- Ağır kutuları önceleyen 3B temas-noktası yerleştiricisi
- Tek SKU için 0°/90° karışımını arayan katman GA'sı ve çift katlarda X ekseninde ayna düzeni
- Çoklu SKU için katman bazlı genetik arama: her seviyede ağır kutulardan `%150` taban alanı büyüklüğünde aday havuzu seçilir; sıra ve 0°/90° yön genleri aranır
- Palet sınırı ve kutu çakışması denetimi
- Üstteki kutular için en az %75 destek yüzeyi kontrolü
- 110 mm yüksekliğinde 3B ahşap palet görünümü
- Three.js ile kamera döndürme ve ağırlık merkezine odaklı yakınlaştırma
- 3B kutuya tıklayınca SKU, ölçü, ağırlık, yön ve palet konumu bilgisi
- Doluluk, toplam yük, ağırlık merkezi, destek oranı ve ön stabilite skoru
- Ağırlık merkezi için `±X`, `±Y`, `±Z` eksen göstergesi

## Hızlı başlangıç

`dist/index.html` dosyasını doğrudan tarayıcıda açın. 3B WebGL görünümü için internet bağlantısı gerekir; Three.js CDN üzerinden yüklenir.

1. Palet profilini seçin veya palet ölçülerini girin.
2. Sol panelden kutu satırlarını düzenleyin ya da **Dosya Yükle** ile CSV/JSON seçin.
3. **3B planı oluştur** düğmesine basın.
4. 3B sahneyi sürükleyerek döndürün; tekerlekle ağırlık merkezine göre yakınlaştırın/uzaklaştırın.
5. Sol panel ve 3B alan arasındaki ayıracı sürükleyerek çalışma alanlarını yeniden boyutlandırın.

## Veri dosyası biçimi

Örnekler:

- [CSV örneği](sample-products.csv)
- [JSON örneği](sample-products.json)

CSV başlığı:

```csv
sku,adet,en,boy,yukseklik,agirlik
SKU-01,4,300,250,200,9
```

JSON, bu alanları taşıyan bir dizi olmalıdır:

```json
[
  { "sku": "SKU-01", "adet": 4, "en": 300, "boy": 250, "yukseklik": 200, "agirlik": 9 }
]
```

Ölçüler milimetre, ağırlık kilogram cinsindendir ve tüm sayısal değerler pozitif tam sayı olmalıdır.

## Stabilite notu

Ön stabilite skoru; ağırlık merkezinin yatay merkezden sapması, ağırlık merkezi yüksekliği ve kutu destek oranından üretilen bir karar desteği göstergesidir. Gerçek palet kapasitesi, ambalaj dayanımı, dinamik taşıma koşulları veya robot güvenlik doğrulamasının yerine geçmez.

## Yol haritası

Detaylı çalışma planı: [MULTI_SKU_ROADMAP.md](MULTI_SKU_ROADMAP.md)

Sıradaki önemli aşamalar:

1. Ağır/kırılgan ürün ve üst yük kuralları
2. GA'ya temas noktası tercihi ve daha ayrıntılı çok amaçlı Pareto seçimi eklenmesi
3. Yerel arama ve performans iyileştirmeleri
4. Robot alma-bırakma pozları, ters kinematik ve çarpışma denetimi

## GitHub Pages

`main` dalına yapılan her gönderim, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) ile GitHub Pages dağıtımını tetikler. Depoda ilk kullanımda **Settings → Pages → Build and deployment → GitHub Actions** kaynağını etkinleştirin.
