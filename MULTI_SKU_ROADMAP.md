# Çoklu SKU Paletleme Yol Haritası

Bu not, PalletForge/Paletdizer çalışmasının kaldığı yeri ve sonraki uygulama sırasını kaydeder.

## Mevcut durum

- Tek tip kutu için geliştirilen ilk yerleştirici, çoklu SKU veri girişiyle genişletilmeye başlandı.
- Arayüzde en fazla 30 kutu türü tanımlanabilir.
- Her satırda `SKU`, `adet`, `en`, `boy`, `yükseklik` ve `ağırlık (kg)` bulunur.
- Ölçüler, adet ve ağırlık pozitif tam sayıdır; küsürlü değerler geçersizdir.
- İlk çoklu SKU decoder'ı kutuları ağırdan hafife ele alır; sol-alt-arka temas noktalarından birini seçer, palet sınırını ve 3B çakışmayı denetler.
- Üstteki bir kutu için alttaki destek alanının en az `%75` olması istenir.
- Three.js sahnesi kutuları gerçek `x, y, z, genişlik, derinlik, yükseklik` değerleriyle çizer.
- Palet 110 mm yüksekliğinde, ahşap tabla ve takozlardan oluşan 3B bir modeldir.
- Çoklu SKU genetik optimizasyonu bağlandı: her fiziksel seviyede kalan kutular ağırlığa göre sıralanır; palet taban alanının `%150`si kadar aday havuzu seçilir. GA bu havuzun sıra ve 0°/90° yön kararlarını arar; yerleşmeyen kutular sonraki seviyede yeniden değerlendirilir.

## Hedefler

1. Palete mümkün olduğunca çok sipariş kutusu yerleştirmek.
2. Hacim doluluğunu artırmak.
3. Ağırlık merkezini palet yatay merkezine yaklaştırmak.
4. Ağırlık merkezini mümkün olduğunca alçakta tutmak.
5. Destek, kırılganlık ve istif kurallarını korumak.
6. Daha sonraki aşamada robot alma-bırakma pozları ve yörünge maliyetini hesaba katmak.

## Uygulama fazları

### Faz 1 — Çoklu SKU veri modeli ve temel decoder

Durum: Başlandı.

- [x] 30 satıra kadar düzenlenebilir kutu listesi
- [x] Tam sayı doğrulaması
- [x] Adet ve toplam ağırlık özeti
- [x] 3B çakışma denetimli, temas noktalı temel yerleştirme
- [x] En az %75 destek alanı kontrolü
- [ ] Kırılganlık, izinli yönelim ve üst yük limiti alanları
- [x] CSV/JSON içe aktarma ve örnek veri seti
- [ ] Dışa aktarma: JSON ve CSV

### Faz 2 — Stabilite ve ağırlık merkezi

- Durum: Başlandı.

- [x] Yerleşen kutuların kütle merkezi hesaplanıyor.
- [x] Toplam ağırlık, COM X/Y, COM yüksekliği ve destek oranı gösteriliyor.
- [x] 3B sahnede ağırlık merkezi yeşil işaretçiyle gösteriliyor.
- [x] Karar desteği amaçlı ön stabilite skoru ekleniyor.
- [ ] Ağır kutunun üstte kalması için ceza veya mutlak kural.
- [ ] Palet taşıma kapasitesi ve dinamik taşıma sınırları.
- Toplam ağırlık merkezi:

  `COM = Σ(ağırlık × kutu merkez koordinatı) / Σ(ağırlık)`

- Yatay merkezden sapma, alçak ağırlık merkezi ve destek oranı raporlanacak.
- Sağ panele `COM X/Y`, `COM yüksekliği`, `toplam ağırlık` ve `stabilite skoru` eklenecek.
- Ağır kutunun üstte kalması için ceza veya kural uygulanacak.

### Faz 3 — Çok amaçlı genetik algoritma

Durum: Başlandı.

- [x] Katman/seviye başına ağırlık sıralı `%150` taban alanı aday havuzu
- [x] Yerleşmeyen adayların sonraki seviyede yeniden değerlendirilmesi
- [x] Sıra için OX çaprazlama ve swap mutasyonu
- [x] Kutu başına 0°/90° yön geni ve yön mutasyonu
- [x] Yerleşen adet, hacim, COM, destek ve ağır/hafif ortalama yüksekliğiyle uygunluk puanı
- [ ] Kromozoma temas noktası tercihi eklenmesi
- [ ] Çok amaçlı Pareto sıralaması (NSGA-II)

Önerilen kromozom:

1. **Yerleştirme sırası:** Kutu örneklerinin permütasyonu.
2. **Yönelim geni:** Kutu başına `0°/90°`; izin varsa altı fiziksel yönelimden biri.
3. **Yerleştirme tercihi:** Decoder'ın ürettiği geçerli temas noktaları arasındaki seçim.

Önerilen operatörler:

- Sıra için order crossover (OX) veya PMX.
- Yönelim için kategorik çaprazlama ve mutasyon.
- Sıra için swap/inversion mutasyonu.
- Elitizm ve çok amaçlı Pareto sıralaması (NSGA-II) veya kısıt öncelikli puanlama.

Öncelik sırası:

1. Geçersiz/çakışan çözümü ele.
2. Yerleştirilen sipariş miktarını artır.
3. Hacim doluluğunu artır.
4. Ağırlık merkezi sapmasını ve yüksekliğini azalt.
5. Destek/stabiliteyi artır.

### Faz 4 — Yerel arama ve performans

- Kutu takası, yönelim çevirme ve katmanı yeniden düzenleme hamleleri.
- Büyük listelerde aday yerleşim noktalarının önbelleklenmesi.
- GA ilerleme, iptal ve en iyi çözümün ara gösterimi.
- Küçük örnekler için CP-SAT/karma tamsayılı programlama ile karşılaştırma.

### Faz 5 — Robot entegrasyonu

Yerleşim planı onaylandıktan sonra, robot için her kutuda şu adımlar çıkarılacak:

`yaklaş → al → kaldır → palete yaklaş → bırak → geri çekil`

- Kutu merkezi, yönelimi ve taban/üst yaklaşım pozları üretilecek.
- Robot erişim sınırı, ters kinematik ve çarpışma kontrolü ayrı katmanda doğrulanacak.
- Robot yörüngesi optimizasyonu, palet yerleşiminden sonra ele alınacak.

## Önemli mimari ilkeler

- Kromozom doğrudan koordinat saklamaz; koordinatlar decoder tarafından üretilir.
- Decoder, fiziksel kısıtları kesin uygular; GA yalnızca karar uzayını arar.
- Robot güvenliği, gerçek robot üretici modeli ve sahada doğrulama gerektirir.
- Büyük çözümlerde GA tek başına değil, geometrik decoder ve yerel arama ile hibrit çalışmalıdır.

