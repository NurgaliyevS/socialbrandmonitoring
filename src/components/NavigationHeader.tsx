"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  className: string;
  external?: boolean;
  isButton?: boolean;
  dropdown?: Array<{ label: string; href: string }>;
};

const NavigationHeader = () => {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_ITEMS: NavItem[] = [
    {
      label: "Pricing",
      href: "#pricing",
      className: "mr-4 hover:underline",
      external: false,
    },
    {
      label: session ? "Dashboard" : "Sign in",
      href: session ? "/dashboard" : "/auth/signin",
      className: "mr-4 hover:underline",
      external: false,
    },
  ];

  return (
    <header className="sticky top-6 z-30 px-4">
      <div className="w-[900px] max-w-full mx-auto flex items-center justify-between bg-white rounded-lg border border-zinc-200 shadow-sm px-4 py-4 md:h-16 lg:h-16 relative">
        <div className="shrink-0">
          <Link href="/">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              <span className="sm:hidden">Social Listening</span>
              <span className="hidden sm:inline">
                <p className="flex items-center gap-2">
                  <img src="/icon.svg" alt="Logo" className="w-8 h-8" />
                  Social Brand Monitoring
                </p>
              </span>
            </span>
          </Link>
        </div>

        {/* Mobile: Hamburger menu and CTA */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Hamburger menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Mobile menu dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <nav className="py-2">
                {NAV_ITEMS.map((item, idx) => {
                  if (item.href) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                        {...(item.external ? { target: "_blank" } : {})}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <span key={item.label} className="block px-4 py-2 text-sm text-gray-500">
                      {item.label}
                    </span>
                  );
                })}
              </nav>
            </div>
          )}

          <Link
            href="https://buy.stripe.com/9B6bJ38c00vp0BIdJ6aVa0h"
            target="_blank"
          >
            <button className="inline-flex items-center justify-center whitespace-nowrap text-xs ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg font-medium h-8 px-3 py-1 bg-zinc-900 text-zinc-100 shadow hover:bg-zinc-800">
              Get Lifetime Access
            </button>
          </Link>
        </div>

        {/* Desktop: Full nav */}
        <nav className="hidden sm:flex">
          <ul className="flex items-center gap-4 text-sm">
            {NAV_ITEMS.map((item, idx) => {
              if ("dropdown" in item && item.dropdown) {
                return (
                  <li className="group relative" key={item.label}>
                    <button className={item.className}>{item.label}</button>
                    <ul className="absolute left-0 hidden w-48 border border-gray-200 bg-white group-hover:block z-10">
                      {item.dropdown &&
                        Array.isArray(item.dropdown) &&
                        item.dropdown.map((drop: any) => (
                          <li key={drop.href}>
                            <Link
                              href={drop.href}
                              className="block items-center whitespace-nowrap px-4 py-2 hover:bg-gray-100"
                            >
                              {drop.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </li>
                );
              }
              if (item.isButton && item.href) {
                return (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <button className={item.className}>{item.label}</button>
                    </Link>
                  </li>
                );
              }
              if (item.href) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={item.className}
                      {...(item.external ? { target: "_blank" } : {})}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <span className={item.className}>{item.label}</span>
                </li>
              );
            })}
            {/* Get Lifetime Access CTA (not in NAV_ITEMS) */}
            <li>
              <Link
                href="https://buy.stripe.com/9B6bJ38c00vp0BIdJ6aVa0h"
                target="_blank"
              >
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
