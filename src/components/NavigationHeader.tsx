import React from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  {
    label: 'Pricing',
    href: '#pricing',
    className: 'mr-4 hover:underline',
    external: false,
  },
//   {
//     label: 'Platforms',
//     dropdown: [
//       { label: 'X (Twitter)', href: '/twitter-monitoring' },
//       { label: 'LinkedIn', href: '/linkedin-monitoring' },
//       { label: 'Reddit', href: '/reddit-monitoring' },
//       { label: 'Bluesky', href: '/bluesky-monitoring' },
//       { label: 'GitHub', href: '/github-monitoring' },
//       { label: 'YouTube', href: '/youtube-monitoring' },
//       { label: 'DEV', href: '/dev-monitoring' },
//       { label: 'HackerNews', href: '/hackernews-monitoring' },
//       { label: 'Stack Overflow', href: '/stackoverflow-monitoring' },
//       { label: 'Newsletters', href: '/newsletter-monitoring' },
//     ],
//     className: 'mr-4 hover:underline',
//   },
//   {
//     label: 'Docs',
//     href: '/docs',
//     className: 'mr-4 hover:underline',
//     external: true,
//   },
//   {
//     label: 'Blog',
//     href: '/blog',
//     className: 'hover:underline',
//     external: false,
//   },
  {
    label: 'Sign in',
    href: '/dashboard',
    isButton: true,
    className:
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-link hover:bg-link-100 hover:text-link h-10 px-4 py-2',
    external: false,
  },
];

const NavigationHeader = () => {
  return (
    <header className="sticky top-6 z-30 px-4">
      <div className="w-[900px] max-w-full mx-auto flex items-center justify-between bg-white rounded-lg border border-zinc-200 shadow-sm px-4 py-4 md:h-16 lg:h-16">
        <div className="shrink-0">
          <Link href="/">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              <span className="sm:hidden">Social Listening</span>
              <span className="hidden sm:inline">Social Brand Monitoring</span>
            </span>
          </Link>
        </div>
        
        {/* Mobile: Only show CTA */}
        <div className="flex items-center gap-4 sm:hidden">
          <Link href="https://buy.stripe.com/9B6bJ38c00vp0BIdJ6aVa0h" target="_blank">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm sm:text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg font-medium h-10 px-4 py-2 btn-sm bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
              Get Lifetime Access
            </button>
          </Link>
        </div>

        {/* Desktop: Full nav */}
        <nav className="hidden sm:flex">
          <ul className="flex items-center gap-4 text-sm">
            {NAV_ITEMS.map((item, idx) => {
              if ('dropdown' in item && item.dropdown) {
                return (
                  <li className="group relative" key={item.label}>
                    <button className={item.className}>{item.label}</button>
                    <ul className="absolute left-0 hidden w-48 border border-gray-200 bg-white group-hover:block z-10">
                      {item.dropdown && Array.isArray(item.dropdown) && item.dropdown.map((drop: any) => (
                        <li key={drop.href}>
                          <Link href={drop.href} className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100">
                            {drop.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              if (item.isButton) {
                return (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <button className={item.className}>{item.label}</button>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={item.className}
                    {...(item.external ? { target: '_blank' } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {/* Get Lifetime Access CTA (not in NAV_ITEMS) */}
            <li>
              <Link href="https://buy.stripe.com/9B6bJ38c00vp0BIdJ6aVa0h" target="_blank">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg font-medium h-10 px-4 py-2 btn-sm bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
                  Get Lifetime Access
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