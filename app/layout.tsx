import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}

