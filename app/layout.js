export const metadata = {
  title: 'Printer Config Manager',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: 'Arial', padding: '20px' }}>
        {children}
      </body>
    </html>
  )
}
