# X/Y yerleşim tercihi deneyi

Dal: `experiment/placement-preference`. Algoritma commit'i: `2925e091b925daafb98988f225c01be7532dca51`.
Referans: `../main-0c50866-complete/`. Aynı siparişler, 1200 × 800 × 1000 mm yük hacmi, 30 birey ve 30 nesil; her siparişte 1 analitik ve 10 GA koşusu.

Her hücre referans → deney değeridir. GA metrikleri 10 koşunun ayrı ayrı medyanlarıdır; aynı tek planı temsil etmek zorunda değildir.

| Sipariş | Yerleşen adet | Doluluk % | COM yatay sapma mm | COM yüksekliği mm | Ortalama destek % | Algoritma süresi s |
| --- | --- | --- | --- | --- | --- | --- |
| 01-direction | 24 → 24 | 55 → 55 | 17,78 → 18,11 | 334,62 → 309,13 | 100 → 100 | 7,35 → 9,27 |
| 02-support | 28 → 28 | 82,5 → 82,5 | 26,14 → 11,64 | 458,39 → 428,50 | 98,81 → 100 | 4,96 → 7,59 |
| 03-capacity | 19 → 20 | 64,97 → 61,99 | 114,54 → 103,83 | 475,34 → 458,89 | 95,83 → 97,62 | 6,97 → 7,77 |

Kapasite siparişinde referansın tüm koşuları 19 kutuydu; deneyin 6 koşusu 20, 4 koşusu 22 kutu yerleştirdi. Bununla birlikte medyan hacim doluluğu düştü: daha çok kutu yerleştirmek daha fazla ürün hacmi yerleştirmek anlamına gelmiyor. Mevcut uygunluk puanı kutu adedini hacimden önce ödüllendiriyor; bu deneyde uygunluk puanı değiştirilmedi.

Destek siparişinde kutu adedi korunurken medyan yatay sapma, COM yüksekliği ve destek iyileşti. Yön siparişinde COM yüksekliği azaldı; yatay sapmada küçük bir artış var. Sonuçlar tüm hedeflerde koşulsuz iyileşme göstermiyor.

33 deney planının tamamı bağımsız geometrik kontrolleri geçti. Üç analitik planın yerleşimleri referansla birebir aynı; sipariş SHA-256 değerleri de eşit. Tercih yönü, eski davranışa dönüş, OX ile aktarım, mutasyon ve ebeveyn genlerinin korunması `benchmarks/check-preference.cjs` ile kontrol edildi. Tarayıcı arayüzü bu çalışmada otomatik olarak sınanmadı.

Node.js v22.23.4, aynı `node:22-alpine` ortamı ve aynı benchmark çalıştırıcısı kullanıldı. Süreler DOM çizimini içermez; ayrı zamanlarda alınan ölçümler sistem yüküne duyarlıdır. Sabit seed veya eşleştirilmiş rastgele koşular yoktur; üç sentetik siparişten genel üstünlük ya da istatistiksel anlamlılık çıkarılamaz.

Sonuç: temas tercihi geni umut verici; özellikle kapasite siparişinde adet kazancı var. `main`e almadan önce adet/hacim önceliğini netleştirmek ve daha fazla sipariş üzerinde tekrar karşılaştırmak uygun olur. Deney `main`e birleştirilmedi ve uzağa gönderilmedi.
