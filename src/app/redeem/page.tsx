"use client";

import { useState } from "react";
import toast from 'react-hot-toast';

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setMessage("⚠️ Please enter a code");
      return;
    }

    if (!email.trim()) {
      setMessage("⚠️ Please enter your email address");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        // Clear form on success
        setCode("");
        setEmail("");
        setTimeout(() => {
          // Redirect to dashboard or welcome page based on response
          const redirectUrl = data.redirectTo || "/dashboard";
          window.location.href = redirectUrl;
        }, 2000);
      } else if (data.userExists) {
        // Show special message for existing users with lifetime access
        setMessage(data.message);
        // Don't clear the form in this case
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Redeem Your AppSumo Code
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              AppSumo Code *
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your AppSumo code"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll use this to create your account and send you important updates about your lifetime deal.
            </p>
          </div>

          <button
            onClick={handleRedeem}
            disabled={isLoading || !code.trim() || !email.trim()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isLoading ? "Redeeming..." : "Redeem Code"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${
              message.includes("✅")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
            {message.includes("already has lifetime access") && (
              <div className="mt-2">
                <a 
                  href="/auth/signin" 
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Click here to sign in
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Having trouble? In the right bottom, there is a chatbot that can
            help you.
          </p>
        </div>
      </div>
    </div>
  );
}
