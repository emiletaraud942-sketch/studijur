import type { Metadata } from "next";
import Landing from "@/components/Landing";

export const metadata: Metadata = {
  title: "StudiJur — 5 minutes de droit par jour",
  description:
    "L'entraînement quotidien des étudiants en L1 de droit : une leçon de 5 minutes, cinq définitions, une question type examen corrigée et un quiz. Dix jours d'essai gratuit, jusqu'à ton CC si besoin.",
  openGraph: {
    title: "StudiJur — 5 minutes de droit par jour",
    description:
      "Une séance de 5 minutes par jour : le cours, cinq définitions, une question type examen corrigée, un quiz. Pour les L1 de droit.",
    type: "website",
    locale: "fr_FR",
    siteName: "StudiJur",
    url: "/presentation",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "StudiJur — 5 minutes de droit par jour" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudiJur — 5 minutes de droit par jour",
    description: "Réviser sa L1 de droit cinq minutes par jour. Dix jours gratuits, jusqu'à ton CC si besoin.",
    images: ["/og.png"],
  },
};

export default function PresentationPage() {
  return <Landing />;
}
