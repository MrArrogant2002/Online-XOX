import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Online XOX - Multiplayer Tic Tac Toe',
  description: 'Real-time multiplayer Tic Tac Toe game built with Next.js and Socket.IO',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
          {children}
        </div>
      </body>
    </html>
  )
}