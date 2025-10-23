import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deník nálad",
  description: "Vizualizace deníku nálad pro bipolární poruchu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
