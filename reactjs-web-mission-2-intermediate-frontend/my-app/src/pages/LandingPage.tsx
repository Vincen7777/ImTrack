import Nav from "../components/layout/Nav";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import ProductPreview from "../components/landing/ProductPreview";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Roadmap from "../components/landing/Roadmap";
import GlassSection from "../components/landing/GlassSection";
import Faq from "../components/landing/Faq";
import Cta from "../components/landing/Cta";

function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProductPreview />
        <Features />
        <HowItWorks />
        <Roadmap />
        <GlassSection />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

export default LandingPage