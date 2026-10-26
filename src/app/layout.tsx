import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Mirchi Chaats | Authentic Street Food Ordering | Vysial St, Coimbatore',
  description:
    'Direct online ordering for Mirchi Chaats, Vysial Street, Town Hall, Coimbatore. Hot Masala Puri, Bhel Puri, Dahi Samosa, Sizzling Cheese Pav Bhaji, and fresh mojitos delivered to your doorstep.',
  keywords: [
    'Mirchi Chaats Coimbatore',
    'Vysial Street Town Hall Chaat',
    'Masala Puri Coimbatore',
    'Dahi Puri online order',
    'Cheese Pav Bhaji Coimbatore',
    'Direct food delivery Coimbatore',
  ],
  authors: [{ name: 'Mirchi Chaats Coimbatore' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#fff9e6] text-[#221014] font-sans selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
