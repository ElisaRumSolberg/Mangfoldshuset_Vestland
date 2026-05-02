import { fetchUtvalg } from "@/lib/utvalg";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const utvalg = await fetchUtvalg();
  const utvalgItems = utvalg.map((u) => ({
    href: `/utvalg/${u.slug}`,
    label: u.title,
  }));

  return <NavbarClient utvalgItems={utvalgItems} />;
}
