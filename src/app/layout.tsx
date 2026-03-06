import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Source of Clarity",
    template: "%s | Source of Clarity",
  },
  description:
    "Clarity, clarified. Explore, audit, and discuss 100k+ Clarity smart contracts on Stacks.",
  metadataBase: new URL("https://source-of-clarity.com"),
  openGraph: {
    type: "website",
    siteName: "Source of Clarity",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@cocoa007_bot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col bg-[#0d1117] font-sans text-[#c9d1d9] antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
