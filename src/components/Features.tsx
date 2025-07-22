
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
      icon: Target,
      title: "Keyword Targeting",
      description: "Set up precise keyword combinations to track exactly what matters to your brand."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Monitor{" "}Reddit
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built specifically for marketers and PR agencies who need to stay on top of Reddit conversations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
