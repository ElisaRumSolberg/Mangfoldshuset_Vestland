# QA ve güvenlik denetimi — 30 Eylül 2026

- Dal: `audit/qa-security-2026-09-30`. Başlangıçtaki 20 değiştirilmiş dosya korunur; otomatik commit/push/deploy yok.
- Başlangıç: sürümler, route envanteri, mevcut Vitest/lint/TypeScript sonuçları.
- Güvenlik: fail-closed roller, server actions, RLS SQL, anonim kayıt sınırları, upload, cron, sırlar ve HTTP başlıkları.
- İşlev: form doğrulama/kayıt hatası/ağ hatası, yetkisiz ve yetkili işlemler için sentetik mock regresyonları.
- Tarayıcı: 360/390/768/1440 genişlikler, menü/link/görsel/console/axe kontrolleri. Canlı ortamda yalnızca GET ve gezinme; form gönderimi yok.
- Sonuç: production build, testlerin tekrar çalıştırılması, kanıtlar ve Türkçe rapor.
- İzole Supabase/Auth/Resend hesabı yoksa gerçek yazma, e-posta, ödeme ve RLS entegrasyon testleri engellenmiş olarak işaretlenir. Canlı SQL uygulanmaz.
