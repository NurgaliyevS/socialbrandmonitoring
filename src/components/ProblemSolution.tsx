
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Reddit Monitoring Challenge{" "}
            <span className="text-purple-600">Solved</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every day, thousands of conversations about your brand happen on Reddit. Here's how we solve the biggest challenges in monitoring them effectively.
          </p>
        </div>

        <div className="space-y-16">
          {challenges.map((challenge, index) => (
            <div key={index} className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-red-50 p-8 rounded-2xl border-l-4 border-red-500">
                  <div className="flex items-center mb-4">
                    <challenge.icon className="h-8 w-8 text-red-500 mr-3" />
                    <h3 className="text-2xl font-bold text-red-700">
                      Problem: {challenge.problem}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="bg-green-50 p-8 rounded-2xl border-l-4 border-green-500">
                  <div className="flex items-center mb-4">
                    <Zap className="h-8 w-8 text-green-500 mr-3" />
                    <h3 className="text-2xl font-bold text-green-700">
                      Solution: {challenge.solution}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
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
