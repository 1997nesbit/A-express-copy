'use client'
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import { WebSocketProvider } from "@/lib/websocket-context"
import { ThemeProvider } from "@/components/provider/theme-provider"
import { Toaster } from "@/components/ui/feedback/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <WebSocketProvider>
                {children}
                <Toaster />
              </WebSocketProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
