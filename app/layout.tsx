import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThotamTracker',
  description: 'An aesthetic and minimal personal finance and expense tracking application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans antialiased text-zinc-800 bg-[#fafafa] selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
