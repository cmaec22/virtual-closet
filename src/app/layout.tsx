import type { Metadata } from "next";
import { Navigation } from "@/components/shared/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Closet",
  description: "Smart wardrobe management and outfit planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
