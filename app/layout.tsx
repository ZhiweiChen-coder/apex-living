import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Aster House | Apex Living",
  description: "A private collection of harbour-edge residences in Potts Point, Sydney.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}
