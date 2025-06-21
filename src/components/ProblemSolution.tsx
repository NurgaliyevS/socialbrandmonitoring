
import { AlertTriangle, Zap, Clock, BarChart3 } from "lucide-react";

const ProblemSolution = () => {
  const challenges = [
    {
      icon: AlertTriangle,
      problem: "Missing Critical Brand Mentions",
      description: "Your brand is being discussed on Reddit right now, but you're not aware of it. Negative reviews, complaints, and viral discussions can damage your reputation before you even know they exist.",
      solution: "Real-Time Alert System",
      solutionDesc: "Get instant notifications the moment your brand is mentioned anywhere on Reddit. Our AI monitors millions of posts and comments 24/7, ensuring you never miss a critical conversation again."
    },
    {
      icon: Clock,
      problem: "Time-Consuming Manual Monitoring",
      description: "Manually checking subreddits and searching for mentions takes hours of valuable time that could be spent on strategy and engagement. It's inefficient and prone to human error.",
      solution: "Automated Intelligence",
      solutionDesc: "Our platform does the heavy lifting for you. Set your keywords once and let our system continuously scan, analyze, and categorize every relevant mention across Reddit's entire ecosystem."
    },
    {
      icon: BarChart3,
      problem: "Lack of Context and Analytics",
      description: "Finding mentions is just the beginning. Understanding sentiment, engagement levels, and trending patterns requires deep analysis that's impossible to do manually at scale.",
      solution: "Smart Analytics Dashboard",
      solutionDesc: "Get comprehensive insights with sentiment analysis, engagement metrics, and trend identification. Understand not just what's being said, but how it's performing and what it means for your brand."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The Reddit Monitoring Challenge{" "}
            <span className="text-orange-400">Solved</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Every day, thousands of conversations about your brand happen on Reddit. Here's how we solve the biggest challenges in monitoring them effectively.
          </p>
        </div>

        <div className="space-y-16">
          {challenges.map((challenge, index) => (
            <div key={index} className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-500/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <challenge.icon className="h-6 w-6 text-red-300" />
                    </div>
                    <h3 className="text-xl font-bold text-red-200">
                      Problem: {challenge.problem}
                    </h3>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-500/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <Zap className="h-6 w-6 text-orange-300" />
                    </div>
                    <h3 className="text-xl font-bold text-orange-200">
                      Solution: {challenge.solution}
                    </h3>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    {challenge.solutionDesc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
