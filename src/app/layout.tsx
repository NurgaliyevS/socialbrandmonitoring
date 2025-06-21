import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import EmailManager from "@/components/EmailManager";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reddit Whisperer Alerts',
  description: 'Get real-time alerts for Reddit opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
            <EmailManager />
          </TooltipProvider>
      </body>
    </html>
  )
} 