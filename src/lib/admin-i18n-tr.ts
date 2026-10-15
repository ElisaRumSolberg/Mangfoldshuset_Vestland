// Tyrkisk ordliste for admin-panelet. Nøkkelen er den norske teksten slik den står i koden;
// mangler en nøkkel, vises norsk tekst. Plassholdere som {n} byttes ut ved visning.

const DAY_NAMES: [string, string][] = [
  ["søndag", "pazar"],
  ["mandag", "pazartesi"],
  ["tirsdag", "salı"],
  ["onsdag", "çarşamba"],
  ["torsdag", "perşembe"],
  ["fredag", "cuma"],
  ["lørdag", "cumartesi"],
];
const NTH_NAMES: [string, string][] = [
  ["Første", "Ayın ilk"],
  ["Andre", "Ayın ikinci"],
  ["Tredje", "Ayın üçüncü"],
  ["Fjerde", "Ayın dördüncü"],
  ["Siste", "Ayın son"],
];

// «Hver fredag», «Første fredag i måneden» (se whenText i recurring.ts) og ukedagene i listene.
const generated: Record<string, string> = {};
for (const [no, tr] of DAY_NAMES) {
  generated[`Hver ${no}`] = `Her ${tr}`;
  generated[no[0].toUpperCase() + no.slice(1)] = tr[0].toLocaleUpperCase("tr") + tr.slice(1);
  for (const [nno, ntr] of NTH_NAMES) {
    generated[`${nno} ${no} i måneden`] = `${ntr} ${tr} günü`;
  }
}

export const TR: Record<string, string> = {
  ...generated,

  // Meny
  Oversikt: "Genel bakış",
  Medlemmer: "Üyeler",
  Innhold: "İçerik",
  Aktiviteter: "Etkinlikler",
  "Faste tilbud": "Sabit programlar",
  Utvalg: "Komiteler",
  Nyheter: "Haberler",
  Mangfoldsposten: "Mangfoldsposten (dergi)",
  Meldinger: "Mesajlar",
  Søknader: "Başvurular",
  Statistikk: "İstatistik",
  Hjelp: "Yardım",
  Start: "Başlangıç",
  Nettsiden: "Web sitesi",
  Folk: "Kişiler",
  Annet: "Diğer",
  Hovedmeny: "Ana menü",
  Admin: "Yönetim",
  "Admin – Logg inn": "Yönetim – Giriş",
  Redaktør: "Editör",
  "Mangfoldshuset Vestland": "Mangfoldshuset Vestland",
  "Logg ut": "Çıkış yap",
  "Til admin": "Yönetime dön",

  // Giriş / şifre
  "E-post": "E-posta",
  Passord: "Şifre",
  "Logg inn": "Giriş yap",
  "Logger inn…": "Giriş yapılıyor…",
  "Glemt passord?": "Şifreni mi unuttun?",
  "Skriv inn e-postadressen din først.": "Önce e-posta adresini yaz.",
  "Hvis adressen er registrert, har vi sendt en lenke for nytt passord.":
    "Adres kayıtlıysa, yeni şifre için bir bağlantı gönderdik.",
  "Feil e-post eller passord.": "E-posta veya şifre yanlış.",
  Vis: "Göster",
  Skjul: "Gizle",
  passordet: "",
  "Nytt passord": "Yeni şifre",
  "Nytt passord (minst 12 tegn)": "Yeni şifre (en az 12 karakter)",
  "Lagre passord": "Şifreyi kaydet",
  "Lagrer…": "Kaydediliyor…",
  "Passordet må være minst 12 tegn.": "Şifre en az 12 karakter olmalı.",
  "Det nye passordet må være forskjellig fra det gamle.": "Yeni şifre eskisinden farklı olmalı.",
  "Passordet ble avvist: {error}": "Şifre kabul edilmedi: {error}",
  "Kunne ikke lagre passordet ({error}). Be om en ny lenke og prøv igjen.":
    "Şifre kaydedilemedi ({error}). Yeni bir bağlantı iste ve tekrar dene.",
  "Åpne lenken fra e-posten for å velge nytt passord. Har lenken utløpt, kan du be om en ny på":
    "Yeni şifre seçmek için e-postadaki bağlantıyı aç. Bağlantının süresi dolduysa şuradan yenisini isteyebilirsin:",
  innloggingssiden: "giriş sayfası",

  // Bildirimler
  "Lagret. Endringen er nå på nettsiden.": "Kaydedildi. Değişiklik artık sitede.",
  "Lagt til.": "Eklendi.",
  "Slettet.": "Silindi.",
  "Registrert som betalt. Medlemskapet gjelder nå ett år fra utløpsdatoen.":
    "Ödeme kaydedildi. Üyelik bitiş tarihinden itibaren bir yıl daha geçerli.",
  "Noe gikk galt, og endringen ble ikke lagret. Prøv igjen. Skjer det flere ganger, kontakt den som har ansvar for nettsiden.":
    "Bir şeyler ters gitti ve değişiklik kaydedilmedi. Tekrar dene. Tekrar olursa siteden sorumlu kişiye haber ver.",
  "Endringen ble ikke lagret. Du har kanskje ikke tilgang til å endre dette. Prøv å logge ut og inn igjen.":
    "Değişiklik kaydedilmedi. Bunu değiştirme yetkin olmayabilir. Çıkış yapıp tekrar girmeyi dene.",
  "Det finnes allerede et utvalg med et nesten likt navn. Velg et annet navn.":
    "Neredeyse aynı isimde bir komite zaten var. Başka bir isim seç.",
  "Skriv inn et navn før du lagrer.": "Kaydetmeden önce bir isim yaz.",
  "Du må laste opp en PDF-fil først. Vent til det står at filen er lastet opp, og trykk deretter «Legg til».":
    "Önce bir PDF dosyası yüklemelisin. Dosyanın yüklendiği yazana kadar bekle, sonra «Legg til» düğmesine bas.",
  "Noen obligatoriske felt manglet. Fyll ut feltene som er merket med stjerne (*).":
    "Bazı zorunlu alanlar eksikti. Yıldızlı (*) alanları doldur.",
  "Lukk meldingen": "Mesajı kapat",

  // Hata sayfası
  "Noe gikk galt": "Bir şeyler ters gitti",
  "Det ble ikke noe av dette. Ingenting er slettet. Har du hatt siden åpen en stund, kan den være utdatert: trykk «Last siden på nytt» og prøv igjen. Hvis det skjer flere ganger, send en melding til den som har ansvar for nettsiden og oppgi koden under.":
    "İşlem tamamlanamadı. Hiçbir şey silinmedi. Sayfa uzun süre açık kaldıysa eskimiş olabilir: «Last siden på nytt» düğmesine basıp tekrar dene. Tekrar olursa siteden sorumlu kişiye mesaj at ve aşağıdaki kodu yaz.",
  "Feilkode:": "Hata kodu:",
  "Last siden på nytt": "Sayfayı yenile",
  "Prøv igjen": "Tekrar dene",

  // Genel
  Rediger: "Düzenle",
  Slett: "Sil",
  "Slett {what}": "{what} öğesini sil",
  "Vil du slette «{what}»?": "«{what}» silinsin mi?",
  "Dette kan ikke angres.": "Bu işlem geri alınamaz.",
  "Legg til": "Ekle",
  Lagre: "Kaydet",
  "Lagre endringer": "Değişiklikleri kaydet",
  "Lagre bilder": "Fotoğrafları kaydet",
  Forrige: "Önceki",
  Neste: "Sonraki",
  av: "/",
  Fjern: "Kaldır",
  "Fjern bildet": "Fotoğrafı kaldır",
  Skjult: "Gizli",
  Bilde: "Fotoğraf",
  "Bilde {n}": "Fotoğraf {n}",
  Bilder: "Fotoğraflar",
  Plakat: "Afiş",
  "Plakat (valgfritt)": "Afiş (isteğe bağlı)",
  "Ny plakat (valgfritt – erstatter gjeldende)": "Yeni afiş (isteğe bağlı – mevcut olanın yerine geçer)",
  "Nytt bilde (valgfritt – erstatter gjeldende)": "Yeni fotoğraf (isteğe bağlı – mevcut olanın yerine geçer)",
  "Ny video (valgfritt – erstatter gjeldende)": "Yeni video (isteğe bağlı – mevcut olanın yerine geçer)",
  "Nytt forsidebilde (valgfritt – erstatter gjeldende)": "Yeni kapak fotoğrafı (isteğe bağlı – mevcut olanın yerine geçer)",
  "Ny PDF (valgfritt – erstatter gjeldende)": "Yeni PDF (isteğe bağlı – mevcut olanın yerine geçer)",
  "Video (valgfritt)": "Video (isteğe bağlı)",
  "Fremhevet": "Öne çıkarılmış",
  Tittel: "Başlık",
  Beskrivelse: "Açıklama",
  Navn: "Ad",
  Telefon: "Telefon",
  "Telefon (valgfritt)": "Telefon (isteğe bağlı)",
  Sted: "Yer",
  "Pris (valgfritt)": "Fiyat (isteğe bağlı)",
  "Gratis, eller 100 kr": "Ücretsiz veya 100 kr",
  "Klokkeslett (valgfritt)": "Saat (isteğe bağlı)",
  Startdato: "Başlangıç tarihi",
  "Sluttdato (valgfritt – for flerdagers aktiviteter)": "Bitiş tarihi (isteğe bağlı – birkaç günlük etkinlikler için)",
  "Kort beskrivelse": "Kısa açıklama",
  "Lenke til Facebook/Instagram-innlegg (valgfritt)": "Facebook/Instagram gönderisine bağlantı (isteğe bağlı)",
  "Lenke til Facebook/Instagram (valgfritt)": "Facebook/Instagram bağlantısı (isteğe bağlı)",
  "Lenke til Facebook (valgfritt)": "Facebook bağlantısı (isteğe bağlı)",
  "Lenke til Instagram (valgfritt)": "Instagram bağlantısı (isteğe bağlı)",
  "Ansvarlig (valgfritt – vises nederst på aktiviteten)":
    "Sorumlu kişi (isteğe bağlı – etkinliğin en altında görünür)",
  "Ansvarlig (valgfritt – vises nederst på kortet)": "Sorumlu kişi (isteğe bağlı – kartın en altında görünür)",
  "Kategori (velg én eller flere)": "Kategori (bir veya birkaç tane seç)",
  "Ny kategori …": "Yeni kategori …",
  "Fjern kategorien {tag}": "«{tag}» kategorisini kaldır",
  "Velg minst én kategori.": "En az bir kategori seç.",
  "Åpne for påmelding – vis skjema på aktivitetens side":
    "Kayda açık – etkinlik sayfasında kayıt formunu göster",
  "Fremhevet – vis øverst i «Kommende aktiviteter»": "Öne çıkar – «Kommende aktiviteter» listesinin en üstünde göster",
  "Fremhevet – vis øverst (til du fjerner haken)": "Öne çıkar – en üstte göster (işareti kaldırana kadar)",
  "Vis bilde i karusellen på forsiden": "Fotoğrafı ana sayfadaki kaydırmalı bölümde göster",
  "Hvilke bilder skal vises i karusellen på forsiden? (velg én eller flere – ingen valgt = automatisk)":
    "Ana sayfadaki kaydırmalı bölümde hangi fotoğraflar gösterilsin? (bir veya birkaç tane seç – hiçbiri seçilmezse otomatik)",
  "Legg til aktivitet": "Etkinlik ekle",
  "Rediger aktivitet": "Etkinliği düzenle",
  "← Tilbake til aktiviteter": "← Etkinliklere dön",
  "← Tilbake til faste tilbud": "← Sabit programlara dön",
  "← Tilbake til nyheter": "← Haberlere dön",
  "← Tilbake til utvalg": "← Komitelere dön",
  "← Tilbake til Mangfoldsposten": "← Mangfoldsposten'e dön",
  "Ingen aktiviteter ennå.": "Henüz etkinlik yok.",
  Påmeldte: "Kayıt olanlar",
  "({n} – {p} personer)": "({n} kayıt – {p} kişi)",
  person: "kişi",
  personer: "kişi",
  "påmeldingen fra {name}": "{name} kişisinin kaydı",
  "Ingen påmeldte ennå.": "Henüz kayıt yok.",
  "Påmeldinger og bilder for aktiviteten forsvinner også.":
    "Etkinliğin kayıtları ve fotoğrafları da silinir.",
  "Slik gikk det (fylles ut etter arrangementet)": "Nasıl geçti (etkinlikten sonra doldurulur)",
  "Antall deltakere": "Katılımcı sayısı",
  "Telles automatisk med i «Deltakere» på forsiden.": "Ana sayfadaki «Deltakere» sayısına otomatik eklenir.",
  "Oppsummering (hva skjedde?)": "Özet (ne oldu?)",
  "Skriv noen få setninger om hva som skjedde. Vises på aktivitetens side og på utvalgets side.":
    "Ne olduğunu birkaç cümleyle yaz. Etkinliğin sayfasında ve komitenin sayfasında görünür.",
  "Tilbakemeldinger (ett utsagn per linje – uten navn)": "Geri bildirimler (her satıra bir cümle – isim yazma)",
  "Trykk Enter for å starte en ny linje. Hver linje blir ett sitat på nettsiden. Skriv bare det deltakerne faktisk har sagt.":
    "Yeni satır için Enter'a bas. Her satır sitede bir alıntı olur. Sadece katılımcıların gerçekten söylediklerini yaz.",
  "Veldig hyggelig, vi kommer igjen!\nFint å møte naboer.":
    "Çok güzeldi, tekrar geleceğiz!\nKomşularla tanışmak güzeldi.",
  "Bilder (bare bilder der alle avbildede har samtykket – foresatte for barn)":
    "Fotoğraflar (sadece fotoğraftaki herkesin izin verdiği fotoğraflar – çocuklar için ebeveyn izni)",

  // Dosya yükleme
  "Filen er {mb} MB. Maks er {max} MB.": "Dosya {mb} MB. En fazla {max} MB olabilir.",
  "Laster opp {name} ({mb} MB) …": "{name} yükleniyor ({mb} MB) …",
  "Vent til opplastingen er ferdig.": "Yüklemenin bitmesini bekle.",
  "Opplastingen feilet: {error}. Velg filen på nytt.": "Yükleme başarısız: {error}. Dosyayı yeniden seç.",
  "✓ {name} er lastet opp": "✓ {name} yüklendi",
  "Laster opp bilde {i} av {n} …": "Fotoğraf yükleniyor: {i} / {n} …",
  "{name}: over {max} MB": "{name}: {max} MB'dan büyük",
  "✓ {n} bilde(r) lastet opp – husk å lagre endringene.":
    "✓ {n} fotoğraf yüklendi – değişiklikleri kaydetmeyi unutma.",
  "Kunne ikke laste opp: {list}": "Yüklenemedi: {list}",

  // Genel bakış
  "Deltakere totalt": "Toplam katılımcı",
  "Her ser du hva som skjer. Trenger du hjelp?": "Burada neler olduğunu görürsün. Yardım mı lazım?",
  "Les brukerveiledningen": "Kullanım rehberini oku",
  "Trenger oppfølging": "Takip gerekiyor",
  "Se alle medlemmer →": "Tüm üyeleri gör →",
  "Medlemskap som er utløpt eller utløper innen 30 dager. Ring eller send e-post ved behov.":
    "Süresi dolmuş veya 30 gün içinde dolacak üyelikler. Gerekirse ara veya e-posta gönder.",
  "Ingen medlemskap trenger oppfølging akkurat nå.": "Şu anda takip gerektiren üyelik yok.",
  "Utløpt for {n} dager siden": "{n} gün önce doldu",
  "Utløper i dag": "Bugün doluyor",
  "{n} dager igjen": "{n} gün kaldı",
  "utløpt for {n} dager siden": "{n} gün önce doldu",
  Ring: "Ara",

  // Üyeler
  "{members} medlemskap ({persons} personer) · {active} aktive · {soon} utløper snart · {expired} utløpt · {unpaid} ikke betalt":
    "{members} üyelik ({persons} kişi) · {active} aktif · {soon} yakında bitiyor · {expired} süresi dolmuş · {unpaid} ödememiş",
  "Kunne ikke hente medlemmer:": "Üyeler alınamadı:",
  "Legg til eksisterende medlem": "Mevcut bir üye ekle",
  Fornavn: "Ad",
  Etternavn: "Soyad",
  "Type medlemskap": "Üyelik türü",
  "Enkelt person (100 kr)": "Tek kişi (100 kr)",
  "Familie (150 kr)": "Aile (150 kr)",
  "Enkelt (100 kr)": "Tek kişi (100 kr)",
  "Medlemskap gjelder til (la stå tom hvis ikke betalt)": "Üyelik şu tarihe kadar geçerli (ödenmediyse boş bırak)",
  "Søk etter medlem": "Üye ara",
  "Søk på navn, e-post eller telefon": "Ad, e-posta veya telefona göre ara",
  Søk: "Ara",
  "Fjern søk": "Aramayı temizle",
  Alle: "Tümü",
  Aktive: "Aktif",
  Aktiv: "Aktif",
  "Ikke betalt": "Ödenmemiş",
  "Utløper snart": "Yakında bitiyor",
  Utløpt: "Süresi dolmuş",
  "Familie:": "Aile:",
  "Gyldig til {date} ({info})": "{date} tarihine kadar geçerli ({info})",
  "Venter på betaling (Vipps #595791)": "Ödeme bekleniyor (Vipps #595791)",
  "Forny (+1 år)": "Yenile (+1 yıl)",
  "Marker betalt": "Ödendi olarak işaretle",
  "Medlemmet og eventuelle familiemedlemmer fjernes fra medlemslisten.":
    "Üye ve varsa aile üyeleri üye listesinden kaldırılır.",
  "Ingen medlemmer funnet for «{q}».": "«{q}» için üye bulunamadı.",
  "Ingen medlemmer her.": "Burada üye yok.",
  Visning: "Görünüm",
  Medlemskap: "Üyelikler",
  "Hver person for seg": "Her kişi ayrı ayrı",
  "Familiemedlemmer ({n})": "Aile üyeleri ({n})",
  "født {date}": "doğum tarihi {date}",
  "{n} år": "{n} yaşında",
  "fødselsdato mangler": "doğum tarihi yok",
  "Fødselsdato (valgfritt)": "Doğum tarihi (isteğe bağlı)",
  Fødselsdato: "Doğum tarihi",
  "Kjønn (valgfritt)": "Cinsiyet (isteğe bağlı)",
  "Ikke oppgitt": "Belirtilmedi",
  Kvinne: "Kadın",
  Mann: "Erkek",
  "Ønsker ikke å oppgi": "Belirtmek istemiyor",
  "Adresse (valgfritt)": "Adres (isteğe bağlı)",
  Familiemedlemmer: "Aile üyeleri",
  "La navnet stå tomt for å fjerne en person. Opptil 5 personer.": "Birini kaldırmak için adı boş bırak. En fazla 5 kişi.",
  "Person {n}: navn": "Kişi {n}: ad",
  "Person {n}: fødselsdato": "Kişi {n}: doğum tarihi",
  "Person {n}: kjønn": "Kişi {n}: cinsiyet",
  "Rediger medlem": "Üyeyi düzenle",
  "← Tilbake til medlemmer": "← Üyelere dön",
  "Betalingsstatus og utløpsdato endres med «Marker betalt / Forny» i medlemslisten.": "Ödeme durumu ve bitiş tarihi, üye listesindeki «Ödendi olarak işaretle / Yenile» ile değişir.",
  "Statistikk etter alder og kjønn": "Yaşa ve cinsiyete göre istatistik",
  "Betalende medlemmer (aktive og snart utløpende)": "Ödeme yapmış üyeler (aktif ve yakında bitecekler)",
  "Alle registrerte": "Tüm kayıtlılar",
  "{n} personer totalt · under 26 år: {u} · 6–25 år: {a} · uten fødselsdato: {x}": "Toplam {n} kişi · 26 yaş altı: {u} · 6–25 yaş: {a} · doğum tarihi yok: {x}",
  Alder: "Yaş",
  Kvinner: "Kadınlar",
  Menn: "Erkekler",
  "Annet / ikke oppgitt": "Diğer / belirtilmemiş",
  Sum: "Toplam",
  "26 år og over": "26 yaş ve üzeri",
  "{g} år": "{g} yaş",
  "Teller hovedmedlem og alle familiemedlemmer. Personer uten fødselsdato er ikke med i aldersgruppene. Rediger medlemmet for å legge inn manglende opplysninger.": "Ana üye ve tüm aile üyeleri sayılır. Doğum tarihi olmayanlar yaş gruplarına dahil edilmez. Eksik bilgileri girmek için üyeyi düzenle.",
  "{n} personer vises": "{n} kişi gösteriliyor",
  "Familiemedlem av {name}": "{name} kişisinin aile üyesi",
  Hovedmedlem: "Ana üye",
  "Ingen personer her.": "Burada kişi yok.",

  // Mesajlar / başvurular
  Kontaktmeldinger: "İletişim mesajları",
  "Meldinger fra kontaktskjemaet på nettsiden. Du får også en kopi på e-post. Svar til avsenderens e-postadresse, og slett meldingen når du er ferdig.":
    "Sitedeki iletişim formundan gelen mesajlar. Bir kopyası e-postana da gelir. Gönderenin e-posta adresine cevap ver ve işin bitince mesajı sil.",
  "meldingen fra {name}": "{name} kişisinin mesajı",
  "Ingen meldinger ennå.": "Henüz mesaj yok.",
  "Frivillige, idéer og samarbeid": "Gönüllüler, fikirler ve işbirliği",
  "Dette er det folk har sendt inn via «Bli med»-siden: frivillige, idéer og forslag om samarbeid. Svar dem på e-post eller telefon. Slett når du er ferdig.":
    "Bunlar insanların «Bli med» sayfasından gönderdikleri: gönüllüler, fikirler ve işbirliği önerileri. E-posta veya telefonla cevap ver. İşin bitince sil.",
  "søknaden fra {name}": "{name} kişisinin başvurusu",
  "Ingen skjema ennå.": "Henüz başvuru yok.",
  Frivillig: "Gönüllü",
  Idé: "Fikir",
  Samarbeid: "İşbirliği",

  // Haberler / dergi
  Overskrift: "Başlık",
  "Kort sammendrag": "Kısa özet",
  Publiseringsdato: "Yayın tarihi",
  "Publiseringsdato (valgfritt – for å legge inn en nyhet med en tidligere dato)":
    "Yayın tarihi (isteğe bağlı – eski tarihli bir haber eklemek için)",
  "Publiser nyhet": "Haberi yayınla",
  "Rediger nyhet": "Haberi düzenle",
  "Ingen nyheter ennå.": "Henüz haber yok.",
  Utgivelsesdato: "Çıkış tarihi",
  "Høst 2026": "Güz 2026",
  Forsidebilde: "Kapak fotoğrafı",
  "PDF-fil av bladet": "Derginin PDF dosyası",
  "Store filer kan ta et minutt å laste opp. Vent til det står «✓ … er lastet opp» før du trykker «Publiser utgave».":
    "Büyük dosyaların yüklenmesi bir dakika sürebilir. «Publiser utgave» düğmesine basmadan önce «✓ … yüklendi» yazmasını bekle.",
  "Publiser utgave": "Sayıyı yayınla",
  "Rediger utgave": "Sayıyı düzenle",
  "Åpne PDF": "PDF'yi aç",
  "Ingen utgaver ennå.": "Henüz sayı yok.",

  // Sabit programlar
  "Aktiviteter som gjentas (hver uke eller hver måned). Datoene regnes ut automatisk og vises under «Kommende aktiviteter». Engangsarrangementer legger du inn under Aktiviteter.":
    "Tekrarlanan etkinlikler (her hafta veya her ay). Tarihler otomatik hesaplanır ve «Kommende aktiviteter» altında görünür. Tek seferlik etkinlikleri Etkinlikler bölümüne ekle.",
  "Kunne ikke hente faste tilbud:": "Sabit programlar alınamadı:",
  ". Kjør": ". Önce şunu çalıştır:",
  "supabase/tilbud.sql": "supabase/tilbud.sql",
  "supabase/utvalg.sql": "supabase/utvalg.sql",
  "i Supabase SQL Editor først.": "dosyasını Supabase SQL Editor'da.",
  "Legg til tilbud": "Program ekle",
  "Rediger tilbud": "Programı düzenle",
  "Ingen faste tilbud ennå.": "Henüz sabit program yok.",
  "neste:": "sonraki:",
  "kl.": "saat",
  "Bilder, oppsummering og tilbakemeldinger for dette tilbudet forsvinner også.":
    "Bu programın fotoğrafları, özeti ve geri bildirimleri de silinir.",
  "F.eks. Barseltreff": "Örn. Barseltreff",
  "Kort om hva tilbudet er og hvem det er for": "Programın ne olduğu ve kimler için olduğu hakkında kısa bilgi",
  "Hvor ofte": "Ne sıklıkta",
  "Hver uke": "Her hafta",
  "Hver måned": "Her ay",
  Ukedag: "Haftanın günü",
  "Hvilken uke i måneden (bare for «Hver måned», f.eks. siste søndag)":
    "Ayın hangi haftası (sadece «Hver måned» için, örn. son pazar)",
  "Starter kl.": "Başlama saati",
  "Slutter kl. (valgfritt)": "Bitiş saati (isteğe bağlı)",
  "Første dato (valgfritt, f.eks. oppstart)": "İlk tarih (isteğe bağlı, örn. başlangıç)",
  "Siste dato (valgfritt, hvis tilbudet avsluttes)": "Son tarih (isteğe bağlı, program biterse)",
  "Merknad (valgfritt)": "Not (isteğe bağlı)",
  "Ingen påmelding – bare kom": "Kayıt gerekmez – sadece gel",
  "Avlyste datoer (valgfritt – skriv ÅÅÅÅ-MM-DD, skill med komma)":
    "İptal edilen tarihler (isteğe bağlı – YYYY-AA-GG yaz, virgülle ayır)",
  "Høydepunkter (gjestebesøk, temadager osv. – ett per linje)":
    "Öne çıkanlar (konuk ziyaretleri, tema günleri vb. – her satıra bir tane)",
  "Format: DD.MM.ÅÅÅÅ: Tekst – f.eks. «17.06.2026: Besøk av Firat Bahcivan fra Mangfoldhuset Oslo». Legg til en ny linje hver gang noe skjer, i stedet for å skrive om hele oppsummeringen.":
    "Biçim: GG.AA.YYYY: Metin – örn. «17.06.2026: Mangfoldhuset Oslo'dan Firat Bahcivan'ın ziyareti». Bir şey olduğunda tüm özeti yeniden yazmak yerine yeni bir satır ekle.",
  "17.06.2026: Besøk av Firat Bahcivan fra Mangfoldhuset Oslo.\n26.04.2026: Første klesbyttedag.":
    "17.06.2026: Mangfoldhuset Oslo'dan Firat Bahcivan'ın ziyareti.\n26.04.2026: İlk kıyafet değişim günü.",
  "Bilder og tilbakemeldinger": "Fotoğraflar ve geri bildirimler",
  "Deltakere totalt så langt (samlet antall besøk)": "Şimdiye kadar toplam katılımcı (toplam ziyaret sayısı)",
  "Vis på nettsiden": "Sitede göster",
  Første: "İlk",
  Andre: "İkinci",
  Tredje: "Üçüncü",
  Fjerde: "Dördüncü",
  Siste: "Son",

  // Komiteler
  "Undergrupper i foreningen, f.eks. Kvinneutvalget og Mangfoldhuset Ungdom. Hvert utvalg får en enkel side med hva de gjør, deres aktiviteter og bilder.":
    "Derneğin alt grupları, örn. Kvinneutvalget ve Mangfoldhuset Ungdom. Her komitenin ne yaptığını, etkinliklerini ve fotoğraflarını gösteren basit bir sayfası olur.",
  "Kunne ikke hente utvalg:": "Komiteler alınamadı:",
  "Legg til utvalg": "Komite ekle",
  "Rediger utvalg": "Komiteyi düzenle",
  "Ingen utvalg ennå.": "Henüz komite yok.",
  "/utvalg/": "/utvalg/",
  "Side: /utvalg/": "Sayfa: /utvalg/",
  "Utvalgssiden på nettsiden forsvinner også. Aktivitetene dine blir værende.":
    "Sitedeki komite sayfası da silinir. Etkinliklerin kalır.",
  "F.eks. Kvinneutvalget": "Örn. Kvinneutvalget",
  "(adressen endres ikke selv om du endrer navnet)": "(isim değişse de adres değişmez)",
  "Adressen til siden lages automatisk ut fra navnet.": "Sayfanın adresi addan otomatik oluşturulur.",
  "Hva utvalget gjør": "Komitenin ne yaptığı",
  "Kort om hva utvalget er og hva de gjør": "Komitenin ne olduğu ve ne yaptığı hakkında kısa bilgi",
  "Forsidebilder (valgfritt – vises ved siden av tittelen øverst på siden; flere bilder glir automatisk over i hverandre)":
    "Kapak fotoğrafları (isteğe bağlı – sayfanın üstünde başlığın yanında görünür; birden fazla fotoğraf otomatik geçiş yapar)",
  "Vis deres aktiviteter (valgfritt – ord fra aktivitetens kategori)":
    "Komitenin etkinliklerini göster (isteğe bağlı – etkinliğin kategorisinden bir kelime)",
  "Skriv samme ord som du bruker som kategori på aktivitetene (f.eks. «ungdom»). Aktiviteter med dette ordet vises på utvalgets side. Skrives ordet annerledes, blir listen tom.":
    "Etkinliklerde kategori olarak kullandığın kelimeyi aynen yaz (örn. «ungdom»). Bu kelimeyi taşıyan etkinlikler komitenin sayfasında görünür. Kelime farklı yazılırsa liste boş kalır.",
  "f.eks. ungdom": "örn. ungdom",
  "Kontakt-e-post (valgfritt)": "İletişim e-postası (isteğe bağlı)",
  "Egen fargeprofil (valgfritt)": "Özel renk düzeni (isteğe bağlı)",
  "Bruk egne farger for denne siden (f.eks. hentet fra en logo)":
    "Bu sayfa için özel renkler kullan (örn. bir logodan alınmış)",
  "Uavhukt bruker siden standardfargene (grønn/rød).":
    "İşaretlenmezse sayfa standart renkleri (yeşil/kırmızı) kullanır.",
  "Bakgrunn, fra": "Arka plan, başlangıç",
  "Bakgrunn, til": "Arka plan, bitiş",
  "Knapper/glød": "Düğmeler/vurgu rengi",

  // İçerik / istatistik
  "Bilder som vises i stedet for det fargede designet på forsiden og Om oss-siden. Flere bilder glir automatisk over i hverandre.":
    "Ana sayfada ve Hakkımızda sayfasında renkli tasarımın yerine gösterilen fotoğraflar. Birden fazla fotoğraf otomatik geçiş yapar.",
  "Forsidebilder (hjemmesiden)": "Ana sayfa fotoğrafları",
  "Bilder til Om oss": "Hakkımızda fotoğrafları",
  "Lenke til Vipps innsamling (valgfritt)": "Vipps bağış bağlantısı (isteğe bağlı)",
  "Lim inn lenken du har fått fra Vipps (den starter med https://). Da vises en «Gi med Vipps»-knapp på nettsiden. Er feltet tomt, vises Vipps-nummeret i stedet.":
    "Vipps'ten aldığın bağlantıyı yapıştır (https:// ile başlar). Sitede «Gi med Vipps» düğmesi görünür. Alan boşsa onun yerine Vipps numarası gösterilir.",
  "Lenker og QR-koder til plakater": "Afişler için bağlantılar ve QR kodları",
  "Ferdige lenker og QR-koder til de vanligste stedene – klar til å lime inn i en plakat.":
    "En sık kullanılan yerler için hazır bağlantılar ve QR kodları – afişe yapıştırmaya hazır.",
  Hjemmeside: "Ana sayfa",
  "Bli medlem": "Üye ol",
  "Bli frivillig": "Gönüllü ol",
  Facebook: "Facebook",
  Instagram: "Instagram",
  "Lenke til plakat/QR-kode": "Afiş / QR kodu bağlantısı",
  "Kopier lenke": "Bağlantıyı kopyala",
  "✓ Kopiert": "✓ Kopyalandı",
  "Last ned QR-kode": "QR kodunu indir",
  "QR-kode – {title}": "QR kodu – {title}",
  "Tallene i «Samfunnsinnsats»-feltet på forsiden. Deltakere regnes ut automatisk fra aktivitetene dine; her legger du bare til det som ikke er registrert andre steder.":
    "Ana sayfadaki «Samfunnsinnsats» bölümündeki sayılar. Katılımcılar etkinliklerinden otomatik hesaplanır; burada sadece başka yerde kayıtlı olmayanları eklersin.",
  "Aktiviteter i år": "Bu yılki etkinlikler",
  "Antall arrangementer dere har gjennomført i år.": "Bu yıl gerçekleştirdiğiniz etkinlik sayısı.",
  "Deltakere før nettsiden / utenfor rapportene": "Siteden önceki / raporların dışındaki katılımcılar",
  "I tillegg summeres deltakere fra aktiviteter og faste tilbud automatisk (":
    "Ayrıca etkinliklerden ve sabit programlardan katılımcılar otomatik toplanır (",
  "). Forsiden viser totalt": "). Ana sayfa toplam olarak şunu gösterir:",
  "Frivillige timer": "Gönüllü saatleri",
  "Samlet antall timer frivillige har brukt.": "Gönüllülerin harcadığı toplam saat.",
};
