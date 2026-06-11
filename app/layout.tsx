import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ajil Korea - Jobs for Mongolians in Korea",
  description: "Discover thousands of career opportunities in South Korea tailored for the Mongolian community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
