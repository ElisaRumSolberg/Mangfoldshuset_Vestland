import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const description =
  "Mangfoldshuset Vestland skaper møteplasser der mennesker med ulike bakgrunner kan møtes, delta, lære og bidra.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Mangfoldshuset Vestland",
  url: siteUrl,
  logo: `${siteUrl}/logo-v2.png`,
  description,
  email: "post@mangfoldshusetvestland.no",
  telephone: "+4740567853",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Arne Abrahamsens vei 1",
    postalCode: "5161",
    addressLocality: "Laksevåg, Bergen",
    addressCountry: "NO",
  },
  sameAs: [
    "https://www.facebook.com/mangfoldhusetvestlandet/",
    "https://www.instagram.com/mangfoldhusetvestlandet/",
  ],
};

// Siden har bare lyst tema. Uten dette mørkner enkelte nettlesere (f.eks. Samsung Internet)
// siden automatisk, og den mørke logoen forsvinner mot mørk bakgrunn.
export const viewport: Viewport = {
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Mangfoldshuset Vestland – møteplass for mangfold i Bergen",
    template: "%s",
  },
  description,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "Mangfoldshuset Vestland",
    title: "Mangfoldshuset Vestland – møteplass for mangfold i Bergen",
    description,
    images: [{ url: "/logo.jpg", width: 488, height: 429, alt: "Mangfoldshuset Vestland" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
