// Faste meldinger for admin-panelet. Adressen bærer bare en kode (?ok=... / ?feil=...),
// aldri fritekst, slik at ingen kan vise egne tekster i admin via en lenke.

export const FLASH_OK = {
  lagret: "Lagret. Endringen er nå på nettsiden.",
  "lagt-til": "Lagt til.",
  slettet: "Slettet.",
  kvittering: "Kvitteringen er sendt på e-post til medlemmet.",
  "fornyelse-sendt": "E-posten om å fornye medlemskapet er sendt.",
  "utlegg-sendt": "Utlegget er sendt inn. Regnskapsføreren har fått en kopi.",
  "utlegg-behandlet": "Statusen er oppdatert.",
  betalt: "Registrert som betalt. Betalingen står i oversikten Betalinger, og medlemskapet gjelder ut medlemsåret.",
} as const;

export const FLASH_ERR = {
  generell:
    "Noe gikk galt, og endringen ble ikke lagret. Prøv igjen. Skjer det flere ganger, kontakt den som har ansvar for nettsiden.",
  "ingen-endring":
    "Endringen ble ikke lagret. Du har kanskje ikke tilgang til å endre dette. Prøv å logge ut og inn igjen.",
  "navn-finnes": "Det finnes allerede et utvalg med et nesten likt navn. Velg et annet navn.",
  "mangler-navn": "Skriv inn et navn før du lagrer.",
  "mangler-pdf":
    "Du må laste opp en PDF-fil først. Vent til det står at filen er lastet opp, og trykk deretter «Legg til».",
  "allerede-betalt":
    "Dette medlemmet har allerede betalt for denne perioden. Ingen ny betaling ble registrert.",
  "ingen-mottakere":
    "Ingen e-poster ble sendt. Alle utløpte medlemmer har enten fått en forespørsel de siste 14 dagene, eller mangler e-postadresse.",
  "mangler-adresse": "Skriv inn adressen din. Den står på utleggsskjemaet.",
  "ugyldig-postnummer": "Postnummeret må være fire siffer, for eksempel 5161.",
  "ugyldig-konto": "Kontonummeret må være 11 siffer og gyldig, for eksempel 1234.56.78903. Sjekk at du har skrevet det riktig.",
  "mangler-signatur": "Skriv under i feltet for underskrift før du sender.",
  "mangler-bekreftelse": "Huk av for at opplysningene er riktige før du sender.",
  "ugyldig-dato": "Datoen mangler eller er i fremtiden. Velg datoen du betalte.",
  "mangler-formal": "Skriv hva utlegget gjelder, for eksempel «Workshop» eller «Torsdagssuppe».",
  "ugyldig-kurs": "Skriv inn kursen som et tall, for eksempel 5. Den må være større enn 0.",
  "ingen-linjer": "Legg inn minst én linje med hva som ble kjøpt.",
  "ugyldig-linje": "En av linjene mangler antall eller pris, eller har et ugyldig tall. Sjekk linjene og prøv igjen.",
  "mangler-kvittering": "Legg ved bilde eller PDF av kvitteringen, eller huk av for at du ikke har kvittering.",
  "mangler-felt": "Noen obligatoriske felt manglet. Fyll ut feltene som er merket med stjerne (*).",
  "ugyldig-epost": "E-postadressen ser ikke riktig ut. Den skal se slik ut: navn@eksempel.no.",
  "ugyldig-dato-felt": "En dato mangler eller finnes ikke. Velg datoen i kalenderfeltet.",
  "ugyldig-fodselsdato": "Fødselsdatoen er ikke gyldig eller er i fremtiden. Sjekk dag, måned og år.",
  "slutt-for-start": "Slutten kommer før starten. Sjekk dato og klokkeslett for start og slutt.",
  "ugyldig-avlyst-dato": "En av de avlyste datoene er skrevet feil. Skriv dem slik: 2026-12-24, 2026-12-31.",
  "ugyldig-tall": "Et tallfelt har en ugyldig verdi. Bruk tall fra 0 og oppover, innenfor grensene i feltet.",
} as const;

export type FlashOk = keyof typeof FLASH_OK;
export type FlashErr = keyof typeof FLASH_ERR;
