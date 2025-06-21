
import { Bell, MessageSquare, TrendingUp, FileText, Target } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Bell,
      title: "Real-Time Monitoring",
      description: "Get instant notifications when your brand, products, or keywords are mentioned anywhere on Reddit."
    },
    {
      icon: MessageSquare,
      title: "Comment & Post Tracking",
      description: "Monitor both posts and comments across all subreddits for comprehensive coverage of discussions."
    },
    {
      icon: TrendingUp,
      title: "Context Analytics",
      description: "Understand the context around mentions with sentiment analysis and engagement metrics."
    },
    {
      icon: FileText,
      title: "Easy Reporting",
      description: "Generate beautiful, shareable reports for clients and stakeholders in minutes."
    },
    {
      icon: Target,
      title: "Keyword Targeting",
      description: "Set up precise keyword combinations to track exactly what matters to your brand."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to Monitor{" "}
            <span className="text-orange-400">Reddit</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Built specifically for marketers and PR agencies who need to stay on top of Reddit conversations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
            >
              <div className="bg-orange-400/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-400/30 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-orange-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
