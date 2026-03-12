import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { PageTransition } from "@/components/page-transition";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SaGentong - Langkah Cepat, Aksi Tepat!",
  description:
    "Sagentong adalah platform yang memudahkan masyarakat dalam melaporkan kebutuhan bantuan sosial, serta membantu pemerintah dan organisasi sosial untuk merespons dengan cepat dan tepat sasaran.",
  keywords: [
    "Sagentong",
    "bantuan sosial",
    "laporan kebutuhan",
    "respon cepat",
    "organisasi sosial",
    "pemerintah",
    "platform pelaporan",
    "bantuan tepat sasaran",
    "laporan masyarakat",
    "bantuan bencana",
    "bantuan kemanusiaan",
    "bantuan darurat",
    "bantuan sosial masyarakat",
    "laporan kebutuhan sosial",
    "respon bencana",
    "bantuan untuk yang membutuhkan",
  ],
  authors: [{ name: "SaGentong Team" }],
  creator: "SaGentong Team",
  publisher: "SaGentong",
  openGraph: {
    title: "SaGentong - Langkah Cepat, Aksi Tepat!",
    description:
      "Sagentong adalah platform yang memudahkan masyarakat dalam melaporkan kebutuhan bantuan sosial, serta membantu pemerintah dan organisasi sosial untuk merespons dengan cepat dan tepat sasaran.",
    url: "https://sagentong.com",
    siteName: "SaGentong",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SaGentong - Langkah Cepat, Aksi Tepat!",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaGentong - Langkah Cepat, Aksi Tepat!",
    description:
      "Sagentong adalah platform yang memudahkan masyarakat dalam melaporkan kebutuhan bantuan sosial, serta membantu pemerintah dan organisasi sosial untuk merespons dengan cepat dan tepat sasaran.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://sagentong.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
