import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MooNsEvents — Open event operating system",
  description:
    "Explore the real MooNsEvents workflows for leads, runOfShows, RFQs, packages, bookings, support, and governed Maya automation.",
  metadataBase: new URL("https://github.com/schowdary75/moonsevents"),
  openGraph: {
    title: "MooNsEvents — From first enquiry to production complete",
    description:
      "An open-source event operating system for CRM, runOfShows, supplier RFQs, proposals, bookings, support, and governed AI.",
    type: "website",
    images: ["/og-card.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MooNsEvents — Open event operating system",
    description:
      "Real events workflows, open source: leads, runOfShows, routes, RFQs, packages, bookings, support, and governed Maya automation.",
    images: ["/og-card.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
