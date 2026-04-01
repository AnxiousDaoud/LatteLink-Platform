import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Logos, Features, Statement } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { About, CTA, Footer } from "@/components/About";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Features />
        <Statement />
        <div style={{ borderTop: "1px solid #13151f" }} />
        <HowItWorks />
        <div style={{ borderTop: "1px solid #13151f" }} />
        <Pricing />
        <div style={{ borderTop: "1px solid #13151f" }} />
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
