
import { Button } from "@/components/ui/button";
import { Check, Users, Zap } from "lucide-react";

const Pricing = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our <span className="text-purple-600">Beta Program</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Be among the first to experience powerful Reddit monitoring. Help us build the perfect tool for your needs.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-purple-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Limited Beta Access
              </span>
            </div>
            
            <div className="text-center mb-8 pt-4">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Early Access
              </h3>
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-purple-600">
                  FREE
                </span>
                <span className="text-gray-600 ml-2">
                  during beta
                </span>
              </div>
              <p className="text-gray-600 text-lg">
                Get full access to all features while we perfect the platform together
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">What you'll get as a beta tester:</h4>
              <ul className="space-y-3">
                {[
                  "Complete access to all monitoring features",
                  "Priority support and direct feedback channel",
                  "Influence product development and new features",
                  "Exclusive early access to future updates",
                  "No credit card required during beta period",
                  "Special pricing when we launch publicly"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full py-4 text-lg font-semibold rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300">
              Request Beta Access
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Limited spots available • No commitment required
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're looking for marketers, PR professionals, and business owners who actively monitor social media. 
            Your feedback will directly shape how we build this platform.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
