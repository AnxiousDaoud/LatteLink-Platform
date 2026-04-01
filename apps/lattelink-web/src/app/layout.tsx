import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://lattelink.da0ud.me";

export const metadata: Metadata = {
  title: "LatteLink | Branded Ordering & Loyalty for Independent Coffee Shops",
  description:
    "Launch a branded ordering app, loyalty program, and operator dashboard built for independent coffee shops.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LatteLink",
    description: "Branded ordering and loyalty for independent coffee shops.",
    type: "website",
    url: siteUrl,
    siteName: "LatteLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "LatteLink",
    description: "Branded ordering and loyalty for independent coffee shops.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
