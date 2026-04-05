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
import { fetchActivityShowcaseSlides } from "@/lib/activity-showcase";

export default async function Home() {
  const [settings, showcaseSlides] = await Promise.all([
    fetchSiteSettings(),
    fetchActivityShowcaseSlides(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero images={settings.hero_images} slides={showcaseSlides} />
        <UpcomingActivities />
        <AboutSnippet />
        <ContributeSection />
        <SupportUs vippsLink={settings.vipps_link} />
        <ImpactCounters />
        <NewsAndMagazine />
      </main>
      <Footer />
    </>
  );
}
