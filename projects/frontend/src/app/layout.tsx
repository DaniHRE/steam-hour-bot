import type { Metadata } from 'next'
import '../index.css'
import { SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'Steam Hour Bot',
  description: 'Steam Hour Bot Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  )
}
