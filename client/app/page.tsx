import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import JoinCreateSection from '@/components/home/join-create-section';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      <Hero />
      <Features />
      <JoinCreateSection />
    </div>
  );
}