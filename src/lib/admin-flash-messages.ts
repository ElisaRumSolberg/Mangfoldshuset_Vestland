// Faste meldinger for admin-panelet. Adressen bærer bare en kode (?ok=... / ?feil=...),
// aldri fritekst, slik at ingen kan vise egne tekster i admin via en lenke.

export const FLASH_OK = {
  lagret: "Lagret. Endringen er nå på nettsiden.",
  "lagt-til": "Lagt til.",
  slettet: "Slettet.",
  betalt: "Registrert som betalt. Medlemskapet gjelder nå ett år fra utløpsdatoen.",
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
  "mangler-felt": "Noen obligatoriske felt manglet. Fyll ut feltene som er merket med stjerne (*).",
} as const;

export type FlashOk = keyof typeof FLASH_OK;
export type FlashErr = keyof typeof FLASH_ERR;
