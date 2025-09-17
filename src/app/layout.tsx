"use client"; 

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import liff from "@line/liff";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar"; // ✅ import Navbar once here

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const liffId = process.env.NEXT_PUBLIC_TEMPLATE_LINE_LIFF!;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initializeLiff = async () => {
        try {
          await liff.init({ liffId });
          setIsLiffReady(true);
        } catch (error) {
          console.error("LIFF init failed", error);
        }
      };
      initializeLiff();
    }
  }, [liffId]);

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLiffReady ? (
          <ThirdwebProvider>
            {/* ✅ Navbar is now global */}
            <Navbar />  
            {children}
          </ThirdwebProvider>
        ) : (
          <div>Loading LIFF...</div>
        )}
      </body>
    </html>
  );
}
