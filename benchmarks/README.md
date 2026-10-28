# Sabit yerleşim karşılaştırmaları — v1

Bu girdiler mevcut `main` yerleştiricisi ile temas tercihi geni deneyini karşılaştırmak içindir. Sentetik siparişlerdir; gerçek saha verisi veya bilinen optimum çözüm değildir. Karşılaştırma sırasında dosyaları ve satır sırasını değiştirmeyin. Yeni senaryoları ayrı dosya olarak ekleyin.

Tüm siparişler için palet eni **1200 mm**, boyu **800 mm**, maksimum yük yüksekliği **1000 mm** kullanılır. Bu yük yüksekliği 110 mm ahşap paleti içermez. Palet profilini seçtikten sonra bu üç değeri kontrol edin; profil varsayılan yüksekliği farklı olabilir.

| Sipariş | Amaç | SKU | Kutu | Toplam kütle | Sipariş hacmi / palet yük hacmi |
| --- | --- | --- | --- | --- | --- |
| `orders/01-direction.json` | Eşit yüksekliklerde X/Y doldurma ve yönelim etkisini ayırmak | 3 | 24 | 208 kg | %55 |
| `orders/02-support.json` | Farklı yüksekliklerde destek ve üst seviyelere geçişi gözlemek | 4 | 28 | 286 kg | %82,5 |
| `orders/03-capacity.json` | Fazla siparişte kutu sayısı ve boşluk kullanımını karşılaştırmak | 4 | 68 | 652 kg | %141,5625 |

Hacim oranı yerleşim sonucu değildir. %100 üstü siparişlerin tamamı bu palet hacmine sığamaz; %100 altı olmak da geometrik olarak sığma garantisi vermez. Ağırlıklar algoritmanın denge hesabı içindir; palet taşıma kapasitesi doğrulanmaz. Bütün senaryolar mevcut 180 kutu işlem sınırının altındadır.

## Deneme prosedürü

1. Dal adını ve `git rev-parse HEAD` çıktısını kaydedin. Önce mevcut `main` sonuçlarını alın; deney dalında aynı veri dosyalarını kullanın.
2. **Dosya Yükle** ile ilgili JSON'u açın ve paleti yukarıdaki ölçülere ayarlayın. Rastgele örnek üretmeyin, ürün satırlarını düzenlemeyin.
3. Analitik modda bir kontrol koşusu; genetik modda her sipariş için **10 bağımsız koşu** yapın. Mevcut GA ayarlarını iki sürümde de aynı tutun. Aynı tarayıcı ve makineyi kullanın.
4. Her koşuda yeni üretilen çözümü kaydedin. Geçmişteki **En iyi** düğmesini kullanmayın, kutuları elle taşımayın. Geçmiş iki sürümün sonuçlarını karıştırabilir; kayıt kaynağı olarak dışa aktarılan JSON'ları kullanın.
5. Her koşudan sonra **Çözümü JSON indir** ile planı dışa aktarın; örneğin `main-01-direction-ga-01.json`. İndirmeleri ayrı bir sonuç klasöründe saklayın.
6. Yerleşen adet, doluluk, COM yatay uzaklığı, COM yüksekliği, ortalama destek, SKU geçişi ve süreyi aşağıdaki başlıklarla kaydedin. COM uzaklığı `sqrt(x²+y²)` ile JSON özetindeki merkezden göreli X/Y değerlerinden hesaplanır. Süreyi düğmeye basıştan sonuç görünene kadar ölçün; mevcut JSON süreyi içermez ve elle ölçüm yaklaşık değerdir.

```csv
revision,scenario,mode,run,placed,requested,utilization_percent,com_offset_mm,com_height_mm,average_support_percent,sku_transitions,duration_seconds,valid,plan_file
```

Her sürüm ve senaryo için 10 GA koşusunun en iyi, medyan ve en kötü yerleşen adetlerini; denge metriklerini ve medyan süreyi karşılaştırın. Tek bir şanslı koşuya göre karar vermeyin. Sınır/çakışma/%75 destek ihlali olan sonuçları geçerli kazanım saymayın; dışa aktarılan koordinatların bağımsız doğrulaması henüz eklenmediği için `valid` alanını doğrulama yapılana kadar `unchecked` bırakın.

Mevcut GA `Math.random()` kullanır; sabit sipariş aynı sonucu garanti etmez. Bu ilk aşama aynı girdilerle tekrarlı karşılaştırma sağlar. Birebir tekrarlanabilir otomatik benchmark için sonraki adım, her iki sürüme ortak seed'li rastgelelik eklemektir.

## Otomatik çalıştırma

`run.cjs`, `dist/optimizer.js` içindeki mevcut fonksiyonları Node.js VM ortamında yükler. Yalnızca DOM başlangıcını çalıştırmaz, ilerleme göstergesini devre dışı bırakır ve animasyon beklemesini Node olay döngüsüne bağlar. Yerleştirme, GA parametreleri, rastgelelik ve uygulamanın JSON dışa aktarıcısı değiştirilmez. Üç sipariş için toplam 33 koşu sırayla çalışır.

```bash
node benchmarks/run.cjs benchmarks/results/YENI-KOSU-KLASORU REFERANS_COMMIT
```

Çıktı klasörü yeni olmalıdır; önceki sonuçların üzerine yazılmaz. Her koşunun uygulamayla aynı şemadaki JSON planına benchmark bilgileri eklenir. `results.csv` metrikleri, `manifest.json` commit ve kaynak/girdi SHA-256 değerlerini içerir. Süre yalnızca algoritmayı kapsar; arayüz çizimini içermez. Bağımsız doğrulayıcı sınır, çakışma, destek, ürün ölçüleri ve adetlerini kontrol eder; hata bulursa koşuları durdurur. Bu geometrik doğrulama gerçek dünya dayanım veya robot güvenliği doğrulaması değildir.

Referans algoritma commit'i: `0c508662600b9da1cf9056a6860ff39357240db0`. Tam referans sonuçları `results/main-0c50866-complete/` altında tutulur. `results/main-0c50866/` ilk çalıştırıcı denemesinin yalnızca analitik çıktısını içerir ve karşılaştırmaya dahil edilmez.

## Temas tercihi deneyi

Dal: `experiment/placement-preference`; algoritma commit'i: `2925e091b925daafb98988f225c01be7532dca51`.

Çoklu SKU GA'sında her kutunun `placement` geni `0` (önce küçük Y, ardından küçük X: X boyunca doldur) veya `1` (önce küçük X, ardından küçük Y: Y boyunca doldur) değerini taşır. Tercih tüm seviyelerde geçerli adayların karşılaştırılmasını değiştirir; kesin bir yüzeye temas zorunluluğu getirmez. 0°/90° yön denemeleri, sınır, çakışma, destek, uygunluk puanı, popülasyon ve nesil sayıları korunmuştur. Yeni gen %5,5 olasılıkla terslenir; OX çaprazlaması kutuyla birlikte yön ve tercih genini taşır.

Başlangıç popülasyonundaki deterministik bireyin tercih geni yoktur; bu birey ve henüz tercih mutasyonu almamış genleri eski davranışı korur (tabanda X boyunca, üstte merkeze yakın). Dolayısıyla deney, eski davranışın yanında X/Y alternatifleri sunar. Analitik mod ve tek SKU yolu değişmemiştir. Üst seviyelerdeki yeni X/Y tercihleri merkeze yakınlık önceliğini kaldırabildiğinden ağırlık merkezi sonuçlarını ayrıca karşılaştırmak gerekir.

`node benchmarks/check-preference.cjs` yön seçimi, eski davranışa dönüş, çaprazlama ve mutasyon kontrollerini çalıştırır. Aynı benchmark çalıştırıcısının 33 deney çıktısı `results/preference-2925e09/` altındadır. Sabit değerlendirme sayısı kullanılır; süre bütçesi eşitlenmez. Seed kullanılmadığından referansla birebir eşlenmiş rastgele deney değildir.

## Üst merkezlemeli temas tercihi deneyi

Dal: `experiment/placement-preference-centered`; algoritma commit'i: `a96ad7531a8015b8e07ca76acbd289b1294bfbb3`. Önceki deneye göre tek algoritma değişikliği üst seviyedeki aday önceliğidir: önce merkez uzaklığı küçük olan, eşitse desteği yüksek olan, ikisi de eşitse X/Y geninin tercih ettiği aday seçilir. Tercih geni olmayan bireylerde referans davranışı aynen korunur. Tabandaki X/Y tercihleri değişmez.

Sonuçlar: `results/centered-a96ad75/`. Üç varyantın girdilerini, plan geçerliliğini, analitik eşitliğini ve GA medyanlarını karşılaştırmak için:

```bash
python3 benchmarks/compare.py benchmarks/results/main-0c50866-complete benchmarks/results/preference-2925e09 benchmarks/results/centered-a96ad75
```

Bu varyant merkezlemeyi koruyarak GA tercihini ölçer; üst katlarda gen yalnızca merkez uzaklığı ve destek eşitliğinde etkilidir. Aday seçimi referansın bu önceliklerini korusa da tam eşitliklerde genin karar vermesi referansa ek bir davranıştır.

## Tüm palet için temas seçimi deneyi

Dal: `experiment/contact-choice`; algoritma commit'i: `84f55aaa03d6b7ba5f35754d3a46770cfa3f5edf`.

Tek GA bütün paleti puanlar (önceki kod da tek global GA kullanıyordu). Yeni olan decoder'ın davranışı ve genlerdir:

- Kutu sırası, kesin 0°/90° yönelim ve `[0,1)` aralığında `contact` geni. OX bunları birlikte taşır; temas geni %5,5 olasılıkla yeniden örneklenir.
- Adaylar mevcut kutuların pozitif X/Y kenarlarından, tekrar eden koordinatlar ayıklanarak üretilir; Y, ardından X sırasına konur. İlk kutu `(0,0,0)` köşesinde başlar. Negatif yönde temas adayları veya tüm sürekli koordinat uzayı aranmaz.
- Geçerli aday sayısı `N` ise `floor(contact × N)` indeksli aday seçilir. Aday kümesi önceki kutulara bağlıdır; gen mutlak koordinat saklamaz. Aynı gen zinciri aynı planı üretir.
- Her seviyede kalan kutuların tamamı sıra ile denenir; yerleşmeyenler tekrar denenir. Bir tam geçişte hiç kutu eklenemezse sıradaki en düşük üst yüzey yüksekliğine geçilir. %150 alan aday havuzu yeni GA yolunda kullanılmaz.
- Sınır, çakışma ve %75 destek kesin kontrol edilir. Zorunlu merkezleme veya X/Y yerleşim tercihi yoktur.
- Başlangıç bireylerinin yaklaşık %80'i ağır SKU grupları önce olacak şekilde, geri kalanı karışık grup sırası ile hazırlanır; ayrıca deterministik sıra/temas=0 bireyi vardır. Bu alt katlarda ağır yükü teşvik eder, garanti etmez.
- Uygunluk puanı, 30 birey ve 30 nesil değişmedi. Kutu adedi, hacim, XY/Z ağırlık merkezi, destek ve SKU akışı tüm plan üzerinde değerlendirilir. Ayrı bir kompaktlık veya maksimum yük yüksekliği cezası bu deneyde eklenmedi; SKU geçişi decoder'ın ürettiği yerleştirme sırasındadır.
- Analitik decoder ve tek SKU yolu korunmuştur. Yeni GA'nın deterministik başlangıç bireyi de yeni decoder ile değerlendirildiğinden analitik çözümle aynı olmak zorunda değildir.

Kontroller: `node benchmarks/check-contact.cjs`. Sonuçlar: `results/contact-84f55aa/`. Önceki varyantlardan birden fazla mekanizma değiştiği için sonuçlar bir tasarım paketi karşılaştırmasıdır; farkı yalnızca temas genine bağlamayın. Süre farkında koordinat tekrarlarının ayıklanması ve yalnızca genin yöneliminin denenmesi de etkilidir.
