import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudiJur — 5 minutes de droit par jour",
    short_name: "StudiJur",
    description:
      "L'entraînement quotidien des étudiants en L1 de droit : une leçon de 5 minutes, cinq définitions, une question type examen corrigée et un quiz.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF2E1",
    theme_color: "#E2876A",
    lang: "fr",
    categories: ["education"],
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
