"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import EmailCaptureModal from "./EmailCaptureModal";

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const fetchEmailCount = async () => {
    const response = await fetch("/api/emails");
    const data = await response.json();
    return data.count;
  };

  useEffect(() => {
    fetchEmailCount().then(setEmailCount);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Stop Missing What Your Customers Say on{" "}
              <span className="text-orange-400">Reddit</span>
            </h1> */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in leading-relaxed">
              Social Brand Monitoring for{" "}
              <span className="text-orange-400">Reddit</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Monitor discussions about your brand, competitors, and industry keywords. Get clean data and sentiment analysis
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-10 border border-white/20 animate-scale-in">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-yellow-300">
                Here's the painful truth:
              </h3>
              <p className="text-blue-100 leading-relaxed">
              You're throwing money every month at Brand24 and similar tools, hoping to catch meaningful customer feedback. Instead, you get thrown under the bus of irrelevant mentions, fake engagement, and social media junk that tells you nothing about what your customers actually think.
              Meanwhile, Reddit is the place where people share their real, unfiltered opinions about your products.
              </p>
            </div>

            <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-orange-300/30">
            <p className="text-orange-100 text-xl font-bold mb-3">
              ⚡ Special Launch Offer: Lock in 50% Off Forever
            </p>
            <p className="text-orange-200 text-lg mb-2 leading-relaxed">
              The first 100 businesses get lifetime access at half price. No tricks, no temporary discounts, just 50% off your subscription for life.
            </p>
            <p className="text-orange-100 text-sm font-semibold">
              Only 100 spots left.
            </p>
          </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-xl"
                onClick={() => window.open('https://buy.stripe.com/4gMeVf0Jy6TN5W248waVa0g', '_blank')}
              >
                Lock In Your Lifetime 50% Off
              </Button>
            </div>
            <p className="text-orange-100 text-sm font-semibold mt-2">
              Only 100 spots left.
            </p>
            {/* <p className="mt-4 text-blue-200">Already {emailCount ? emailCount : ""} people on the waitlist</p> */}
          </div>
        </div>
      </section>

      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Get Early Access - Free"
        description="Join our beta waitlist and be among the first to experience powerful Reddit monitoring."
        source="hero"
      />
    </>
  );
};

export default Hero;
