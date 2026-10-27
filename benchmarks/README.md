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

Mevcut GA `Math.random()` kullanır; sabit sipariş aynı sonucu garanti etmez. Bu ilk aşama aynı girdilerle tekrarlı karşılaştırma sağlar. Birebir tekrarlanabilir otomatik benchmark için sonraki adım, her iki sürüme ortak seed'li rastgelelik ve plan doğrulayıcısı eklemektir. Bu veri setinde henüz ölçülmüş referans sonuç yoktur.
