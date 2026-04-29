import './globals.css'
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        {/* Подключаем SDK через специальный компонент Next.js */}
        <Script 
          src="https://telegram.org" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}



