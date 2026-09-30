# QA / Güvenlik Denetimi — Mangfoldshuset Vestland — 30 Eylül 2026

**Dal:** `audit/full-qa-2026-09-30-claude` (izole git worktree, `master` @ 744be03'ten türetildi)
**Not:** Bu denetim sırasında aynı repoda `audit/qa-security-2026-09-30` adlı, görünüşe göre benzer kapsamlı bir denetim çalıştıran başka bir süreç tespit edildi (kaynağı belirlenemedi — ayrı bir Claude oturumu/zamanlanmış görev değil). Kullanıcı talimatıyla o sürece dokunulmadı, bu denetim tamamen izole bir worktree'de yürütüldü.

## Yöntem
- Bağımlılıklar temiz kuruldu (`npm install`), mevcut Vitest paketi, ESLint, `tsc --noEmit` ve `next build` çalıştırıldı.
- Sunucu tarafı yetkilendirme (`auth-guard.ts`, `proxy.ts`), server actions, cron endpoint ve dosya yükleme kodu okundu.
- Canlı sitede (www.mangfoldshusetvestland.no) **yalnızca salt-okunur** gezinme ve HTTP başlık kontrolü yapıldı.
- Supabase RLS, anon anahtarla **salt-okunur SELECT** ve tek bir **kontrollü, geri alınamaz olmayan INSERT testi** (members tablosu, aşağıda açıklanıyor) ile doğrulandı.
- Form gönderimi, dosya yükleme, ödeme, e-posta gönderimi gibi veri değiştiren canlı testler **yapılmadı** (talimat gereği, izole ortam yok).
- Mobil görünüm (375px) gerçek dev server üzerinde (izole worktree, port 3100) manuel olarak test edildi.

## Bulgular

### #1 — KRİTİK: Mobilde ana navigasyon menüsü tamamen eksikti
- **Durum:** Doğrulandı, düzeltildi ve yeniden test edildi.
- **Dosya:** `src/components/NavbarClient.tsx`
- **Yeniden üretme:** Canlı siteyi 375px genişlikte aç. Üstte sadece logo ve "Bli frivillig" butonu görünüyor.
- **Beklenen:** Om oss, Utvalg, Aktiviteter, Nyheter, Kontakt gibi sayfalara mobilden ulaşılabilmeli.
- **Gerçekleşen:** `<nav>` elemanı `hidden md:flex` idi, 768px altında hiçbir alternatif (hamburger menü vs.) yoktu. Mobil ziyaretçi (muhtemelen trafiğin çoğunluğu) sadece ana sayfa ve "Bli med" sayfasına, o da yalnızca hero butonları üzerinden ulaşabiliyordu.
- **Kanıt:** `read_page` çıktısı — mobilde sadece 4 link/buton interaktifti (Hjem, Bli frivillig, Bli med, slayt butonları), 12 menü linkinden hiçbiri yoktu.
- **Etki:** Yüksek — birçok ziyaretçi Aktiviteter, Utvalg, Kontakt sayfalarını hiç bulamayabilir.
- **Düzeltme:** Hamburger buton (`md:hidden`) + tüm menü öğelerini düzleştiren, Escape ve link-tıklamasında kapanan, erişilebilir (`aria-expanded`, `aria-label`, `aria-controls`) bir açılır panel eklendi.
- **Yeniden test:** Lokal dev sunucuda 375px'de manuel doğrulandı — 12 linkin tamamı çalışıyor, konsol hatası yok. `npx eslint`, `npx tsc --noEmit`, `npx vitest run` (82/82) ve `npm run build` temiz geçti.
- **Commit:** `a9b7efa` (bu branch'te, henüz master'a alınmadı — inceleme bekliyor).

### #2 — Doğrulandı GÜVENLİ: `members` tablosunda anon INSERT (ilk bakışta endişe verici)
- **Durum:** Araştırıldı, tasarım gereği güvenli olduğu doğrulandı.
- **Test:** Anon anahtarla doğrudan `POST /rest/v1/members` çağrısı → **HTTP 201** (kayıt oluştu).
- **İlk izlenim:** Kimliksiz kullanıcı üye tablosuna yazabiliyor — ciddi görünüyor.
- **Derinlemesine inceleme:** `supabase/members.sql`'deki RLS politikası: `for insert with check (paid_at is null and expires_at is null)`. Yani anon sadece "ödenmemiş/süresi belirsiz" bir başvuru satırı oluşturabiliyor; `paid_at`/`expires_at` alanlarını kesinlikle giremiyor. SELECT/UPDATE/DELETE ayrı politikalarla sadece `owner` rolüne kapalı (anon SELECT denemesi `[]` döndü — okuma erişimi yok).
- **Sonuç:** Bu, herkese açık "Bli medlem" formunun çalışması için **kasıtlı** bir tasarım; bir güvenlik açığı değil. Tek gerçek risk: uygulama katmanındaki honeypot/rate-limit korumaları (spam-guard.ts) bu doğrudan API çağrısında devre dışı kalıyor, yani bir saldırgan formu atlayıp doğrudan API'ye çok sayıda sahte "bekleyen üyelik" kaydı gönderebilir (spam, DoS değil — admin panelini gereksiz kayıtlarla doldurabilir). Düşük öncelikli bir sertleştirme önerisi olarak not edildi, düzeltme yapılmadı (kapsam dışı/opsiyonel).
- **⚠️ Temizlik gerekli:** Test sırasında gerçek veritabanına `first_name: "QA-TEST-SIL"` adıyla 1 sahte üye başvurusu eklendi (anon anahtarla silinemedi, RLS engelliyor). **Admin panelinden (Medlemmer) elle silinmesi gerekiyor.**

### #3 — Cron endpoint (`/api/cron/paminnelser`) — güvenli ve idempotent
- **Durum:** Doğrulandı (kod incelemesi).
- Bearer token kontrolü var, `CRON_SECRET` eksikse **fail-closed** (401) davranıyor.
- Her üye için `last_reminder_for`/`last_reminder_offset` takip ediliyor — aynı milestone için tekrar çağrılsa bile **çift e-posta göndermiyor**. İyi tasarlanmış.

### #4 — Dosya yükleme — kod incelemesiyle doğrulandı, canlı test yapılmadı
- `FileUpload.tsx`: Tarayıcıdan doğrudan Supabase Storage'a yüklüyor, 50MB boyut sınırı client-side kontrol ediliyor. Gerçek yetki kontrolü **storage RLS politikalarında**: `supabase/storage.sql` + `roles-rls-fix.sql` → INSERT/DELETE sadece `owner`/`editor` rolüne (kimlik doğrulamalı), SELECT herkese açık (bu doğru, çünkü görseller public sitede gösteriliyor).
- **Engellendi:** Canlı ortamda gerçek dosya yükleme testi yapılmadı (kullanıcı talimatı: dosya yükleme testleri izole ortamda yapılmalı, izole Supabase projesi yok). Migration dosyasının canlı projeye uygulandığı **doğrulanamadı** — bu ayrı bir kontrol gerektirir.
- Not: Dosya uzantısı/içerik türü client'tan geliyor (`file.type`), sunucu tarafında gerçek içerik doğrulaması yok. Düşük risk (yükleme yetkisi zaten owner/editor ile sınırlı), ama düşük öncelikli bir sertleştirme fırsatı.

### #5 — HTTP güvenlik başlıkları — iyileştirme fırsatı
- Canlı sitede `Strict-Transport-Security` mevcut. `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` başlıkları **gözlenmedi**.
- Düşük/orta öncelik — Next.js `next.config.ts`'e `headers()` eklenerek kolayca sertleştirilebilir. Bu denetimde uygulanmadı (kapsam dışı bırakıldı, ayrı bir değişiklik olarak önerilir).

### #6 — "Vår innsats" sayaçları (0 görünmesi) — YANLIŞ ALARM, teyit edildi
- Canlı sayfa ilk yüklendiğinde sayaçlar kısa süreliğine "0" gösteriyor, birkaç saniye sonra gerçek değerlere (13 / 4.670+ / 1.820) animasyonla geçiyor. Bu, `AnimatedNumber` bileşeninin sayfa yüklenince 0'dan başlayıp saymasından kaynaklanıyor — gerçek bir hata değil. Veritabanı değerleri doğru.

### Bu oturumda daha önce düzeltilmiş olanlar (yeniden doğrulandı, hâlâ geçerli)
- "Vår historie" taslak metni → gerçek metinle değiştirildi.
- "Bli frivillig" üst menü butonu → artık doğru bölüme (`#frivillig`) gidiyor.
- "Mangfoldhuset/Mangfoldshuset" isim tutarsızlığı → "Mangfoldshuset Vestland" olarak standardize edildi.
- Om oss görseli → eklendi, `object-contain` ile düzgün gösteriliyor.

## Otomatik Kontrol Sonuçları
| Kontrol | Sonuç |
|---|---|
| Vitest (82 test) | ✅ 82/82 geçti |
| ESLint | ✅ Temiz |
| `tsc --noEmit` | ✅ Temiz (not: `.next/types` üretilmeden çalıştırılırsa `LayoutProps` için yanlış alarm verir — önce `next build` gerekir) |
| `npm audit` | ✅ 0 açık (518 bağımlılık) |
| `next build` (production) | ✅ Başarılı |

## İncelenen / İncelenemeyen Kapsam
**İncelendi:** Admin yetkilendirme (24 server action, tamamı guard'lı), public form spam/rate-limit koruması (4 form, tamamı korumalı), cron endpoint, storage RLS (kod), members/contact_messages RLS (canlı, salt-okunur+kontrollü test), HTTP başlıkları, mobil navigasyon, sayaç animasyonu, build/lint/test/audit.

**İncelenemedi / Engellendi:** Gerçek dosya yükleme (canlı test yasak, izole ortam yok), form gönderimi uçtan uca (e-posta/Resend canlı test yasak), Lighthouse/axe otomatik taraması (bu turda çalıştırılmadı — zaman kısıtı), Playwright çoklu-breakpoint taraması (mobil manuel yapıldı, 768/1440 test edilmedi), diğer admin sayfalarının (Nyheter, Tilbud, Utvalg CRUD) uçtan uca testi.

## İlk Ele Alınması Gereken Sorunlar
1. **Mobil navigasyon menüsü eksikliği** (düzeltildi, bu branch'te inceleme bekliyor — master'a alınmalı ve deploy edilmeli).
2. `QA-TEST-SIL` test kaydının `members` tablosundan admin panelinden silinmesi.
3. HTTP güvenlik başlıklarının (CSP, X-Frame-Options, X-Content-Type-Options) eklenmesi.
4. Dosya yükleme storage RLS politikalarının canlı Supabase projesinde gerçekten uygulandığının teyidi (migration dosyası var, canlıya uygulandığı doğrulanamadı).
5. 768px ve 1440px genişliklerde, ayrıca Lighthouse/axe ile daha kapsamlı bir tur (bu denetimde zaman kısıtı nedeniyle yapılamadı).

## Yayına Hazır Olma Değerlendirmesi
Site **zaten canlı ve genel olarak sağlam** (build/test/lint temiz, kritik yetkilendirme ve RLS kontrolleri doğru). Mobil menü eksikliği önemli bir kullanılabilirlik sorunuydu ve düzeltildi (henüz deploy edilmedi). Bu denetim kapsamında **kritik/yüksek düzeyde doğrulanmış bir güvenlik açığı bulunmadı** — yalnızca incelenen kapsamda; dosya yükleme ve daha geniş tarayıcı/erişilebilirlik taraması gibi alanlar test edilemedi.
