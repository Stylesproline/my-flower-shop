import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org" strategy="beforeInteractive" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: 'var(--tg-theme-bg-color)' }}>
        {children}
      </body>
    </html>
  );
}
