import { AnimatedGlobe } from "@/components/AnimatedGlobe";
import { YashiroHero } from "@/components/YashiroHero";
import { GeminiChat } from "@/components/GeminiChat";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <AnimatedGlobe />

      <section className="relative z-10 sticky top-0">
        <YashiroHero />
      </section>

      <section className="relative z-10 p-12 bg-black/80 backdrop-blur-md border-t border-white/5 min-h-screen flex flex-col items-center justify-center">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-title uppercase text-brand-orange mb-4">Neural Scripting</h2>
            <p className="text-white/40 max-w-xl mx-auto font-sans">
              Connect to the Orochi Network. Let Gemini 1.5 Flash synthesize your vision into reality.
            </p>
          </div>
          <GeminiChat />
        </div>
      </section>

      {/* Scroll indicator */}
      <div className="fixed bottom-10 left-10 flex flex-col items-center gap-2 opacity-30 z-20">
        <span className="font-arcade text-[8px] tracking-widest [writing-mode:vertical-lr]">SCROLL_SYNC</span>
        <div className="w-[1px] h-12 bg-brand-orange animate-pulse" />
      </div>
    </main>
  );
}
