import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProblemSolution />
      <Features />
      <Pricing />
    </div>
  );
} 