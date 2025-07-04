"use client";

import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="bg-white text-gray-900 py-12 md:py-20 lg:py-24 flex flex-col justify-center">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-12 md:py-0 gap-8 w-full">
        {/* Left column */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl w-full mx-auto md:mx-0">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
            Social Listening for B2B
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Social Brand Monitoring for Reddit
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed">
            Monitor discussions about your brand, competitors, and industry
            keywords. Get clean data and sentiment analysis
          </p>
          <div className="flex flex-row gap-4 w-full">
            <button
              className="btn-primary"
              onClick={() =>
                window.open(
                  "https://buy.stripe.com/9B6bJ38c00vp0BIdJ6aVa0h",
                  "_blank"
                )
              }
            >
              Get Lifetime Access
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                window.open(
                  "https://cal.com/sabyr-nurgaliyev/social-brand-monitoring-discovery-call",
                  "_blank"
                );
              }}
            >
              Book a demo
            </button>
          </div>
        </div>
        {/* Right column */}
        <div className="flex-1 flex items-center justify-center w-full max-w-xl mx-auto md:mx-0">
          <div className="w-full h-72 md:h-96 rounded-xl flex items-center justify-center">
            <img src="/social-listening-tool.webp" alt="SocialBrandMonitoring" className="h-48 md:h-72 object-contain" />
          </div>
        </div>
      </div>
      {/* Bottom center text */}
      <div className="w-full flex justify-center mt-6 md:mt-12">
        <p className="text-zinc-500 text-sm font-semibold">
          Only 10 spots left.
        </p>
      </div>
    </section>
  );
};

export default Hero;
