

import "../styles/globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { HeaderNav } from "/components/shadcn-nav-bar"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Urban Rivers",
  description: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Urban Rivers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <HeaderNav />
        <div className="relative flex min-h-screen flex-col pt-16">
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
