import React from "react";
import { Tag, Users, Globe, Smile, BarChart2, TrendingUp, Mail, Slack } from "lucide-react";

const HowItWorks: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-center mb-10">
        How Social Brand Monitoring Works
      </h2>
      <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Steps */}
        <div className="flex-1 min-w-0 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">1. Set Your Keywords</h3>
            <p className="text-gray-700">
              Track keywords for your brand, competitors, or industry topics.
              Our platform will scan Reddit for every mention, so you never miss
              a critical conversation.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Tag className="w-4 h-4" /> brand name
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Users className="w-4 h-4" /> competitor
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Globe className="w-4 h-4" /> industry keyword
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              2. AI Monitors Reddit 24/7
            </h3>
            <p className="text-gray-700">
              Our system scans posts and comments across all subreddits,
              filtering out noise and analyzing sentiment, engagement, and
              trends in real time.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Smile className="w-4 h-4" /> Sentiment Score
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <BarChart2 className="w-4 h-4" /> Engagement Metrics
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Trends
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              3. Get Real-Time Alerts
            </h3>
            <p className="text-gray-700">
              Receive instant notifications via Email or Slack. You will be able
              to see the sentiment of the post, the engagement metrics, and the
              trends in the post.
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Mail className="w-4 h-4" /> Email
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Slack className="w-4 h-4" /> Slack
              </span>
            </div>
          </div>
        </div>
        {/* Dashboard image */}
        <div className="flex-shrink-0 w-full md:w-auto md:max-w-xl flex justify-center items-center">
          <img
            src="/socialbrandmonitoringdashboard_2.webp"
            alt="Dashboard Screenshot"
            className="w-full max-h-80 object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
