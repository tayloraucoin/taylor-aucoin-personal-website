import RootField from "@/components/field/RootField";
import Capabilities from "@/components/sections/Capabilities";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import Signal from "@/components/sections/Signal";

export default function Home() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-16">
      {/* The field runs the full page height, not just the hero. */}
      <RootField />
      <Hero />
      <Capabilities />
      <SelectedWork />
      <Signal />
      <Footer />
    </main>
  );
}
