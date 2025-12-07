import { Metadata } from 'next'

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
        {children}
      </body>
    </html>
  )
}

