# Tüm palet üzerinde temas seçimi GA deneyi

Dal: `experiment/contact-choice`. Algoritma commit'i: `84f55aaa03d6b7ba5f35754d3a46770cfa3f5edf`.

## Tasarım

Kutu sırası, kesin 0°/90° yönelim ve normalize temas adayı indeksi genleri tek GA ile bütün palet üzerinden değerlendirilir. İlk kutu köşede başlar. Decoder bir seviyede tüm kalan kutuları dener; bir tam geçişte hiçbiri yerleşmezse sıradaki üst yüzey yüksekliğine çıkar. Aday sayısını %150 taban alanıyla sınırlayan havuz bu yolda kullanılmaz. Temas adayları mevcut pozitif kenar koordinatlarından üretilir, tekrarlardan arındırılır ve Y/X sırasına konur. Zorunlu merkez veya X/Y tercih kuralı yoktur. Tüm fiziksel kontroller korunur.

Başlangıç bireylerinin yaklaşık %80'i ağır SKU gruplarından hafiflere sıralanır, kalanları çeşitlilik için grup sırasını karıştırır; ayrıca deterministik başlangıç vardır. Başlangıç eğilimi mutlak ağır-alt kuralı değildir. OX sıra/yön/temas genlerini taşır; temas mutasyonu %5,5'tir.

Önceki sürümler de tek global GA kullanıyordu; yeni olan genler ve decoder'ın kararlarıdır. Analitik ve tek SKU algoritmaları korunmuştur. Uygunluk puanı değiştirilmemiştir: adet/hacim, XY/Z ağırlık merkezi, destek ve SKU geçiş/yayılımı. Ayrı kompaktlık, üst yük limiti veya maksimum kullanılan yük yüksekliği hedefi eklenmedi. Çözüm matematiksel optimum garantisi taşımaz.

## Sonuçlar

1200 × 800 × 1000 mm yük hacminde aynı üç sipariş, 30 birey, 30 nesil, sipariş başına 1 analitik ve 10 GA koşusu. Node.js v22.23.4, aynı benchmark çalıştırıcısı. Medyanlar ayrı ayrı hesaplanır; tek planı temsil etmeleri gerekmez.

| Sipariş | Eski GA adet | X/Y, merkezleme yok adet | X/Y + merkezleme adet | Yeni temas seçimi adet |
| --- | --- | --- | --- | --- |
| 01-direction | 24 | 24 | 24 | 24 |
| 02-support | 28 | 28 | 28 | 28 |
| 03-capacity | 19 | 20–22 | 19 | 50–56 (medyan 55,5) |

### Eski GA → yeni temas seçimi medyanları

| Sipariş | Doluluk % | COM yatay sapma mm | COM yüksekliği mm | Destek % | SKU geçişi | Süre s |
| --- | --- | --- | --- | --- | --- | --- |
| 01-direction | 55 → 55 | 17,78 → 2,27 | 334,62 → 284,13 | 100 → 100 | 9,5 → 6 | 7,35 → 0,62 |
| 02-support | 82,5 → 82,5 | 26,14 → 10,34 | 458,39 → 426,40 | 98,81 → 99,15 | 10 → 6 | 4,96 → 0,70 |
| 03-capacity | 64,97 → 86,88 | 114,54 → 15,63 | 475,34 → 480,42 | 95,83 → 94,89 | 7 → 15 | 6,97 → 9,30 |

Kapasite koşularının adetleri sırasıyla: 55, 50, 56, 54, 56, 56, 54, 56, 53, 56.

İlk iki siparişte aynı sipariş miktarı daha alçak ve yatayda daha dengeli yerleştirildi; SKU geçişi azaldı. Kapasite siparişinde hem adet hem hacim artarken yatay denge iyileşti. Ancak Z kütle merkezi biraz yükseldi, ortalama destek azaldı ve toplam SKU geçişi arttı. Daha fazla ve farklı kutu yerleştiği için bu metrikler aynı yükün karşılaştırması değildir; bütün hedeflerin birlikte iyileştiği söylenemez. Ağırların her koşulda altta kaldığı garantisi yoktur.

## Doğrulama ve yorum sınırı

33 yeni plan bağımsız sınır, çakışma, %75 destek, ölçü ve adet kontrolünü geçti. Önceki üç varyantla girdi hash'leri aynı, analitik yerleşimler birebir eşit. Tek SKU plan ve GA fonksiyonlarının önceki sürümle kaynak eşitliği doğrulandı. `check-contact.cjs` aday sırasını, temas seçimini, kesin yönelimi, köşe başlangıcını, desteği, alt seviyeyi doldurmayı, determinizmi ve genetik bütünlüğü test eder. `check-preference.cjs` korunmuş analitik karşılaştırıcıyı test eder. Tarayıcı UI akışı bu çalışmada otomatik sınanmadı.

Kazanç yalnızca yeni gene bağlanamaz. Aday havuzunun kaldırılması, alt seviyelerin yeniden denenmesi, kesin yönelim, ağır SKU başlangıcı ve temas seçimi birlikte değişmiştir. Hız farkında tekrarlı koordinatların ayıklanması ve tek yönelimin denenmesi de etkilidir. Farklı zamanlardaki süreler sistem yüküne duyarlıdır; sabit seed kullanılmadı. Sonuç üç sentetik siparişle sınırlıdır.

Ham planlar bu klasörde, metrikler `results.csv`, kod/girdi hash'leri `manifest.json` içindedir. Karşılaştırma:

```bash
python3 benchmarks/compare.py benchmarks/results/main-0c50866-complete benchmarks/results/preference-2925e09 benchmarks/results/centered-a96ad75 benchmarks/results/contact-84f55aa
```

Yerelde denemek için `dist/index.html` dosyasını yenileyin, çoklu SKU dosyasını yükleyin ve genetik modu çalıştırın. Eski geçmiş farklı algoritmaların sonuçlarını içerebilir; yeni üretilen planı değerlendirin veya ilgili geçmişi temizleyin. Sonuçlar yerel deney dalındadır; main'e birleştirme veya push yapılmadı.
