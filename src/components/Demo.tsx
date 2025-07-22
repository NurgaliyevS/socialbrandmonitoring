import React from "react";

const Demo = () => {
  return (
    <section className="flex flex-col items-center py-16 bg-white">
      {/* Section Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Social Brand Monitoring Demo
      </h2>

      {/* YouTube Embed */}
      <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg mb-12 bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/frpaNHz_LtU?si=uI_HmZn-OkeHLG9c"
          title="Social Brand Monitoring Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
};

export default Demo;
