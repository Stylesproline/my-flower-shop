import './globals.css'

export const metadata = {
  title: 'Flower Shop Mini App',
  description: 'Заказ цветов через Telegram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        {/* Загружаем локальную копию SDK из папки public */}
        <script src="/telegram-web-app.js" defer></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}



