"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EmailCaptureModal from "./EmailCaptureModal";

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Stop Missing What Your Customers Say on{" "}
              <span className="text-orange-400">Reddit</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Reddit-focused social listening that actually works. Track mentions, analyze sentiment, and get actionable insights – without the noise and sky-high costs.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-10 border border-white/20 animate-scale-in">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-yellow-300">
                Tired of Brand24's High Costs & Irrelevant Data?
              </h3>
              <p className="text-blue-100 leading-relaxed">
                You're paying $99-399/month for social listening tools that flood you with spam, miss relevant conversations, and charge extra for basic features. Meanwhile, Reddit – where your customers have their most honest conversations – gets lost in the noise.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-xl"
                onClick={() => setIsModalOpen(true)}
              >
                Get Early Access - Free
              </Button>
            </div>
            <p className="mt-4 text-blue-200">Join our beta waitlist</p>
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
