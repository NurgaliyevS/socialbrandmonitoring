import { X, Check } from "lucide-react";

const ProblemSolution = () => {
  const comparisons = [
    {
      problem: "You miss Reddit and Hacker News completely",
      solution: "You catch every mention that matters"
    },
    {
      problem: "You pay $100+ every month",
      solution: "You pay once and own it forever"
    },
    {
      problem: "You get buried in useless notifications",
      solution: "You only see mentions that matter"
    },
    {
      problem: "You struggle with complicated dashboards",
      solution: "You get insights in minutes, not hours"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {/* You're Being Talked About - We Make Sure You Know About It */}
            Why You Need This
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            People talk about your brand <strong>every day</strong>. Someone might
            be praising your product or complaining about it. You need to react
            ASAP.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Problems */}
            <div className="bg-red-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                With other social listening tools
              </h3>
              <div className="space-y-4">
                {comparisons.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <X className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">
                      {item.problem}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Solutions */}
            <div className="bg-green-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                With Social Brand Monitoring
              </h3>
              <div className="space-y-4">
                {comparisons.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
