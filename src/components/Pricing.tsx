"use client";

import { useState } from "react";

const Pricing = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto flex justify-center">
        <div className="relative flex flex-col justify-between bg-white p-4 shadow-sm sm:p-6 rounded-2xl border-2 border-primary border-gray-300 z-10 lg:scale-[1.02] w-full max-w-lg items-center">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-semibold">
              Launch
            </span>
          </div>

          {/* Plan name */}
          <h3 className="mt-4 text-xl font-bold text-zinc-900">
            Early Adopter Access
          </h3>
          <p className="text-zinc-600 text-sm mt-2 mb-6 text-center">
            Be among the first to experience powerful Reddit monitoring.
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl font-bold text-zinc-900">
              $497
            </span>
            <div className="text-left">
              <div className="text-lg text-gray-500 line-through">$994</div>
              <div className="text-sm text-zinc-900 font-medium">
                lifetime
              </div>
            </div>
          </div>

          <p className="text-zinc-900 font-medium mb-2 mt-4 text-left w-full">
            What you'll get as an early adopter:
          </p>
          <ul className="text-zinc-700 text-sm mb-8 w-full pl-5 list-disc space-y-2">
            <li>Complete access to all monitoring features</li>
            <li>Priority support and direct feedback channel</li>
            <li>Influence product development and new features</li>
            <li>Exclusive early access to future updates</li>
            <li>Market rate: $99-399/month</li>
            <li>Your rate: $497 lifetime</li>
            <li>No recurring bills ever</li>
          </ul>

          {/* Button */}
          <button
            className="w-full btn-primary bg-black bg-gradient-to-r from-black to-zinc-900 text-white rounded-lg py-3 text-base font-semibold shadow hover:from-zinc-900 hover:to-zinc-900 transition-all duration-200"
            onClick={() =>
              window.open(
                "https://buy.stripe.com/4gMeVf0Jy6TN5W248waVa0g",
                "_blank"
              )
            }
          >
            Lock In Your Lifetime 50% Off
          </button>

          <p className="text-center text-sm text-zinc-500 mt-4">
            Only 10 spots left.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
