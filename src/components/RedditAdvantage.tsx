
import { Clock, ArrowUp, MessageSquare, BarChart3 } from "lucide-react";

const RedditAdvantage = () => {
  const advantages = [
    {
      icon: Clock,
      title: "Long-lasting Conversations",
      description: "Unlike Facebook or Twitter, Reddit conversations have staying power. Threads remain active and searchable for months, continuing to influence opinions long after the initial post."
    },
    {
      icon: ArrowUp,
      title: "Natural Content Curation",
      description: "Reddit's upvote system naturally surfaces the most important discussions, helping you focus on what really matters to your audience."
    },
    {
      icon: MessageSquare,
      title: "Detailed Customer Feedback",
      description: "Comments sections reveal in-depth customer feedback, pain points, and suggestions that's impossible to find elsewhere on social media."
    },
    {
      icon: BarChart3,
      title: "Market Research Goldmine",
      description: "This isn't just social listening – it's a comprehensive market research tool that reveals genuine customer insights and trends."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-600 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The <span className="text-orange-400">Reddit</span> Advantage
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Reddit offers unique advantages that make it the most valuable platform for authentic customer insights and market intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {advantages.map((advantage, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-orange-400/20 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-orange-400/30 transition-colors duration-300">
                  <advantage.icon className="h-7 w-7 text-orange-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {advantage.title}
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    {advantage.description}
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

export default RedditAdvantage;
