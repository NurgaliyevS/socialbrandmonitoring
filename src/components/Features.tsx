const Features = () => {
  const features = [
      {
      title: "Real-Time Monitoring",
      description:
        "Get instant notifications when your brand, products, or keywords are mentioned anywhere on Reddit & Hacker News.",
    },
    {
      title: "Complete Coverage",
      description:
        "Monitor posts, comments, stories across all Reddit and Hacker News. No more missing important conversations.",
    },
    {
      title: "Context Analytics",
      description:
        "Understand the context around mentions with sentiment analysis and engagement metrics.",
    },
    {
      title: "Keyword Targeting",
      description:
        "Set up precise keyword combinations to track exactly what matters to your brand.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Monitor Reddit and Hacker News
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your brand where buyers and people who matter actually talk
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
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
