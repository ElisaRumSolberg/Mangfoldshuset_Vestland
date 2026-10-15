import Link from "next/link";

const sections = [
  { id: "giris", title: "Giriş ve çıkış" },
  { id: "aktivite", title: "Aktivite ekleme" },
  { id: "sonrasi", title: "Etkinlikten sonra: «Slik gikk det»" },
  { id: "gorseller", title: "Fotoğraf ve dosyalar" },
  { id: "sabit", title: "Sabit programlar (haftalık / aylık)" },
  { id: "utvalg", title: "Utvalg (komiteler)" },
  { id: "haberler", title: "Haberler ve Mangfoldsposten" },
  { id: "uyeler", title: "Üyeler (sadece yönetici)" },
  { id: "mesajlar", title: "Mesajlar ve başvurular (sadece yönetici)" },
  { id: "anasayfa", title: "Ana sayfa görselleri, Vipps ve istatistik" },
  { id: "sorun", title: "Bir şey ters giderse" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-6">
      <h2 className="font-serif text-xl font-medium text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function HjelpTr() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Admin nasıl kullanılır?</h1>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">
        Siteyi güncelleyenler için basit bir rehber. Okuyarak veya deneyerek bir şeyi bozamazsın:
        bir şey silinmeden önce her zaman onay sorulur. Her işlemden sonra sayfanın üstünde yeşil
        bir mesaj çıkar ve işlemin başarılı olduğunu gösterir. Sitedeki yazılar Norveççe
        kalır; bu rehber sadece kullanım içindir.
      </p>

      <nav aria-label="İçindekiler" className="mt-6 rounded-2xl border border-line bg-cream p-5">
        <p className="text-sm font-semibold text-ink">Şuraya git</p>
        <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex min-h-11 items-center text-sm font-medium text-green-dark underline-offset-2 hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="giris" title="Giriş ve çıkış">
        <ol className="list-decimal space-y-1.5 pl-6">
          <li>
            Tarayıcıda <strong>mangfoldshusetvestland.no/admin</strong> adresine git.
          </li>
          <li>E-posta ve şifreni yaz, «Logg inn» düğmesine bas.</li>
          <li>İşin bitince sağ üstteki «Logg ut» düğmesine bas.</li>
        </ol>
        <p>
          <strong>Şifreni mi unuttun?</strong> Giriş sayfasında «Glemt passord?» bağlantısına bas.
          E-postana bir bağlantı gelir. Bağlantıya tıkla ve en az 12 karakterlik yeni bir şifre
          seç. Yeni şifre eskisinden farklı olmalı.
        </p>
        <p>
          <strong>Dil:</strong> Sağ üstteki NO ve TR düğmeleri yönetim panelini Norveççe veya
          Türkçe yapar. Ziyaretçilerin gördüğü site her zaman Norveççedir.
        </p>
        <p>
          Sadece yetkin olan bölümleri görürsün. «Redaktør» içerik düzenleyebilir. «Utvalg» sadece
          kendi komitesini düzenleyebilir.
        </p>
      </Section>

      <Section id="aktivite" title="Aktivite ekleme">
        <ol className="list-decimal space-y-1.5 pl-6">
          <li>
            Menüden <strong>Aktiviteter</strong>’e bas.
          </li>
          <li>
            Üstteki formu doldur: başlık, kategori, tarih, yer ve kısa açıklama. Saat, fiyat ve
            fotoğraf isteğe bağlıdır.
          </li>
          <li>
            Bir veya birkaç <strong>kategori</strong> seç. Komitelerin kullandığı bir kelimeyi
            (örneğin «ungdom») seçersen aktivite otomatik olarak o komitenin sayfasında görünür.
          </li>
          <li>
            İnsanlar kayıt olabilsin istiyorsan «Åpne for påmelding» kutusunu işaretle. En üstte
            göstermek için «Fremhevet» kutusunu işaretle.
          </li>
          <li>«Legg til aktivitet» düğmesine bas. Üstte yeşil bir onay çıkar.</li>
        </ol>
        <p>
          <strong>Düzenleme veya silme:</strong> formun altındaki listede «Rediger» düzenler,
          «Slett» siler. Slett her zaman emin olup olmadığını sorar.
        </p>
        <p>
          <strong>Kayıt olanlar:</strong> aktiviteyi «Rediger» ile aç. En altta kayıt olan herkes
          ad, e-posta ve telefonuyla görünür.
        </p>
      </Section>

      <Section id="sonrasi" title="Etkinlikten sonra: «Slik gikk det»">
        <p>
          Aktiviteyi «Rediger» ile aç ve <strong>Slik gikk det</strong> kutusunu bul. Burada şunlar
          yazılır:
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Antall deltakere</strong> (katılımcı sayısı): ana sayfadaki sayıya otomatik
            eklenir.
          </li>
          <li>
            <strong>Oppsummering</strong> (özet): ne olduğunu anlatan birkaç cümle.
          </li>
          <li>
            <strong>Tilbakemeldinger</strong> (geri bildirimler): her satıra bir cümle (satırlar
            arasında Enter’a bas). Sadece katılımcıların gerçekten söylediklerini yaz, isim
            yazma.
          </li>
          <li>
            <strong>Bilder</strong> (fotoğraflar): sadece fotoğraftaki herkesin izin verdiği
            fotoğrafları ekle. Çocuklar için ebeveynin izni gerekir.
          </li>
        </ul>
        <p>En altta «Lagre endringer» düğmesine basmayı unutma.</p>
      </Section>

      <Section id="gorseller" title="Fotoğraf ve dosyalar">
        <ol className="list-decimal space-y-1.5 pl-6">
          <li>«Velg fil» (veya «Choose file») düğmesine bas ve bilgisayardan dosyayı seç.</li>
          <li>
            Alanın altında <strong>«✓ … er lastet opp»</strong> yazısını bekle. Büyük dosyalar
            biraz sürebilir.
          </li>
          <li>
            Ancak ondan sonra «Legg til» veya «Lagre» düğmesine bas. Erken basarsan tarayıcı
            yükleme bitmedi diye uyarır.
          </li>
        </ol>
        <p>
          Dosyalar en fazla 50 MB olabilir. Çok büyükse açık bir mesaj çıkar. Normal fotoğraflar
          (JPG veya PNG) ve Mangfoldsposten için PDF kullan.
        </p>
      </Section>

      <Section id="sabit" title="Sabit programlar (haftalık / aylık)">
        <p>
          Düzenli olan şeyler için kullanılır, örneğin her cuma Barseltreff. Programı bir kez
          eklersin, site tarihleri kendisi hesaplar.
        </p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Hvor ofte:</strong> «Hver uke» (her hafta) veya «Hver måned» (her ay). Gün
            seç. Aylık için ayın hangi haftası olduğunu da seç (örneğin «siste søndag», yani
            son pazar).
          </li>
          <li>
            <strong>Avlyste datoer</strong> (iptal tarihleri): tarihi YYYY-AA-GG biçiminde yaz,
            örneğin{" "}
            <code className="rounded bg-cream-2 px-1.5 py-0.5">2026-12-25</code>. Birden fazla
            tarihi virgülle ayır.
          </li>
          <li>
            <strong>Vis på nettsiden:</strong> programı silmeden gizlemek için işareti kaldır.
          </li>
        </ul>
      </Section>

      <Section id="utvalg" title="Utvalg (komiteler)">
        <p>
          Her komitenin kendi sayfası vardır. Menüde <strong>Utvalg</strong> bölümünde açıklamayı,
          fotoğrafları ve bağlantıları değiştirebilirsin.
        </p>
        <p>
          <strong>«Vis deres aktiviteter»</strong> alanı önemlidir: aktivitelerde kategori olarak
          kullandığın aynı kelimeyi yaz (örneğin «ungdom»). O kelimeyi taşıyan aktiviteler
          fotoğraf ve geri bildirimleriyle komitenin sayfasında görünür. Kelimeyi farklı yazarsan
          liste boş kalır.
        </p>
      </Section>

      <Section id="haberler" title="Haberler ve Mangfoldsposten">
        <p>
          <strong>Nyheter (haberler):</strong> başlık ve kısa bir özet yaz, istersen fotoğraf seç
          ve «Legg til» düğmesine bas. En yenisi sitede en üstte görünür.
        </p>
        <p>
          <strong>Mangfoldsposten:</strong> başlık yaz (örneğin «Høst 2026»), tarihi seç,
          kapak fotoğrafını ve PDF’yi yükle, «Publiser utgave» düğmesine bas. Önce PDF’nin
          yüklenmesini bekle.
        </p>
      </Section>

      <Section id="uyeler" title="Üyeler (sadece yönetici)">
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            Üstteki <strong>filtreler</strong> aktif, yakında bitecek, süresi dolmuş ve ödememiş
            üyeleri gösterir.
          </li>
          <li>
            <strong>Marker betalt / Forny (+1 år)</strong> ödemeyi kaydeder ve bitiş tarihini bir
            yıl ileri alır.
          </li>
          <li>
            <strong>Legg til eksisterende medlem</strong>, zaten ödeme yapmış ama kayıtlı
            olmayan kişiler içindir.
          </li>
          <li>
            <strong>Oversikt</strong> (ilk sayfa) takip edilmesi gereken üyeleri gösterir; ara veya
            e-posta gönder düğmeleri vardır.
          </li>
          <li>
            <strong>Arama</strong> ad, e-posta, telefon veya aile üyesi adına göre üye bulur.
          </li>
          <li>
            <strong>Görünüm:</strong> «Medlemskap» her üyelik için bir kart gösterir (aile üyeleri
            altında). «Hver person for seg» herkesi tek tek, yaşı ve cinsiyetiyle gösterir.
          </li>
          <li>
            <strong>Rediger</strong> ad, iletişim bilgileri, doğum tarihi, cinsiyet ve aile
            üyelerini düzeltmeni sağlar. Doğum tarihi veya cinsiyeti eksik eski üyeler için
            kullan.
          </li>
          <li>
            Üstteki <strong>yaşa ve cinsiyete göre istatistik</strong> her yaş grubundaki sayıyı,
            26 yaş altı ve 6–25 yaş arası kişi sayısını gösterir. Destek kurumlarına rapor için
            kullanılır.
          </li>
          <li>
            Ödeme yapmamış yeni üyelere 3. ve 14. günde otomatik e-posta hatırlatması gider.
          </li>
        </ul>
      </Section>

      <Section id="mesajlar" title="Mesajlar ve başvurular (sadece yönetici)">
        <p>
          <strong>Meldinger</strong>, iletişim formundan yazılanlardır. Bir kopyası e-postana da
          gelir.
        </p>
        <p>
          <strong>Søknader</strong>, «Bli med» sayfasından gelen gönüllü, fikir ve işbirliği
          önerileridir. E-posta veya telefonla cevap ver, sonra sil.
        </p>
      </Section>

      <Section id="anasayfa" title="Ana sayfa görselleri, Vipps ve istatistik">
        <p>
          <strong>Innhold</strong> bölümünde ana sayfadaki ve «Om oss» sayfasındaki fotoğrafları
          değiştirirsin. Afişler için hazır bağlantılar ve QR kodlar da burada.
        </p>
        <p>
          <strong>Vipps:</strong> Vipps’ten bir bağlantı (https:// ile başlar) aldığında
          «Lenke til Vipps innsamling» alanına yapıştır ve «Lagre» düğmesine bas. Sitede «Gi
          med Vipps» düğmesi çıkar.
        </p>
        <p>
          <strong>Statistikk</strong> (sadece yönetici), ana sayfadaki «Samfunnsinnsats»
          sayılarını gösterir. Katılımcı sayısı aktivitelerden otomatik hesaplanır; sadece başka
          yerde kayıtlı olmayanları eklersin.
        </p>
      </Section>

      <Section id="sorun" title="Bir şey ters giderse">
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong>Üstte kırmızı mesaj:</strong> metni oku, ne yapman gerektiğini söyler. Tekrar
            dene; yetkin yok diyorsa çıkış yapıp tekrar gir.
          </li>
          <li>
            <strong>«Noe gikk galt» sayfası:</strong> hiçbir şey silinmedi. «Prøv igjen»
            düğmesine bas. Tekrar olursa siteden sorumlu kişiye mesaj at ve sayfadaki hata
            kodunu yaz.
          </li>
          <li>
            <strong>Değişiklik sitede görünmüyor:</strong> birkaç dakika bekle ve sayfayı yenile
            (bilgisayarda F5, telefonda aşağı çek).
          </li>
          <li>
            <strong>Yanlışlıkla sildin:</strong> admin’den geri alınamaz. Siteden sorumlu kişiye
            hemen haber ver.
          </li>
        </ul>
        <p className="pt-2">
          <Link href="/admin" className="font-semibold text-green-dark underline">
            Oversikt sayfasına dön
          </Link>
        </p>
      </Section>
    </div>
  );
}
