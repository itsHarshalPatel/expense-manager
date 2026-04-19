import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Manager",
  description: "Track your expenses, friends and groups",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-light">{children}</body>
    </html>
  );
}
