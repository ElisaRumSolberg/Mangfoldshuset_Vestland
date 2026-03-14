import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Mangfoldhuset Vestland",
  description:
    "Mangfoldhuset Vestland skaper møteplasser der mennesker med ulike bakgrunner kan møtes, delta, lære og bidra.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
