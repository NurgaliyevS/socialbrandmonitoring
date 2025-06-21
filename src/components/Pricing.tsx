
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small businesses and startups",
      features: [
        "Up to 5 keywords",
        "Real-time monitoring",
        "Basic alerts",
        "Weekly reports",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$149",
      period: "/month",
      description: "Ideal for marketing teams and agencies",
      features: [
        "Up to 25 keywords",
        "Advanced analytics",
        "Smart alerts",
        "Daily reports",
        "Priority support",
        "Custom dashboards",
        "Export capabilities"
      ],
      popular: true
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent{" "}
            <span className="text-orange-400">Pricing</span>
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Choose the plan that fits your monitoring needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 transition-all duration-300 hover:bg-white/20 relative ${
                plan.popular 
                  ? 'border-orange-400 scale-105 transform' 
                  : 'border-white/20 hover:border-orange-400/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-blue-100 ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-blue-100">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-blue-100">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-4 text-lg font-semibold rounded-full transition-all duration-300 ${
                  plan.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                }`}
              >
                Start Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
