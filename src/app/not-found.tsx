import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-green-dark">
          404
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium">
          Fant ikke siden
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          Siden du leter etter finnes ikke, eller den er flyttet.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >
          Til forsiden
        </Link>
      </main>
      <Footer />
    </>
  );
}
