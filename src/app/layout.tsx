import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import Script from "next/script";
import AuthClientProvider from "./AuthClientProvider";
import { Toaster } from "react-hot-toast";
import CrispScript from "@/components/CrispScript";

export const metadata: Metadata = {
  title: "Find Relevant Conversations About Your Brand",
  description: "Monitor discussions about your brand, competitors, and industry keywords. Get clean data and sentiment analysis",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Find Relevant Conversations About Your Brand",
    description: "Monitor discussions about your brand, competitors, and industry keywords. Get clean data and sentiment analysis",
    url: "https://socialbrandmonitoring.com",
    siteName: "Social Brand Monitoring",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Social Brand Monitoring Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Relevant Conversations About Your Brand",
    description: "Monitor discussions about your brand, competitors, and industry keywords. Get clean data and sentiment analysis",
    images: ["/og-image.png"],
    creator: "@socialbrandmonitoring",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          data-website-id="685c2c3b4a49545aec53e2c1"
          data-domain="socialbrandmonitoring.com"
          src="https://datafa.st/js/script.js"
        />
      </head>
      <body className="font-sans" suppressHydrationWarning={true}>
        <AuthClientProvider>
          <TooltipProvider>
            {children}
            <Toaster 
              position="top-right"
            />
            <CrispScript />
          </TooltipProvider>
        </AuthClientProvider>
      </body>
    </html>
  );
}
