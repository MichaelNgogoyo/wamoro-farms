import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { getPublicSettings } from "@/lib/queries";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.siteTitle, template: "%s | Wamoro Farms" },
    description: settings.siteDescription,
    openGraph: { type: "website", locale: "en_KE", siteName: "Wamoro Farms", title: settings.siteTitle, description: settings.siteDescription, images: ["/images/farm/orchard-rows-aerial.jpg"] },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-KE">
      <body>{children}</body>
    </html>
  );
}
