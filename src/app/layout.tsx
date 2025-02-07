"use client"; // MARK THIS AS A CLIENT COMPONENT

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThirdwebProvider } from 'thirdweb/react';
import liff from '@line/liff'; // DIRECT IMPORT of liff
import { useEffect, useState } from 'react'; // Import useEffect

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLiffReady, setIsLiffReady] = useState(false); // Track LIFF readiness
  const liffId = process.env.NEXT_PUBLIC_TEMPLATE_LINE_LIFF!; //USE YOUR LIFF ID

  useEffect(() => {
    // Only initialize LIFF on the client-side
    if (typeof window !== 'undefined') {
      const initializeLiff = async () => {
        try {
          await liff.init({ liffId: liffId });
          console.log('LIFF initialized successfully!');
          setIsLiffReady(true); // Set state to indicate LIFF is ready
        } catch (error) {
          console.error('LIFF initialization failed', error);
        }
      };

      initializeLiff();
    }
  }, [liffId]);

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLiffReady ? (
          <ThirdwebProvider>{children}</ThirdwebProvider>
        ) : (
          <div>Loading LIFF...</div> // Or a better loading indicator
        )}
      </body>
    </html>
  );
}
