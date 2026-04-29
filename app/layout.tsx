import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* Вставляем обычным тегом для максимальной надежности */}
        <script src="https://telegram.org" defer></script>
        {children}
      </body>
    </html>
  );
}


