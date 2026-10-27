# Üst merkezlemeli temas tercihi karşılaştırması

Dal: `experiment/placement-preference-centered`.
Algoritma commit'i: `a96ad7531a8015b8e07ca76acbd289b1294bfbb3`.

Üst seviyelerde (`z > 0`) adaylar önce merkez uzaklığı, sonra destek oranı ile seçilir. X/Y geni yalnızca bu iki değer eşitse karar verir. Tabanda X/Y tercihi önceliklidir. Önceki deneyin gen üretimi, çaprazlaması ve mutasyonu; tüm fiziksel kontroller ve uygunluk puanı korunmuştur.

Her siparişte 1 analitik ve 10 GA koşusu çalıştırıldı. Palet yük hacmi 1200 × 800 × 1000 mm, GA popülasyonu 30 ve nesil sayısı 30. Aynı çalıştırıcı ve Node.js v22.23.4 kullanıldı.

## Yerleşen adet

| Sipariş | Eski referans | X/Y geni, üst merkezleme önceliği yok | X/Y geni, üst merkezleme var |
| --- | --- | --- | --- |
| 01-direction | 24 (tüm koşular) | 24 (tüm koşular) | 24 (tüm koşular) |
| 02-support | 28 (tüm koşular) | 28 (tüm koşular) | 28 (tüm koşular) |
| 03-capacity | 19 (tüm koşular) | 20–22 (medyan 20) | 19 (tüm koşular) |

## Eski referans → merkezlemeli deney: GA medyanları

| Sipariş | Doluluk % | COM yatay sapma mm | COM yüksekliği mm | Ortalama destek % | Süre s |
| --- | --- | --- | --- | --- | --- |
| 01-direction | 55 → 55 | 17,78 → 22,96 | 334,62 → 369,71 | 100 → 100 | 7,35 → 7,22 |
| 02-support | 82,5 → 82,5 | 26,14 → 17,38 | 458,39 → 440,64 | 98,81 → 98,52 | 4,96 → 5,09 |
| 03-capacity | 64,97 → 64,81 | 114,54 → 114,54 | 475,34 → 473,97 | 95,83 → 95,83 | 6,97 → 7,25 |

Metrikler ayrı ayrı medyandır; tek bir plana ait olmak zorunda değildir. Süreler algoritma süresidir, çizim dahil değildir ve sistem yüküne duyarlıdır.

## Yorum

Üst merkezleme korununca önceki kapasite kazancı gözlenmedi. Bu veri setinde X/Y geninin merkezleme korunurken kutu adedini artırdığına dair bulgu yok. Önceki 20–22 kutuluk sonuçları yalnızca yeni gene bağlamak doğru değildi; üstte aday seçiminin değişmesiyle birlikte ortaya çıkmışlardı.

Merkezlemeyi kaldırmanın tek başına tüm kazancı sağladığı da henüz kanıtlanmadı: bunu ayırmak için gen eklemeden merkezlemeyi kaldıran ayrı bir kontrol gerekir. Burada görülen, önceki kazancın merkezleme önceliği geri getirildiğinde kaybolmasıdır. Ayrıca seed kullanılmayan, farklı rastgele koşular ve yalnızca üç sentetik sipariş karşılaştırılıyor; istatistiksel veya genel üstünlük iddiası yoktur.

Denge açısından sonuçlar karışık: yön siparişinde medyan yatay sapma ve yükseklik kötüleşti, destek siparişinde iyileşti. Merkezlemeli yeni GA eski GA'ya göre bütün hedeflerde üstün değil. Üst seviyelerde gen yalnızca eşitliklerde çalıştığı için yeni genin ana etkisi taban düzeni ve eşit adayların seçimidir.

## Doğrulama ve kayıtlar

- 33 yeni planın tümü bağımsız sınır, çakışma, destek, ürün ölçüsü ve adet kontrolünü geçti.
- Üç varyantın sipariş SHA-256 değerleri aynı; analitik yerleşimler birebir eşit.
- Merkez ve destek önceliği, X/Y eşitlik seçimi, eski davranış, çaprazlama, mutasyon ve ebeveyn korunması testleri geçti.
- Ham planlar bu klasörde, metrikler `results.csv`, kaynak hash'i `manifest.json` içindedir.
- Karşılaştırma `python3 benchmarks/compare.py benchmarks/results/main-0c50866-complete benchmarks/results/preference-2925e09 benchmarks/results/centered-a96ad75` ile tekrarlanabilir.
- Tarayıcı etkileşimleri bu koşularda test edilmedi. Gerçek fiziksel dayanım/robot güvenliği bu doğrulamanın kapsamında değildir.

Deney ayrı dalda tutulur; `main`e birleştirilmez ve uzak depoya gönderilmez.
