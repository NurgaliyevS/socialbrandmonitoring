import React from 'react';
import Link from 'next/link';

const NavigationHeader = () => {
  return (
    <header className="sticky top-2 z-30 px-4">
      <div className="w-[900px] max-w-full mx-auto flex items-center justify-between bg-white rounded-lg border border-zinc-200 shadow-sm px-4 py-4 md:h-16 lg:h-16">
        <div className="shrink-0">
          <Link href="/">
            <span className="text-lg font-semibold text-gray-900">SocialBrandMonitoring</span>
          </Link>
        </div>
        
        {/* Mobile: Only show CTA */}
        <div className="flex items-center gap-4 sm:hidden">
          <Link href="/dashboard">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg font-medium h-10 px-4 py-2 btn-sm bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
              Sign up
            </button>
          </Link>
        </div>

        {/* Desktop: Full nav */}
        <nav className="hidden sm:flex">
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <Link href="#pricing" className="mr-4 hover:underline">
                Pricing
              </Link>
            </li>
            <li className="group relative">
              <button className="mr-4 hover:underline">Platforms</button>
              <ul className="absolute left-0 hidden w-48 border border-gray-200 bg-white group-hover:block">
                <li>
                  <Link href="/twitter-monitoring" className="flex items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    X (Twitter)
                  </Link>
                </li>
                <li>
                  <Link href="/linkedin-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link href="/reddit-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    Reddit
                  </Link>
                </li>
                <li>
                  <Link href="/bluesky-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    Bluesky
                  </Link>
                </li>
                <li>
                  <Link href="/github-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="/youtube-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    YouTube
                  </Link>
                </li>
                <li>
                  <Link href="/dev-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    DEV
                  </Link>
                </li>
                <li>
                  <Link href="/hackernews-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    HackerNews
                  </Link>
                </li>
                <li>
                  <Link href="/stackoverflow-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    Stack Overflow
                  </Link>
                </li>
                <li>
                  <Link href="/newsletter-monitoring" className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                    Newsletters
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/docs" target="_blank" className="mr-4 hover:underline">
                Docs
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/dashboard">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-link hover:bg-link-100 hover:text-link h-10 px-4 py-2">
                  Sign in
                </button>
              </Link>
            </li>
            <li>
              <Link href="/dashboard">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg font-medium h-10 px-4 py-2 btn-sm bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
                  Start for free
                </button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavigationHeader; 