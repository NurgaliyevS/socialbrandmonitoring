
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import WhyRedditMatters from "@/components/WhyRedditMatters";
import RedditAdvantage from "@/components/RedditAdvantage";
import Pricing from "@/components/Pricing";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProblemSolution />
      <Features />
      <WhyRedditMatters />
      <RedditAdvantage />
      <Pricing />
    </div>
  );
};

export default Index;
