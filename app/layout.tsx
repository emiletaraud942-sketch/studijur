import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StudiJurProvider } from "@/lib/state";
import { AllHueStyles } from "@/components/ui";
import Shell from "@/components/Shell";
import ServiceWorker from "@/components/ServiceWorker";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lexio-roan.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "StudiJur — 5 minutes de droit par jour",
  description:
    "L'entraînement quotidien des étudiants en L1 de droit : une leçon de 5 minutes, cinq définitions, une question de cours corrigée et un quiz, tous les jours.",
  applicationName: "StudiJur",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "StudiJur", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "StudiJur",
    title: "StudiJur — 5 minutes de droit par jour",
    description:
      "Une séance de 5 minutes par jour : le cours, cinq définitions, une question type examen corrigée, un quiz. Pour les L1 de droit.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "StudiJur — 5 minutes de droit par jour" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudiJur — 5 minutes de droit par jour",
    description: "Réviser sa L1 de droit cinq minutes par jour. Sept jours gratuits.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF2E1" },
    { media: "(prefers-color-scheme: dark)", color: "#141B29" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Public+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='19' font-size='20'%3E%E2%9A%96%EF%B8%8F%3C/text%3E%3C/svg%3E"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('lexio.state.v1')||'{}');var t=(s.profile&&s.profile.theme)||'light';var d=t==='dark'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <AllHueStyles />
        <StudiJurProvider>
          <Shell>{children}</Shell>
          <ServiceWorker />
        </StudiJurProvider>
      </body>
    </html>
  );
}
