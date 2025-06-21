
import { MessageCircle, Users, TrendingUp, Shield } from "lucide-react";

const WhyRedditMatters = () => {
  const reasons = [
    {
      icon: MessageCircle,
      title: "Unfiltered Conversations",
      description: "Unlike other platforms, Reddit users share brutally honest opinions without the polish and filters found elsewhere."
    },
    {
      icon: Users,
      title: "Authentic Customer Voice",
      description: "Real people discussing real experiences with your brand, products, and services in their own words."
    },
    {
      icon: TrendingUp,
      title: "Purchase Decision Driver",
      description: "Reddit discussions directly influence buying decisions and shape brand perception across demographics."
    },
    {
      icon: Shield,
      title: "Make or Break Moments",
      description: "Product launches, brand reputation, and customer sentiment can be determined by Reddit conversations."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Reddit Matters More Than{" "}
            <span className="text-orange-500">Other Platforms</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Reddit users don't hold back. While other social platforms show polished, filtered conversations, 
            Reddit is where people share brutally honest opinions about brands, products, and services. 
            These unfiltered discussions drive purchasing decisions, shape brand perception, and can make or break product launches. 
            <span className="font-semibold text-gray-900"> If you're not monitoring Reddit, you're missing the most authentic voice of your customers.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                <reason.icon className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {reason.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyRedditMatters;
