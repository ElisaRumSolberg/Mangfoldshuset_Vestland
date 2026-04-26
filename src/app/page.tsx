import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImpactCounters from "@/components/ImpactCounters";
import UpcomingActivities from "@/components/UpcomingActivities";
import AboutSnippet from "@/components/AboutSnippet";
import ContributeSection from "@/components/ContributeSection";
import SupportUs from "@/components/SupportUs";
import NewsAndMagazine from "@/components/NewsAndMagazine";
import Footer from "@/components/Footer";
import { fetchSiteSettings } from "@/lib/site-settings";

export default async function Home() {
  const settings = await fetchSiteSettings();

  return (
    <>
      <Navbar />
      <main>
        <Hero images={settings.hero_images} />
        <UpcomingActivities />
        <AboutSnippet />
        <ContributeSection />
        <SupportUs />
        <ImpactCounters />
        <NewsAndMagazine />
      </main>
      <Footer />
    </>
  );
}
