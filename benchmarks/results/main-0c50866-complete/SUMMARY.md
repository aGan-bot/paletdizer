# Main referans sonuçları

Algoritma referansı: `0c508662600b9da1cf9056a6860ff39357240db0`.
Palet: 1200 × 800 mm, maksimum yük yüksekliği: 1000 mm.
Node.js v22.23.4, ağ erişimsiz `node:22-alpine` container; koşular sıralı çalıştırıldı.

| Sipariş | Analitik adet | GA en kötü / medyan / en iyi adet | GA medyan süre |
| --- | --- | --- | --- |
| 01-direction | 24/24 | 24 / 24 / 24 | 7,35 s |
| 02-support | 14/28 | 28 / 28 / 28 | 4,96 s |
| 03-capacity | 16/68 | 19 / 19 / 19 | 6,97 s |

Her sipariş için 1 analitik ve 10 GA olmak üzere 33 koşu tamamlandı. Tüm planlar bağımsız sınır, çakışma, minimum %75 destek, ürün ölçüsü ve adet kontrollerini geçti. Bu kontrol statik geometrik kurallarla sınırlıdır.

Her JSON, uygulamanın mevcut `exportPlanJson` fonksiyonundan üretilmiştir; ek `benchmark` alanı süre, koşu, referans ve doğrulama bilgilerini taşır. Ayrıntılı denge ve doluluk metrikleri `results.csv` içindedir. `manifest.json` kaynak ve sipariş dosyası hash'lerini içerir; kullanılan çalıştırıcının kopyası `runner.cjs` dosyasıdır.

GA'nın rastgeleliği değiştirilmedi, sabit seed kullanılmadı. Adetlerin aynı olması planların veya denge metriklerinin aynı olduğu anlamına gelmez. Süreler yalnızca algoritmayı kapsar, tarayıcı çizimini içermez. Deney dalıyla karşılaştırmada aynı çalıştırıcı ve çalışma ortamı kullanılmalıdır. İlk başarısız çalıştırıcı denemesinin kardeş klasörü `../main-0c50866/` bu sonuçlara dahil değildir.
