# PalletForge

Değişken ölçülü paletlere tek tip kutuları yerleştiren, izometrik 3B görünüm sunan tarayıcı-tabanlı bir optimizasyon aracı. İlk çözüm deterministik analitik yerleştirme ile üretilir; ardından isteğe bağlı genetik arama daha iyi yönelim ve katman düzenleri dener.

## Mevcut kapsam ve sonraki faz

İlk sürüm yalnızca **tek tip kutu** ile 3B palet dolumunu hedefler. Katman stratejileri, aynı dizilimi koruma veya katmanlar arasında ayna/yön değişimi ile kilitli yük oluşturma seçeneklerini kapsayacaktır. Tam dikdörtgen bir gridde ayna simetrisi geometrik olarak aynı yerleşimi verir; gerçek kilitleme için alternatif yönelim veya kontrollü ofset uygulanır ve bu sırada alan verimi ile stabilite birlikte değerlendirilir.

Sonraki fazda, kutu ölçüsü ve ağırlık listesinden çok ürünlü tam palet senaryoları üretilecek; hacim doluluğu, ağırlık merkezi, katman stabilitesi ve azami yükseklik ortak hedef fonksiyonunda optimize edilecektir.

## Çalıştırma

`dist/index.html` doğrudan açılabilir; bağımlılık veya sunucu gerekmez.

## GitHub Pages

1. Bu klasörü yeni bir GitHub deposuna gönderin.
2. Depoda **Settings → Pages → Build and deployment → GitHub Actions** seçin.
3. `main` dalına her gönderimde `.github/workflows/deploy.yml` uygulamayı yayınlar.
