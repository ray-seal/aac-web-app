import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AAC Web App",
  description: "Augmentative and Alternative Communication tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
