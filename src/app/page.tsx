import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImpactCounters from "@/components/ImpactCounters";
import UpcomingActivities from "@/components/UpcomingActivities";
import AboutSnippet from "@/components/AboutSnippet";
import ContributeSection from "@/components/ContributeSection";
import NewsAndMagazine from "@/components/NewsAndMagazine";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <UpcomingActivities />
        <AboutSnippet />
        <ContributeSection />
        <ImpactCounters />
        <NewsAndMagazine />
      </main>
      <Footer />
    </>
  );
}
