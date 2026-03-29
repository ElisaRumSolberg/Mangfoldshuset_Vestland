import { redirect } from "next/navigation";

// Kort, stabil adresse til bruk i QR-koder og plakater.
export default function MedlemRedirect() {
  redirect("/bli-med#medlem");
}
