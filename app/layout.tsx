import { Metadata } from 'next'

import { Providers } from './components/Providers'
import UserMenu from './components/UserMenu'

export const metadata: Metadata = {
  title: 'Printer Config Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: 'Arial', padding: '20px' }}>
        <Providers>
          <UserMenu />
          {children}
        </Providers>
      </body>
    </html>
  )
}

