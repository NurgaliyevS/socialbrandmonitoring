import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-stretch justify-stretch">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 min-h-screen p-10 dark:border-r bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="relative z-20 flex flex-col items-center justify-center h-full w-full">
          <div className="flex items-center text-2xl font-bold mb-8 gap-1">
            <img src="/icon.svg" alt="Logo" className="w-8 h-8" />
            Social Brand Monitoring
          </div>
          <blockquote className="space-y-2 text-center max-w-md mx-auto">
            <p className="text-lg font-medium">
              Monitor discussions about your brand, competitors, and industry
              keywords. Get clean data and sentiment analysis
            </p>
            <footer className="text-sm opacity-80">
              Social Listening Made Simple
            </footer>
          </blockquote>
        </div>
      </div>
      {/* Right Panel (Form) with plain background */}
      <div className="flex flex-1 items-center justify-center min-h-screen bg-none">
        <div className="w-full max-w-xl mx-auto flex flex-col justify-center bg-none">
          <div className="bg-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
