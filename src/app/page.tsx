import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import NavigationHeader from "@/components/NavigationHeader";
import HowItWorks from "@/components/HowItWorks";
import Demo from "@/components/Demo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavigationHeader />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Demo />
      <Features />
      <Pricing />
    </div>
  );
} 